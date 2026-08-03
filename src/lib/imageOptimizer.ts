/**
 * Client-side image optimisation pipeline used by the admin uploads.
 *
 * Goals:
 *  1. Cap dimensions (default 1920px on the longest edge) — Full HD is the
 *     sweet spot for retina screens without wasting bandwidth.
 *  2. Apply a moderate unsharp-mask style sharpening so resized photos keep
 *     crisp edges (typical web sharpening ~ amount 0.4 / radius 0.8).
 *  3. Re-encode to WebP when the browser supports it (smaller files than
 *     JPEG at equivalent quality), falling back to JPEG otherwise.
 *  4. Preserve transparency for PNG/GIF/SVG sources by skipping the pipeline.
 *  5. Bypass everything for tiny images (already optimised) and for non-raster
 *     files (SVG, PDF…).
 */

export type OptimizeOptions = {
  /** Max edge in CSS pixels. Defaults to 1920 (Full HD). */
  maxEdge?: number;
  /** Output quality 0..1. Defaults to 0.85. */
  quality?: number;
  /**
   * Sharpening intensity 0..1. 0 disables, 0.4 ≈ moderate (recommended for
   * professional photos), 0.7+ becomes visibly crunchy.
   */
  sharpen?: number;
  /** Force a specific output mime. By default WebP if supported else JPEG. */
  mimeType?: "image/webp" | "image/jpeg";
};

const DEFAULTS: Required<Omit<OptimizeOptions, "mimeType">> = {
  maxEdge: 1920,
  quality: 0.85,
  sharpen: 0.4,
};

const RASTER_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

let webpSupportCache: boolean | null = null;
const supportsWebp = (): boolean => {
  if (webpSupportCache !== null) return webpSupportCache;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    webpSupportCache = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupportCache = false;
  }
  return webpSupportCache;
};

const loadBitmap = async (file: File): Promise<ImageBitmap | HTMLImageElement> => {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to <img> fallback
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image"));
    };
    img.src = url;
  });
};

/**
 * Apply a 3x3 unsharp-mask convolution. Faster than a true gaussian-blur diff
 * and more than enough for screen-sized assets. Amount in 0..1.
 */
const applySharpen = (ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) => {
  if (amount <= 0) return;
  // Centre weight grows with amount; surrounding 4 neighbours stay negative.
  const a = Math.max(0, Math.min(1, amount));
  const centre = 1 + 4 * a;
  const side = -a;
  const kernel = [0, side, 0, side, centre, side, 0, side, 0];

  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let v = 0;
        let k = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ni = ((y + ky) * w + (x + kx)) * 4 + c;
            v += s[ni] * kernel[k++];
          }
        }
        d[i + c] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
      d[i + 3] = s[i + 3];
    }
  }
  // Copy unprocessed border pixels straight from source.
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const i = (y * w + x) * 4;
      d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = s[i + 3];
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const i = (y * w + x) * 4;
      d[i] = s[i]; d[i + 1] = s[i + 1]; d[i + 2] = s[i + 2]; d[i + 3] = s[i + 3];
    }
  }
  ctx.putImageData(dst, 0, 0);
};

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas encoding failed"))),
      type,
      quality
    );
  });

/**
 * Optimise an image File. Returns the original file untouched when the input
 * isn't a supported raster, when it's already smaller than the target, or if
 * any step throws (we never want to block the upload).
 */
export const optimizeImage = async (file: File, options: OptimizeOptions = {}): Promise<File> => {
  if (!file || !file.type.startsWith("image/")) return file;
  if (!RASTER_MIMES.has(file.type)) return file; // SVG, GIF (animated), AVIF passthrough

  const { maxEdge, quality, sharpen } = { ...DEFAULTS, ...options };
  const targetMime: "image/webp" | "image/jpeg" =
    options.mimeType ?? (supportsWebp() ? "image/webp" : "image/jpeg");

  try {
    const bitmap = await loadBitmap(file);
    const srcW = "width" in bitmap ? bitmap.width : (bitmap as HTMLImageElement).naturalWidth;
    const srcH = "height" in bitmap ? bitmap.height : (bitmap as HTMLImageElement).naturalHeight;
    if (!srcW || !srcH) return file;

    const longest = Math.max(srcW, srcH);
    const scale = longest > maxEdge ? maxEdge / longest : 1;
    const dstW = Math.round(srcW * scale);
    const dstH = Math.round(srcH * scale);

    const canvas = document.createElement("canvas");
    canvas.width = dstW;
    canvas.height = dstH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap as CanvasImageSource, 0, 0, dstW, dstH);

    if (sharpen > 0 && dstW > 2 && dstH > 2) {
      try {
        applySharpen(ctx, dstW, dstH, sharpen);
      } catch {
        // ignore — keep the resized but un-sharpened image
      }
    }

    const blob = await canvasToBlob(canvas, targetMime, quality);
    if (blob.size >= file.size && scale === 1) {
      // Re-encoded file isn't smaller and we didn't resize — keep the original.
      return file;
    }
    const ext = targetMime === "image/webp" ? "webp" : "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.${ext}`, { type: targetMime, lastModified: Date.now() });
  } catch {
    return file;
  }
};

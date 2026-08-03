import type { ImgHTMLAttributes } from "react";

/**
 * Output format produced by `vite-imagetools` when imported with
 * `?responsive` query (using `as: "picture"`).
 *
 * Shape:
 *   {
 *     sources: { "image/avif": "url-480w 480w, url-768w 768w, ...", ... },
 *     img: { src: string, w: number, h: number }
 *   }
 *
 * Some versions may emit an array of `{ srcset, type }` per format instead —
 * we normalise both shapes below.
 */
export type ResponsivePicture = {
  sources:
    | Record<string, string>
    | Record<string, Array<{ srcset: string; type?: string }>>;
  img: { src: string; w: number; h: number };
};

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  data: ResponsivePicture;
  /** Sizes attribute, e.g. "(min-width: 768px) 50vw, 100vw" */
  sizes?: string;
  /** Apply to <picture> wrapper */
  pictureClassName?: string;
};

type NormalisedSource = { type: string; srcset: string };

const normaliseSources = (
  sources: ResponsivePicture["sources"]
): NormalisedSource[] => {
  const out: NormalisedSource[] = [];
  for (const [format, value] of Object.entries(sources)) {
    if (typeof value === "string") {
      out.push({ type: format, srcset: value });
    } else if (Array.isArray(value)) {
      for (const s of value) {
        out.push({ type: s.type ?? format, srcset: s.srcset });
      }
    }
  }
  return out;
};

export const ResponsiveImage = ({
  data,
  sizes = "100vw",
  pictureClassName,
  alt = "",
  loading = "lazy",
  decoding = "async",
  ...rest
}: Props) => {
  const sources = normaliseSources(data.sources);

  // Normalise React's camelCase `fetchPriority` to the lowercase DOM attribute
  // expected by HTML; React 18 warns when given the camelCase form on <img>.
  const restProps = rest as Record<string, unknown>;
  if ("fetchPriority" in restProps) {
    restProps.fetchpriority = restProps.fetchPriority;
    delete restProps.fetchPriority;
  }

  return (
    <picture className={pictureClassName}>
      {sources.map((s, i) => (
        <source key={`${s.type}-${i}`} type={s.type} srcSet={s.srcset} sizes={sizes} />
      ))}
      <img
        src={data.img.src}
        width={data.img.w}
        height={data.img.h}
        alt={alt}
        loading={loading}
        decoding={decoding}
        {...(restProps as ImgHTMLAttributes<HTMLImageElement>)}
      />
    </picture>
  );
};

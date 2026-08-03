import { useSite } from "@/hooks/SiteDataContext";

type Props = {
  title: string;
  description: string;
  /** Path on the site, e.g. "/", "/cabinet" */
  path?: string;
  /** Optional custom OG image URL — falls back to /og-image.jpg */
  image?: string;
};

const ORIGIN =
  typeof window !== "undefined" && window.location.hostname.endsWith("cabinet-diabate.com")
    ? "https://www.cabinet-diabate.com"
    : typeof window !== "undefined"
    ? window.location.origin
    : "https://www.cabinet-diabate.com";

const truncate = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

const Bar = ({ value, max, label }: { value: number; max: number; label: string }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const color =
    value === 0
      ? "bg-muted-foreground/40"
      : value > max
      ? "bg-destructive"
      : value > max * 0.95
      ? "bg-amber-500"
      : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
        <span>{label}</span>
        <span className={value > max ? "text-destructive font-semibold" : ""}>
          {value} / {max}
        </span>
      </div>
      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export const SeoPreview = ({ title, description, path = "/", image }: Props) => {
  const { contact: _contact } = useSite();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${ORIGIN}${cleanPath}`;
  const displayUrl = fullUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") || ORIGIN;
  const breadcrumb = displayUrl.split("/").join(" › ");

  const t = title.trim();
  const d = description.trim();
  const safeT = t || "(Titre manquant)";
  const safeD = d || "(Description manquante — Google générera un extrait depuis le contenu de la page.)";

  return (
    <div className="space-y-4 mt-2">
      {/* Length meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Bar value={t.length} max={60} label="Titre" />
        <Bar value={d.length} max={160} label="Description" />
      </div>

      {/* Google SERP preview */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Aperçu Google
        </p>
        <div className="bg-white text-[#202124] rounded-md border border-border p-4 font-sans">
          <div className="flex items-center gap-2 text-xs text-[#5f6368] mb-1">
            <div className="h-6 w-6 rounded-full bg-[#f1f3f4] grid place-items-center text-[10px] font-bold text-[#1a73e8]">
              V
            </div>
            <div className="leading-tight">
              <div className="text-[#202124] text-[12px]">Cabinet Manuela DIABATE</div>
              <div className="text-[#5f6368] text-[12px]">{breadcrumb}</div>
            </div>
          </div>
          <h4 className="text-[#1a0dab] text-[18px] leading-snug font-normal hover:underline cursor-pointer truncate">
            {truncate(safeT, 70)}
          </h4>
          <p className="text-[14px] text-[#4d5156] leading-snug mt-1 line-clamp-2">
            {truncate(safeD, 180)}
          </p>
        </div>
      </div>

      {/* Social card preview */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Aperçu réseaux sociaux (Facebook, LinkedIn, X)
        </p>
        <div className="rounded-md border border-border overflow-hidden bg-card">
          <div className="aspect-[1.91/1] bg-muted relative">
            <img
              src={image && image.trim() !== "" ? image : `${ORIGIN}/og-image.jpg`}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="p-3 bg-muted/40">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground truncate">
              {displayUrl}
            </p>
            <p className="text-sm font-semibold text-foreground line-clamp-1 mt-1">
              {truncate(safeT, 90)}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {truncate(safeD, 200)}
            </p>
          </div>
        </div>
      </div>

      {/* Pinterest Rich Pin preview */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
          Aperçu Pinterest (Rich Pin)
        </p>
        <div className="bg-[#efefef] p-4 rounded-md flex justify-center">
          <div className="w-full max-w-[236px] bg-white rounded-2xl overflow-hidden shadow-md font-sans">
            <div className="aspect-[2/3] bg-[#e9e9e9] relative">
              <img
                src={image && image.trim() !== "" ? image : `${ORIGIN}/og-image.jpg`}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
              <button
                type="button"
                className="absolute top-2 right-2 bg-[#e60023] text-white text-[11px] font-bold px-3 py-1.5 rounded-full pointer-events-none"
              >
                Enregistrer
              </button>
            </div>
            <div className="p-3 space-y-2">
              <p className="text-[13px] font-bold text-[#111] leading-snug line-clamp-2">
                {truncate(safeT, 100)}
              </p>
              <p className="text-[11px] text-[#5f5f5f] leading-snug line-clamp-3">
                {truncate(safeD, 220)}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="h-5 w-5 rounded-full bg-[#e60023] grid place-items-center text-[9px] font-bold text-white">
                  V
                </div>
                <p className="text-[11px] text-[#111] font-medium truncate">
                  {displayUrl}
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/80 mt-2 italic">
          Pinterest privilégie un format vertical (2:3). Pour un Rich Pin parfait, utilisez aussi une image 1000×1500 px.
        </p>
      </div>
    </div>
  );
};

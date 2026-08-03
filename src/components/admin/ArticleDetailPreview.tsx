import { RichText } from "@/components/RichText";
import { ArrowLeft } from "lucide-react";

type Props = {
  lang: "fr" | "en";
  category: string;
  date: string;
  title: string;
  excerpt: string;
  body: string;
  image_url: string | null;
};

/**
 * Vue "page détail" d'un article — utilisée dans la prévisualisation admin.
 * Reproduit fidèlement la mise en page éditoriale du site (hero image plein
 * largeur, titre serif large, lead, contenu RichText, méta SEO simulé).
 */
export const ArticleDetailPreview = ({
  lang,
  category,
  date,
  title,
  excerpt,
  body,
  image_url,
}: Props) => {
  const seoTitle = `${title || (lang === "fr" ? "Sans titre" : "Untitled")} — Manuela DIABATE`;
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();
  const seoDesc = stripHtml(excerpt).slice(0, 160) || (lang === "fr" ? "—" : "—");

  return (
    <div className="bg-background">
      {/* Simulated browser bar with SEO meta */}
      <div className="bg-night/95 text-primary-foreground/80 border-b border-primary-foreground/10">
        <div className="container-luxe py-3 text-[11px] font-mono space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-accent uppercase tracking-[0.2em] text-[9px]">title</span>
            <span className="truncate">{seoTitle}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-accent uppercase tracking-[0.2em] text-[9px]">desc</span>
            <span className="truncate text-primary-foreground/60">{seoDesc}</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-night text-primary-foreground overflow-hidden">
        {image_url ? (
          <>
            <img
              src={image_url}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover scale-105 [filter:contrast(1.1)_saturate(1.05)_brightness(0.95)]"
            />
            <div className="absolute inset-0 bg-night/40" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-night via-night/85 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))_0%,transparent_55%)]" />
        )}
        <div className="container-luxe relative pt-20 pb-16 md:pt-24 md:pb-20 min-h-[360px] flex flex-col justify-end">
          <div className="inline-flex items-center gap-2 text-xs text-primary-foreground/80 mb-8 [text-shadow:0_1px_2px_hsl(var(--night)/0.6)]">
            <ArrowLeft className="h-4 w-4" />
            <span>{lang === "fr" ? "Toutes les actualités" : "All insights"}</span>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-primary-foreground/85 [text-shadow:0_1px_2px_hsl(var(--night)/0.6)]">
            <span className="text-accent">{category || "—"}</span>
            <span className="opacity-40">·</span>
            <span>{date}</span>
          </div>
          <h1 className="mt-6 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.05] max-w-4xl [text-shadow:0_2px_12px_hsl(var(--night)/0.7)]">
            {title || (lang === "fr" ? "(Sans titre)" : "(Untitled)")}
          </h1>
        </div>
      </section>

      {/* Lead (excerpt) */}
      {stripHtml(excerpt) && (
        <section className="py-12 md:py-16 bg-background">
          <div className="container-luxe max-w-3xl">
            <RichText
              html={excerpt}
              className="text-lg md:text-xl text-foreground leading-relaxed font-serif italic"
            />
            <div className="gold-divider mt-10" />
          </div>
        </section>
      )}

      {/* Body */}
      <section className={`pb-16 md:pb-24 bg-background ${stripHtml(excerpt) ? "" : "pt-12 md:pt-16"}`}>
        <div className="container-luxe max-w-3xl">
          {stripHtml(body) ? (
            <RichText
              html={body}
              className="text-base md:text-lg text-muted-foreground leading-relaxed [&_p]:mb-5 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-primary [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:text-primary [&_h3]:mt-8 [&_h3]:mb-3 [&_a]:text-accent [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-primary"
            />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {lang === "fr"
                ? "Aucun contenu rédigé pour cet article."
                : "No content written for this article yet."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

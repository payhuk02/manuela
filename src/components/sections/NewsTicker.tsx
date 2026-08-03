import { Link } from "react-router-dom";
import { ArrowUpRight, Newspaper } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { useText } from "@/hooks/useText";

/**
 * Defiling/marquee section showing latest news + articles.
 * Sorted by published_date DESC, displayed in a continuous horizontal scroll.
 */
export const NewsTicker = () => {
  const { lang } = useLang();
  const { news } = useSite();

  const eyebrow = useText(
    "newsTicker.eyebrow",
    lang === "fr" ? "Fil d'actualité" : "Live feed"
  );
  const title = useText(
    "newsTicker.title",
    lang === "fr"
      ? "Actualités & articles en continu"
      : "News & articles on the move"
  );

  const basePath = lang === "en" ? "/news" : "/actualites";

  // Sort by published_date DESC (most recent first)
  const items = news
    .filter((n) => n.lang === lang)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.published_date).getTime() -
        new Date(a.published_date).getTime()
    )
    .slice(0, 12)
    .map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      type: (n.content_type ?? "news") as "news" | "article",
      href: `${basePath}/${n.id}`,
      date: new Date(n.published_date).toLocaleDateString(
        lang === "fr" ? "fr-FR" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      ),
    }));

  if (items.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const loop = [...items, ...items];

  return (
    <section
      aria-label={title}
      className="relative py-16 md:py-20 bg-secondary/40 border-y border-border overflow-hidden"
    >
      <div className="container-luxe">
        <div className="flex flex-col items-center text-center gap-6 mb-10">
          <p className="eyebrow inline-flex items-center justify-center gap-2">
            <Newspaper className="h-4 w-4 text-accent" strokeWidth={1.5} />
            {eyebrow}
          </p>
          <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary leading-[1.15]">
            {title}
          </h2>
        </div>
      </div>

      <div className="relative group">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-secondary/40 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-secondary/40 to-transparent z-10" />

        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((item, idx) => (
            <Link
              key={`${item.id}-${idx}`}
              to={item.href}
              className="mx-3 md:mx-4 w-[300px] md:w-[360px] shrink-0 bg-card border border-border rounded-3xl p-6 md:p-7 transition-all duration-500 ease-luxe hover:border-accent hover:shadow-elegant hover:-translate-y-1 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-accent">{item.category}</span>
                <span className="opacity-40">·</span>
                <span>{item.date}</span>
              </div>
              <h3 className="font-serif text-lg md:text-xl text-primary leading-snug line-clamp-3 flex-1">
                {item.title}
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-primary">
                {item.type === "article"
                  ? lang === "fr" ? "Lire l'article" : "Read article"
                  : lang === "fr" ? "Lire l'actualité" : "Read news"}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

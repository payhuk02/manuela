import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { NewsCard, type NewsCardData } from "./NewsCard";

export type NewsSectionItem = NewsCardData & { key: string; href?: string };

type Props = {
  eyebrow: string;
  title: string;
  readMoreLabel: string;
  items: NewsSectionItem[];
  seeAllHref?: string;
  seeAllLabel?: string;
  emptyLabel?: string;
  /** Background variant for stacking multiple sections */
  background?: "muted" | "default";
  /** HTML id for in-page anchor (default "news") */
  sectionId?: string;
};

/**
 * Section "Actualités" — utilisée à l'identique sur la page publique
 * et dans la prévisualisation admin pour garantir un rendu identique
 * (mise en page, marges, container, typographie, NewsCard).
 */
export const NewsSection = ({
  eyebrow,
  title,
  readMoreLabel,
  items,
  seeAllHref,
  seeAllLabel,
  emptyLabel,
  background = "muted",
  sectionId = "news",
}: Props) => {
  if (items.length === 0 && !emptyLabel) return null;

  return (
    <section
      id={sectionId}
      className={`py-28 md:py-36 ${background === "muted" ? "bg-secondary/50" : "bg-background"}`}
    >
      <div className="container-luxe">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-6 font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.1]">
              {title}
            </h2>
          </div>
          {seeAllHref && seeAllLabel && items.length > 0 && (
            <Link
              to={seeAllHref}
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-accent hover:text-accent/80 transition-colors"
            >
              {seeAllLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {items.length > 0 ? (
          <div
            key={items.map((i) => i.key).join(",")}
            className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both"
          >
            {items.map((n, i) => (
              <div
                key={n.key}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <NewsCard item={n} readMoreLabel={readMoreLabel} href={n.href} />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-16 text-muted-foreground">{emptyLabel}</p>
        )}
      </div>
    </section>
  );
};

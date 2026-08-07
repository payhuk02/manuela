import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";
import { ResponsiveImage, type ResponsivePicture } from "@/components/ResponsiveImage";
// eslint-disable-next-line import/no-unresolved
import imgCabinetDiabate from "@/assets/hero-cabinet-diabate.jpg?responsive";

const defaultPortrait = imgCabinetDiabate as unknown as ResponsivePicture;

export const StaticHero = () => {
  const { lang } = useLang();

  const show = useText("hero.static.show", "oui") === "oui";
  const customImage = useText("hero.static.image", "");
  const portraitFromAbout = useText("about.portrait", "");

  const tagline = useText(
    "hero.static.tagline",
    lang === "fr"
      ? "Un cabinet d'avocat. Des compétences, des engagements."
      : "A law firm. Expertise, commitment."
  );
  const name = useText(
    "hero.static.name",
    lang === "fr" ? "Maître Manuela DIABATE" : "Manuela DIABATE, Esq."
  );
  const title = useText(
    "hero.static.title",
    lang === "fr" ? "Avocate au Barreau de Paris" : "Attorney at the Paris Bar"
  );
  const motto = useText(
    "hero.static.motto",
    lang === "fr" ? "Défendre vos intérêts, avant tout" : "Defending your interests, above all"
  );
  const cta = useText(
    "hero.static.cta",
    lang === "fr" ? "Contactez le Cabinet" : "Contact the firm"
  );

  if (!show) return null;

  const imageUrl = customImage || portraitFromAbout;

  return (
    <section
      id="intro"
      aria-label={lang === "fr" ? "Présentation du cabinet" : "Firm introduction"}
      className="relative bg-[#f8f8f8] dark:bg-secondary/40 border-b border-border/40 pt-16 lg:pt-0"
    >
      <div className="grid lg:grid-cols-2 min-h-[480px] lg:min-h-[560px]">
        <div className="relative h-[380px] sm:h-[440px] lg:h-auto overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : (
            <ResponsiveImage
              data={defaultPortrait}
              alt={name}
              sizes="(min-width: 1024px) 50vw, 100vw"
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover object-top"
              pictureClassName="absolute inset-0 h-full w-full"
            />
          )}
        </div>

        <div className="flex flex-col items-center justify-center px-8 py-12 sm:px-12 lg:px-16 lg:py-20 text-center">
          <h1 className="sr-only">
            {name} — {title}
          </h1>

          <p className="max-w-md text-[11px] sm:text-xs font-sans font-normal uppercase tracking-[0.22em] text-primary leading-relaxed">
            {tagline}
          </p>

          <div className="my-5 h-10 w-px bg-primary/70" aria-hidden />

          <p className="font-serif text-lg sm:text-xl font-medium uppercase tracking-[0.04em] text-foreground/90" aria-hidden>
            {name}
          </p>

          <p
            className="mt-2 font-serif text-2xl sm:text-3xl lg:text-[2.142em] font-light uppercase tracking-[0.04em] text-foreground leading-[1.15]"
            aria-hidden
          >
            {title}
          </p>

          <p className="mt-5 max-w-sm font-accent text-base sm:text-lg italic text-muted-foreground">
            {motto}
          </p>

          <Link
            to="/contact"
            className="mt-8 inline-flex items-center gap-3 bg-primary px-7 py-3.5 font-serif text-sm italic text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {cta}
            <ArrowRight className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
};

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";

import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useExpertises } from "@/hooks/useExpertises";
import { getExpertiseIcon } from "@/data/expertiseIcons";
import { EXPERTISE_IMAGES, EXPERTISE_TO_HERO } from "@/data/expertiseImages";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useBreadcrumbJsonLd } from "@/lib/useBreadcrumbJsonLd";
import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";
import { useSite } from "@/hooks/SiteDataContext";
/* eslint-disable import/no-unresolved */
import heroExpertisesPic from "@/assets/hero-expertises.jpg?responsive";
/* eslint-enable import/no-unresolved */
import { ResponsiveImage, type ResponsivePicture } from "@/components/ResponsiveImage";

const heroExpertisesPicture = heroExpertisesPic as unknown as ResponsivePicture;

const Expertises = () => {
  const { data: expertises, loading } = useExpertises();
  const { lang } = useLang();
  const { textOverrides } = useSite();
  const { canonical, alternates } = buildLangAlternates("/expertises", lang);

  const seoTitle = useText(
    "seo.expertises.title",
    "Expertises Juridiques — Avocat à Paris | Manuela DIABATE"
  );
  const seoDescription = useText(
    "seo.expertises.description",
    "Droit des affaires, OHADA, bancaire, immobilier, pénal, étrangers, pétrolier et minier : tous les domaines d'expertise du Cabinet Manuela DIABATE à Paris."
  );
  const seoImage = useText("seo.expertises.image", "");

  // Hero
  const heroEyebrow = useText(
    "expertisesPage.eyebrow",
    lang === "fr" ? "Nos expertises" : "Our expertises"
  );
  const heroTitlePrefix = useText(
    "expertisesPage.titlePrefix",
    lang === "fr" ? "Une expertise" : "A"
  );
  const heroTitleAccent = useText(
    "expertisesPage.titleAccent",
    lang === "fr" ? "complète" : "comprehensive"
  );
  const heroTitleSuffix = useText(
    "expertisesPage.titleSuffix",
    lang === "fr" ? "au service de vos enjeux." : "expertise serving your stakes."
  );
  const heroSubtitle = useText(
    "expertisesPage.subtitle",
    lang === "fr"
      ? "Conseil stratégique et contentieux, en France comme à l'international. Découvrez les domaines d'intervention du cabinet."
      : "Strategic advice and litigation, in France and internationally. Discover the firm's practice areas."
  );

  // Domains intro
  const domainsEyebrow = useText(
    "expertisesPage.domainsEyebrow",
    lang === "fr" ? "Domaines d'intervention" : "Practice areas"
  );
  const domainsTitle = useText(
    "expertisesPage.domainsTitle",
    lang === "fr"
      ? "Nos domaines clés, une approche sur mesure."
      : "Our key areas, a tailored approach."
  );
  const loadingLabel = useText(
    "expertisesPage.loading",
    lang === "fr" ? "Chargement…" : "Loading…"
  );
  const learnMoreLabel = useText(
    "expertisesPage.learnMore",
    lang === "fr" ? "Découvrir cette expertise" : "Explore this expertise"
  );

  // CTA
  const ctaTitle = useText(
    "expertisesPage.ctaTitle",
    lang === "fr" ? "Un dossier à nous confier ?" : "A case to entrust to us?"
  );
  const ctaDescription = useText(
    "expertisesPage.ctaDescription",
    lang === "fr"
      ? "Échangeons sur votre situation en toute confidentialité."
      : "Let's discuss your situation in full confidence."
  );
  const ctaButton = useText(
    "expertisesPage.ctaButton",
    lang === "fr" ? "Nous contacter" : "Contact us"
  );

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage || undefined,
    type: "website",
    lang,
    canonical,
    alternates,
    jsonLdId: "expertises-jsonld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: expertises.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: e.title,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/expertises/${e.slug}`,
      })),
    },
  });

  useBreadcrumbJsonLd([
    { name: lang === "en" ? "Home" : "Accueil", path: "/" },
    { name: lang === "en" ? "Expertise" : "Expertises", path: "/expertises" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
        <main>
          {/* Hero */}
          <section className="relative pt-48 pb-32 md:pt-60 md:pb-40 bg-night text-primary-foreground overflow-hidden">
            <ResponsiveImage
              data={heroExpertisesPicture}
              alt=""
              aria-hidden="true"
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="absolute inset-0 w-full h-full object-cover [filter:saturate(1.08)_contrast(1.05)] [image-rendering:auto]"
              pictureClassName="absolute inset-0 w-full h-full"
            />
            
            <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))_0%,transparent_55%)]" />
            <div className="container-luxe relative">
              <p className="eyebrow text-accent animate-fade-in">{heroEyebrow}</p>
              <h1 className="mt-6 font-serif text-5xl md:text-7xl leading-[1.05] max-w-4xl animate-fade-up">
                {heroTitlePrefix} <span className="text-accent">{heroTitleAccent}</span><br />
                {heroTitleSuffix}
              </h1>
              <p className="mt-8 max-w-2xl text-base md:text-lg text-primary-foreground/80 animate-fade-up [animation-delay:200ms]">
                {heroSubtitle}
              </p>
            </div>
          </section>

          {/* Main domains — all expertises */}
          <section className="py-24 md:py-32 bg-background">
            <div className="container-luxe">
              <div className="max-w-2xl mb-14">
                <p className="eyebrow text-accent">{domainsEyebrow}</p>
                <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary leading-tight">
                  {domainsTitle}
                </h2>
              </div>

              {loading ? (
                <p className="text-muted-foreground">{loadingLabel}</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {expertises.map((e, idx) => {
                    const Icon = getExpertiseIcon(e.icon);
                    const heroKey = EXPERTISE_TO_HERO[e.slug];
                    const heroImg = heroKey ? textOverrides[`${heroKey}::${lang}`] : null;
                    const img = e.image_url || heroImg || EXPERTISE_IMAGES[e.slug];
                    return (
                      <Link
                        key={e.id}
                        to={`/expertises/${e.slug}`}
                        aria-label={`${learnMoreLabel} — ${e.title}`}
                        className="group relative bg-night border border-border overflow-hidden flex flex-col min-h-[360px] transition-all duration-500 hover:border-accent hover:shadow-elegant hover:-translate-y-1"
                      >
                        {img && (
                          <img
                            src={img}
                            alt={`${e.title} — illustration du domaine d'expertise du Cabinet Manuela DIABATE`}
                            loading="lazy"
          decoding="async"
                            width={1024}
                            height={768}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 [filter:contrast(1.15)_saturate(1.1)_brightness(1.05)]"
                          />
                        )}
                        <div className="absolute inset-0 bg-night/20" />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night via-night/90 to-transparent" />
                        <div className="relative p-8 flex flex-col flex-1 text-primary-foreground">
                          <span className="absolute top-6 right-6 text-xs font-serif text-primary-foreground/80">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="mx-auto h-14 w-14 grid place-items-center bg-accent text-accent-foreground rounded-sm mb-auto">
                            <Icon className="h-7 w-7" strokeWidth={1.4} />
                          </div>
                          <h3 className="mt-6 font-serif text-xl leading-tight">
                            {e.title}
                          </h3>
                          <p className="mt-3 text-sm text-primary-foreground/90 leading-relaxed">
                            {e.tagline}
                          </p>
                          <span className="mt-6 inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-accent">
                            <span className="sr-only">{learnMoreLabel} — {e.title}</span>
                            <span aria-hidden="true">{learnMoreLabel}</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 md:py-28 bg-muted/40">
            <div className="container-luxe text-center">
              <h2 className="font-serif text-3xl md:text-4xl text-primary">
                {ctaTitle}
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                {ctaDescription}
              </p>
              <div className="mt-8">
                <Button asChild variant="gold" size="lg">
                  <Link to="/#contact">
                    {ctaButton} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Expertises;

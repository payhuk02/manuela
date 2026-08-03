import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { About } from "@/components/sections/About";
import { Timeline } from "@/components/sections/Timeline";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { getValueIcon } from "@/data/valueIcons";
import cabinetImg from "@/assets/cabinet-office.jpg?responsive";

import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Link } from "react-router-dom";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useBreadcrumbJsonLd } from "@/lib/useBreadcrumbJsonLd";
import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";

const Cabinet = () => {
  const { lang } = useLang();
  const { canonical, alternates } = buildLangAlternates("/cabinet", lang);

  // Hero
  const heroEyebrow = useText("cabinet.eyebrow", "Cabinet");
  const heroTitlePrefix = useText("cabinet.heroTitlePrefix", "Cabinet");
  const heroTitleAccent = useText("cabinet.heroTitleAccent", "Manuela DIABATE");
  const heroSubtitle = useText(
    "cabinet.heroSubtitle",
    "Un partenaire juridique entre la France et l'Afrique."
  );

  // Portrait (uploadé depuis l'admin)
  const portraitSrc = useText("cabinet.portrait", "");

  // Présentation
  const presEyebrow = useText("cabinet.presentation.eyebrow", "Notre histoire");
  const presTitlePrefix = useText("cabinet.presentation.titlePrefix", "Le Cabinet");
  const presTitleAccent = useText("cabinet.presentation.titleAccent", "Manuela DIABATE");
  const presLead = useText(
    "cabinet.presentation.lead",
    "Un cabinet fondé en 2018 avec une motivation claire : l'excellence au service de vos droits."
  );
  const presP1 = useText(
    "cabinet.presentation.p1",
    "Créé pour répondre aux enjeux juridiques complexes de notre époque, le Cabinet Manuela DIABATE accompagne une clientèle diversifiée. Animé par la volonté d'offrir une défense juste et stratégique, le cabinet s'est rapidement imposé comme un acteur de confiance."
  );
  const presP2 = useText(
    "cabinet.presentation.p2",
    "Nos particularités résident dans notre approche sur mesure : chaque dossier est traité avec une rigueur absolue et une profonde humanité. Nous croyons que derrière chaque affaire juridique se trouvent des vies et des projets nécessitant protection et accompagnement."
  );
  const presP3 = useText(
    "cabinet.presentation.p3",
    "Le cabinet se distingue par sa réactivité, son accessibilité et sa capacité à apporter des solutions pragmatiques et sécurisées, que ce soit en conseil stratégique ou en phase contentieuse."
  );
  const presP4 = useText(
    "cabinet.presentation.p4",
    "Alliant exigence professionnelle, sens de la stratégie et engagement indéfectible, nous nous inscrivons dans une démarche d'excellence et d'efficacité."
  );
  const presQuote = useText(
    "cabinet.presentation.quote",
    "Par son positionnement et sa vision, le Cabinet Manuela DIABATE se veut un partenaire juridique de confiance, capable d'offrir à ses clients un accompagnement sur mesure."
  );

  // Valeurs
  const valuesEyebrow = useText("cabinet.values.eyebrow", "Nos valeurs");
  const valuesTitle = useText("cabinet.values.title", "Quatre piliers, une seule exigence.");
  const v1i = useText("cabinet.values.1.icon", "Scale");
  const v1t = useText("cabinet.values.1.title", "Rigueur");
  const v1d = useText("cabinet.values.1.desc", "Une exigence absolue dans chaque dossier traité.");
  const v2i = useText("cabinet.values.2.icon", "Lock");
  const v2t = useText("cabinet.values.2.title", "Confidentialité");
  const v2d = useText("cabinet.values.2.desc", "Une discrétion totale au service de la confiance.");
  const v3i = useText("cabinet.values.3.icon", "Target");
  const v3t = useText("cabinet.values.3.title", "Stratégie");
  const v3d = useText("cabinet.values.3.desc", "Une vision claire pour anticiper et décider.");
  const v4i = useText("cabinet.values.4.icon", "Award");
  const v4t = useText("cabinet.values.4.title", "Excellence");
  const v4d = useText("cabinet.values.4.desc", "Un niveau d'exigence à la hauteur de vos enjeux.");

  const values = [
    { icon: getValueIcon(v1i), title: v1t, desc: v1d },
    { icon: getValueIcon(v2i), title: v2t, desc: v2d },
    { icon: getValueIcon(v3i), title: v3t, desc: v3d },
    { icon: getValueIcon(v4i), title: v4t, desc: v4d },
  ];

  // CTA
  const ctaTitle = useText("cabinet.cta.title", "Discutons de votre situation.");
  const ctaButton = useText("cabinet.cta.button", "Nous contacter");

  const seoTitle = useText(
    "seo.cabinet.title",
    "Le Cabinet Manuela DIABATE — Avocats d'Affaires à Paris"
  );
  const seoDescription = useText(
    "seo.cabinet.description",
    "Cabinet d'avocats à Paris : valeurs, méthodologie et expertise juridique au service des entreprises et particuliers, en France comme en Afrique."
  );
  const seoImage = useText("seo.cabinet.image", "");

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage || cabinetImg.img.src,
    type: "website",
    lang,
    canonical,
    alternates,
    jsonLdId: "cabinet-jsonld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: seoTitle,
      description: seoDescription,
      url: "https://cabinet-diabate.com/cabinet",
      inLanguage: lang === "en" ? "en" : "fr",
      mainEntity: {
        "@type": "LegalService",
        "@id": "https://cabinet-diabate.com/#organization",
        name: "Cabinet Manuela DIABATE",
        url: "https://cabinet-diabate.com",
        image: "https://cabinet-diabate.com/og-image.jpg",
        logo: "https://cabinet-diabate.com/og-image.jpg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "3 avenue des Ternes",
          postalCode: "75017",
          addressLocality: "Paris",
          addressCountry: "FR",
        },
        areaServed: ["France", "Côte d'Ivoire", "OHADA"],
        knowsLanguage: ["fr", "en"],
      },
    },
  });

  useBreadcrumbJsonLd([
    { name: lang === "en" ? "Home" : "Accueil", path: "/" },
    { name: lang === "en" ? "Firm" : "Cabinet", path: "/cabinet" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[70svh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <ResponsiveImage
              data={cabinetImg}
              alt="Cabinet Manuela DIABATE — bibliothèque de droit"
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover scale-105 animate-[fade-in_1.2s_ease-out]"
              pictureClassName="block h-full w-full"
            />
            
          </div>

          <div className="container-luxe relative z-10 pt-32 pb-20">
            <div className="max-w-3xl">
              <p className="eyebrow text-accent animate-fade-in">{heroEyebrow}</p>
              <h1 className="mt-6 font-serif text-5xl md:text-7xl text-primary-foreground leading-[1.05] animate-fade-up">
                {heroTitlePrefix} <span className="text-accent">{heroTitleAccent}</span>
              </h1>
              <p className="mt-8 max-w-xl text-base md:text-lg text-primary-foreground/80 leading-relaxed animate-fade-up [animation-delay:200ms]">
                {heroSubtitle}
              </p>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-accent to-transparent" />
          </div>
        </section>

        {/* Présentation */}
        <section className="py-24 md:py-32 bg-background">
          <div className="container-luxe grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {portraitSrc && (
              <div className="lg:col-span-6 flex justify-center lg:justify-start">
                <div className="relative w-full max-w-xl lg:max-w-2xl group">
                  {/* Halo doré diffus */}
                  <div
                    aria-hidden
                    className="absolute -inset-10 -z-20 rounded-[2.5rem] opacity-60 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
                    style={{
                      background:
                        "radial-gradient(60% 60% at 50% 50%, hsl(var(--accent) / 0.30), transparent 70%)",
                    }}
                  />
                  {/* Cadre or décalé */}
                  <div className="absolute -inset-4 border border-accent/40 rounded-3xl -z-10 translate-x-4 translate-y-4" />
                  {/* Ombre douce sous la photo */}
                  <div
                    aria-hidden
                    className="absolute inset-x-8 -bottom-6 h-12 -z-10 rounded-full blur-2xl bg-primary/40"
                  />
                  <img
                    src={portraitSrc}
                    alt="Maître Manuela DIABATE"
                    loading="lazy"
                    decoding="async"
                    width={1024}
                    height={1024}
                    className="w-full aspect-[4/5] object-cover bg-background rounded-3xl ring-1 ring-accent/30 shadow-[0_30px_60px_-20px_hsl(var(--primary)/0.45),0_18px_40px_-25px_hsl(var(--accent)/0.35)] transition-transform duration-700 ease-luxe group-hover:-translate-y-1"
                  />
                </div>
              </div>
            )}

            <div className={portraitSrc ? "lg:col-span-6" : "lg:col-span-12"}>
              <p className="eyebrow">{presEyebrow}</p>
              <h2 className="mt-6 font-serif text-4xl md:text-5xl text-primary leading-[1.1]">
                {presTitlePrefix} <span className="text-accent">{presTitleAccent}</span>.
              </h2>
              <div className="gold-divider mt-8" />

              <div className="mt-10 space-y-5 text-muted-foreground font-bold leading-relaxed text-justify hyphens-auto">
                <p className="text-lg text-foreground">{presLead}</p>
                <p>{presP1}</p>
                <p>{presP2}</p>
                <p>{presP3}</p>
                <p>{presP4}</p>
                <p className="text-lg text-primary font-serif pt-4 border-l-2 border-accent pl-6 text-left">
                  {presQuote}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Frise Chronologique */}
        <Timeline />

        {/* Valeurs */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-primary via-primary to-[hsl(var(--primary))]">
          {/* Premium decorative background */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, hsl(var(--accent)) 0, transparent 40%), radial-gradient(circle at 80% 80%, hsl(var(--accent)) 0, transparent 45%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--accent) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent) / 0.06) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <div className="container-luxe relative">
            <div className="max-w-2xl mx-auto text-center">
              <p className="eyebrow text-accent">{valuesEyebrow}</p>
              <h2 className="mt-6 font-serif font-bold text-4xl md:text-5xl text-primary-foreground leading-[1.1] whitespace-pre-line">
                {valuesTitle}
              </h2>
              <div className="mt-6 mx-auto h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent" />
            </div>

            <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group relative p-[1px] rounded-3xl bg-gradient-to-b from-accent/40 via-accent/10 to-transparent transition-all duration-500 hover:from-accent hover:via-accent/40 hover:-translate-y-1"
                >
                  <div className="relative h-full rounded-[calc(1.5rem-1px)] overflow-hidden bg-white shadow-md p-8 flex flex-col items-center text-center transition-shadow duration-500 group-hover:shadow-lg">
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 0%, hsl(var(--accent) / 0.1), transparent 60%)",
                      }}
                    />

                    <h3 className="relative font-serif font-bold text-xl text-primary tracking-tight">
                      {title}
                    </h3>

                    <div className="relative mt-5 h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/40 shadow-[0_0_24px_-8px_hsl(var(--accent)/0.6)] group-hover:from-accent group-hover:to-accent/80 group-hover:border-accent transition-all duration-500">
                      <Icon
                        className="h-6 w-6 text-accent group-hover:text-primary-foreground transition-colors"
                        strokeWidth={1.5}
                      />
                    </div>

                    <p className="relative mt-5 text-sm text-primary/80 font-medium leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Présentation plus complète de l'avocate */}
        <About />

        {/* CTA */}
        <section className="py-20 md:py-28 bg-background">
          <div className="container-luxe">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-[hsl(var(--primary))] px-8 py-16 md:px-16 md:py-20 text-center shadow-soft">
              {/* Decorative radial glows */}
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.12] pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 15% 20%, hsl(var(--accent)) 0, transparent 45%), radial-gradient(circle at 85% 80%, hsl(var(--accent)) 0, transparent 50%)",
                }}
              />
              {/* Subtle grid */}
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--accent) / 0.07) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent) / 0.07) 1px, transparent 1px)",
                  backgroundSize: "56px 56px",
                  maskImage:
                    "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse at center, black 30%, transparent 75%)",
                }}
              />
              {/* Gold border accent */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-[2.5rem] pointer-events-none border border-accent/30"
              />

              <div className="relative">
                <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent mb-8" />
                <h2 className="font-serif font-bold text-3xl md:text-4xl text-primary-foreground">
                  {ctaTitle}
                </h2>
                <div className="mt-8">
                  <Button asChild variant="appointment" size="lg">
                    <Link to="/#contact">
                      {ctaButton} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Cabinet;
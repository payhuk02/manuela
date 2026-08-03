import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, ArrowRight, Check, HelpCircle } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useExpertise, useExpertises } from "@/hooks/useExpertises";
import { getExpertiseIcon } from "@/data/expertiseIcons";
import { EXPERTISE_IMAGES, EXPERTISE_TO_HERO } from "@/data/expertiseImages";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { MethodologyTimeline } from "@/components/MethodologyTimeline";
import { ExpertiseContactForm } from "@/components/ExpertiseContactForm";

const ExpertiseDetail = () => {
  const { slug } = useParams();
  const { lang } = useLang();
  const { data: expertise, loading } = useExpertise(slug);
  const { data: allExpertises } = useExpertises();
  const { textOverrides } = useSite();

  const heroKey = expertise ? EXPERTISE_TO_HERO[expertise.slug] : null;
  const slideImg = heroKey ? textOverrides[`${heroKey}::${lang}`] : null;
  const heroImage = expertise ? (expertise.image_url || slideImg || EXPERTISE_IMAGES[expertise.slug]) : null;

  const { canonical, alternates } = buildLangAlternates(
    `/expertises/${slug ?? ""}`,
    lang
  );

  const expRow = expertise as (typeof expertise & { seo_title?: string | null; seo_description?: string | null; og_image_url?: string | null }) | null;
  const fallbackTitle = expertise
    ? `${expertise.title} — Avocat | Cabinet Manuela DIABATE`.slice(0, 60)
    : "";
  const FIRM_SUFFIX = " — Cabinet Manuela DIABATE, avocats à Paris et en Afrique.";
  const fallbackDescRaw = expertise
    ? (expertise.tagline && expertise.tagline.length > 50
        ? expertise.tagline
        : `${expertise.title} : ${expertise.intro || expertise.tagline || ""}`
      )
        .replace(/\s+/g, " ")
        .trim()
    : "";
  const fallbackDescPadded = fallbackDescRaw.length < 80 && fallbackDescRaw.length > 0
    ? (fallbackDescRaw + FIRM_SUFFIX)
    : fallbackDescRaw;
  const fallbackDesc = fallbackDescPadded.slice(0, 158);
  const metaTitle = expRow?.seo_title?.trim() || fallbackTitle;
  const metaDesc = expRow?.seo_description?.trim() || fallbackDesc;
  const metaImage = expRow?.og_image_url || heroImage;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://cabinvang.lovable.app";

  useSeo(
    expertise
      ? {
          title: metaTitle,
          description: metaDesc,
          image: metaImage,
          type: "article",
          lang,
          canonical,
          alternates,
          jsonLdId: "expertise-jsonld",
          jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "LegalService",
                "@id": `${origin}/expertises/${expertise.slug}#service`,
                name: `${expertise.title} — Cabinet Manuela DIABATE`,
                description: metaDesc,
                serviceType: expertise.title,
                areaServed: ["FR", "CI"],
                url: `${origin}/expertises/${expertise.slug}`,
                image: heroImage || undefined,
                provider: {
                  "@type": "Attorney",
                  name: "Cabinet Manuela DIABATE",
                  url: origin,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: lang === "fr" ? "Accueil" : "Home", item: origin },
                  { "@type": "ListItem", position: 2, name: lang === "fr" ? "Expertises" : "Practice areas", item: `${origin}/expertises` },
                  { "@type": "ListItem", position: 3, name: expertise.title, item: `${origin}/expertises/${expertise.slug}` },
                ],
              },
              ...(expertise.faq.length > 0
                ? [
                    {
                      "@type": "FAQPage",
                      "@id": `${origin}/expertises/${expertise.slug}#faq`,
                      mainEntity: expertise.faq.map((item) => ({
                        "@type": "Question",
                        name: item.question,
                        acceptedAnswer: {
                          "@type": "Answer",
                          text: item.answer,
                        },
                      })),
                    },
                  ]
                : []),
            ],
          },
        }
      : null
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Chargement…
      </div>
    );
  }
  if (!expertise) return <Navigate to="/expertises" replace />;

  const Icon = getExpertiseIcon(expertise.icon);
  const others = allExpertises.filter((e) => e.slug !== expertise.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
        <main>
          {/* Hero with banner image */}
          <section className="relative pt-40 pb-24 md:pt-52 md:pb-32 bg-night text-primary-foreground overflow-hidden min-h-[480px] md:min-h-[560px]">
            {heroImage && (
              <>
                <img
                  src={heroImage}
                  alt=""
                  aria-hidden="true"
                  width={1920}
                  height={1080}
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                />
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/20 to-transparent" />
              </>
            )}
            <div className="container-luxe relative flex flex-col h-full">
              <Link
                to="/expertises"
                className="inline-flex items-center gap-2 text-sm text-primary-foreground/90 hover:text-accent transition-colors mb-10"
              >
                <ArrowLeft className="h-4 w-4" />
                Toutes les expertises
              </Link>

              <div className="mt-auto">
                <div className="flex flex-col items-center text-center gap-6 md:flex-row md:items-start md:text-left">
                  <div className="h-16 w-16 shrink-0 flex items-center justify-center border border-accent/60 bg-night/60 backdrop-blur-md">
                    <Icon className="h-7 w-7 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="eyebrow text-accent">
                      Expertise
                    </p>
                    <h1 className="mt-4 font-serif text-4xl md:text-6xl leading-[1.05]">
                      {expertise.title}
                    </h1>
                  </div>
                </div>
                <p className="mt-8 max-w-2xl text-center md:text-left text-base md:text-lg text-primary-foreground leading-relaxed">
                  {expertise.tagline}
                </p>
              </div>
            </div>
          </section>

          {/* Intro */}
          <section className="py-20 md:py-28 bg-background">
            <div className="container-luxe max-w-3xl">
              <p className="text-lg md:text-xl text-foreground leading-relaxed font-serif">
                {expertise.intro}
              </p>
              <div className="gold-divider mt-12" />
            </div>
          </section>

          {/* Sections */}
          {expertise.sections.length > 0 && (
            <section className="pb-24 md:pb-32 bg-background">
              <div className="container-luxe grid md:grid-cols-2 gap-10">
                {expertise.sections.map((section) => (
                  <div
                    key={section.title}
                    className="bg-[#0c1c36] text-white rounded-3xl p-8 md:p-10 hover:shadow-[0_20px_50px_-20px_hsl(var(--accent)/0.3)] transition-all duration-300 border border-transparent hover:border-accent/30"
                  >
                    <p className="eyebrow text-accent">Domaine</p>
                    <h2 className="mt-4 font-serif text-2xl md:text-3xl text-white">
                      {section.title}
                    </h2>
                    <ul className="mt-8 space-y-4">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-accent shrink-0 mt-0.5" strokeWidth={1.5} />
                          <span className="text-sm md:text-base text-white/80">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {expertise.conclusion && (
                <div className="container-luxe mt-16 max-w-3xl">
                  <p className="text-lg text-primary font-serif border-l-2 border-accent pl-6">
                    {expertise.conclusion}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Approche */}
          {expertise.approach && (
            <section className="py-20 md:py-28 bg-night text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent))_0%,transparent_55%)]" />
              <div className="container-luxe relative max-w-4xl">
                <p className="eyebrow text-blue-400">Notre approche</p>
                <h2 className="mt-4 font-serif text-3xl md:text-4xl leading-tight">
                  Une pratique <span className="text-blue-400">engagée</span>, au service de vos objectifs.
                </h2>
                <p className="mt-8 text-base md:text-lg text-primary-foreground/85 leading-relaxed">
                  {expertise.approach}
                </p>
              </div>
            </section>
          )}

          {/* Méthodologie — interactive timeline */}
          <MethodologyTimeline
            steps={expertise.methodology}
            expertiseTitle={expertise.title}
            formAnchorId="expertise-contact"
          />

          {/* FAQ preview + link to dedicated page */}
          {expertise.faq.length > 0 && (
            <section className="py-20 md:py-28 bg-muted/30">
              <div className="container-luxe max-w-3xl">
                <div className="text-center mb-12">
                  <p className="eyebrow text-accent">
                    {lang === "fr" ? "Questions fréquentes" : "FAQ"}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary leading-tight">
                    {lang === "fr" ? "Vos questions, nos réponses." : "Your questions, our answers."}
                  </h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {expertise.faq.slice(0, 4).map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`item-${idx}`}
                      className="border-b border-border"
                    >
                      <AccordionTrigger className="text-left font-serif text-lg text-primary hover:text-accent hover:no-underline py-6">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {expertise.faq.length > 4 && (
                  <div className="mt-10 text-center">
                    <Button asChild variant="outline" size="lg">
                      <Link to={`/expertises/${expertise.slug}/faq`}>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        {lang === "fr"
                          ? `Voir les ${expertise.faq.length} questions`
                          : `View all ${expertise.faq.length} questions`}
                      </Link>
                    </Button>
                  </div>
                )}
                {expertise.faq.length > 0 && expertise.faq.length <= 4 && (
                  <div className="mt-10 text-center">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/expertises/${expertise.slug}/faq`}>
                        {lang === "fr" ? "Page FAQ dédiée" : "Dedicated FAQ page"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Dedicated contact form for this expertise */}
          <section id="expertise-contact" className="py-20 md:py-28 bg-background scroll-mt-24">
            <div className="container-luxe max-w-3xl">
              <ExpertiseContactForm
                expertiseSlug={expertise.slug}
                expertiseTitle={expertise.title}
              />
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  {lang === "fr" ? "Vous préférez un rendez-vous ?" : "Prefer a meeting?"}{" "}
                  <Link to="/#contact" className="text-accent hover:underline">
                    {lang === "fr" ? "Prendre rendez-vous" : "Book an appointment"}
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Other expertises */}
          {others.length > 0 && (
            <section className="py-20 md:py-28 bg-background">
              <div className="container-luxe">
                <p className="eyebrow">Autres expertises</p>
                <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary">
                  Découvrir d'autres domaines
                </h2>
                <div className="mt-12 grid md:grid-cols-3 gap-6">
                  {others.map((o) => {
                    const I = getExpertiseIcon(o.icon);
                    return (
                      <Link
                        key={o.id}
                        to={`/expertises/${o.slug}`}
                        className="group border border-border p-8 hover:border-accent transition-colors"
                      >
                        <I className="h-7 w-7 text-accent" strokeWidth={1.25} />
                        <h3 className="mt-6 font-serif text-xl text-primary">{o.title}</h3>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{o.tagline}</p>
                        <span className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-accent group-hover:translate-x-1 transition-transform">
                          Découvrir →
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default ExpertiseDetail;

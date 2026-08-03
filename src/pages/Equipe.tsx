import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { useSite } from "@/hooks/SiteDataContext";
import { Button } from "@/components/ui/button";
import { RichText } from "@/components/RichText";
import { Download, ArrowRight, Mail, Phone, Linkedin, MapPin, X } from "lucide-react";
import { LazyMap } from "@/components/LazyMap";
import { Link } from "react-router-dom";
import { useLang } from "@/i18n/LanguageContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useBreadcrumbJsonLd } from "@/lib/useBreadcrumbJsonLd";
import { useText } from "@/hooks/useText";

/* eslint-disable import/no-unresolved */
import heroTeamPic from "@/assets/hero-team.jpg?responsive";
/* eslint-enable import/no-unresolved */
import { ResponsiveImage, type ResponsivePicture } from "@/components/ResponsiveImage";
import { FounderCard } from "@/components/FounderCard";

const heroTeamPicture = heroTeamPic as unknown as ResponsivePicture;

const fallbacks: string[] = [];

const EquipeInner = () => {
  const { team, loading, contact } = useSite();
  const { lang } = useLang();
  const [openId, setOpenId] = useState<string | null>(null);
  const { canonical, alternates } = buildLangAlternates("/equipe", lang);
  const openMember = team.find((m) => m.id === openId) || null;

  const seoTitle = useText(
    "seo.team.title",
    lang === "fr"
      ? "Équipe d'avocats à Paris — Cabinet Manuela DIABATE"
      : "Our lawyers — Manuela DIABATE Law Firm, Paris"
  );
  const seoDescription = useText(
    "seo.team.description",
    lang === "fr"
      ? "Maître Manuela DIABATE et ses avocats partenaires : une équipe d'avocats à Paris experte en droit des affaires, OHADA et contentieux international."
      : "Manuela DIABATE and partner attorneys advise clients in Paris and Africa with rigor, confidentiality and legal excellence."
  );
  const seoImage = useText("seo.team.image", "");

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage || undefined,
    type: "website",
    lang,
    canonical,
    alternates,
  });

  useBreadcrumbJsonLd([
    { name: lang === "en" ? "Home" : "Accueil", path: "/" },
    { name: lang === "en" ? "Team" : "Équipe", path: "/equipe" },
  ]);

  // Editable hero/CTA labels
  const heroEyebrow = useText(
    "teamPage.eyebrow",
    lang === "fr" ? "Notre équipe" : "Our team"
  );
  const heroTitlePrefix = useText(
    "teamPage.titlePrefix",
    lang === "fr" ? "Des avocats" : "Committed"
  );
  const heroTitleAccent = useText(
    "teamPage.titleAccent",
    lang === "fr" ? "engagés" : "lawyers"
  );
  const heroTitleSuffix = useText(
    "teamPage.titleSuffix",
    lang === "fr" ? ", des parcours d'exception." : ", exceptional careers."
  );
  const founderEyebrow = useText(
    "teamPage.founderEyebrow",
    lang === "fr" ? "Avocat fondateur" : "Founding attorney"
  );
  const downloadCvLabel = useText(
    "teamPage.downloadCv",
    lang === "fr" ? "Télécharger le CV" : "Download CV"
  );
  const getInTouchLabel = useText(
    "teamPage.getInTouch",
    lang === "fr" ? "Prendre contact" : "Get in touch"
  );
  const partnersEyebrow = useText(
    "teamPage.partnersEyebrow",
    lang === "fr" ? "Nos avocats partenaires" : "Our partner attorneys"
  );
  const partnersTitle = useText(
    "teamPage.partnersTitle",
    lang === "fr"
      ? "Une équipe d'expertise complémentaire."
      : "A team of complementary expertise."
  );
  const learnMoreLabel = useText(
    "teamPage.learnMore",
    lang === "fr" ? "Voir le profil de l'avocat" : "View attorney profile"
  );
  const ctaTitle = useText(
    "teamPage.ctaTitle",
    lang === "fr" ? "Une question, un projet ?" : "A question, a project?"
  );
  const ctaDescription = useText(
    "teamPage.ctaDescription",
    lang === "fr"
      ? "Notre équipe vous répond sous 24 heures ouvrées."
      : "Our team responds within 24 working hours."
  );
  const ctaButton = useText(
    "teamPage.ctaButton",
    lang === "fr" ? "Nous contacter" : "Contact us"
  );

  const founder = team.find((m) => m.is_founder);
  const partners = team.filter((m) => !m.is_founder);

  const founderRole = founder ? (lang === "fr" ? founder.role_fr : founder.role_en) : "";
  const founderPresentation = founder
    ? lang === "fr"
      ? founder.presentation_fr || founder.bio_fr
      : founder.presentation_en || founder.bio_en
    : "";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 md:pt-72 md:pb-52 min-h-[60vh] sm:min-h-[70vh] md:min-h-[82vh] flex items-end bg-night text-primary-foreground overflow-hidden">
          <ResponsiveImage
            data={heroTeamPicture}
            alt=""
            aria-hidden="true"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-center [filter:saturate(1.08)_contrast(1.05)] [image-rendering:auto]"
            pictureClassName="absolute inset-0 w-full h-full"
          />
          {/* Readability overlay — stronger on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/40 to-night/30 md:from-night/70 md:via-night/20 md:to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))_0%,transparent_55%)]" />
          <div className="container-luxe relative">
            <p className="eyebrow text-accent animate-fade-in">{heroEyebrow}</p>
            <h1 className="mt-4 sm:mt-6 font-serif text-3xl sm:text-4xl md:text-7xl leading-[1.1] md:leading-[1.05] max-w-4xl animate-fade-up">
              {heroTitlePrefix} <span className="text-accent">{heroTitleAccent}</span>{heroTitleSuffix}
            </h1>
          </div>
        </section>

        {/* Founder section */}
        {loading ? (
          <section className="py-24 md:py-32 bg-background">
            <div className="container-luxe">
              <p className="text-muted-foreground">
                {lang === "fr" ? "Chargement…" : "Loading…"}
              </p>
            </div>
          </section>
        ) : founder ? (
          <FounderCard founder={founder} />
        ) : (
          <section className="py-24 md:py-32 bg-background">
            <div className="container-luxe">
              <p className="text-muted-foreground">
                {lang === "fr"
                  ? "Aucun avocat fondateur configuré. Marquez un membre comme « fondateur » dans l'admin."
                  : "No founding attorney configured yet."}
              </p>
            </div>
          </section>
        )}

        {/* Partners grid */}
        {partners.length > 0 && (
          <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[hsl(215_50%_14%)] via-[hsl(215_45%_18%)] to-[hsl(215_40%_22%)] text-primary-foreground">
            <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent))_0%,transparent_55%)]" aria-hidden="true" />
            <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
            <div className="container-luxe relative">
              <div className="max-w-2xl mx-auto mb-14 text-center">
                <p className="eyebrow text-accent">
                  {partnersEyebrow}
                </p>
                <h2 className="mt-4 font-serif text-3xl md:text-4xl text-primary-foreground leading-tight">
                  {partnersTitle}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {partners.map((m, i) => {
                  const role = lang === "fr" ? m.role_fr : m.role_en;
                  return (
                    <article
                      key={m.id}
                      className="group bg-background border border-border hover:border-accent/60 transition-all duration-500 hover:shadow-elegant hover:-translate-y-1 flex flex-col"
                    >
                      <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt={m.name}
                            width={640}
                            height={800}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                            <span className="font-serif text-6xl text-primary/30">
                              {m.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 md:p-7 flex-1 flex flex-col">
                        <h3 className="font-serif text-2xl text-primary leading-tight">
                          {m.name}
                        </h3>
                        {role && (
                          <p className="mt-1 text-sm text-accent tracking-wide">{role}</p>
                        )}
                        <div className="mt-6 pt-2">
                          <Button
                            type="button"
                            variant="appointment"
                            size="default"
                            onClick={() => setOpenId(m.id)}
                          >
                            {learnMoreLabel}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Partner detail dialog */}
        <Dialog open={!!openMember} onOpenChange={(o) => !o && setOpenId(null)}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[min(1180px,calc(100vw-2rem))] max-h-[92vh] overflow-y-auto p-0">
            {openMember && (() => {
              const m = openMember;
              const role = lang === "fr" ? m.role_fr : m.role_en;
              const presentation = lang === "fr"
                ? m.presentation_fr || m.bio_fr
                : m.presentation_en || m.bio_en;
              return (
                <div className="grid lg:grid-cols-[minmax(280px,380px)_minmax(0,1fr)] gap-0">
                  <div className="bg-secondary aspect-[4/5] lg:aspect-auto lg:min-h-full overflow-hidden">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted min-h-[300px]">
                        <span className="font-serif text-7xl text-primary/30">
                          {m.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 md:p-10 lg:p-12 min-w-0">
                    <DialogHeader className="text-left space-y-2">
                      <p className="eyebrow text-accent">
                        {lang === "fr" ? "Avocat partenaire" : "Partner attorney"}
                      </p>
                      <DialogTitle className="font-serif text-3xl md:text-4xl text-primary leading-tight">
                        {m.name}
                      </DialogTitle>
                      {role && (
                        <DialogDescription className="text-sm text-accent tracking-wide">
                          {role}
                        </DialogDescription>
                      )}
                    </DialogHeader>

                    <div className="gold-divider my-6" />

                    {presentation ? (
                      <RichText
                        html={presentation}
                        className="prose-luxe text-foreground/85 leading-relaxed text-sm md:text-base max-w-none text-justify hyphens-auto [text-align-last:left]"
                      />
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        {lang === "fr" ? "Présentation à venir." : "Presentation coming soon."}
                      </p>
                    )}

                    {/* Contact references — cabinet shared coordinates */}
                    {contact && (
                      <div className="mt-8 pt-6 border-t border-border">
                        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
                          {lang === "fr" ? "Contact" : "Contact"}
                        </p>
                        <ul className="space-y-2.5 text-sm">
                          {contact.email && (
                            <li className="flex items-start gap-3">
                              <Mail className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">
                                {contact.email}
                              </a>
                            </li>
                          )}
                          {contact.phone && (
                            <li className="flex items-start gap-3">
                              <Phone className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-accent transition-colors">
                                {contact.phone}
                              </a>
                            </li>
                          )}
                          {contact.address && (
                            <li className="flex items-start gap-3">
                              <MapPin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <span>{contact.address}</span>
                            </li>
                          )}
                          {contact.linkedin_url && (
                            <li className="flex items-start gap-3">
                              <Linkedin className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                              <a
                                href={contact.linkedin_url}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:text-accent transition-colors"
                              >
                                LinkedIn
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      {m.cv_url && (
                        <Button asChild variant="gold" size="default">
                          <a href={m.cv_url} target="_blank" rel="noreferrer" download>
                            <Download className="mr-2 h-4 w-4" />
                            {lang === "fr" ? "Télécharger le CV" : "Download CV"}
                          </a>
                        </Button>
                      )}
                      <Button asChild variant="appointment" size="default">
                        <Link to="/contact" onClick={() => setOpenId(null)}>
                          <Mail className="mr-2 h-4 w-4" />
                          {lang === "fr" ? "Prendre contact" : "Get in touch"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* CTA */}
        <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-[hsl(215_50%_14%)] via-[hsl(215_45%_18%)] to-[hsl(215_40%_22%)] text-primary-foreground">
          <div className="absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_50%_20%,hsl(var(--accent))_0%,transparent_55%)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-[36rem] rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
          <div className="container-luxe text-center relative">
            <h2 className="font-serif text-3xl md:text-4xl text-primary-foreground">
              {ctaTitle}
            </h2>
            <p className="mt-4 text-primary-foreground/75 max-w-xl mx-auto">
              {ctaDescription}
            </p>
            <div className="mt-8">
              <Button asChild variant="gold" size="lg">
                <Link to="/contact">
                  {ctaButton}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Map — directly after the contact CTA */}
        <section className="bg-background">
          <LazyMap
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              contact?.address || "3 avenue des Ternes, 75017 Paris"
            )}&output=embed`}
            title={lang === "fr" ? "Localisation du cabinet" : "Office location"}
            directionsHref={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              contact?.address || "3 avenue des Ternes, 75017 Paris"
            )}`}
            directionsLabel={lang === "fr" ? "Itinéraire" : "Get directions"}
            loadingLabel={lang === "fr" ? "Chargement de la carte…" : "Loading map…"}
            iframeClassName="w-full h-[320px] md:h-[420px]"
          />
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

const Equipe = () => <EquipeInner />;

export default Equipe;

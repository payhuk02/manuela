import { ArrowUpRight, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { AppointmentButton } from "@/components/AppointmentButton";
import { useExpertises } from "@/hooks/useExpertises";
import { getExpertiseIcon } from "@/data/expertiseIcons";
import { EXPERTISE_IMAGES, EXPERTISE_TO_HERO } from "@/data/expertiseImages";
import { useText } from "@/hooks/useText";
import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";

export const Practice = () => {
  const { data: expertises, loading } = useExpertises();
  const { textOverrides } = useSite();
  const { lang } = useLang();

  const eyebrow = useText(
    "practice.eyebrow",
    lang === "fr" ? "Domaines d'intervention" : "Practice areas"
  );
  const titlePrefix = useText(
    "practice.titlePrefix",
    lang === "fr" ? "Une expertise" : "A"
  );
  const titleAccent = useText(
    "practice.titleAccent",
    lang === "fr" ? "complète" : "comprehensive"
  );
  const titleSuffix = useText(
    "practice.titleSuffix",
    lang === "fr" ? "au service de vos enjeux." : "expertise serving your stakes."
  );
  const loadingLabel = useText(
    "practice.loading",
    lang === "fr" ? "Chargement…" : "Loading…"
  );

  return (
    <section id="practice" className="py-28 md:py-36 bg-night text-primary-foreground relative overflow-hidden">
      {/* Premium layered background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.18)_0%,transparent_55%),radial-gradient(ellipse_at_bottom_right,hsl(var(--primary-glow)/0.22)_0%,transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--accent)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)/0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[680px] rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[420px] h-[420px] rounded-full bg-primary-glow/10 blur-3xl pointer-events-none" />

      <div className="container-luxe relative">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow">{eyebrow}</p>
          <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-accent to-transparent" />
          <h2 className="mt-6 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
            {titlePrefix} <span className="text-accent">{titleAccent}</span><br />
            {titleSuffix}
          </h2>
        </div>

        {loading ? (
          <p className="mt-16 text-center text-primary-foreground/60">{loadingLabel}</p>
        ) : (
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {expertises.map((e) => {
              const Icon = getExpertiseIcon(e.icon);
              const heroKey = EXPERTISE_TO_HERO[e.slug];
              const heroImg = heroKey ? textOverrides[`${heroKey}::${lang}`] : null;
              const img = e.image_url || heroImg || EXPERTISE_IMAGES[e.slug];
              return (
                <Link
                  key={e.id}
                  to={`/expertises/${e.slug}`}
                  className="group relative overflow-hidden rounded-[2rem] p-10 flex flex-col items-center text-center bg-night border border-primary-foreground/10 shadow-[0_20px_60px_-20px_hsl(0_0%_0%/0.6)] transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_30px_80px_-20px_hsl(var(--accent)/0.25)]"
                >
                  {img && (
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 [filter:brightness(0.6)_contrast(1.1)]"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-[hsl(222_47%_15%)/0.85] to-[hsl(222_50%_10%)/0.95] mix-blend-multiply" />
                  
                  {/* hover glow */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.18)_0%,transparent_60%)]" />
                  <ArrowUpRight className="absolute right-5 top-5 h-5 w-5 text-primary-foreground/30 group-hover:text-accent transition-colors" />

                  <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/30 shadow-[inset_0_1px_0_hsl(var(--accent)/0.3)] backdrop-blur-sm">
                    <Icon className="h-9 w-9 text-accent transition-transform duration-500 group-hover:scale-110" strokeWidth={1.25} />
                  </div>
                  <h3 className="relative mt-8 font-serif text-2xl text-primary-foreground">{e.title}</h3>
                  <p className="relative mt-4 text-sm text-primary-foreground/80 leading-relaxed">{e.tagline}</p>
                </Link>
              );
            })}
          </div>
        )}

        {/* Premium CTA */}
        <div className="mt-20 flex justify-center">
          <div className="relative w-full max-w-3xl rounded-[2.5rem] p-[1px] bg-gradient-to-br from-accent/60 via-accent/20 to-primary-glow/40 shadow-[0_30px_80px_-30px_hsl(var(--accent)/0.35)]">
            <div className="relative overflow-hidden rounded-[2.4rem] bg-gradient-to-br from-[hsl(222_47%_13%)] to-[hsl(222_50%_9%)] px-8 py-12 md:px-14 md:py-14 text-center">
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-primary-glow/15 blur-3xl" />
              <div className="relative">
                <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-accent to-transparent" />
                <h3 className="mt-6 font-serif text-3xl md:text-4xl leading-tight">
                  {lang === "fr"
                    ? "Prêt à confier votre dossier à un expert ?"
                    : "Ready to entrust your case to an expert?"}
                </h3>
                <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto">
                  {lang === "fr"
                    ? "Échangeons en toute confidentialité sur votre situation et définissons ensemble la meilleure stratégie."
                    : "Let's discuss your situation in full confidentiality and define the best strategy together."}
                </p>
                <div className="mt-8 flex justify-center w-full">
                  <AppointmentButton
                    size="lg"
                    className="max-w-full whitespace-normal break-words overflow-visible text-center leading-tight h-auto min-h-12 rounded-full px-5 sm:px-8 py-3 sm:py-6 normal-case tracking-normal sm:uppercase sm:tracking-[0.22em] text-sm sm:text-base"
                    label={lang === "fr" ? "Demander un rendez-vous" : "Request an appointment"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

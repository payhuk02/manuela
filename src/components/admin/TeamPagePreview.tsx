import { RichText } from "@/components/RichText";
import { Download, ArrowRight, Mail, MessageCircle, CalendarCheck, Phone, ExternalLink, FileText } from "lucide-react";
import { useSite } from "@/hooks/SiteDataContext";
import { useAppointment } from "@/hooks/useAppointment";

type Member = {
  id: string;
  name: string;
  role_fr: string;
  role_en: string;
  bio_fr: string;
  bio_en: string;
  presentation_fr: string;
  presentation_en: string;
  photo_url: string | null;
  cv_url: string | null;
  is_founder: boolean;
  published: boolean;
  sort_order: number;
};

type Props = {
  lang: "fr" | "en";
  members: Member[];
};

/**
 * Aperçu temps réel de la page publique /equipe.
 * Reflète exactement la mise en page de src/pages/Equipe.tsx
 * (fondateur en hero + grille de partenaires) à partir de l'état local
 * de TeamAdmin — sans attendre un rechargement de la base.
 */
export const TeamPagePreview = ({ lang, members }: Props) => {
  const { contact } = useSite();
  const appt = useAppointment();
  const whatsappDisplay = contact?.whatsapp_number?.trim() || "—";
  const whatsappDigits = (contact?.whatsapp_number || "").replace(/[^\d]/g, "");
  const waHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}`
    : appt.waHref;
  const apptHref = appt.href;
  const apptIsExternal = !!appt.appointmentUrl;

  // Show ALL members in the preview (published + drafts) so admins can see
  // exactly which entries will go live and which won't.
  const sorted = [...members].sort((a, b) => a.sort_order - b.sort_order);
  const founder = sorted.find((m) => m.is_founder);
  const partners = sorted.filter((m) => !m.is_founder);

  const founderRole = founder ? (lang === "fr" ? founder.role_fr : founder.role_en) : "";
  const founderPresentation = founder
    ? lang === "fr"
      ? founder.presentation_fr || founder.bio_fr
      : founder.presentation_en || founder.bio_en
    : "";

  const publishedCount = sorted.filter((m) => m.published).length;
  const draftCount = sorted.length - publishedCount;

  const StatusBadge = ({ published }: { published: boolean }) =>
    published ? (
      <span className="inline-flex items-center gap-1 bg-status-live text-status-live-foreground text-[9px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-sm shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-status-live-foreground animate-pulse" />
        {lang === "fr" ? "Publié" : "Live"}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-status-draft text-status-draft-foreground text-[9px] font-semibold uppercase tracking-[0.18em] px-2 py-1 rounded-sm shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-status-draft-foreground" />
        {lang === "fr" ? "Brouillon" : "Draft"}
      </span>
    );

  return (
    <div className="bg-background relative">
      {/* Simulated browser bar */}
      <div className="bg-night/95 text-primary-foreground/80 border-b border-primary-foreground/10">
        <div className="px-5 py-2.5 text-[11px] font-mono flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent/40" />
          </div>
          <span className="text-accent uppercase tracking-[0.2em] text-[9px]">URL</span>
          <span className="truncate opacity-80">/equipe</span>
          <span className="ml-auto text-[9px] uppercase tracking-[0.2em] text-accent">
            {lang.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Editorial status banner */}
      <div className="bg-card border-b border-border px-5 py-2.5 flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-status-live" />
            <span className="text-foreground/80">
              <strong className="text-foreground">{publishedCount}</strong>{" "}
              {lang === "fr" ? "publié" : "live"}{publishedCount > 1 ? "s" : ""}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-status-draft" />
            <span className="text-foreground/80">
              <strong className="text-foreground">{draftCount}</strong>{" "}
              {lang === "fr" ? "brouillon" : "draft"}{draftCount > 1 ? "s" : ""}
            </span>
          </span>
        </div>
        <span className="text-muted-foreground italic hidden md:inline">
          {lang === "fr"
            ? "Les brouillons sont grisés et invisibles sur le site public."
            : "Drafts are dimmed and hidden on the live site."}
        </span>
      </div>

      {/* Booking & WhatsApp config bar — visualises what the floating buttons will do once published. */}
      <div className="bg-muted/40 border-b border-border px-5 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-3 w-3 text-whatsapp" />
          <span className="uppercase tracking-[0.18em] text-muted-foreground text-[9px]">WhatsApp</span>
          {whatsappDigits ? (
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-foreground hover:text-accent transition-colors"
              title={lang === "fr" ? "Tester le lien WhatsApp" : "Test WhatsApp link"}
            >
              {whatsappDisplay}
            </a>
          ) : (
            <span className="font-mono text-destructive italic">
              {lang === "fr" ? "non configuré" : "not set"}
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <CalendarCheck className="h-3 w-3 text-accent" />
          <span className="uppercase tracking-[0.18em] text-muted-foreground text-[9px]">
            {lang === "fr" ? "RDV" : "Booking"}
          </span>
          {appt.appointmentUrl ? (
            <a
              href={appt.appointmentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:text-accent transition-colors truncate max-w-[220px]"
              title={appt.appointmentUrl}
            >
              {appt.appointmentUrl}
            </a>
          ) : (
            <span className="text-muted-foreground italic">
              {lang === "fr" ? "WhatsApp (aucun lien dédié)" : "WhatsApp (no dedicated link)"}
            </span>
          )}
        </span>
      </div>

      {/* Hero */}
      <section className="relative px-6 py-14 md:py-20 min-h-[360px] md:min-h-[440px] flex items-end bg-night text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))_0%,transparent_50%)]" />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
            {lang === "fr" ? "Notre équipe" : "Our team"}
          </p>
          <h1 className="mt-3 font-serif text-2xl md:text-3xl leading-[1.1] max-w-2xl">
            {lang === "fr" ? (
              <>
                Des avocats <span className="italic text-accent">engagés</span>,<br />
                des parcours d'exception.
              </>
            ) : (
              <>
                Committed lawyers, <span className="italic text-accent">exceptional</span> careers.
              </>
            )}
          </h1>
        </div>
      </section>

      {/* Founder */}
      <section className="px-6 py-10 md:py-12 bg-background">
        {founder ? (
          <div
            className={`grid md:grid-cols-12 gap-8 items-start transition-opacity ${
              founder.published ? "" : "opacity-50"
            }`}
          >
            <div className="md:col-span-5 relative">
              <div
                className={`aspect-[4/5] overflow-hidden bg-secondary shadow-elegant relative ${
                  founder.published ? "" : "outline outline-2 outline-dashed outline-status-draft"
                }`}
              >
                {founder.photo_url ? (
                  <img
                    src={founder.photo_url}
                    alt={founder.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center text-xs text-muted-foreground">
                    {lang === "fr" ? "Photo manquante" : "Missing photo"}
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <StatusBadge published={founder.published} />
                </div>
              </div>
              <div className="hidden md:block absolute -bottom-3 -right-3 h-12 w-12 border-2 border-accent" aria-hidden />
            </div>

            <div className="md:col-span-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
                {lang === "fr" ? "Avocat fondateur" : "Founding attorney"}
              </p>
              <h2 className="mt-2 font-serif text-2xl md:text-3xl text-primary leading-tight">
                {founder.name || (lang === "fr" ? "Sans nom" : "Untitled")}
              </h2>
              {founderRole && (
                <p className="mt-1.5 text-sm text-accent tracking-wide">{founderRole}</p>
              )}
              <div className="my-5 h-px w-16 bg-accent" />
              {founderPresentation ? (
                <RichText
                  html={founderPresentation}
                  className="prose-luxe text-sm text-foreground/85 leading-relaxed"
                />
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  {lang === "fr"
                    ? "Renseignez la « Présentation détaillée » pour la voir s'afficher ici."
                    : "Fill in the detailed presentation to display it here."}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {founder.cv_url ? (
                  <a
                    href={founder.cv_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-xs uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {lang === "fr" ? "Télécharger le CV" : "Download CV"}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 border border-dashed border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <Download className="h-3.5 w-3.5" />
                    {lang === "fr" ? "CV non téléversé" : "No CV uploaded"}
                  </span>
                )}
                <span className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground/70">
                  <Mail className="h-3.5 w-3.5" />
                  {lang === "fr" ? "Prendre contact" : "Get in touch"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-border p-6 text-sm text-muted-foreground italic">
            {lang === "fr"
              ? "Aucun membre n'est marqué comme « Fondateur ». Cochez la case « Fondateur » sur un membre publié pour qu'il s'affiche ici."
              : "No member marked as Founder. Tick the Founder checkbox on a published member."}
          </div>
        )}
      </section>

      {/* Partners */}
      {partners.length > 0 && (
        <section className="px-6 py-10 md:py-12 bg-muted/30">
          <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
            {lang === "fr" ? "Nos avocats partenaires" : "Our partner attorneys"}
          </p>
          <h2 className="mt-2 font-serif text-xl md:text-2xl text-primary leading-tight max-w-2xl">
            {lang === "fr"
              ? "Une équipe d'expertise complémentaire."
              : "A team of complementary expertise."}
          </h2>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {partners.map((m) => {
              const role = lang === "fr" ? m.role_fr : m.role_en;
              const hasDetails = !!(
                (lang === "fr" ? m.presentation_fr || m.bio_fr : m.presentation_en || m.bio_en) ||
                m.cv_url
              );
              return (
                <article
                  key={m.id}
                  className={`bg-background border transition-opacity flex flex-col ${
                    m.published
                      ? "border-border"
                      : "border-status-draft/60 border-dashed opacity-60"
                  }`}
                >
                  <div className="relative overflow-hidden bg-secondary aspect-[4/5]">
                    {m.photo_url ? (
                      <img
                        src={m.photo_url}
                        alt={m.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-[10px] text-muted-foreground">
                        {lang === "fr" ? "Photo manquante" : "Missing photo"}
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <StatusBadge published={m.published} />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-serif text-base text-primary leading-tight">
                      {m.name || (lang === "fr" ? "Sans nom" : "Untitled")}
                    </h3>
                    {role && (
                      <p className="mt-0.5 text-[11px] text-accent tracking-wide">{role}</p>
                    )}
                    <div className="mt-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-appointment text-white px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] font-bold">
                        {lang === "fr" ? "En savoir plus" : "Learn more"}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                      {!hasDetails && (
                        <p className="mt-2 text-[10px] text-muted-foreground italic">
                          {lang === "fr"
                            ? "Astuce : remplissez la présentation détaillée et/ou le CV pour enrichir la fiche."
                            : "Tip: fill in the detailed presentation and/or CV to enrich this profile."}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-6 py-8 bg-background border-t border-border text-center">
        <h2 className="font-serif text-lg text-primary">
          {lang === "fr" ? "Une question, un projet ?" : "A question, a project?"}
        </h2>
        <span className="mt-3 inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 text-xs uppercase tracking-[0.2em]">
          {lang === "fr" ? "Nous contacter" : "Contact us"}
          <ArrowRight className="h-3 w-3" />
        </span>
      </section>

      {/* Floating actions overlay — real, clickable links so the admin can verify booking & WhatsApp targets before publishing. */}
      <div className="sticky bottom-3 left-0 right-0 z-10 px-4 pb-3 pointer-events-none">
        <div className="flex flex-col gap-2 items-end">
          <a
            href={apptHref}
            target={apptIsExternal ? "_blank" : undefined}
            rel={apptIsExternal ? "noreferrer" : undefined}
            className="inline-flex items-center gap-2 rounded-full bg-appointment text-white px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] shadow-elegant pointer-events-auto hover:bg-appointment/90 transition-colors font-bold"
            title={
              apptIsExternal
                ? appt.appointmentUrl
                : lang === "fr"
                ? "Aucun lien dédié — utilise WhatsApp"
                : "No dedicated link — uses WhatsApp"
            }
          >
            <CalendarCheck className="h-3.5 w-3.5" />
            {lang === "fr" ? "Prendre rendez-vous" : "Book appointment"}
            {apptIsExternal && <ExternalLink className="h-3 w-3 opacity-70" />}
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="grid place-items-center h-11 w-11 rounded-full bg-whatsapp text-whatsapp-foreground shadow-gold pointer-events-auto hover:scale-105 transition-transform"
            aria-label="WhatsApp"
            title={whatsappDisplay}
          >
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          </a>
        </div>
      </div>
    </div>
  );
};

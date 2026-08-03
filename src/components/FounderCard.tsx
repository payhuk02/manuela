import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";
import { useSite } from "@/hooks/SiteDataContext";
import { useFounderProfile, type FounderItem } from "@/hooks/useFounderProfile";
import { RichText } from "@/components/RichText";
import * as LucideIcons from "lucide-react";
import {
  Linkedin,
  Mail,
  Briefcase,
  Globe,
  GraduationCap,
  Network,
  Check,
  type LucideIcon,
} from "lucide-react";

/**
 * Renders a multi-line subtitle as a checked list — one gold check (✓) per line.
 * Splits on newlines OR on common bullet separators (•, ;, |) so admins can
 * paste plain prose and still get a tidy bulleted output.
 * `tone` toggles colors for the dark premium variant vs. the light card.
 */
const SubtitleCheckList = ({
  text,
  tone = "light",
}: {
  text: string;
  tone?: "light" | "dark";
}) => {
  const lines = text
    .split(/\r?\n|\s•\s|\s\|\s|;\s+/)
    .map((l) => l.replace(/^[\s•\-–—*]+/, "").trim())
    .filter(Boolean);
  if (lines.length === 0) return null;
  const textClass = tone === "dark" ? "text-primary-foreground/80" : "text-foreground/75";
  return (
    <ul className="mt-1.5 space-y-1">
      {lines.map((line, i) => (
        <li key={i} className={`flex items-start gap-2 text-sm leading-relaxed ${textClass}`}>
          <Check
            className="h-3.5 w-3.5 mt-[3px] shrink-0 text-accent"
            strokeWidth={2.5}
            aria-hidden="true"
          />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
};

type Props = {
  founder: {
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
    linkedin_url?: string | null;
  };
  /** Optional override — when provided, skips the Supabase fetch and renders these items instead. Used by the admin live preview. */
  itemsOverride?: FounderItem[];
  /** Optional language override (admin preview supports both FR/EN tabs). */
  langOverride?: "fr" | "en";
};

/** Resolve a Lucide icon name to a component, with safe fallback. */
function getIcon(name: string, fallback: LucideIcon): LucideIcon {
  if (!name) return fallback;
  const cleaned = name.trim();
  const found = (LucideIcons as unknown as Record<string, LucideIcon>)[cleaned];
  return found || fallback;
}

/**
 * FounderCard — premium presentation block inspired by kottinpartners.com/equipe.
 * Shows the tagline + presentation alongside the photo (with floating social
 * actions and a gold "Fondateur" badge), then a grid of editorial cards
 * (Expertises, Languages, Formation, Parcours, Associations) fed by the
 * `founder_profile_items` Supabase table — fully editable from /admin.
 */
export const FounderCard = ({ founder, itemsOverride, langOverride }: Props) => {
  const { lang: ctxLang } = useLang();
  const lang = langOverride ?? ctxLang;
  const { contact } = useSite();
  const fetched = useFounderProfile();
  // When an override is supplied, derive byCategory locally to avoid the network call effect.
  const items = itemsOverride ?? fetched.items;
  const byCategory = (cat: string) =>
    items
      .filter((i) => i.category === cat && i.published)
      .sort((a, b) => a.sort_order - b.sort_order);
  const loading = itemsOverride ? false : fetched.loading;

  const role = lang === "fr" ? founder.role_fr : founder.role_en;
  const presentation =
    lang === "fr"
      ? founder.presentation_fr || founder.bio_fr
      : founder.presentation_en || founder.bio_en;

  const tagline = byCategory("tagline")[0];
  const taglineText = tagline
    ? lang === "fr"
      ? tagline.title_fr
      : tagline.title_en
    : "";

  const founderBadge = useText(
    "teamPage.founderBadge",
    lang === "fr" ? "FONDATEUR" : "FOUNDER"
  );

  const expertiseLabel = useText(
    "teamPage.section.expertise",
    lang === "fr" ? "Domaines d'expertise" : "Areas of expertise"
  );
  const languagesLabel = useText(
    "teamPage.section.languages",
    lang === "fr" ? "Langues" : "Languages"
  );
  const formationLabel = useText(
    "teamPage.section.formation",
    lang === "fr" ? "Formation" : "Education"
  );
  const parcoursLabel = useText(
    "teamPage.section.parcours",
    lang === "fr" ? "Parcours" : "Career"
  );
  const associationLabel = useText(
    "teamPage.section.associations",
    lang === "fr" ? "Associations professionnelles" : "Professional associations"
  );

  const expertises = byCategory("expertise");
  const languages = byCategory("language");
  const formations = byCategory("formation");
  const parcours = byCategory("parcours");
  const associations = byCategory("association");

  const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`bg-card rounded-3xl shadow-elegant border border-border/40 p-7 md:p-9 ${className}`}
    >
      {children}
    </div>
  );

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="font-serif text-2xl md:text-[1.65rem] text-primary mb-7">{children}</h3>
  );

  const IconBubble = ({
    icon: Icon,
    color,
  }: {
    icon: LucideIcon;
    color?: string;
  }) => (
    <span
      className="grid place-items-center h-9 w-9 rounded-full bg-muted shrink-0"
      style={color ? { backgroundColor: color.includes(" ") ? `hsl(${color} / 0.12)` : color, color: color.includes(" ") ? `hsl(${color})` : undefined } : undefined}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
    </span>
  );

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container-luxe space-y-10">
        {/* Top: photo + presentation */}
        <Card className="!p-6 md:!p-10 lg:!p-12">
          <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-14 items-start">
            {/* Photo + floating actions + gold badge */}
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary shadow-elegant">
                {founder.photo_url ? (
                  <img
                    src={founder.photo_url}
                    alt={founder.name}
                    width={840}
                    height={1050}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="h-full w-full grid place-items-center bg-gradient-to-br from-secondary to-muted">
                    <span className="font-serif text-7xl text-primary/30">
                      {founder.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                )}

                {/* Floating socials top-right */}
                <div className="absolute top-4 right-4 flex flex-col gap-2.5">
                  {founder.linkedin_url && (
                    <a
                      href={founder.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                      className="grid place-items-center h-10 w-10 rounded-full bg-background/95 text-primary shadow-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {contact?.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      aria-label="Email"
                      className="grid place-items-center h-10 w-10 rounded-full bg-background/95 text-primary shadow-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Name + founder label below the image */}
              <div className="mt-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] font-semibold text-accent">
                  {founderBadge}
                </p>
                <p className="mt-2 font-serif text-2xl md:text-[1.6rem] text-primary leading-tight">
                  {founder.name}
                </p>
                <span className="block mx-auto mt-3 h-px w-12 bg-accent/60" aria-hidden="true" />
              </div>
            </div>

            {/* Tagline + presentation */}
            <div className="lg:pt-2">
              {taglineText && (
                <h2 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] text-primary leading-[1.15]">
                  {taglineText}
                </h2>
              )}
              {role && (
                <p className="mt-3 text-sm text-accent tracking-wide uppercase">
                  {role}
                </p>
              )}
              {presentation ? (
                <RichText
                  html={presentation}
                  className="prose-luxe mt-6 text-[15px] md:text-base text-foreground/80 leading-relaxed text-justify hyphens-auto [text-align-last:left]"
                />
              ) : (
                <p className="mt-6 text-muted-foreground italic">
                  {lang === "fr" ? "Présentation à venir." : "Presentation coming soon."}
                </p>
              )}
            </div>
          </div>
        </Card>

        {loading ? null : (
          <>
            {/* Languages — centered standalone card */}
            {languages.length > 0 && (
              <div className="flex justify-center">
                <div className="w-full max-w-2xl">
                  <Card className="relative overflow-hidden bg-gradient-to-br from-[hsl(215_50%_14%)] via-[hsl(215_45%_18%)] to-[hsl(215_40%_22%)] border-accent/20 text-primary-foreground shadow-[0_20px_60px_-20px_hsl(215_50%_10%/0.5)]">
                    {/* Premium decorative layers */}
                    <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_85%_15%,hsl(var(--accent))_0%,transparent_55%)]" aria-hidden="true" />
                    <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
                    <div className="relative">
                    <h3 className="font-serif text-2xl md:text-[1.65rem] text-primary-foreground mb-7 text-center">
                      <span className="inline-block relative">
                        {languagesLabel}
                        <span className="block mx-auto mt-2 h-px w-10 bg-accent/70" aria-hidden="true" />
                      </span>
                    </h3>
                    <ul className="space-y-6 max-w-md mx-auto">
                      {languages.map((l, idx) => {
                        const Icon = getIcon(l.icon, Globe);
                        const level = Math.max(0, Math.min(100, parseInt(l.meta || "0", 10) || 0));
                        const langName = lang === "fr" ? l.title_fr : l.title_en;

                        // Color derived from proficiency level — admin-defined `l.color` takes precedence.
                        // Tuned to read well on a dark midnight-blue card background.
                        const levelHsl =
                          level >= 90 ? "150 55% 60%"   // emerald — mastery
                          : level >= 70 ? "38 75% 65%"  // champagne gold — fluent
                          : level >= 50 ? "210 75% 70%" // sky blue — professional
                          : "350 65% 65%";              // rose — basic
                        const raw = l.color?.trim();
                        const hsl = raw && raw.includes(" ") ? raw : levelHsl;
                        const tint = `hsl(${hsl})`;
                        const tintBg = `hsl(${hsl} / 0.18)`;
                        const tintTrack = `hsl(0 0% 100% / 0.12)`;

                        return (
                          <li key={l.id} className="flex items-center gap-4 group">
                            {/* Tinted rounded tile with icon */}
                            <span
                              className="grid place-items-center h-12 w-12 rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
                              style={{ backgroundColor: tintBg }}
                              aria-hidden="true"
                            >
                              <Icon
                                className="h-5 w-5"
                                strokeWidth={1.75}
                                style={{ color: tint }}
                              />
                            </span>

                            <div className="flex-1 min-w-0">
                              <p
                                className="font-serif text-lg leading-none mb-2.5"
                                style={{ color: tint }}
                              >
                                {langName}
                              </p>
                              <div
                                className="h-2 rounded-full overflow-hidden"
                                style={{ backgroundColor: tintTrack }}
                                role="progressbar"
                                aria-valuenow={level}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={langName}
                              >
                                <div
                                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                                  style={{ width: `${level}%`, backgroundColor: tint }}
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Formation + Parcours */}
            {(formations.length > 0 || parcours.length > 0) && (
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
                {formations.length > 0 && (
                  <Card className="relative overflow-hidden bg-gradient-to-br from-[hsl(215_50%_14%)] via-[hsl(215_45%_18%)] to-[hsl(215_40%_22%)] border-accent/20 text-primary-foreground shadow-[0_20px_60px_-20px_hsl(215_50%_10%/0.5)]">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_85%_15%,hsl(var(--accent))_0%,transparent_55%)]" aria-hidden="true" />
                    <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
                    <div className="relative">
                      <h3 className="font-serif text-2xl md:text-[1.65rem] mb-7 text-center" style={{ color: "hsl(210 90% 72%)" }}>
                        <span className="inline-block relative">
                          {formationLabel}
                          <span className="block mx-auto mt-2 h-px w-10 bg-accent/70" aria-hidden="true" />
                        </span>
                      </h3>
                      <PremiumTimeline items={formations} lang={lang} fallbackIcon={GraduationCap} />
                    </div>
                  </Card>
                )}
                {parcours.length > 0 && (
                  <Card className="relative overflow-hidden bg-gradient-to-br from-[hsl(215_50%_14%)] via-[hsl(215_45%_18%)] to-[hsl(215_40%_22%)] border-accent/20 text-primary-foreground shadow-[0_20px_60px_-20px_hsl(215_50%_10%/0.5)]">
                    <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_15%_15%,hsl(var(--accent))_0%,transparent_55%)]" aria-hidden="true" />
                    <div className="pointer-events-none absolute -top-16 -left-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
                    <div className="relative">
                      <h3 className="font-serif text-2xl md:text-[1.65rem] mb-7 text-center" style={{ color: "hsl(210 90% 72%)" }}>
                        <span className="inline-block relative">
                          {parcoursLabel}
                          <span className="block mx-auto mt-2 h-px w-10 bg-accent/70" aria-hidden="true" />
                        </span>
                      </h3>
                      <PremiumTimeline items={parcours} lang={lang} fallbackIcon={Briefcase} />
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Expertises — premium midnight-blue card, placed below Formations/Parcours */}
            {expertises.length > 0 && (
              <Card className="relative overflow-hidden bg-gradient-to-br from-[hsl(215_50%_14%)] via-[hsl(215_45%_18%)] to-[hsl(215_40%_22%)] border-accent/20 text-primary-foreground shadow-[0_20px_60px_-20px_hsl(215_50%_10%/0.5)]">
                <div className="pointer-events-none absolute inset-0 opacity-[0.18] bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent))_0%,transparent_55%)]" aria-hidden="true" />
                <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" aria-hidden="true" />
                <div className="relative">
                  <h3 className="font-serif text-2xl md:text-[1.65rem] mb-8 text-center" style={{ color: "hsl(210 90% 72%)" }}>
                    <span className="inline-block relative">
                      {expertiseLabel}
                      <span className="block mx-auto mt-2 h-px w-10 bg-accent/70" aria-hidden="true" />
                    </span>
                  </h3>
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {expertises.map((e) => {
                      const Icon = getIcon(e.icon, Briefcase);
                      const raw = e.color?.trim();
                      const tint = raw && raw.includes(" ") ? `hsl(${raw})` : "hsl(var(--accent))";
                      const tintBg = raw && raw.includes(" ") ? `hsl(${raw} / 0.18)` : "hsl(var(--accent) / 0.15)";
                      const tintBorder = raw && raw.includes(" ") ? `hsl(${raw} / 0.35)` : "hsl(var(--accent) / 0.30)";
                      return (
                        <li
                          key={e.id}
                          className="group relative rounded-2xl p-5 md:p-6 bg-white/[0.04] border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.07] hover:shadow-[0_15px_45px_-15px_hsl(215_50%_5%/0.6)]"
                          style={{ borderColor: tintBorder }}
                        >
                          <span
                            className="grid place-items-center h-11 w-11 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: tintBg }}
                            aria-hidden="true"
                          >
                            <Icon className="h-5 w-5" strokeWidth={1.75} style={{ color: tint }} />
                          </span>
                          <p className="font-serif text-lg leading-snug" style={{ color: tint }}>
                            {lang === "fr" ? e.title_fr : e.title_en}
                          </p>
                          <SubtitleCheckList
                            text={(lang === "fr" ? e.subtitle_fr : e.subtitle_en) ?? ""}
                            tone="dark"
                          />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Card>
            )}

            {/* Associations */}
            {associations.length > 0 && (
              <Card>
                <SectionTitle>{associationLabel}</SectionTitle>
                <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                  {associations.map((a) => {
                    const Icon = getIcon(a.icon, Network);
                    return (
                      <li key={a.id} className="flex gap-3.5">
                        <IconBubble icon={Icon} color={a.color} />
                        <p className="font-medium text-primary leading-snug pt-1">
                          {lang === "fr" ? a.title_fr : a.title_en}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            )}
          </>
        )}
      </div>
    </section>
  );
};

/** Vertical timeline used for Formation & Parcours sections. */
const Timeline = ({
  items,
  lang,
  fallbackIcon,
}: {
  items: FounderItem[];
  lang: "fr" | "en";
  fallbackIcon: LucideIcon;
}) => (
  <ol className="relative space-y-7">
    {items.map((item, idx) => (
      <li key={item.id} className="relative pl-7">
        <span
          className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-accent/15"
          aria-hidden="true"
        />
        {idx < items.length - 1 && (
          <span
            className="absolute left-[5px] top-4 bottom-[-1.75rem] w-px bg-border"
            aria-hidden="true"
          />
        )}
        <p className="font-medium text-primary leading-snug">
          {lang === "fr" ? item.title_fr : item.title_en}
        </p>
        {(lang === "fr" ? item.subtitle_fr : item.subtitle_en) && (
          <p className="mt-1.5 text-sm text-foreground/75 leading-relaxed whitespace-pre-line">
            {lang === "fr" ? item.subtitle_fr : item.subtitle_en}
          </p>
        )}
        {item.meta && (
          <p className="mt-1 text-xs text-muted-foreground tracking-wide">{item.meta}</p>
        )}
      </li>
    ))}
  </ol>
);

/** Vertical timeline tuned for the dark premium card variant. */
const PremiumTimeline = ({
  items,
  lang,
  fallbackIcon: _fallbackIcon,
}: {
  items: FounderItem[];
  lang: "fr" | "en";
  fallbackIcon: LucideIcon;
}) => (
  <ol className="relative space-y-7">
    {items.map((item, idx) => (
      <li key={item.id} className="relative pl-7">
        <span
          className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20"
          aria-hidden="true"
        />
        {idx < items.length - 1 && (
          <span
            className="absolute left-[5px] top-4 bottom-[-1.75rem] w-px bg-white/15"
            aria-hidden="true"
          />
        )}
        <p className="font-medium text-primary-foreground leading-snug">
          {lang === "fr" ? item.title_fr : item.title_en}
        </p>
        {(lang === "fr" ? item.subtitle_fr : item.subtitle_en) && (
          <p className="mt-1.5 text-sm text-primary-foreground/80 leading-relaxed whitespace-pre-line">
            {lang === "fr" ? item.subtitle_fr : item.subtitle_en}
          </p>
        )}
        {item.meta && (
          <p className="mt-1 text-xs text-accent/90 tracking-wide">{item.meta}</p>
        )}
      </li>
    ))}
  </ol>
);

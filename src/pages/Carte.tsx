import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Phone,
  Mail,
  Globe,
  MapPin,
  Linkedin, Instagram ,
  Download,
  QrCode,
  MessageCircle,
  Calendar,
  Clock,
} from "lucide-react";

import { useLogo } from "@/hooks/useLogos";

/* Vraies données extraites de cabinet-diabate.com (servent de fallback) */
const DEFAULTS = {
  cabinet: "CABINET Manuela DIABATE",
  name: "Maître Manuela DIABATE",
  subtitle: "Avocat au Barreau de Paris",
  tagline: "Conseil & Contentieux — Expertise France & Afrique",
  email: "manuela.diabate@mdi-avocats.com",
  phone: "06 59 76 42 51",
  whatsapp: "06 59 76 42 51",
  address: "47 Rue Rémy-DUMONCEL 75014 PARIS",
  hours: "Lundi au vendredi de 9 heures- 20 heures",
  website: "https://cabinet-diabate.com",
  linkedin: "https://www.linkedin.com/in/manuela-diabate",
  instagram: "https://instagram.com/manuela.diabate",
  appointment: "https://consultation.avocat.fr/avocat-paris/manuela-diabate-48544.html",
};

type CardData = typeof DEFAULTS & { photo: string };

function digits(value: string) {
  return value.replace(/[^0-9+]/g, "");
}

function buildVCard(d: CardData) {
  const tel = digits(d.phone);
  const mobile = digits(d.whatsapp);
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${d.name}`,
    "N:DIABATE;Manuela;;Maître;",
    `ORG:${d.cabinet}`,
    `TITLE:${d.subtitle}`,
    tel ? `TEL;TYPE=WORK,VOICE:${tel}` : "",
    mobile ? `TEL;TYPE=CELL,VOICE:${mobile}` : "",
    d.email ? `EMAIL;TYPE=WORK:${d.email}` : "",
    d.website ? `URL:${d.website}` : "",
    d.address ? `ADR;TYPE=WORK:;;${d.address.replace(/,/g, "\\,")};;;;` : "",
    d.linkedin ? `URL;TYPE=LinkedIn:${d.linkedin}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");
}

export default function Carte() {
  const [data, setData] = useState<CardData>({ ...DEFAULTS, photo: "" });

  useEffect(() => {
    let cancelled = false;
    document.title = `${DEFAULTS.name} — ${DEFAULTS.subtitle}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        `Carte de visite numérique de ${DEFAULTS.name}, ${DEFAULTS.subtitle}.`
      );
    }
    (async () => {
      const [contactRes, founderRes, contentRes] = await Promise.all([
        supabase.from("contact_info").select("*").limit(1).maybeSingle(),
        supabase
          .from("team_members")
          .select("name,photo_url,role_fr,linkedin_url,email,phone,office_address")
          .eq("is_founder", true)
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("site_content")
          .select("key,value")
          .eq("lang", "fr")
          .like("key", "card.%"),
      ]);
      if (cancelled) return;
      const ci = contactRes.data ?? {};
      const fm = founderRes.data ?? {};
      const overrides: Record<string, string> = Object.fromEntries(
        (contentRes.data ?? []).map((r: any) => [r.key, r.value ?? ""])
      );
      const get = (key: string, fallback: string) => {
        const v = overrides[key];
        return v && v.trim() ? v.trim() : fallback;
      };
      setData({
        cabinet: get("card.cabinet", (ci as any).cabinet_name_fr || DEFAULTS.cabinet),
        name: get("card.name", (fm as any).name || DEFAULTS.name),
        subtitle: get("card.subtitle", DEFAULTS.subtitle),
        tagline: get("card.tagline", DEFAULTS.tagline),
        email: get("card.email", (ci as any).email || (fm as any).email || DEFAULTS.email),
        phone: get("card.phone", (ci as any).phone || (fm as any).phone || DEFAULTS.phone),
        whatsapp: get("card.whatsapp", (ci as any).whatsapp_number || DEFAULTS.whatsapp),
        address: get("card.address", (ci as any).address || (fm as any).office_address || DEFAULTS.address),
        hours: get("card.hours", (ci as any).hours_fr || DEFAULTS.hours),
        website: get("card.website", DEFAULTS.website),
        linkedin: get("card.linkedin", (ci as any).linkedin_url || (fm as any).linkedin_url || DEFAULTS.linkedin),
        instagram: get("card.instagram", DEFAULTS.instagram),
        appointment: get("card.appointment", (ci as any).appointment_url || DEFAULTS.appointment),
        photo: get("card.photo", (fm as any).photo_url || ""),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const vcardHref = useMemo(() => {
    const blob = new Blob([buildVCard(data)], { type: "text/vcard;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [data]);

  const logoDark = useLogo("logo.header", null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[hsl(var(--night))] text-primary-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(60% 40% at 50% 0%, hsl(var(--accent) / 0.55), transparent 70%), radial-gradient(40% 30% at 50% 100%, hsl(var(--accent) / 0.32), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "var(--gradient-gold)" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 py-8">
        <header className="flex items-center justify-center pt-3">
          {logoDark && <img src={logoDark} alt={data.cabinet} className="h-16 md:h-20 w-auto opacity-95 drop-shadow-[0_4px_16px_rgba(201,168,76,0.25)]" />}
        </header>

        <section className="mt-9 flex flex-col items-center text-center">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-3 rounded-full blur-2xl opacity-40"
              style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.55), transparent 70%)" }}
            />
            <div
              className="relative rounded-full p-[3px]"
              style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-gold)" }}
            >
              <img
                src={data.photo}
                sizes="192px"
                alt={data.name}
                width={192}
                height={192}
                className="h-48 w-48 rounded-full object-cover object-[center_15%] ring-1 ring-[hsl(var(--accent))/30]"
                loading="eager"
              />
            </div>
          </div>

          <p
            className="mt-6 text-[0.7rem] font-medium uppercase tracking-[0.32em]"
            style={{ color: "hsl(var(--accent))" }}
          >
            {data.cabinet}
          </p>
          <h1
            className="mt-3 text-3xl leading-tight"
            style={{ fontFamily: "Cormorant Garamond, serif", fontWeight: 500 }}
          >
            {data.name}
          </h1>
          <div className="mt-3 flex items-center justify-center gap-3">
            <span className="h-px w-8" style={{ background: "hsl(var(--accent) / 0.6)" }} />
            <span className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/85">
              {data.subtitle}
            </span>
            <span className="h-px w-8" style={{ background: "hsl(var(--accent) / 0.6)" }} />
          </div>
          {data.tagline && (
            <p
              className="mt-4 max-w-[22rem] text-sm italic text-primary-foreground/70"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              {data.tagline}
            </p>
          )}
        </section>

        <a
          href={vcardHref}
          download={`${data.name.replace(/\s+/g, "-")}.vcf`}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3.5 text-sm font-medium uppercase tracking-[0.18em] transition-transform duration-300 hover:-translate-y-0.5"
          style={{
            background: "var(--gradient-gold)",
            color: "hsl(var(--accent-foreground))",
            boxShadow: "var(--shadow-gold)",
          }}
        >
          <Download className="h-4 w-4" />
          Enregistrer le contact
        </a>

        {data.appointment && (
          <a
            href={data.appointment}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-sm border border-[hsl(var(--accent))/40] px-5 py-3 text-sm uppercase tracking-[0.18em] text-primary-foreground/95 transition-colors hover:bg-white/[0.05]"
          >
            <Calendar className="h-4 w-4" style={{ color: "hsl(var(--accent))" }} />
            Prendre rendez-vous
          </a>
        )}

        <section className="mt-6 space-y-2">
          {data.phone && (
            <Row
              href={`tel:${digits(data.phone)}`}
              icon={<Phone className="h-4 w-4" />}
              label="Cabinet"
              value={data.phone}
            />
          )}
          {data.whatsapp && (
            <Row
              href={`https://wa.me/${digits(data.whatsapp).replace(/^\+/, "")}`}
              icon={<MessageCircle className="h-4 w-4" />}
              label="Mobile · WhatsApp"
              value={data.whatsapp}
              external
            />
          )}
          {data.email && (
            <Row
              href={`mailto:${data.email}`}
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={data.email}
            />
          )}
          {data.address && (
            <Row
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}`}
              icon={<MapPin className="h-4 w-4" />}
              label="Cabinet"
              value={data.address}
              external
            />
          )}
          {data.hours && (
            <Row
              icon={<Clock className="h-4 w-4" />}
              label="Horaires"
              value={data.hours}
            />
          )}
          {data.website && (
            <Row
              href={data.website}
              icon={<Globe className="h-4 w-4" />}
              label="Site web"
              value={data.website.replace(/^https?:\/\//, "")}
              external
            />
          )}
          {data.linkedin && (
            <Row
              href={data.linkedin}
              icon={<Linkedin className="h-4 w-4" />}
              label="LinkedIn"
              value="LinkedIn"
              external
            />
          )}
        </section>

        <footer className="mt-auto pt-10 text-center">
          <div className="mx-auto flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.32em] text-primary-foreground/50">
            <QrCode className="h-3 w-3" />
            Carte de visite numérique
          </div>
          <p className="mt-3 text-[10px] tracking-wider text-primary-foreground/40">
            © {new Date().getFullYear()} {data.cabinet}
          </p>
        </footer>
      </div>
    </main>
  );
}

function Row({
  href,
  icon,
  label,
  value,
  external,
}: {
  href?: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  external?: boolean;
}) {
  const Cmp: any = href ? "a" : "div";
  return (
    <Cmp
      {...(href
        ? {
            href,
            target: external ? "_blank" : undefined,
            rel: external ? "noopener noreferrer" : undefined,
          }
        : {})}
      className={`group flex items-center gap-4 rounded-sm border border-[hsl(var(--accent))/15] bg-white/[0.03] px-4 py-3.5 backdrop-blur-sm transition-all duration-300 ${
        href ? "hover:border-[hsl(var(--accent))/45] hover:bg-white/[0.06]" : ""
      }`}
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "hsl(var(--accent) / 0.12)", color: "hsl(var(--accent))" }}
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="text-[10px] uppercase tracking-[0.24em] text-primary-foreground/55">
          {label}
        </span>
        <span
          className={`truncate text-sm text-primary-foreground/95 ${
            href ? "group-hover:text-[hsl(var(--accent))]" : ""
          }`}
        >
          {value}
        </span>
      </span>
    </Cmp>
  );
}

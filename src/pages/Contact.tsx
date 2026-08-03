import { useState } from "react";
import { z } from "zod";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useBreadcrumbJsonLd } from "@/lib/useBreadcrumbJsonLd";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { useText } from "@/hooks/useText";
import { useAppointment } from "@/hooks/useAppointment";
import { AppointmentButton } from "@/components/AppointmentButton";
import { 
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Linkedin, Instagram, IdCard ,
  Clock,
  Building2,
  PhoneCall,
  Video,
  MessageSquareText,
  ChevronRight,
} from "lucide-react";
/* eslint-disable import/no-unresolved */
import heroContactPic from "@/assets/hero-contact.jpg?responsive";
/* eslint-enable import/no-unresolved */
import { ResponsiveImage, type ResponsivePicture } from "@/components/ResponsiveImage";

const heroContactPicture = heroContactPic as unknown as ResponsivePicture;

const SESSION_KEY = "contact_send_count";
const MAX_SENDS_PER_SESSION = 3;

const ADDRESS = "47 Rue Rémy-DUMONCEL 75014 PARIS";
const PHONE = "06 59 76 42 51";
const WHATSAPP = "06 59 76 42 51";
const EMAIL = "manuela.diabate@mdi-avocats.com";
const LINKEDIN = "https://www.linkedin.com/in/manuela-diabate";

const Contact = () => {
  const { t, lang } = useLang();
  const { contact } = useSite();
  const { canonical, alternates } = buildLangAlternates("/contact", lang);
  const addressStr = contact?.address || ADDRESS;
  const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(addressStr)}&output=embed`;
  const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`;

  const seoTitle = useText("seo.contact.title", "Contact — Avocat à Paris | Cabinet Manuela DIABATE");
  const seoDescription = useText(
    "seo.contact.description",
    `Prenez rendez-vous avec le Cabinet Manuela DIABATE, avocat au Barreau de Paris. Téléphone ${contact?.phone || PHONE} — ${contact?.address || ADDRESS}.`
  );
  const seoImage = useText("seo.contact.image", "");

  const phoneClean = (contact?.phone || PHONE).replace(/[^\d+]/g, "");
  const addressParts = (contact?.address || ADDRESS).split(",").map((s) => s.trim());
  const streetAddr = addressParts[0] || "3 avenue des Ternes";
  const cityPartC = addressParts[1] || "75017 Paris";
  const cityMatchC = cityPartC.match(/^(\d{4,5})\s+(.+)$/);
  const postalC = cityMatchC?.[1] || "75017";
  const localityC = cityMatchC?.[2] || "Paris";

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage || undefined,
    type: "website",
    lang,
    canonical,
    alternates,
    jsonLdId: "contact-jsonld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LegalService",
      "@id": "https://cabinet-diabate.com/#organization",
      name: "Cabinet Manuela DIABATE",
      url: "https://cabinet-diabate.com/contact",
      telephone: phoneClean,
      email: contact?.email || EMAIL,
      image: "https://cabinet-diabate.com/og-image.jpg",
      address: {
        "@type": "PostalAddress",
        streetAddress: streetAddr,
        postalCode: postalC,
        addressLocality: localityC,
        addressCountry: "FR",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: phoneClean,
          contactType: "customer service",
          areaServed: ["FR", "CI"],
          availableLanguage: ["French", "English"],
        },
      ],
      sameAs: [contact?.linkedin_url || LINKEDIN].filter(Boolean),
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
    },
  });

  useBreadcrumbJsonLd([
    { name: lang === "en" ? "Home" : "Accueil", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);
  const appt = useAppointment();
  const [loading, setLoading] = useState(false);
  const [ackOpen, setAckOpen] = useState(false);

  const address = contact?.address || ADDRESS;
  const phone = contact?.phone || PHONE;
  const whatsapp = contact?.whatsapp_number || WHATSAPP;
  const email = contact?.email || EMAIL;
  const linkedin = contact?.linkedin_url || LINKEDIN;
  const hours =
    (contact && (lang === "fr" ? contact.hours_fr : contact.hours_en)) ||
    (lang === "fr"
      ? "Lundi au vendredi de 9 heures- 20 heures"
      : "Monday to Friday, 9:00 AM - 8:00 PM");

  const bookHref = appt.href;

  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(2, lang === "fr" ? "Nom trop court" : "Name too short")
      .max(100),
    email: z
      .string()
      .trim()
      .email(lang === "fr" ? "Email invalide" : "Invalid email")
      .max(255),
    phone: z
      .string()
      .trim()
      .min(1, lang === "fr" ? "Téléphone requis" : "Phone required")
      .max(30)
      .regex(/^\+?[\d\s().-]{8,20}$/, lang === "fr" ? "Numéro invalide" : "Invalid number"),
    message: z
      .string()
      .trim()
      .min(10, lang === "fr" ? "Message trop court" : "Message too short")
      .max(2000),
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — should remain empty for humans
    const honey = String(data.get("website") || "");
    if (honey) {
      form.reset();
      setAckOpen(true);
      return;
    }

    // Session-based send limit
    const current = Number(sessionStorage.getItem(SESSION_KEY) || "0");
    if (current >= MAX_SENDS_PER_SESSION) {
      toast.error(
        lang === "fr"
          ? "Limite d'envois atteinte pour cette session. Merci de réessayer plus tard."
          : "Send limit reached for this session. Please try again later."
      );
      return;
    }

    const parsed = schema.safeParse({
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      message: String(data.get("message") || ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const subject = encodeURIComponent(
      lang === "fr"
        ? `Demande de contact — ${parsed.data.name}`
        : `Contact request — ${parsed.data.name}`
    );
    const body = encodeURIComponent(
      `${parsed.data.message}\n\n— ${parsed.data.name}\n${parsed.data.email}${
        parsed.data.phone ? `\n${parsed.data.phone}` : ""
      }`
    );
    setTimeout(() => {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      sessionStorage.setItem(SESSION_KEY, String(current + 1));
      setLoading(false);
      form.reset();
      setAckOpen(true);
    }, 400);
  };

  const T = {
    fr: {
      eyebrow: "Nous contacter",
      title: "Contact",
      subtitle:
        "Pour toute demande, sollicitation d'expertise ou prise de rendez-vous, l'équipe vous répond dans les meilleurs délais.",
      formTitle: "Envoyer un message",
      name: "Nom",
      email: "Email",
      phone: "Téléphone",
      message: "Message",
      submit: "Envoyer",
      sending: "Envoi…",
      addressLabel: "Adresse",
      phoneLabel: "Téléphone",
      whatsappLabel: "WhatsApp",
      emailLabel: "Email",
      hoursLabel: "Horaires",
      linkedinLabel: "LinkedIn",
      directions: "Itinéraire",
      mapTitle: "Localisation du cabinet",
      pricingEyebrow: "Honoraires",
      pricingTitle: "Tarifs des consultations",
      pricingNote:
        "Les consultations approfondies, dossiers complexes et missions sur mesure font l'objet d'un devis personnalisé.",
      cabBadge: "Au cabinet/Visio",
      cabTitle: "Consultation cabinet ou visio",
      cabDesc:
        "Rendez-vous individuel dans nos bureaux du 17ᵉ arrondissement de Paris.",
      phoneBadge: "À distance",
      phoneTitle: "Consultation téléphonique",
      phoneDesc:
        "Échange de 30 minutes sur votre situation, par téléphone ou visioconférence.",
      ttc: "TTC",
      book: "Prendre rendez-vous",
      ackTitle: "Message bien reçu",
      ackDesc:
        "Merci pour votre message. Votre client e-mail s'est ouvert pour finaliser l'envoi. Notre équipe vous répondra dans les meilleurs délais.",
      ackClose: "Fermer",
      waFloat: "Discuter sur WhatsApp",
    },
    en: {
      eyebrow: "Contact us",
      title: "Contact",
      subtitle:
        "For any request, expertise inquiry or appointment, our team will get back to you promptly.",
      formTitle: "Send a message",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      submit: "Send",
      sending: "Sending…",
      addressLabel: "Address",
      phoneLabel: "Phone",
      whatsappLabel: "WhatsApp",
      emailLabel: "Email",
      hoursLabel: "Hours",
      linkedinLabel: "LinkedIn",
      directions: "Get directions",
      mapTitle: "Office location",
      pricingEyebrow: "Fees",
      pricingTitle: "Consultation rates",
      pricingNote:
        "Complex matters and bespoke assignments are quoted individually upon assessment.",
      cabBadge: "In office",
      cabTitle: "Office consultation",
      cabDesc:
        "One-on-one appointment at our offices in the 17th arrondissement of Paris.",
      phoneBadge: "Remote",
      phoneTitle: "Phone consultation",
      phoneDesc:
        "30-minute discussion about your case, by phone or video call.",
      ttc: "incl. VAT",
      book: "Book an appointment",
      ackTitle: "Message received",
      ackDesc:
        "Thank you for your message. Your email client has opened to finalise the send. Our team will get back to you shortly.",
      ackClose: "Close",
      waFloat: "Chat on WhatsApp",
    },
  }[lang];

  const inputCls =
    "mt-2 h-12 border border-border rounded-full px-5 bg-background/60 transition-colors focus-visible:ring-2 focus-visible:ring-appointment/30 focus-visible:border-appointment";
  const textareaCls =
    "mt-2 border border-border rounded-2xl px-5 py-3 bg-background/60 transition-colors focus-visible:ring-2 focus-visible:ring-appointment/30 focus-visible:border-appointment";

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative pt-48 pb-28 md:pt-60 md:pb-40 bg-night text-primary-foreground overflow-hidden">
        <ResponsiveImage
          data={heroContactPicture}
          alt=""
          aria-hidden="true"
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover [filter:saturate(1.08)_contrast(1.05)] [image-rendering:auto]"
          pictureClassName="absolute inset-0 w-full h-full"
        />
        
        <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))_0%,transparent_55%)]" />
        <div className="container-luxe text-center max-w-3xl mx-auto relative">
          <p className="eyebrow text-accent">{T.eyebrow}</p>
          <h1 className="mt-6 font-serif text-4xl md:text-6xl leading-[1.05]">
            {T.title}
          </h1>
          <p className="mt-6 text-primary-foreground/80 text-base md:text-lg">
            {T.subtitle}
          </p>
        </div>
      </section>

      {/* Form + Coordinates */}
      <section id="contact" className="py-20 md:py-28">
        <div className="container-luxe grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Coordinates */}
          <aside className="lg:col-span-5 space-y-8">
            <div className="space-y-4 text-sm">
              {[
                { Icon: MapPin, label: T.addressLabel, content: <span className="font-bold text-foreground">{address}</span> },
                { Icon: Clock, label: T.hoursLabel, content: <span className="font-bold text-foreground">{hours}</span> },
                {
                  Icon: Phone,
                  label: T.phoneLabel,
                  content: (
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-bold text-foreground link-underline">
                      {phone}
                    </a>
                  ),
                },
                {
                  Icon: MessageCircle,
                  label: T.whatsappLabel,
                  content: (
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-foreground link-underline"
                    >
                      {whatsapp}
                    </a>
                  ),
                },
                {
                  Icon: Mail,
                  label: T.emailLabel,
                  content: (
                    <a href={`mailto:${email}`} className="font-bold text-foreground link-underline break-all">
                      {email}
                    </a>
                  ),
                },
                {
                  Icon: Linkedin,
                  label: "Réseaux Sociaux",
                  content: (
                    <div className="flex gap-4">
                      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground link-underline">
                        LinkedIn
                      </a>
                      <a href="https://instagram.com/manuela.diabate" target="_blank" rel="noopener noreferrer" className="font-bold text-foreground link-underline">
                        Instagram
                      </a>
                    </div>
                  ),
                },
                {
                  Icon: IdCard,
                  label: "Carte de visite numérique",
                  content: (
                    <a href="/carte" target="_blank" className="font-bold text-foreground link-underline text-accent">
                      Télécharger la carte de visite
                    </a>
                  ),
                },
              ].map(({ Icon, label, content }, i) => (
                <div key={i} className="group flex items-start gap-4">
                  <span
                    className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 ring-1 ring-accent/25 shadow-[0_4px_14px_-6px_hsl(var(--accent)/0.45)] transition-all duration-300 group-hover:from-accent/25 group-hover:to-accent/10 group-hover:ring-accent/50 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  >
                    <Icon className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 mb-1">
                      {label}
                    </span>
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="lg:col-span-7 bg-card border border-border p-8 md:p-12 shadow-soft space-y-5"
          >
            <h2 className="font-serif text-2xl text-primary mb-2">
              {T.formTitle}
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {T.name}
                </label>
                <Input name="name" required maxLength={100} className={inputCls} />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {T.email}
                </label>
                <Input
                  name="email"
                  type="email"
                  required
                  maxLength={255}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {T.phone}
              </label>
              <Input
                name="phone"
                type="tel"
                required
                maxLength={30}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {T.message}
              </label>
              <Textarea
                name="message"
                required
                maxLength={2000}
                rows={6}
                className={`${textareaCls} resize-none`}
              />
            </div>
            {/* Honeypot anti-spam — hidden from humans */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
              <label>
                Website
                <input type="text" name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                variant="contact"
                size="lg"
                disabled={loading}
                className="w-full md:w-auto min-w-[240px] h-12"
              >
                {loading ? T.sending : T.submit}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Map */}
      <section className="pb-20 md:pb-28">
        <div className="container-luxe">
          <div className="relative overflow-hidden border border-border shadow-soft bg-card">
            <iframe
              title={T.mapTitle}
              src={MAPS_EMBED}
              className="w-full h-[420px] md:h-[520px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 bg-background/95 backdrop-blur px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary border border-border shadow-soft hover:bg-background transition"
            >
              <MapPin className="h-3.5 w-3.5" />
              {T.directions}
            </a>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-20 md:py-28 mx-4 md:mx-8 my-8 rounded-3xl overflow-hidden bg-night text-primary-foreground">
        {/* Dark marble base */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, hsl(var(--accent) / 0.18), transparent 55%), radial-gradient(circle at 85% 85%, hsl(var(--accent) / 0.12), transparent 60%), radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.35), transparent 70%)",
          }}
        />
        {/* Gold marble veins */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-screen"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0px, transparent 80px, hsl(var(--accent) / 0.35) 81px, transparent 82px, transparent 160px), repeating-linear-gradient(65deg, transparent 0px, transparent 140px, hsl(var(--accent) / 0.25) 141px, transparent 142px, transparent 240px), repeating-linear-gradient(95deg, transparent 0px, transparent 200px, hsl(var(--accent) / 0.18) 201px, transparent 203px, transparent 360px)",
          }}
        />
        {/* Subtle grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(hsl(var(--accent)) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />
        {/* Gold edge lines */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-accent/70 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        />

        <div className="relative container-luxe max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <p className="eyebrow text-accent">{useText("contact.pricing.eyebrow", T.pricingEyebrow)}</p>
            <h2 className="mt-6 font-serif text-3xl md:text-5xl text-primary-foreground leading-[1.1]">
              {useText("contact.pricing.title", T.pricingTitle)}
            </h2>
          </div>

          <div className="mt-14 flex flex-col gap-4 max-w-4xl mx-auto">
            <HorizontalPricingCard
              icon={<Building2 className="h-7 w-7 text-accent" strokeWidth={1.5} />}
              title={useText("contact.pricing.1.title", "Rendez-vous cabinet")}
              desc={useText("contact.pricing.1.desc", "Durée : 60 min")}
              price={useText("contact.pricing.1.price", "180 €")}
              cta={useText("contact.pricing.1.btn", "Prendre RDV")}
              useAppointmentSelector
            />
            
            <HorizontalPricingCard
              icon={<Video className="h-7 w-7 text-accent" strokeWidth={1.5} />}
              title={useText("contact.pricing.2.title", "Consultation vidéo")}
              desc={useText("contact.pricing.2.desc", "Durée : 60 min")}
              price={useText("contact.pricing.2.price", "180 €")}
              cta={useText("contact.pricing.2.btn", "Prendre RDV")}
              useAppointmentSelector
            />
            
            <HorizontalPricingCard
              icon={<MessageSquareText className="h-7 w-7 text-accent" strokeWidth={1.5} />}
              title={useText("contact.pricing.3.title", "Consultation écrite")}
              desc={useText("contact.pricing.3.desc", "Etude de votre dossier + possibilité d'ajout d'une pièce jointe")}
              price={useText("contact.pricing.3.price", "350 €")}
              cta={useText("contact.pricing.3.btn", "Consulter par écrit")}
              href={`mailto:${email}`}
            />
          </div>

          <p className="mt-10 text-center text-xs text-primary-foreground/60 max-w-2xl mx-auto">
            {useText("contact.pricing.note", T.pricingNote)}
          </p>
        </div>
      </section>

      <Footer />
      <FloatingActions />

      <Dialog open={ackOpen} onOpenChange={setAckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">{T.ackTitle}</DialogTitle>
            <DialogDescription className="pt-2 text-sm text-muted-foreground leading-relaxed">
              {T.ackDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="contact" onClick={() => setAckOpen(false)}>
              {T.ackClose}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-4">
    <div className="shrink-0 mt-0.5">{icon}</div>
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 mb-1">
        {label}
      </span>
      {children}
    </div>
  </div>
);

const HorizontalPricingCard = ({
  icon,
  title,
  desc,
  price,
  cta,
  href,
  useAppointmentSelector = false,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  price: string;
  cta: string;
  href?: string;
  useAppointmentSelector?: boolean;
}) => (
  <div className="flex flex-col md:flex-row items-center justify-between bg-card/10 backdrop-blur-sm border border-border/20 rounded-xl p-4 md:p-6 shadow-sm hover:bg-card/20 hover:border-accent/30 transition-all duration-300">
    <div className="flex items-center gap-6 w-full md:w-auto">
      <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-background border border-accent/20 shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="font-serif text-xl md:text-2xl text-primary-foreground">{title}</h3>
        <p className="mt-1 text-sm text-primary-foreground/70">{desc}</p>
      </div>
    </div>
    
    <div className="flex items-center gap-6 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
      <div className="flex items-baseline gap-2 min-w-[120px] justify-end">
        <span className="font-serif text-3xl md:text-4xl text-primary-foreground">{price}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/50">TTC</span>
      </div>
      
      {useAppointmentSelector ? (
        <AppointmentButton
          variant="gold"
          size="lg"
          className="w-full md:w-48 whitespace-nowrap group"
          showIcon={false}
          label={
            <span className="flex items-center justify-center gap-2">
              {cta}
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          }
        />
      ) : (
        <Button asChild variant="gold" size="lg" className="w-full md:w-48 group">
          <a
            href={href}
            target={href?.startsWith("http") ? "_blank" : undefined}
            rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            className="flex items-center justify-center gap-2"
          >
            {cta}
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Button>
      )}
    </div>
  </div>
);


export default Contact;

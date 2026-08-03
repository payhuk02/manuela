import { useState } from "react";
import { z } from "zod";
import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";
import { useSite } from "@/hooks/SiteDataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  Linkedin,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { LazyMap } from "@/components/LazyMap";

const SESSION_KEY = "contact_send_count";
const MAX_SENDS_PER_SESSION = 3;

const ADDRESS = "47 Rue Rémy-DUMONCEL 75014 PARIS";
const PHONE = "+33 1 76 58 67 37";
const WHATSAPP = "+33 6 68 44 10 49";
const EMAIL = "contact@cabinet-diabate.com";
const LINKEDIN = "https://www.linkedin.com/in/manuela-diabate";

export const Contact = () => {
  const { t, lang } = useLang();
  const { contact } = useSite();
  const address = contact?.address || ADDRESS;
  const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const [loading, setLoading] = useState(false);
  const [ackOpen, setAckOpen] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const phone = contact?.phone || PHONE;
  const whatsapp = contact?.whatsapp_number || WHATSAPP;
  const email = contact?.email || EMAIL;
  const linkedin = contact?.linkedin_url || LINKEDIN;
  const hours =
    (contact && (lang === "fr" ? contact.hours_fr : contact.hours_en)) ||
    (lang === "fr"
      ? "Lundi – Vendredi : 9h00 – 19h00"
      : "Monday – Friday: 9:00 – 19:00");

  const T_DEFAULTS = {
    fr: {
      whatsappLabel: "WhatsApp",
      linkedinLabel: "LinkedIn",
      directions: "Itinéraire",
      mapTitle: "Localisation du cabinet",
      ackTitle: "Message bien reçu",
      ackDesc:
        "Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.",
      ackClose: "Fermer",
      sending: "Envoi…",
      namePh: "Jean Dupont",
      emailPh: "jean.dupont@email.com",
      phonePh: "+33 6 12 34 56 78",
      messagePh: "Décrivez brièvement votre situation…",
      optional: "(facultatif)",
      genericError: "Une erreur est survenue. Merci de réessayer.",
      linkedinName: "Sylvestre Manuela Diabate",
      confidentialNote: "Vos informations restent strictement confidentielles.",
      mapLoading: "Chargement de la carte…",
    },
    en: {
      whatsappLabel: "WhatsApp",
      linkedinLabel: "LinkedIn",
      directions: "Get directions",
      mapTitle: "Office location",
      ackTitle: "Message received",
      ackDesc:
        "Thank you for your message. Our team will get back to you shortly.",
      ackClose: "Close",
      sending: "Sending…",
      namePh: "John Doe",
      emailPh: "john.doe@email.com",
      phonePh: "+33 6 12 34 56 78",
      messagePh: "Briefly describe your situation…",
      optional: "(optional)",
      genericError: "An error occurred. Please try again.",
      linkedinName: "Sylvestre Manuela Diabate",
      confidentialNote: "Your information remains strictly confidential.",
      mapLoading: "Loading map…",
    },
  }[lang];

  // Allow admin overrides for every customer-visible label/message of the section.
  // Keys are language-aware (handled inside useText), so each language can be tuned independently.
  const T = {
    whatsappLabel: useText("contact.whatsappLabel", T_DEFAULTS.whatsappLabel),
    linkedinLabel: useText("contact.linkedinLabel", T_DEFAULTS.linkedinLabel),
    directions: useText("contact.directions", T_DEFAULTS.directions),
    mapTitle: useText("contact.mapTitle", T_DEFAULTS.mapTitle),
    ackTitle: useText("contact.ackTitle", T_DEFAULTS.ackTitle),
    ackDesc: useText("contact.ackDesc", T_DEFAULTS.ackDesc),
    ackClose: useText("contact.ackClose", T_DEFAULTS.ackClose),
    sending: useText("contact.sending", T_DEFAULTS.sending),
    namePh: useText("contact.namePh", T_DEFAULTS.namePh),
    emailPh: useText("contact.emailPh", T_DEFAULTS.emailPh),
    phonePh: useText("contact.phonePh", T_DEFAULTS.phonePh),
    messagePh: useText("contact.messagePh", T_DEFAULTS.messagePh),
    optional: useText("contact.optional", T_DEFAULTS.optional),
    genericError: useText("contact.genericError", T_DEFAULTS.genericError),
    linkedinName: useText("contact.linkedinName", T_DEFAULTS.linkedinName),
    confidentialNote: useText("contact.confidentialNote", T_DEFAULTS.confidentialNote),
    mapLoading: useText("contact.mapLoading", T_DEFAULTS.mapLoading),
  };

  const M = lang === "fr"
    ? {
        nameMin: "Le nom doit contenir au moins 2 caractères.",
        nameMax: "Le nom ne doit pas dépasser 100 caractères.",
        nameChars: "Le nom contient des caractères non autorisés.",
        emailReq: "Merci d'indiquer votre adresse email.",
        emailInvalid: "Format d'email invalide (ex. prenom@domaine.com).",
        emailMax: "Email trop long (max. 255 caractères).",
        phoneInvalid: "Numéro invalide. Utilisez 8 à 20 chiffres (espaces et + autorisés).",
        phoneMax: "Numéro trop long.",
        messageMin: "Message trop court — décrivez votre situation en au moins 10 caractères.",
        messageMax: "Message trop long (max. 2000 caractères).",
      }
    : {
        nameMin: "Name must be at least 2 characters.",
        nameMax: "Name must be 100 characters or less.",
        nameChars: "Name contains invalid characters.",
        emailReq: "Please enter your email address.",
        emailInvalid: "Invalid email format (e.g. name@domain.com).",
        emailMax: "Email too long (max 255 characters).",
        phoneInvalid: "Invalid number. Use 8–20 digits (spaces and + allowed).",
        phoneMax: "Number too long.",
        messageMin: "Message too short — describe your situation in at least 10 characters.",
        messageMax: "Message too long (max 2000 characters).",
      };

  const schema = z.object({
    name: z
      .string()
      .trim()
      .min(2, M.nameMin)
      .max(100, M.nameMax)
      .regex(/^[\p{L}\p{M}'’\-\s.]+$/u, M.nameChars),
    email: z
      .string()
      .trim()
      .min(1, M.emailReq)
      .email(M.emailInvalid)
      .max(255, M.emailMax),
    phone: z
      .string()
      .trim()
      .min(1, M.phoneInvalid)
      .max(30, M.phoneMax)
      .regex(/^\+?[\d\s().-]{8,20}$/, M.phoneInvalid),
    message: z
      .string()
      .trim()
      .min(10, M.messageMin)
      .max(2000, M.messageMax),
  });

  const validateField = (field: keyof typeof values, val: string) => {
    const single = (schema.shape as any)[field];
    const result = single.safeParse(val);
    setErrors((prev) => ({
      ...prev,
      [field]: result.success ? "" : result.error.issues[0]?.message ?? "",
    }));
  };

  const handleChange = (field: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [field]: val }));
    if (touched[field]) validateField(field, val);
  };

  const handleBlur = (field: keyof typeof values) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, values[field]);
  };

  const messageCount = values.message.length;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    const current = Number(sessionStorage.getItem(SESSION_KEY) || "0");
    if (current >= MAX_SENDS_PER_SESSION) {
      toast.error(
        lang === "fr"
          ? "Limite d'envois atteinte pour cette session. Merci de réessayer plus tard."
          : "Send limit reached for this session. Please try again later."
      );
      return;
    }

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const k = String(iss.path[0]);
        if (!fieldErrors[k]) fieldErrors[k] = iss.message;
      });
      setErrors(fieldErrors);
      setTouched({ name: true, email: true, phone: true, message: true });
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("contact_messages")
        .insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        lang,
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (error) throw error;

      sessionStorage.setItem(SESSION_KEY, String(current + 1));
      form.reset();
      setValues({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      setTouched({});
      setAckOpen(true);
    } catch (err) {
      console.error("contact submit error", err);
      toast.error(T.genericError);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (hasError: boolean) =>
    `mt-2 h-12 rounded-full border bg-background/60 px-5 transition-colors focus-visible:ring-2 focus-visible:ring-appointment/30 focus-visible:border-appointment ${
      hasError
        ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
        : "border-border"
    }`;

  const labelCls = "text-xs uppercase tracking-[0.2em] text-muted-foreground";
  const errCls = "mt-1.5 flex items-start gap-1.5 text-xs text-destructive font-medium";
  const FieldError = ({ id, msg }: { id: string; msg?: string }) =>
    msg ? (
      <p id={id} role="alert" className={errCls}>
        <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" strokeWidth={2} />
        <span>{msg}</span>
      </p>
    ) : null;

  return (
    <section id="contact" className="py-28 md:py-36 bg-background">
      <div className="container-luxe grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-5">
          <p className="eyebrow">{t.contact.eyebrow}</p>
          <h2 className="mt-6 font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.1]">
            {t.contact.title}
          </h2>
          <p className="mt-6 text-muted-foreground">{t.contact.subtitle}</p>

          <div className="mt-12 space-y-4 text-sm">
            {[
              { Icon: MapPin, content: <span className="font-bold text-foreground">{address}</span> },
              { Icon: Clock, content: <span className="font-bold text-foreground">{hours}</span> },
              {
                Icon: Phone,
                content: (
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-bold text-foreground link-underline">
                    {phone}
                  </a>
                ),
              },
              {
                Icon: MessageCircle,
                content: (
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground link-underline"
                  >
                    {whatsapp} <span className="font-normal text-muted-foreground">· {T.whatsappLabel}</span>
                  </a>
                ),
              },
              {
                Icon: Mail,
                content: (
                  <a href={`mailto:${email}`} className="font-bold text-foreground link-underline break-all">
                    {email}
                  </a>
                ),
              },
              {
                Icon: Linkedin,
                content: (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-foreground link-underline"
                  >
                    {T.linkedinName} <span className="font-normal text-muted-foreground">· {T.linkedinLabel}</span>
                  </a>
                ),
              },
            ].map(({ Icon, content }, i) => (
              <div key={i} className="group flex items-center gap-4">
                <span
                  className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 ring-1 ring-accent/25 shadow-[0_4px_14px_-6px_hsl(var(--accent)/0.45)] transition-all duration-300 group-hover:from-accent/25 group-hover:to-accent/10 group-hover:ring-accent/50 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                >
                  <Icon className="h-[18px] w-[18px] text-accent" strokeWidth={2} />
                </span>
                <div className="min-w-0">{content}</div>
              </div>
            ))}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="lg:col-span-7 bg-card border border-border p-8 md:p-12 shadow-soft space-y-6 self-start relative"
        >
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="cf-name" className={labelCls}>
                {t.contact.name}
              </label>
              <Input
                id="cf-name"
                name="name"
                required
                maxLength={100}
                placeholder={T.namePh}
                value={values.name}
                onChange={handleChange("name")}
                onBlur={handleBlur("name")}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "cf-name-err" : undefined}
                className={inputCls(!!errors.name)}
              />
              <FieldError id="cf-name-err" msg={errors.name} />
            </div>
            <div>
              <label htmlFor="cf-email" className={labelCls}>
                {t.contact.email}
              </label>
              <Input
                id="cf-email"
                name="email"
                type="email"
                required
                maxLength={255}
                placeholder={T.emailPh}
                value={values.email}
                onChange={handleChange("email")}
                onBlur={handleBlur("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "cf-email-err" : undefined}
                className={inputCls(!!errors.email)}
              />
              <FieldError id="cf-email-err" msg={errors.email} />
            </div>
          </div>
          <div>
            <label htmlFor="cf-phone" className={labelCls}>
              {t.contact.phone}
            </label>
            <Input
              id="cf-phone"
              name="phone"
              type="tel"
              required
              maxLength={30}
              placeholder={T.phonePh}
              value={values.phone}
              onChange={handleChange("phone")}
              onBlur={handleBlur("phone")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "cf-phone-err" : undefined}
              className={inputCls(!!errors.phone)}
            />
            <FieldError id="cf-phone-err" msg={errors.phone} />
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="cf-message" className={labelCls}>
                {t.contact.message}
              </label>
              <span
                className={`text-[11px] tabular-nums ${
                  messageCount > 1900
                    ? "text-destructive"
                    : "text-muted-foreground/60"
                }`}
              >
                {messageCount}/2000
              </span>
            </div>
            <Textarea
              id="cf-message"
              name="message"
              required
              maxLength={2000}
              rows={6}
              placeholder={T.messagePh}
              value={values.message}
              onChange={handleChange("message")}
              onBlur={handleBlur("message")}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "cf-message-err" : undefined}
              className={`mt-2 border rounded-2xl px-5 py-3 bg-background/60 transition-colors focus-visible:ring-2 focus-visible:ring-appointment/30 resize-none ${
                errors.message
                  ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
                  : "border-border focus-visible:border-appointment"
              }`}
            />
            <FieldError id="cf-message-err" msg={errors.message} />
          </div>
          {/* Honeypot anti-spam */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
            <label>
              Website
              <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <Button
              type="submit"
              variant="contact"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto min-w-[240px] h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {T.sending}
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  {t.contact.submit}
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              {T.confidentialNote}
            </p>
          </div>
        </form>
      </div>

      {/* Full-bleed map (uses 100% width to avoid horizontal overflow caused by scrollbar with 100vw) */}
      <div className="relative w-full mt-16 md:mt-24 overflow-hidden border-y border-border bg-card">
        <LazyMap
          src={MAPS_EMBED}
          title={T.mapTitle}
          directionsHref={MAPS_LINK}
          directionsLabel={T.directions}
          loadingLabel={T.mapLoading}
          iframeClassName="w-full h-[320px] md:h-[420px]"
        />
      </div>

      <Dialog open={ackOpen} onOpenChange={setAckOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-accent" strokeWidth={1.5} />
              {T.ackTitle}
            </DialogTitle>
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
    </section>
  );
};

import { useState } from "react";
import { z } from "zod";
import { useLang } from "@/i18n/LanguageContext";
import { useExpertiseFormText } from "@/hooks/useExpertiseFormText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Send, AlertCircle } from "lucide-react";

const SESSION_KEY = "expertise_contact_send_count";
const MAX_SENDS_PER_SESSION = 3;

interface Props {
  expertiseSlug: string;
  expertiseTitle: string;
}

export const ExpertiseContactForm = ({ expertiseSlug, expertiseTitle }: Props) => {
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFr = lang === "fr";
  const lcTitle = expertiseTitle.toLowerCase();

  // Editable via admin: per-expertise override → global override → hard-coded fallback
  const t = (field: string, fallback: string) => useExpertiseFormText(expertiseSlug, field, fallback);
  const eyebrow = t("eyebrow", isFr ? "Demande dédiée" : "Dedicated inquiry");
  const titleTpl = t("title", isFr ? "Une question en {expertise} ?" : "A question regarding {expertise}?");
  const subtitle = t(
    "subtitle",
    isFr
      ? "Décrivez votre situation. Nous vous répondons sous 24h ouvrées."
      : "Tell us about your situation. We reply within 24 business hours."
  );
  const nameLabel = t("nameLabel", isFr ? "Nom complet" : "Full name");
  const emailLabel = t("emailLabel", isFr ? "Email" : "Email");
  const phoneLabel = t("phoneLabel", isFr ? "Téléphone" : "Phone");
  const messageLabel = t("messageLabel", "Message");
  const messagePlaceholderTpl = t(
    "messagePlaceholder",
    isFr ? "Décrivez votre dossier en {expertise}…" : "Describe your matter regarding {expertise}…"
  );
  const submitLabel = t("submit", isFr ? "Envoyer ma demande" : "Send my inquiry");
  const sendingLabel = t("sending", isFr ? "Envoi…" : "Sending…");
  const sentTitleTxt = t("sentTitle", isFr ? "Demande transmise" : "Inquiry sent");
  const sentDescTxt = t(
    "sentDesc",
    isFr
      ? "Merci, votre demande a été enregistrée. Notre équipe vous recontactera rapidement."
      : "Thank you, your inquiry has been recorded. Our team will get back to you shortly."
  );
  const confidentialTxt = t(
    "confidential",
    isFr
      ? "Vos informations restent strictement confidentielles."
      : "Your information remains strictly confidential."
  );
  const limitTxt = t(
    "limit",
    isFr ? "Limite d'envois atteinte. Réessayez plus tard." : "Send limit reached. Try again later."
  );
  const errorTxt = t(
    "error",
    isFr ? "Une erreur est survenue. Merci de réessayer." : "An error occurred. Please try again."
  );

  const T = isFr
    ? {
        nameMin: "Le nom doit contenir au moins 2 caractères.",
        nameMax: "Le nom ne doit pas dépasser 100 caractères.",
        nameChars: "Le nom contient des caractères non autorisés.",
        emailReq: "Merci d'indiquer votre adresse email.",
        emailInvalid: "Format d'email invalide (ex. prenom@domaine.com).",
        emailMax: "Email trop long (max. 255 caractères).",
        phoneInvalid: "Numéro invalide. Utilisez 8 à 20 chiffres (espaces et + autorisés).",
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
        messageMin: "Message too short — describe your situation in at least 10 characters.",
        messageMax: "Message too long (max 2000 characters).",
      };

  const interpolate = (tpl: string) => tpl.replace(/\{expertise\}/g, lcTitle);
  const titleTxt = interpolate(titleTpl);
  const messagePlaceholder = interpolate(messagePlaceholderTpl);

  const schema = z.object({
    name: z.string().trim().min(2, T.nameMin).max(100, T.nameMax)
      .regex(/^[\p{L}\p{M}'’\-\s.]+$/u, T.nameChars),
    email: z.string().trim().min(1, T.emailReq).email(T.emailInvalid).max(255, T.emailMax),
    phone: z.string().trim().min(1, T.phoneInvalid).max(30).regex(/^\+?[\d\s().-]{8,20}$/, T.phoneInvalid),
    message: z.string().trim().min(10, T.messageMin).max(2000, T.messageMax),
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
    validateField(field, val);
  };

  const handleBlur = (field: keyof typeof values) => () => {
    validateField(field, values[field]);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const current = Number(sessionStorage.getItem(SESSION_KEY) || "0");
    if (current >= MAX_SENDS_PER_SESSION) {
      toast.error(limitTxt);
      return;
    }

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((iss) => {
        const k = String(iss.path[0]);
        if (!fe[k]) fe[k] = iss.message;
      });
      setErrors(fe);
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any).from("contact_messages").insert({
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        lang,
        expertise_slug: expertiseSlug,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      if (error) throw error;
      sessionStorage.setItem(SESSION_KEY, String(current + 1));
      setValues({ name: "", email: "", phone: "", message: "" });
      setErrors({});
      setSent(true);
    } catch (err) {
      console.error("expertise contact submit", err);
      toast.error(errorTxt);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-card border border-accent/40 p-10 md:p-14 text-center shadow-soft">
        <CheckCircle2 className="h-12 w-12 text-accent mx-auto" strokeWidth={1.25} />
        <h3 className="mt-6 font-serif text-2xl text-primary">{sentTitleTxt}</h3>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">{sentDescTxt}</p>
      </div>
    );
  }

  const labelCls = "text-xs uppercase tracking-[0.2em] text-muted-foreground";
  const errCls = "mt-1.5 flex items-start gap-1.5 text-xs text-destructive font-medium";
  const FieldError = ({ id, msg }: { id: string; msg?: string }) =>
    msg ? (
      <p id={id} role="alert" className={errCls}>
        <AlertCircle className="h-3.5 w-3.5 mt-px shrink-0" strokeWidth={2} />
        <span>{msg}</span>
      </p>
    ) : null;
  const inputCls = (err: boolean) =>
    `mt-2 h-12 rounded-full border px-5 bg-background/60 transition-colors focus-visible:ring-2 focus-visible:ring-appointment/30 ${
      err ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-border focus-visible:border-appointment"
    }`;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-card border border-border p-8 md:p-12 shadow-soft space-y-6"
    >
      <div>
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h3 className="mt-3 font-serif text-2xl md:text-3xl text-primary leading-tight">{titleTxt}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="ef-name" className={labelCls}>{nameLabel}</label>
          <Input
            id="ef-name"
            value={values.name}
            onChange={handleChange("name")}
            onBlur={handleBlur("name")}
            maxLength={100}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "ef-name-err" : undefined}
            className={inputCls(!!errors.name)}
          />
          <FieldError id="ef-name-err" msg={errors.name} />
        </div>
        <div>
          <label htmlFor="ef-email" className={labelCls}>{emailLabel}</label>
          <Input
            id="ef-email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            onBlur={handleBlur("email")}
            maxLength={255}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "ef-email-err" : undefined}
            className={inputCls(!!errors.email)}
          />
          <FieldError id="ef-email-err" msg={errors.email} />
        </div>
      </div>

      <div>
        <label htmlFor="ef-phone" className={labelCls}>{phoneLabel}</label>
        <Input
          id="ef-phone"
          type="tel"
          value={values.phone}
          onChange={handleChange("phone")}
          onBlur={handleBlur("phone")}
          maxLength={30}
          required
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "ef-phone-err" : undefined}
          className={inputCls(!!errors.phone)}
        />
        <FieldError id="ef-phone-err" msg={errors.phone} />
      </div>

      <div>
        <label htmlFor="ef-message" className={labelCls}>{messageLabel}</label>
        <Textarea
          id="ef-message"
          rows={5}
          value={values.message}
          onChange={handleChange("message")}
          onBlur={handleBlur("message")}
          maxLength={2000}
          required
          placeholder={messagePlaceholder}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "ef-message-err" : undefined}
          className={`mt-2 border rounded-2xl px-5 py-3 bg-background/60 transition-colors focus-visible:ring-2 focus-visible:ring-appointment/30 resize-none ${
            errors.message ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : "border-border focus-visible:border-appointment"
          }`}
        />
        <FieldError id="ef-message-err" msg={errors.message} />
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
        <Button type="submit" variant="contact" size="lg" disabled={loading} className="w-full sm:w-auto min-w-[240px] h-12">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{sendingLabel}</>
          ) : (
            <><Send className="h-4 w-4" />{submitLabel}</>
          )}
        </Button>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">{confidentialTxt}</p>
      </div>
    </form>
  );
};

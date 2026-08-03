import { useSite } from "@/hooks/SiteDataContext";
import { useLang } from "@/i18n/LanguageContext";

const DEFAULT_WHATSAPP = "+33 6 68 44 10 49";
const DEFAULT_NAME_FR = "Cabinet Manuela Diabate — Avocat au Barreau de Paris";
const DEFAULT_NAME_EN = "Manuela Diabate Law Firm — Attorney at the Paris Bar";

export type AppointmentTopic =
  | "appointment"
  | "legal"
  | "consultation"
  | "litigation"
  | "other";

const buildMessages = (
  cabinet: string
): Record<"fr" | "en", Record<AppointmentTopic, string>> => ({
  fr: {
    appointment: `Bonjour, je souhaite prendre rendez-vous avec le ${cabinet}. Pourriez-vous m'indiquer vos prochaines disponibilités ?`,
    legal: `Bonjour, je contacte le ${cabinet} pour une demande de conseil juridique. Pouvons-nous échanger sur ma situation ?`,
    consultation: `Bonjour, je souhaite organiser une consultation (cabinet ou téléphonique) avec le ${cabinet}. Merci de me communiquer vos créneaux disponibles.`,
    litigation: `Bonjour, je souhaite être assisté(e) par le ${cabinet} dans le cadre d'un contentieux. Pouvons-nous convenir d'un premier échange confidentiel ?`,
    other: `Bonjour, je contacte le ${cabinet} pour une demande spécifique. Pouvons-nous en discuter ?`,
  },
  en: {
    appointment: `Hello, I would like to book an appointment with ${cabinet}. Could you share your next availabilities?`,
    legal: `Hello, I am contacting ${cabinet} for legal advice. Could we discuss my situation?`,
    consultation: `Hello, I would like to schedule a consultation (in office or by phone) with ${cabinet}. Please let me know your available slots.`,
    litigation: `Hello, I would like to be assisted by ${cabinet} in a litigation matter. Could we arrange a first confidential discussion?`,
    other: `Hello, I am contacting ${cabinet} with a specific request. Could we discuss it?`,
  },
});

/** Build a custom WhatsApp message with a free-text reason, branded with the cabinet name. */
const buildCustomMessage = (
  cabinet: string,
  reason: string,
  l: "fr" | "en"
) => {
  const clean = reason.trim();
  if (l === "fr") {
    return `Bonjour, je contacte le ${cabinet} concernant la demande suivante : ${clean}. Pouvons-nous en échanger ?`;
  }
  return `Hello, I am contacting ${cabinet} regarding the following request: ${clean}. Could we discuss it?`;
};

/**
 * Centralized "Prendre rendez-vous" logic.
 * - If admin set `appointment_url` → use it.
 * - Else fallback to WhatsApp with a localized + cabinet-personalized message.
 */
export function useAppointment(topic: AppointmentTopic = "appointment") {
  const { contact } = useSite();
  const { lang } = useLang();
  const l: "fr" | "en" = lang === "en" ? "en" : "fr";

  const appointmentUrl = contact?.appointment_url?.trim() || "";
  const whatsappRaw = contact?.whatsapp_number?.trim() || DEFAULT_WHATSAPP;
  const whatsappDigits = whatsappRaw.replace(/[^\d]/g, "");

  const cabinet =
    (l === "fr"
      ? contact?.cabinet_name_fr?.trim()
      : contact?.cabinet_name_en?.trim()) ||
    (l === "fr" ? DEFAULT_NAME_FR : DEFAULT_NAME_EN);

  const messages = buildMessages(cabinet)[l];

  const buildWaHref = (msg: string) =>
    `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(msg)}`;

  const waHref = buildWaHref(messages[topic]);
  const href = appointmentUrl || waHref;
  const isExternal = href.startsWith("http");

  const waHrefFor = (t: AppointmentTopic, customReason?: string) => {
    if (t === "other" && customReason && customReason.trim().length > 0) {
      return buildWaHref(buildCustomMessage(cabinet, customReason, l));
    }
    return buildWaHref(messages[t]);
  };

  return {
    href,
    isExternal,
    usesWhatsApp: !appointmentUrl,
    waHref,
    waHrefFor,
    appointmentUrl,
    cabinet,
    messages,
  };
}

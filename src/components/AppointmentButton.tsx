import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  CalendarCheck,
  Scale,
  MessageSquare,
  Gavel,
  HelpCircle,
  Send,
} from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { useAppointment, type AppointmentTopic } from "@/hooks/useAppointment";
import { cn } from "@/lib/utils";

type Props = {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  showIcon?: boolean;
  label?: string;
};

const TOPICS: { key: AppointmentTopic; icon: typeof Scale }[] = [
  { key: "consultation", icon: CalendarCheck },
  { key: "legal", icon: Scale },
  { key: "litigation", icon: Gavel },
  { key: "other", icon: HelpCircle },
];

const I18N: Record<
  "fr" | "en",
  Record<AppointmentTopic | "title" | "subtitle" | "external" | "otherLabel" | "otherPlaceholder" | "otherHelper" | "otherSend" | "otherEmpty" | "back", string>
> = {
  fr: {
    title: "Quel type de demande ?",
    subtitle: "Sélectionnez le motif pour préparer un message WhatsApp adapté.",
    appointment: "Prise de rendez-vous",
    consultation: "Consultation",
    legal: "Conseil juridique",
    litigation: "Contentieux",
    other: "Autre demande",
    external: "Ouvrir le calendrier",
    otherLabel: "Précisez votre demande",
    otherPlaceholder: "Décrivez en quelques mots l'objet de votre demande…",
    otherHelper: "Votre message sera prérempli sur WhatsApp avec ce motif.",
    otherSend: "Envoyer sur WhatsApp",
    otherEmpty: "Merci de saisir un motif avant d'envoyer.",
    back: "Retour",
  },
  en: {
    title: "What type of request?",
    subtitle: "Pick a topic to prepare a tailored WhatsApp message.",
    appointment: "Book appointment",
    consultation: "Consultation",
    legal: "Legal advice",
    litigation: "Litigation",
    other: "Other request",
    external: "Open calendar",
    otherLabel: "Describe your request",
    otherPlaceholder: "Briefly describe the purpose of your request…",
    otherHelper: "Your WhatsApp message will be pre-filled with this reason.",
    otherSend: "Send on WhatsApp",
    otherEmpty: "Please enter a reason before sending.",
    back: "Back",
  },
};

const DESCRIPTIONS: Record<"fr" | "en", Record<AppointmentTopic, string>> = {
  fr: {
    appointment: "Convenir d'un rendez-vous général.",
    consultation: "Échange en cabinet ou par téléphone.",
    legal: "Question juridique, analyse, accompagnement.",
    litigation: "Procédure, défense, représentation.",
    other: "Décrivez librement votre besoin.",
  },
  en: {
    appointment: "Arrange a general meeting.",
    consultation: "In-office or phone discussion.",
    legal: "Legal question, analysis, advisory.",
    litigation: "Proceedings, defence, representation.",
    other: "Freely describe your need.",
  },
};

export const AppointmentButton = ({
  variant = "appointment",
  size = "lg",
  className,
  showIcon = true,
  label,
}: Props) => {
  const { t, lang } = useLang();
  const l: "fr" | "en" = lang === "en" ? "en" : "fr";
  const appt = useAppointment();
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setCustomMode(false);
    setReason("");
    setError(null);
  };

  // If admin configured an external booking URL, skip the selector.
  if (!appt.usesWhatsApp) {
    return (
      <Button asChild variant={variant} size={size} className={className}>
        <a href={appt.href} target="_blank" rel="noopener noreferrer">
          {showIcon && <CalendarCheck className="mr-1 h-4 w-4" />}
          {label ?? t.nav.appointment}
        </a>
      </Button>
    );
  }

  const handleTopicClick = (key: AppointmentTopic, e: React.MouseEvent) => {
    if (key === "other") {
      e.preventDefault();
      setCustomMode(true);
    } else {
      setOpen(false);
      // anchor href handles navigation
    }
  };

  const submitCustom = () => {
    const trimmed = reason.trim();
    if (trimmed.length < 3) {
      setError(I18N[l].otherEmpty);
      return;
    }
    const href = appt.waHrefFor("other", trimmed);
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
    resetState();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          {showIcon && <CalendarCheck className="mr-1 h-4 w-4" />}
          {label ?? t.nav.appointment}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-primary">
            {I18N[l].title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {I18N[l].subtitle}
          </DialogDescription>
        </DialogHeader>

        {!customMode ? (
          <div className="mt-4 grid gap-3">
            {TOPICS.map(({ key, icon: Icon }) => {
              const isOther = key === "other";
              const commonInner = (
                <>
                  <div className="grid place-items-center h-10 w-10 rounded-full bg-accent/10 text-accent shrink-0">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="font-serif text-base text-primary group-hover:text-accent transition-colors">
                      {I18N[l][key]}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {DESCRIPTIONS[l][key]}
                    </p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-1" />
                </>
              );
              const className = cn(
                "group flex items-start gap-4 border border-border bg-card p-4 transition-all text-left w-full",
                "hover:border-accent hover:shadow-soft"
              );
              if (isOther) {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={(e) => handleTopicClick(key, e)}
                    className={className}
                  >
                    {commonInner}
                  </button>
                );
              }
              return (
                <a
                  key={key}
                  href={appt.waHrefFor(key)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={className}
                >
                  {commonInner}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appt-other-reason" className="text-sm text-primary">
                {I18N[l].otherLabel}
              </Label>
              <Textarea
                id="appt-other-reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={I18N[l].otherPlaceholder}
                rows={4}
                maxLength={500}
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                {I18N[l].otherHelper}
              </p>
              {error && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setCustomMode(false);
                  setError(null);
                }}
              >
                {I18N[l].back}
              </Button>
              <Button type="button" variant="contact" onClick={submitCustom}>
                <Send className="mr-2 h-4 w-4" />
                {I18N[l].otherSend}
              </Button>
            </div>
          </div>
        )}

        <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/70 text-center">
          {appt.cabinet}
        </p>
      </DialogContent>
    </Dialog>
  );
};

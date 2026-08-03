import { AppointmentButton } from "@/components/AppointmentButton";
import { useText } from "@/hooks/useText";
import { useLang } from "@/i18n/LanguageContext";

export const CTA = () => {
  const { lang } = useLang();
  const eyebrow = useText("cta.eyebrow", lang === "fr" ? "Contact" : "Contact");
  const titlePrefix = useText(
    "cta.titlePrefix",
    lang === "fr" ? "Parlons de" : "Let's discuss"
  );
  const titleAccent = useText(
    "cta.titleAccent",
    lang === "fr" ? "votre situation" : "your situation"
  );
  const description = useText(
    "cta.description",
    lang === "fr"
      ? "Chaque dossier mérite une écoute attentive et une stratégie sur mesure. Échangeons en toute confidentialité."
      : "Every case deserves attentive listening and a tailored strategy. Let's talk in full confidence."
  );
  const button = useText(
    "cta.button",
    lang === "fr" ? "Prendre rendez-vous" : "Book an appointment"
  );

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container-luxe">
        <div className="relative overflow-hidden border border-accent/30 bg-gradient-to-br from-muted/60 to-background p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--accent)/0.12)_0%,transparent_60%)]" />
          <div className="relative">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-6 font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.1]">
              {titlePrefix} <span className="text-accent">{titleAccent}</span>.
            </h2>
            <p className="mt-6 max-w-xl mx-auto text-muted-foreground">
              {description}
            </p>
            <div className="mt-10 flex justify-center">
              <AppointmentButton
                label={button}
                className="max-w-[calc(100vw-4rem)] sm:max-w-none whitespace-normal break-words text-center leading-tight h-auto min-h-12 py-3 px-4 sm:px-8 font-bold rounded-full bg-appointment hover:bg-appointment/90 text-white border-transparent tracking-tight sm:tracking-[0.22em] text-[10px] sm:text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

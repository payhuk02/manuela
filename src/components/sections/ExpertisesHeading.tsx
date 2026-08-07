import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";

export const ExpertisesHeading = () => {
  const { lang } = useLang();
  const label = useText(
    "hero.expertisesHeading",
    lang === "fr" ? "NOS EXPERTISES" : "OUR EXPERTISE"
  );

  return (
    <div className="bg-background py-8 md:py-10">
      <p className="text-center font-sans text-sm md:text-base font-bold uppercase tracking-[0.35em] text-foreground">
        {label}
      </p>
    </div>
  );
};

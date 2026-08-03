import { useLang } from "@/i18n/LanguageContext";

export const LangSwitcher = ({ variant = "light" }: { variant?: "light" | "dark" }) => {
  const { lang, setLang } = useLang();
  
  const containerStyle = variant === "dark" 
    ? "bg-primary-foreground/5 border-primary-foreground/10" 
    : "bg-primary/5 border-primary/10";
    
  const inactiveStyle = variant === "dark"
    ? "text-primary-foreground/60 hover:text-primary-foreground"
    : "text-primary/60 hover:text-primary";

  return (
    <div className={`flex items-center p-1 rounded-full border backdrop-blur-sm transition-all hover:border-accent/40 ${containerStyle}`}>
      <button
        onClick={() => setLang("fr")}
        className={`relative px-3 py-1 text-[11px] font-medium tracking-[0.15em] rounded-full transition-all duration-300 ${
          lang === "fr" 
            ? "text-primary-foreground bg-accent shadow-[0_2px_10px_-2px_hsl(var(--accent)/0.5)]" 
            : inactiveStyle
        }`}
        aria-label="Français"
      >
        FR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`relative px-3 py-1 text-[11px] font-medium tracking-[0.15em] rounded-full transition-all duration-300 ${
          lang === "en" 
            ? "text-primary-foreground bg-accent shadow-[0_2px_10px_-2px_hsl(var(--accent)/0.5)]" 
            : inactiveStyle
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

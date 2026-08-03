import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { translations, type Lang } from "./translations";

type Dict = typeof translations.fr;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
};

const LanguageContext = createContext<Ctx | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "fr";
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "fr" || stored === "en") return stored;
    // SEO: Toujours forcer le français par défaut pour que Googlebot
    // voie le site en français, même s'il navigue en en-US.
    return "fr";
  });

  useEffect(() => {
    // We do NOT update document.documentElement.lang here because
    // we want to strictly keep lang="fr" for Googlebot SEO purposes,
    // which is already handled in seo.ts.
    localStorage.setItem("lang", lang);
  }, [lang]);

  const t = translations[lang] as unknown as Dict;

  return (
    <LanguageContext.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

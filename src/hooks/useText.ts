import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";

/** Returns DB override for the given key in the active language, or the fallback. */
export function useText(key: string, fallback: string): string {
  const { lang } = useLang();
  const { textOverrides } = useSite();
  return textOverrides[`${key}::${lang}`] || fallback;
}

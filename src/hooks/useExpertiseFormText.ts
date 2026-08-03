import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";

/**
 * Returns the most specific override for a contact-form field on an expertise page:
 *   1. expertiseForm.<slug>.<field>::<lang>  (per-expertise override, set in Admin → Expertises (fiches))
 *   2. expertiseForm.<field>::<lang>         (global override, set in Admin → Page Expertises)
 *   3. fallback                              (hard-coded default passed by the component)
 */
export function useExpertiseFormText(
  slug: string,
  field: string,
  fallback: string,
): string {
  const { lang } = useLang();
  const { textOverrides } = useSite();
  const specific = textOverrides[`expertiseForm.${slug}.${field}::${lang}`];
  if (specific) return specific;
  const global = textOverrides[`expertiseForm.${field}::${lang}`];
  if (global) return global;
  return fallback;
}

import { useSite } from "@/hooks/SiteDataContext";

/**
 * Returns custom logo URL stored in site_content (key + any lang),
 * or the provided fallback if none has been set.
 */
export function useLogo(key: string, fallback?: string): string | null {
  const { textOverrides } = useSite();
  return (
    textOverrides[`${key}::fr`] ||
    textOverrides[`${key}::en`] ||
    null
  );
}

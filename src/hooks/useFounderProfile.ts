import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FounderItemCategory =
  | "tagline"
  | "expertise"
  | "language"
  | "formation"
  | "parcours"
  | "association"
  | "social";

export type FounderItem = {
  id: string;
  category: string;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  icon: string;
  meta: string;
  color: string;
  sort_order: number;
  published: boolean;
};

/**
 * Loads the founder's structured profile items (expertises, languages,
 * formations, parcours, associations, socials, tagline) — used by the
 * /equipe page to render a rich, KOTTIN-style founder card.
 */
export function useFounderProfile() {
  const [items, setItems] = useState<FounderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("founder_profile_items")
      .select("*")
      .eq("published", true)
      .order("category")
      .order("sort_order")
      .then(({ data }) => {
        setItems((data as FounderItem[]) ?? []);
        setLoading(false);
      });
  }, []);

  const byCategory = (cat: FounderItemCategory) =>
    items.filter((i) => i.category === cat).sort((a, b) => a.sort_order - b.sort_order);

  return { items, byCategory, loading };
}

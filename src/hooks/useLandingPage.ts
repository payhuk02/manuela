import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type LandingPage = {
  id: string;
  slug: string;
  city: string;
  country: string;
  country_code: string;
  expertise_slug: string | null;
  title_fr: string;
  title_en: string;
  meta_description_fr: string;
  meta_description_en: string;
  h1_fr: string;
  h1_en: string;
  intro_fr: string;
  intro_en: string;
  content_fr: string;
  content_en: string;
  image_url: string | null;
  published: boolean;
  sort_order: number;
};

export function useLandingPage(slug: string | undefined) {
  const [data, setData] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setData(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (supabase.from as any)("landing_pages")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }: any) => {
        if (cancelled) return;
        setData(data ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading };
}

export function useLandingPages() {
  const [data, setData] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    (supabase.from as any)("landing_pages")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }: any) => {
        if (cancelled) return;
        setData(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { data, loading };
}

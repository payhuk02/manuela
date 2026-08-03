import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseExt } from "@/integrations/supabase/client-ext";
import type { TeamMemberPublicRow } from "@/integrations/supabase/extended-types";

type ContactInfo = {
  address: string;
  hours_fr: string;
  hours_en: string;
  email: string;
  phone: string;
  whatsapp_number: string;
  appointment_url: string;
  cabinet_name_fr: string;
  cabinet_name_en: string;
  linkedin_url: string;
};

type NewsItem = {
  id: string;
  slug: string | null;
  lang: "fr" | "en";
  title: string;
  excerpt: string;
  category: string;
  published_date: string;
  image_url: string | null;
  content_type: "news" | "article";
};

// Public-facing team member shape — matches the `team_members_public` view.
type TeamMember = Pick<
  TeamMemberPublicRow,
  | "id"
  | "name"
  | "role_fr"
  | "role_en"
  | "bio_fr"
  | "bio_en"
  | "presentation_fr"
  | "presentation_en"
  | "photo_url"
  | "cv_url"
  | "linkedin_url"
  | "is_founder"
  | "sort_order"
>;

export type SiteData = {
  contact: ContactInfo | null;
  news: NewsItem[];
  team: TeamMember[];
  textOverrides: Record<string, string>; // key::lang -> value
  loading: boolean;
};

export function useSiteData(): SiteData {
  const [data, setData] = useState<SiteData>({
    contact: null,
    news: [],
    team: [],
    textOverrides: {},
    loading: true,
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      supabase.from("contact_info").select("*").limit(1).maybeSingle(),
      supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .lte("published_date", today)
        .order("published_date", { ascending: false }),
      // Use the public view which excludes private PII (email, phone, office_address).
      supabaseExt
        .from("team_members_public")
        .select("*")
        .eq("published", true)
        .order("sort_order"),
      supabase.from("site_content").select("*"),
    ]).then(([c, n, t, sc]) => {
      const overrides: Record<string, string> = {};
      type SiteContentRow = { key: string; lang: string; value: string | null };
      (sc.data as SiteContentRow[] | null ?? []).forEach((r) => {
        if (r.value) overrides[`${r.key}::${r.lang}`] = r.value;
      });
      setData({
        contact: (c.data as ContactInfo) ?? null,
        news: (n.data as NewsItem[]) ?? [],
        team: (t.data as TeamMember[]) ?? [],
        textOverrides: overrides,
        loading: false,
      });
    });
  }, []);

  return data;
}

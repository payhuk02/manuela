import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FALLBACK_SECTIONS } from "@/data/expertiseSections";

export type ExpertiseSection = { title: string; items: string[] };
export type ExpertiseStep = { title: string; description: string };
export type ExpertiseFAQ = { question: string; answer: string };

export type ExpertiseRow = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  tagline: string;
  intro: string;
  conclusion: string;
  image_url: string | null;
  approach: string;
  sections: ExpertiseSection[];
  methodology: ExpertiseStep[];
  faq: ExpertiseFAQ[];
  sort_order: number;
  published: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
};

// `raw` is the row returned by Supabase where the JSONB columns are typed as
// `Json` — we narrow them to their concrete shapes here.
const normalize = (raw: Record<string, unknown>): ExpertiseRow => ({
  ...(raw as unknown as ExpertiseRow),
  sections: (Array.isArray(raw.sections) && raw.sections.length > 0) ? (raw.sections as ExpertiseSection[]) : (FALLBACK_SECTIONS[raw.slug as string] || []),
  methodology: Array.isArray(raw.methodology) ? (raw.methodology as ExpertiseStep[]) : [],
  faq: Array.isArray(raw.faq) ? (raw.faq as ExpertiseFAQ[]) : [],
});

const FALLBACK_EXPERTISES: ExpertiseRow[] = [
  {
    id: "ext-1",
    slug: "droit-des-etrangers-asile",
    title: "Droit des étrangers et de l'asile",
    icon: "Globe2",
    tagline: "Demande de visa, titre de séjour, regroupement familial, asile.",
    intro: "Nous vous accompagnons dans toutes vos démarches relatives au droit des étrangers et de la nationalité.",
    conclusion: "Notre cabinet vous garantit un suivi rigoureux pour faire valoir vos droits.",
    image_url: null,
    approach: "Une approche humaine et pragmatique pour débloquer votre situation administrative.",
    sections: [
      {
        title: "Nos interventions",
        items: [
          "Demande de visa d'entrée sur le territoire",
          "Demande de titre de séjour",
          "Introduire une demande de regroupement familial",
          "Demande d'asile et recours"
        ]
      }
    ],
    methodology: [],
    faq: [],
    sort_order: 1,
    published: true
  },
  {
    id: "fam-1",
    slug: "droit-de-la-famille",
    title: "Droit de la famille",
    icon: "Users",
    tagline: "Divorce, droits des enfants et devoirs des parents.",
    intro: "Nous vous assistons dans les moments délicats touchant à votre cadre familial.",
    conclusion: "Un accompagnement sur mesure pour protéger vos intérêts et ceux de vos enfants.",
    image_url: null,
    approach: "Écoute attentive, discrétion et fermeté dans la défense de vos droits.",
    sections: [
      {
        title: "Divorce",
        items: [
          "Divorce par consentement mutuel",
          "Divorce pour faute",
          "Divorce pour altération définitive du lien conjugal",
          "Divorce pour acceptation du principe de la rupture du mariage"
        ]
      },
      {
        title: "Droit des enfants",
        items: [
          "Résidence habituelle",
          "Droits de visite et d'hébergement",
          "Contribution à l'éducation et à l'entretien de l'enfant",
          "Droits et devoirs des parents vis-à-vis de leur enfant mineur"
        ]
      }
    ],
    methodology: [],
    faq: [],
    sort_order: 2,
    published: true
  }
];

export const useExpertises = (opts: { onlyPublished?: boolean } = {}) => {
  const { onlyPublished = true } = opts;
  const [data, setData] = useState<ExpertiseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    setLoading(true);
    let q = supabase.from("expertises").select("*").order("sort_order", { ascending: true });
    if (onlyPublished) q = q.eq("published", true);
    const { data: rows, error: err } = await q;
    if (err) {
      setError(err.message);
      setData(FALLBACK_EXPERTISES);
    } else {
      setData(rows && rows.length > 0 ? rows.map(normalize) : FALLBACK_EXPERTISES);
    }
    setLoading(false);
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyPublished]);

  return { data, loading, error, refetch };
};

export const useExpertise = (slug: string | undefined) => {
  const [data, setData] = useState<ExpertiseRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: row } = await supabase
        .from("expertises")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (!cancelled) {
        if (row) {
          setData(normalize(row));
        } else {
          const fallback = FALLBACK_EXPERTISES.find((e) => e.slug === slug);
          setData(fallback || null);
        }
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { data, loading };
};

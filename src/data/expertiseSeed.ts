/**
 * Canonical seed data for the 8 expertises.
 * The slugs MUST match the keys of EXPERTISE_IMAGES so that the fallback
 * image mapping (src/data/expertiseImages.ts) works on the public site.
 */

export type ExpertiseSeed = {
  slug: string;
  title: string;
  icon: string;
  tagline: string;
  intro: string;
  approach: string;
  conclusion: string;
};

export const EXPERTISE_SEED: ExpertiseSeed[] = [
  {
    slug: "droit-des-affaires",
    title: "Droit des affaires",
    icon: "Briefcase",
    tagline: "Conseil et contentieux pour entreprises, dirigeants et investisseurs.",
    intro:
      "Le cabinet accompagne les entreprises et leurs dirigeants à toutes les étapes de leur vie sociale, du conseil stratégique au contentieux complexe.",
    approach:
      "Une approche pragmatique combinant maîtrise technique du droit et compréhension des enjeux économiques de nos clients.",
    conclusion: "",
  },
  {
    slug: "droit-bancaire-et-financier",
    title: "Droit bancaire et financier",
    icon: "Landmark",
    tagline: "Financements, sûretés, contentieux bancaires et conformité.",
    intro:
      "Conseil et représentation auprès des établissements bancaires, emprunteurs et investisseurs, en France et à l'international.",
    approach:
      "Une expertise pointue des opérations de financement et des contentieux bancaires.",
    conclusion: "",
  },

  {
    slug: "droit-ohada",
    title: "Droit OHADA",
    icon: "Scale",
    tagline: "Maîtrise approfondie du droit harmonisé des affaires en Afrique.",
    intro:
      "Le cabinet conseille investisseurs et opérateurs économiques sur l'ensemble des Actes uniformes OHADA.",
    approach:
      "Une parfaite connaissance des juridictions et procédures dans les 17 États membres.",
    conclusion: "",
  },
  {
    slug: "droit-immobilier",
    title: "Droit immobilier",
    icon: "Building2",
    tagline: "Acquisition, transactions et contentieux immobiliers complexes.",
    intro:
      "Conseil aux propriétaires, promoteurs et investisseurs sur l'ensemble des opérations immobilières.",
    approach:
      "Sécurisation juridique des opérations et résolution efficace des litiges.",
    conclusion: "",
  },
  {
    slug: "droit-penal-et-droit-penal-des-affaires",
    title: "Droit pénal et droit pénal des affaires",
    icon: "Gavel",
    tagline: "Défense pénale, infractions économiques et financières.",
    intro:
      "Défense des personnes physiques et morales mises en cause dans des procédures pénales, notamment en matière économique.",
    approach:
      "Une défense rigoureuse, fondée sur l'analyse minutieuse du dossier et la stratégie procédurale.",
    conclusion: "",
  },
  {
    slug: "droit-des-etrangers",
    title: "Droit des étrangers",
    icon: "Globe2",
    tagline: "Titres de séjour, naturalisation, regroupement familial et recours.",
    intro:
      "Accompagnement des particuliers dans toutes leurs démarches en droit des étrangers et de la nationalité.",
    approach:
      "Une écoute attentive et un suivi personnalisé de chaque dossier.",
    conclusion: "",
  },
  {
    slug: "droit-petrolier-et-minier",
    title: "Droit pétrolier et minier",
    icon: "Flame",
    tagline: "Accompagnement des opérateurs et États sur les industries extractives.",
    intro:
      "Conseil aux compagnies pétrolières et minières, ainsi qu'aux États, sur les contrats et la régulation du secteur.",
    approach:
      "Une expertise sectorielle rare, à la croisée du droit, de la finance et des enjeux régaliens.",
    conclusion: "",
  },
  {
    slug: "droit-du-travail",
    title: "Droit du travail",
    icon: "Users",
    tagline: "Conseil et contentieux pour les employeurs et les salariés.",
    intro:
      "Le cabinet vous accompagne dans toutes les problématiques liées au droit social, de l'embauche à la rupture du contrat de travail.",
    approach:
      "Une approche stratégique pour prévenir les litiges et une défense combative devant les juridictions prud'homales.",
    conclusion: "",
  },
  {
    slug: "droit-du-dommage-corporel",
    title: "Droit du dommage corporel",
    icon: "Activity",
    tagline: "Indemnisation des victimes d'accidents et d'erreurs médicales.",
    intro:
      "Nous défendons les victimes pour obtenir la réparation intégrale de leurs préjudices corporels, matériels et moraux.",
    approach:
      "Un accompagnement humain et une détermination sans faille face aux compagnies d'assurance et fonds d'indemnisation.",
    conclusion: "",
  },
  {
    slug: "droit-de-la-famille",
    title: "Droit de la famille",
    icon: "Heart",
    tagline: "Divorce, séparation, filiation et successions.",
    intro:
      "Conseil et assistance dans les moments difficiles de la vie familiale, en privilégiant l'intérêt supérieur de nos clients.",
    approach:
      "Écoute, confidentialité et recherche de solutions amiables chaque fois que possible, sans exclure le contentieux.",
    conclusion: "",
  },
  {
    slug: "droit-administratif-et-de-la-fonction-publique",
    title: "Droit administratif et de la fonction publique",
    icon: "Landmark",
    tagline: "Litiges avec l'administration, contrats publics et fonction publique.",
    intro:
      "Défense des agents publics et des administrés face à l'État, aux collectivités territoriales et aux établissements publics.",
    approach:
      "Maîtrise approfondie des procédures administratives et recours devant le tribunal administratif.",
    conclusion: "",
  },
];

export const EXPECTED_SLUGS = EXPERTISE_SEED.map((e) => e.slug);

import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";
import { SeoPreview } from "./SeoPreview";

const imageField = (key: string) => ({
  key,
  label: "Image de partage (Open Graph)",
  image: true as const,
  hint: "Format recommandé : 1200×630 px (JPG/PNG/WebP). Si vide, l'image par défaut du site est utilisée.",
});

const GROUPS: GroupDef[] = [
  {
    label: "Page d'accueil",
    keys: [
      { key: "seo.home.title", label: "Titre (≤ 60 caractères)", defaultValue: "Avocat Paris — Cabinet Manuela DIABATE | Affaires & OHADA" },
      { key: "seo.home.description", label: "Description (≤ 160 caractères)", multiline: true, defaultValue: "Cabinet d'avocats à Paris : droit des affaires, OHADA, immobilier, pénal, étrangers. Conseil et contentieux entre la France et l'Afrique." },
      imageField("seo.home.image"),
      { key: "seo.home.jsonld.name", label: "Nom du cabinet (données structurées)", defaultValue: "Cabinet Manuela DIABATE" },
      { key: "seo.home.jsonld.description", label: "Description (données structurées)", multiline: true, defaultValue: "Cabinet d'avocats international — droit des affaires, OHADA, immobilier, contentieux." },
    ],
    renderPreview: (get) => (
      <SeoPreview path="/" title={get("seo.home.title")} description={get("seo.home.description")} image={get("seo.home.image")} />
    ),
  },
  {
    label: "Page Cabinet",
    keys: [
      { key: "seo.cabinet.title", label: "Titre", defaultValue: "Le Cabinet Manuela DIABATE — Avocats à Paris & en Afrique" },
      { key: "seo.cabinet.description", label: "Description", multiline: true, defaultValue: "Découvrez le Cabinet Manuela DIABATE : valeurs, méthodologie et expertise juridique au service des entreprises et particuliers, France et Afrique." },
      imageField("seo.cabinet.image"),
    ],
    renderPreview: (get) => (
      <SeoPreview path="/cabinet" title={get("seo.cabinet.title")} description={get("seo.cabinet.description")} image={get("seo.cabinet.image")} />
    ),
  },
  {
    label: "Page Expertises",
    keys: [
      { key: "seo.expertises.title", label: "Titre", defaultValue: "Expertises juridiques — Cabinet Manuela DIABATE, Paris" },
      { key: "seo.expertises.description", label: "Description", multiline: true, defaultValue: "Droit des affaires, OHADA, bancaire, immobilier, pénal des affaires, étrangers, pétrolier et minier : nos domaines d'intervention à Paris." },
      imageField("seo.expertises.image"),
    ],
    renderPreview: (get) => (
      <SeoPreview path="/expertises" title={get("seo.expertises.title")} description={get("seo.expertises.description")} image={get("seo.expertises.image")} />
    ),
  },
  {
    label: "Page Équipe",
    keys: [
      { key: "seo.team.title", label: "Titre", defaultValue: "Notre équipe d'avocats — Cabinet Manuela DIABATE Paris" },
      { key: "seo.team.description", label: "Description", multiline: true, defaultValue: "Maître Manuela DIABATE et ses avocats partenaires vous accompagnent à Paris et en Afrique avec rigueur, confidentialité et excellence juridique." },
      imageField("seo.team.image"),
    ],
    renderPreview: (get) => (
      <SeoPreview path="/equipe" title={get("seo.team.title")} description={get("seo.team.description")} image={get("seo.team.image")} />
    ),
  },
  {
    label: "Page Actualités",
    keys: [
      { key: "seo.news.title", label: "Titre", defaultValue: "Actualités juridiques & analyses — Manuela DIABATE Avocats" },
      { key: "seo.news.description", label: "Description", multiline: true, defaultValue: "Articles, analyses et actualités du Cabinet Manuela DIABATE : droit des affaires, OHADA, contentieux, fiscalité et droit international." },
      imageField("seo.news.image"),
    ],
    renderPreview: (get) => (
      <SeoPreview path="/actualites" title={get("seo.news.title")} description={get("seo.news.description")} image={get("seo.news.image")} />
    ),
  },
  {
    label: "Page Contact",
    keys: [
      { key: "seo.contact.title", label: "Titre", defaultValue: "Contact — Cabinet d'avocats Manuela DIABATE à Paris" },
      { key: "seo.contact.description", label: "Description", multiline: true, defaultValue: "Contactez le Cabinet Manuela DIABATE, avocat au Barreau de Paris. Prise de rendez-vous, téléphone et adresse — 3 av. des Ternes, 75017 Paris." },
      imageField("seo.contact.image"),
    ],
    renderPreview: (get) => (
      <SeoPreview path="/contact" title={get("seo.contact.title")} description={get("seo.contact.description")} image={get("seo.contact.image")} />
    ),
  },
];

export const SeoAdmin = () => (
  <ContentSectionEditor
    title="SEO — Référencement"
    description="Optimisez le titre, la description et l'image de partage de chaque page. Une prévisualisation en temps réel s'affiche sous chaque page (longueurs idéales : 60 caractères pour le titre, 160 pour la description, 1200×630 pour l'image)."
    groups={GROUPS}
    auditAction="content.seo.update"
  />
);

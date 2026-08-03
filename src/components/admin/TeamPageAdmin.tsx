import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";

const GROUPS: GroupDef[] = [
  {
    label: "Hero",
    keys: [
      { key: "teamPage.eyebrow", label: "Eyebrow (ex. « Notre équipe »)", defaultValue: "Notre équipe" },
      { key: "teamPage.titlePrefix", label: "Titre — préfixe (ex. « Des avocats »)", defaultValue: "Des avocats" },
      { key: "teamPage.titleAccent", label: "Titre — mot doré italique (ex. « engagés »)", defaultValue: "engagés" },
      { key: "teamPage.titleSuffix", label: "Titre — suffixe", multiline: true, defaultValue: ", des parcours d'exception." },
    ],
  },
  {
    label: "Sections",
    keys: [
      { key: "teamPage.founderEyebrow", label: "Eyebrow fondateur", defaultValue: "Avocat fondateur" },
      { key: "teamPage.founderBadge", label: "Badge doré sur la photo (ex. « FONDATEUR »)", defaultValue: "FONDATEUR" },
      { key: "teamPage.partnersEyebrow", label: "Eyebrow partenaires", defaultValue: "Nos avocats partenaires" },
      { key: "teamPage.partnersTitle", label: "Titre partenaires", multiline: true, defaultValue: "Une équipe d'expertise complémentaire." },
      { key: "teamPage.learnMore", label: "Libellé « En savoir plus »", defaultValue: "En savoir plus" },
      { key: "teamPage.downloadCv", label: "Libellé « Télécharger le CV »", defaultValue: "Télécharger le CV" },
      { key: "teamPage.getInTouch", label: "Libellé « Prendre contact »", defaultValue: "Prendre contact" },
    ],
  },
  {
    label: "Cartes éditoriales du fondateur (titres)",
    keys: [
      { key: "teamPage.section.expertise", label: "Titre carte « Domaines d'expertise »", defaultValue: "Domaines d'expertise" },
      { key: "teamPage.section.languages", label: "Titre carte « Langues »", defaultValue: "Langues" },
      { key: "teamPage.section.formation", label: "Titre carte « Formation »", defaultValue: "Formation" },
      { key: "teamPage.section.parcours", label: "Titre carte « Parcours »", defaultValue: "Parcours" },
      { key: "teamPage.section.associations", label: "Titre carte « Associations professionnelles »", defaultValue: "Associations professionnelles" },
    ],
  },
  {
    label: "CTA bas de page",
    keys: [
      { key: "teamPage.ctaTitle", label: "Titre", defaultValue: "Une question, un projet ?" },
      { key: "teamPage.ctaDescription", label: "Description", multiline: true, defaultValue: "Notre équipe vous répond sous 24 heures ouvrées." },
      { key: "teamPage.ctaButton", label: "Bouton", defaultValue: "Nous contacter" },
    ],
  },
];

export const TeamPageAdmin = () => (
  <ContentSectionEditor
    title="Page Équipe — textes éditoriaux"
    description="Modifiez les textes affichés sur la page /equipe (hero, intros, CTA). Pour gérer les membres eux-mêmes, utilisez l'onglet Équipe."
    groups={GROUPS}
    auditAction="content.team_page.update"
  />
);

import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";

// Reste des textes non liés à une page dédiée (Footer, etc.).
// Les textes Accueil et Cabinet ont leurs propres sections d'admin.
const GROUPS: GroupDef[] = [
  {
    label: "Footer",
    keys: [
      { key: "footer.tagline", label: "Tagline", defaultValue: "Cabinet Manuela DIABATE" },
      { key: "footer.legal", label: "Mentions légales", defaultValue: "Mentions légales" },
      { key: "footer.privacy", label: "Confidentialité", defaultValue: "Confidentialité" },
      { key: "footer.rights", label: "Mention de droits", defaultValue: "Tous droits réservés." },
    ],
  },
];

export const ContentAdmin = () => (
  <ContentSectionEditor
    title="Textes globaux"
    description="Textes communs au site (footer, mentions). Les pages Accueil et Cabinet ont leurs propres sections dédiées dans le menu."
    groups={GROUPS}
  />
);

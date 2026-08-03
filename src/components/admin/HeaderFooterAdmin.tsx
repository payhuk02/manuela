import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";

const GROUPS: GroupDef[] = [
  {
    label: "Header — Navigation",
    keys: [
      { key: "nav.home", label: "Accueil", defaultValue: "Accueil" },
      { key: "nav.about", label: "Cabinet", defaultValue: "Cabinet" },
      { key: "nav.practice", label: "Expertises", defaultValue: "Expertises" },
      { key: "nav.team", label: "Équipe", defaultValue: "Équipe" },
      { key: "nav.news", label: "Actualités", defaultValue: "Actu/Articles" },
      { key: "nav.contact", label: "Contact", defaultValue: "Contact" },
      { key: "nav.appointment", label: "Bouton « Prendre rendez-vous »", defaultValue: "Prendre rendez-vous" },
    ],
  },
  {
    label: "Footer — Tagline & titres de colonnes",
    keys: [
      { key: "footer.tagline", label: "Tagline (sous le logo)", multiline: true, defaultValue: "Cabinet Manuela DIABATE" },
      { key: "footer.usefulLinks", label: "Titre colonne « Liens utiles »", defaultValue: "Liens utiles" },
      { key: "footer.expertisesTitle", label: "Titre colonne « Nos expertises »", defaultValue: "Nos expertises" },
      { key: "footer.contactTitle", label: "Titre colonne « Contact »", defaultValue: "Contact" },
    ],
  },
  {
    label: "Footer — Liens utiles (libellés)",
    keys: [
      { key: "footer.about", label: "Lien « Notre cabinet »", defaultValue: "Notre cabinet" },
      { key: "footer.expertises", label: "Lien « Nos expertises »", defaultValue: "Nos expertises" },
      { key: "footer.team", label: "Lien « Notre équipe »", defaultValue: "Notre équipe" },
    ],
  },
  {
    label: "Footer — Bas de page",
    keys: [
      { key: "footer.rights", label: "Mention copyright (ex. « Tous droits réservés. »)", defaultValue: "Tous droits réservés." },
      { key: "footer.legal", label: "Lien « Mentions légales »", defaultValue: "Mentions légales" },
      { key: "footer.privacy", label: "Lien « Confidentialité »", defaultValue: "Confidentialité" },
      { key: "footer.terms", label: "Lien « CGU »", defaultValue: "CGU" },
      { key: "footer.admin", label: "Lien « Administration »", defaultValue: "Administration" },
    ],
  },
  {
    label: "Options d'Apparence",
    keys: [
      { key: "settings.customCursor", label: "Curseur personnalisé ('true' pour activer, 'false' pour désactiver)", defaultValue: "true" },
    ],
  },
];

export const HeaderFooterAdmin = () => (
  <ContentSectionEditor
    title="Header & Footer"
    description="Personnalisez les libellés du menu, du pied de page et des mentions légales."
    groups={GROUPS}
    auditAction="content.header_footer.update"
  />
);

import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";

const GROUPS: GroupDef[] = [
  {
    label: "Hero",
    keys: [
      { key: "expertisesPage.eyebrow", label: "Eyebrow (ex. « Nos expertises »)", defaultValue: "Nos expertises" },
      { key: "expertisesPage.titlePrefix", label: "Titre — préfixe", defaultValue: "Une expertise" },
      { key: "expertisesPage.titleAccent", label: "Titre — mot doré italique", defaultValue: "complète" },
      { key: "expertisesPage.titleSuffix", label: "Titre — suffixe", multiline: true, defaultValue: "au service de vos enjeux." },
      { key: "expertisesPage.subtitle", label: "Sous-titre", multiline: true, defaultValue: "Conseil stratégique et contentieux, en France comme à l'international. Découvrez les domaines d'intervention du cabinet." },
    ],
  },
  {
    label: "Section domaines",
    keys: [
      { key: "expertisesPage.domainsEyebrow", label: "Eyebrow", defaultValue: "Domaines d'intervention" },
      { key: "expertisesPage.domainsTitle", label: "Titre", multiline: true, defaultValue: "Nos domaines clés, une approche sur mesure." },
      { key: "expertisesPage.learnMore", label: "Libellé « En savoir plus »", defaultValue: "En savoir plus" },
      { key: "expertisesPage.loading", label: "Libellé chargement", defaultValue: "Chargement…" },
    ],
  },
  {
    label: "CTA bas de page",
    keys: [
      { key: "expertisesPage.ctaTitle", label: "Titre", defaultValue: "Un dossier à nous confier ?" },
      { key: "expertisesPage.ctaDescription", label: "Description", multiline: true, defaultValue: "Échangeons sur votre situation en toute confidentialité." },
      { key: "expertisesPage.ctaButton", label: "Bouton", defaultValue: "Nous contacter" },
    ],
  },
  {
    label: "Formulaire de contact (par expertise) — Libellés",
    keys: [
      { key: "expertiseForm.eyebrow", label: "Eyebrow", defaultValue: "Demande dédiée" },
      { key: "expertiseForm.title", label: "Titre (utilisez {expertise} pour insérer le nom)", defaultValue: "Une question en {expertise} ?" },
      { key: "expertiseForm.subtitle", label: "Sous-titre", multiline: true, defaultValue: "Décrivez votre situation. Nous vous répondons sous 24h ouvrées." },
      { key: "expertiseForm.confidential", label: "Mention de confidentialité", multiline: true, defaultValue: "Vos informations restent strictement confidentielles." },
    ],
  },
  {
    label: "Formulaire de contact — Champs & boutons",
    keys: [
      { key: "expertiseForm.nameLabel", label: "Libellé Nom", defaultValue: "Nom complet" },
      { key: "expertiseForm.emailLabel", label: "Libellé Email", defaultValue: "Email" },
      { key: "expertiseForm.phoneLabel", label: "Libellé Téléphone", defaultValue: "Téléphone" },
      { key: "expertiseForm.messageLabel", label: "Libellé Message", defaultValue: "Message" },
      { key: "expertiseForm.messagePlaceholder", label: "Placeholder du message ({expertise} dispo)", multiline: true, defaultValue: "Décrivez votre dossier en {expertise}…" },
      { key: "expertiseForm.submit", label: "Bouton — envoyer", defaultValue: "Envoyer ma demande" },
      { key: "expertiseForm.sending", label: "Bouton — état envoi", defaultValue: "Envoi…" },
    ],
  },
  {
    label: "Formulaire de contact — Confirmation & erreurs",
    keys: [
      { key: "expertiseForm.sentTitle", label: "Confirmation — titre", defaultValue: "Demande transmise" },
      { key: "expertiseForm.sentDesc", label: "Confirmation — description", multiline: true, defaultValue: "Merci, votre demande a été enregistrée. Notre équipe vous recontactera rapidement." },
      { key: "expertiseForm.limit", label: "Erreur — limite atteinte", defaultValue: "Limite d'envois atteinte. Réessayez plus tard." },
      { key: "expertiseForm.error", label: "Erreur — générique", defaultValue: "Une erreur est survenue. Merci de réessayer." },
    ],
  },
];

export const ExpertisesPageAdmin = () => (
  <ContentSectionEditor
    title="Page Expertises"
    description="Modifiez les textes affichés sur la page /expertises (hero, intro, CTA)."
    groups={GROUPS}
    auditAction="content.expertises_page.update"
  />
);

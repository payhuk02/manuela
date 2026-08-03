import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";
import { VALUE_ICON_OPTIONS } from "@/data/valueIcons";

const GROUPS: GroupDef[] = [
  {
    label: "Hero",
    keys: [
      { key: "cabinet.eyebrow", label: "Eyebrow hero", defaultValue: "Cabinet" },
      { key: "cabinet.heroTitlePrefix", label: "Titre hero — préfixe (ex. Cabinet)", defaultValue: "Cabinet" },
      { key: "cabinet.heroTitleAccent", label: "Titre hero — mot doré (ex. Manuela DIABATE)", defaultValue: "Manuela DIABATE" },
      { key: "cabinet.heroSubtitle", label: "Sous-titre hero", multiline: true, defaultValue: "Un partenaire juridique entre la France et l'Afrique." },
    ],
  },
  {
    label: "Présentation",
    keys: [
      { key: "cabinet.presentation.eyebrow", label: "Eyebrow", defaultValue: "Présentation" },
      { key: "cabinet.presentation.titlePrefix", label: "Titre — préfixe", defaultValue: "Un cabinet" },
      { key: "cabinet.presentation.titleAccent", label: "Titre — mot doré (italique)", defaultValue: "à votre image" },
      { key: "cabinet.presentation.lead", label: "Phrase d'accroche", multiline: true, defaultValue: "Conseil stratégique & contentieux, en France et à l'international." },
      { key: "cabinet.presentation.p1", label: "Paragraphe 1", multiline: true, defaultValue: "Cabinet Manuela DIABATE est fondé par Maître Manuela DIABATE, avocat inscrit au Barreau de Paris." },
      { key: "cabinet.presentation.p2", label: "Paragraphe 2", multiline: true, defaultValue: "Le cabinet accompagne une clientèle composée d'entreprises, d'investisseurs, d'institutions et de particuliers dans la gestion de leurs enjeux juridiques et stratégiques, en France comme à l'international." },
      { key: "cabinet.presentation.p3", label: "Paragraphe 3", multiline: true, defaultValue: "Cabinet Manuela DIABATE développe une pratique orientée vers le conseil stratégique et le contentieux, en mettant au service de ses clients une expertise juridique solide et une compréhension fine des enjeux économiques." },
      { key: "cabinet.presentation.p4", label: "Paragraphe 4", multiline: true, defaultValue: "Alliant exigence professionnelle, sens de la stratégie et engagement au service des intérêts de ses clients, le cabinet s'inscrit dans une démarche d'excellence et d'efficacité, au service d'une pratique juridique de haut niveau." },
      { key: "cabinet.presentation.quote", label: "Citation finale (italique doré)", multiline: true, defaultValue: "Par son positionnement et sa vision, le Cabinet Manuela DIABATE se veut un partenaire juridique de confiance, capable d'offrir à ses clients un accompagnement sur mesure dans des contextes juridiques et économiques exigeants." },
    ],
  },
  {
    label: "Valeurs",
    keys: [
      { key: "cabinet.values.eyebrow", label: "Eyebrow", defaultValue: "Nos valeurs" },
      { key: "cabinet.values.title", label: "Titre", multiline: true, defaultValue: "Quatre piliers, une seule exigence." },
      { key: "cabinet.values.1.icon", label: "Valeur 1 — icône", defaultValue: "Scale", options: VALUE_ICON_OPTIONS },
      { key: "cabinet.values.1.title", label: "Valeur 1 — titre", defaultValue: "Rigueur" },
      { key: "cabinet.values.1.desc", label: "Valeur 1 — description", multiline: true, defaultValue: "Une exigence absolue dans chaque dossier traité." },
      { key: "cabinet.values.2.icon", label: "Valeur 2 — icône", defaultValue: "Lock", options: VALUE_ICON_OPTIONS },
      { key: "cabinet.values.2.title", label: "Valeur 2 — titre", defaultValue: "Confidentialité" },
      { key: "cabinet.values.2.desc", label: "Valeur 2 — description", multiline: true, defaultValue: "Une discrétion totale au service de la confiance." },
      { key: "cabinet.values.3.icon", label: "Valeur 3 — icône", defaultValue: "Target", options: VALUE_ICON_OPTIONS },
      { key: "cabinet.values.3.title", label: "Valeur 3 — titre", defaultValue: "Stratégie" },
      { key: "cabinet.values.3.desc", label: "Valeur 3 — description", multiline: true, defaultValue: "Une vision claire pour anticiper et décider." },
      { key: "cabinet.values.4.icon", label: "Valeur 4 — icône", defaultValue: "Award", options: VALUE_ICON_OPTIONS },
      { key: "cabinet.values.4.title", label: "Valeur 4 — titre", defaultValue: "Excellence" },
      { key: "cabinet.values.4.desc", label: "Valeur 4 — description", multiline: true, defaultValue: "Un niveau d'exigence à la hauteur de vos enjeux." },
    ],
  },
  {
    label: "Frise Chronologique (Timeline)",
    keys: [
      { key: "cabinet.timeline.show", label: "Afficher cette section (oui/non)", defaultValue: "oui" },
      { key: "cabinet.timeline.eyebrow", label: "Eyebrow", defaultValue: "Frise Chronologique" },
      { key: "cabinet.timeline.mainTitle", label: "Titre principal", defaultValue: "Notre Parcours" },
      { key: "cabinet.timeline.1.year", label: "Étape 1 — Année", defaultValue: "2018" },
      { key: "cabinet.timeline.1.title", label: "Étape 1 — Titre", defaultValue: "Création du Cabinet" },
      { key: "cabinet.timeline.1.desc", label: "Étape 1 — Description", multiline: true, defaultValue: "Fondation du cabinet avec une vision claire : apporter une expertise juridique pointue en droit des affaires et droit pénal." },
      { key: "cabinet.timeline.2.year", label: "Étape 2 — Année", defaultValue: "2020" },
      { key: "cabinet.timeline.2.title", label: "Étape 2 — Titre", defaultValue: "Développement International" },
      { key: "cabinet.timeline.2.desc", label: "Étape 2 — Description", multiline: true, defaultValue: "Renforcement de notre réseau de partenaires, marquant le début de l'expertise approfondie en droit OHADA." },
      { key: "cabinet.timeline.3.year", label: "Étape 3 — Année", defaultValue: "2022" },
      { key: "cabinet.timeline.3.title", label: "Étape 3 — Titre", defaultValue: "Élargissement des Compétences" },
      { key: "cabinet.timeline.3.desc", label: "Étape 3 — Description", multiline: true, defaultValue: "Intégration du droit de l'immobilier et du droit des étrangers pour offrir un accompagnement global à nos clients." },
      { key: "cabinet.timeline.4.year", label: "Étape 4 — Année", defaultValue: "2024" },
      { key: "cabinet.timeline.4.title", label: "Étape 4 — Titre", defaultValue: "Accélération" },
      { key: "cabinet.timeline.4.desc", label: "Étape 4 — Description", multiline: true, defaultValue: "Une équipe qui s'agrandit pour mieux répondre aux enjeux juridiques complexes de notre époque." },
    ],
  },
  {
    label: "CTA bas de page",
    keys: [
      { key: "cabinet.cta.title", label: "Titre", multiline: true, defaultValue: "Discutons de votre situation." },
      { key: "cabinet.cta.button", label: "Bouton", defaultValue: "Nous contacter" },
    ],
  },
];

export const CabinetAdmin = () => (
  <ContentSectionEditor
    title="Page Cabinet"
    description="Modifiez tous les textes de la page /cabinet."
    groups={GROUPS}
    auditAction="content.cabinet.update"
  />
);

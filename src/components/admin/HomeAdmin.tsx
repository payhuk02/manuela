import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";

// Defaults below mirror EXACTLY the fallbacks used in the actual site components
// (Hero.tsx, About.tsx, Strengths.tsx, Practice.tsx, NewsSection.tsx, CTA.tsx,
// Contact.tsx, Index.tsx). Keep them in sync if you ever change the source.
const ABOUT_P1 =
  "Avocat passionné et engagé, inscrit au Barreau de Paris, Maître Manuela DIABATE accompagne ses clients avec rigueur et détermination, tant en Conseil qu'en Contentieux.";
const ABOUT_P2 =
  "Fort d'un parcours professionnel enrichissant, Maître VANGAH a exercé au sein de cabinets d'avocats de renom en Côte d'Ivoire et en France, ainsi qu'au sein d'entreprises internationales. Ces expériences variées lui ont permis de développer une approche globale et pragmatique des problématiques juridiques, répondant aux exigences d'une clientèle diversifiée.";
const ABOUT_P3 =
  "Diplômé en droit en Côte d'Ivoire, Maître VANGAH possède une maîtrise approfondie du droit OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires). Cette compétence, alliée à sa pratique du droit français, lui confère une capacité unique à traiter des dossiers transnationaux complexes, en conciliant les systèmes juridiques africains et européens.";
const ABOUT_P4 =
  "Cette double compétence franco-africaine lui permet d'appréhender avec finesse des problématiques complexes à l'échelle internationale dans plusieurs domaines du droit, tels que le droit des affaires (sociétés, bancaires et financiers, conflits entre associés…), droit immobilier (baux, copropriétés, constructions), droit des étrangers (visas, titres de séjour, naturalisation, asile).";
const ABOUT_P5 =
  "Maître Manuela DIABATE s'engage à défendre vos intérêts avec passion, rigueur, et détermination, en vous offrant un accompagnement juridique sur mesure adapté à vos besoins spécifiques.";

const GROUPS: GroupDef[] = [
  {
    label: "Hero",
    keys: [
      { key: "hero.eyebrow", label: "Eyebrow", defaultValue: "Conseil & Contentieux" },
      { key: "hero.titleLine1", label: "Titre — ligne 1", defaultValue: "CABINET" },
      { key: "hero.titleLine2", label: "Titre — ligne 2 (italique doré)", defaultValue: "Manuela DIABATE" },
      { key: "hero.subtitle", label: "Sous-titre", multiline: true, defaultValue: "Conseil & Contentieux — Expertise France & Afrique." },
      { key: "hero.cta", label: "Bouton principal (RDV)", defaultValue: "Prendre rendez-vous" },
      { key: "hero.ctaSecondary", label: "Bouton secondaire (Contact)", defaultValue: "Contact" },
      { key: "hero.image", label: "Image de secours (URL) — utilisée si aucun slide ne charge", defaultValue: "", clearable: true },
    ],
  },
  {
    label: "Hero — Carrousel : Images (URL par slide)",
    keys: [
      { key: "hero.s1.image", label: "Slide 1 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s2.image", label: "Slide 2 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s3.image", label: "Slide 3 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s4.image", label: "Slide 4 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s5.image", label: "Slide 5 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s6.image", label: "Slide 6 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s7.image", label: "Slide 7 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s8.image", label: "Slide 8 — Image (URL)", defaultValue: "", clearable: true },
      { key: "hero.s9.image", label: "Slide 9 — Image (URL)", defaultValue: "", clearable: true },
    ],
  },
  {
    label: "Hero — Carrousel (9 slides)",
    keys: [
      { key: "hero.s1.eyebrow", label: "Slide 1 — Eyebrow", multiline: true, defaultValue: "CABINET\nManuela DIABATE" },
      { key: "hero.s1.title", label: "Slide 1 — Titre", defaultValue: "Avocat au" },
      { key: "hero.s1.accent", label: "Slide 1 — Accent doré", defaultValue: "Barreau de Paris" , clearable: true },
      { key: "hero.s2.eyebrow", label: "Slide 2 — Eyebrow", defaultValue: "Expertise" },
      { key: "hero.s2.title", label: "Slide 2 — Titre", defaultValue: "Droit des" },
      { key: "hero.s2.accent", label: "Slide 2 — Accent doré", defaultValue: "affaires" , clearable: true },
      { key: "hero.s3.eyebrow", label: "Slide 3 — Eyebrow", defaultValue: "Protection" },
      { key: "hero.s3.title", label: "Slide 3 — Titre", defaultValue: "Droit du" },
      { key: "hero.s3.accent", label: "Slide 3 — Accent doré", defaultValue: "travail" , clearable: true },
      { key: "hero.s4.eyebrow", label: "Slide 4 — Eyebrow", defaultValue: "Assistance" },
      { key: "hero.s4.title", label: "Slide 4 — Titre", defaultValue: "Dommage" },
      { key: "hero.s4.accent", label: "Slide 4 — Accent doré", defaultValue: "corporel" , clearable: true },
      { key: "hero.s5.eyebrow", label: "Slide 5 — Eyebrow", defaultValue: "Accompagnement" },
      { key: "hero.s5.title", label: "Slide 5 — Titre", defaultValue: "Droit de la" },
      { key: "hero.s5.accent", label: "Slide 5 — Accent doré", defaultValue: "famille" , clearable: true },
      { key: "hero.s6.eyebrow", label: "Slide 6 — Eyebrow", defaultValue: "Défense" },
      { key: "hero.s6.title", label: "Slide 6 — Titre", defaultValue: "Droit" },
      { key: "hero.s6.accent", label: "Slide 6 — Accent doré", defaultValue: "administratif" , clearable: true },
      { key: "hero.s7.eyebrow", label: "Slide 7 — Eyebrow", defaultValue: "Protection" },
      { key: "hero.s7.title", label: "Slide 7 — Titre", defaultValue: "Droit des" },
      { key: "hero.s7.accent", label: "Slide 7 — Accent doré", defaultValue: "étrangers" , clearable: true },
      { key: "hero.s8.eyebrow", label: "Slide 8 — Eyebrow", defaultValue: "Investissement" },
      { key: "hero.s8.title", label: "Slide 8 — Titre", defaultValue: "Droit" },
      { key: "hero.s8.accent", label: "Slide 8 — Accent doré", defaultValue: "immobilier" , clearable: true },
      { key: "hero.s9.eyebrow", label: "Slide 9 — Eyebrow", defaultValue: "Afrique" },
      { key: "hero.s9.title", label: "Slide 9 — Titre", defaultValue: "Droit" },
      { key: "hero.s9.accent", label: "Slide 9 — Accent doré", defaultValue: "OHADA" , clearable: true },
    ],
  },
  {
    label: "Hero — Carrousel : Couleurs des textes (par slide)",
    keys: [
      { key: "hero.s1.color.eyebrow", label: "Slide 1 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s1.color.title", label: "Slide 1 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s1.color.accent", label: "Slide 1 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s2.color.eyebrow", label: "Slide 2 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s2.color.title", label: "Slide 2 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s2.color.accent", label: "Slide 2 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s3.color.eyebrow", label: "Slide 3 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s3.color.title", label: "Slide 3 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s3.color.accent", label: "Slide 3 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s4.color.eyebrow", label: "Slide 4 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s4.color.title", label: "Slide 4 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s4.color.accent", label: "Slide 4 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s5.color.eyebrow", label: "Slide 5 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s5.color.title", label: "Slide 5 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s5.color.accent", label: "Slide 5 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s6.color.eyebrow", label: "Slide 6 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s6.color.title", label: "Slide 6 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s6.color.accent", label: "Slide 6 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s7.color.eyebrow", label: "Slide 7 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s7.color.title", label: "Slide 7 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s7.color.accent", label: "Slide 7 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s8.color.eyebrow", label: "Slide 8 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s8.color.title", label: "Slide 8 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s8.color.accent", label: "Slide 8 — Couleur Accent", color: true, defaultValue: "#d4af37" },
      { key: "hero.s9.color.eyebrow", label: "Slide 9 — Couleur Eyebrow", color: true, defaultValue: "#d4af37" },
      { key: "hero.s9.color.title", label: "Slide 9 — Couleur Titre", color: true, defaultValue: "#ffffff" },
      { key: "hero.s9.color.accent", label: "Slide 9 — Couleur Accent", color: true, defaultValue: "#d4af37" },
    ],
  },
  {
    label: "Hero — Carrousel : Taille des écritures (par slide)",
    keys: (() => {
      const SIZE_OPTIONS_EYEBROW = [
        { value: "xs", label: "Très petit" },
        { value: "sm", label: "Petit" },
        { value: "md", label: "Normal (par défaut)" },
        { value: "lg", label: "Grand" },
        { value: "xl", label: "Très grand" },
      ];
      const SIZE_OPTIONS_TITLE = [
        { value: "xs", label: "Très petit" },
        { value: "sm", label: "Petit" },
        { value: "md", label: "Normal (par défaut)" },
        { value: "lg", label: "Grand" },
        { value: "xl", label: "Très grand" },
        { value: "2xl", label: "Géant" },
      ];
      const fields: { key: string; label: string; options: { value: string; label: string }[]; defaultValue: string }[] = [];
      for (let i = 1; i <= 9; i++) {
        fields.push({
          key: `hero.s${i}.size.eyebrow`,
          label: `Slide ${i} — Taille Eyebrow`,
          options: SIZE_OPTIONS_EYEBROW,
          defaultValue: "md",
        });
        fields.push({
          key: `hero.s${i}.size.title`,
          label: `Slide ${i} — Taille Titre`,
          options: SIZE_OPTIONS_TITLE,
          defaultValue: "md",
        });
      }
      return fields;
    })(),
  },
  {
    label: "Cabinet (présentation)",
    keys: [
      { key: "about.eyebrow", label: "Eyebrow", defaultValue: "Présentation" },
      { key: "about.titlePrefix", label: "Titre — préfixe", defaultValue: "Maître MANUELA" },
      { key: "about.titleAccent", label: "Titre — mot doré", defaultValue: "VANGAH" },
      { key: "about.portrait", label: "Portrait (URL personnalisée) — vide = portrait par défaut", defaultValue: "", clearable: true },
      { key: "about.p1", label: "Paragraphe 1", multiline: true, defaultValue: ABOUT_P1 },
      { key: "about.p2", label: "Paragraphe 2", multiline: true, defaultValue: ABOUT_P2 },
      { key: "about.p3", label: "Paragraphe 3", multiline: true, defaultValue: ABOUT_P3 },
      { key: "about.p4", label: "Paragraphe 4", multiline: true, defaultValue: ABOUT_P4 },
      { key: "about.p5", label: "Paragraphe 5", multiline: true, defaultValue: ABOUT_P5 },
      { key: "about.intervention", label: "Label « Il intervient notamment en »", defaultValue: "Il intervient notamment en" },
      { key: "about.domain1", label: "Domaine 1", defaultValue: "Droit des affaires" },
      { key: "about.domain2", label: "Domaine 2", defaultValue: "Droit immobilier" },
      { key: "about.domain3", label: "Domaine 3", defaultValue: "Droit des étrangers" },
    ],
  },
  {
    label: "Points forts",
    keys: [
      { key: "strengths.eyebrow", label: "Eyebrow", defaultValue: "Points forts" },
      { key: "strengths.title", label: "Titre", multiline: true, defaultValue: "Pourquoi nous choisir." },
      { key: "strengths.1.title", label: "Item 1 — titre", defaultValue: "Expertise franco-africaine" },
      { key: "strengths.1.desc", label: "Item 1 — description", multiline: true, defaultValue: "Une double culture juridique au service de dossiers transnationaux." },
      { key: "strengths.2.title", label: "Item 2 — titre", defaultValue: "Approche stratégique" },
      { key: "strengths.2.desc", label: "Item 2 — description", multiline: true, defaultValue: "Une analyse fine pour orienter chaque décision avec efficacité." },
      { key: "strengths.3.title", label: "Item 3 — titre", defaultValue: "Accompagnement sur mesure" },
      { key: "strengths.3.desc", label: "Item 3 — description", multiline: true, defaultValue: "Des solutions adaptées aux réalités de chaque client." },
      { key: "strengths.4.title", label: "Item 4 — titre", defaultValue: "Rigueur et engagement" },
      { key: "strengths.4.desc", label: "Item 4 — description", multiline: true, defaultValue: "Une exigence absolue dans la défense de vos intérêts." },
    ],
  },
  {
    label: "Expertises (intro)",
    keys: [
      { key: "practice.eyebrow", label: "Eyebrow", defaultValue: "Domaines d'intervention" },
      { key: "practice.titlePrefix", label: "Titre — préfixe (ex. « Une expertise »)", defaultValue: "Une expertise" },
      { key: "practice.titleAccent", label: "Titre — mot doré italique (ex. « complète »)", defaultValue: "complète" },
      { key: "practice.titleSuffix", label: "Titre — suffixe (ex. « au service de vos enjeux. »)", defaultValue: "au service de vos enjeux." },
      { key: "practice.loading", label: "Texte « Chargement… »", defaultValue: "Chargement…" },
    ],
  },
  {
    label: "Équipe (intro)",
    keys: [
      { key: "team.eyebrow", label: "Eyebrow", defaultValue: "Notre équipe" },
      { key: "team.title", label: "Titre", multiline: true, defaultValue: "Des avocats engagés,\ndes parcours d'exception." },
    ],
  },
  {
    label: "Actualités (intro)",
    keys: [
      { key: "news.eyebrow", label: "Eyebrow", defaultValue: "Actualités" },
      { key: "news.title", label: "Titre", multiline: true, defaultValue: "Décryptages & publications" },
      { key: "news.readMore", label: "Lien « Lire l'article »", defaultValue: "Lire l'article" },
      { key: "news.seeAll", label: "Lien « Voir toutes les actualités »", defaultValue: "Voir toutes les actualités" },
    ],
  },
  {
    label: "Fil d'actualités (sous la carte Google Maps)",
    keys: [
      { key: "newsTicker.eyebrow", label: "Eyebrow", defaultValue: "Fil d'actualité" },
      { key: "newsTicker.title", label: "Titre", multiline: true, defaultValue: "Actualités & articles en continu" },
    ],
  },
  {
    label: "Bloc CTA Contact (bas page accueil)",
    keys: [
      { key: "cta.eyebrow", label: "Eyebrow", defaultValue: "Contact" },
      { key: "cta.titlePrefix", label: "Titre — préfixe (ex. « Parlons de »)", defaultValue: "Parlons de" },
      { key: "cta.titleAccent", label: "Titre — mot doré italique (ex. « votre situation »)", defaultValue: "votre situation" },
      { key: "cta.description", label: "Description", multiline: true, defaultValue: "Chaque dossier mérite une écoute attentive et une stratégie sur mesure. Échangeons en toute confidentialité." },
      { key: "cta.button", label: "Bouton", defaultValue: "Prendre rendez-vous" },
    ],
  },
  {
    label: "Section Contact — Libellés",
    keys: [
      { key: "contact.whatsappLabel", label: "Libellé « WhatsApp »", defaultValue: "WhatsApp" },
      { key: "contact.linkedinLabel", label: "Libellé « LinkedIn »", defaultValue: "LinkedIn" },
      { key: "contact.linkedinName", label: "Nom affiché à côté du lien LinkedIn", defaultValue: "Sylvestre Manuela Diabate" },
      { key: "contact.directions", label: "Lien « Itinéraire »", defaultValue: "Itinéraire" },
      { key: "contact.mapTitle", label: "Titre de la carte (accessibilité)", defaultValue: "Localisation du cabinet" },
      { key: "contact.mapLoading", label: "Texte « Chargement de la carte… »", defaultValue: "Chargement de la carte…" },
      { key: "contact.optional", label: "Mention « (facultatif) »", defaultValue: "(facultatif)" },
      { key: "contact.confidentialNote", label: "Note de confidentialité (sous le bouton)", multiline: true, defaultValue: "Vos informations restent strictement confidentielles." },
    ],
  },
  {
    label: "Section Contact — Formulaire (placeholders)",
    keys: [
      { key: "contact.namePh", label: "Placeholder — Nom", defaultValue: "Jean Dupont" },
      { key: "contact.emailPh", label: "Placeholder — Email", defaultValue: "jean.dupont@email.com" },
      { key: "contact.phonePh", label: "Placeholder — Téléphone", defaultValue: "+33 6 12 34 56 78" },
      { key: "contact.messagePh", label: "Placeholder — Message", multiline: true, defaultValue: "Décrivez brièvement votre situation…" },
      { key: "contact.sending", label: "Texte du bouton pendant l'envoi (ex. « Envoi… »)", defaultValue: "Envoi…" },
      { key: "contact.genericError", label: "Message d'erreur générique", defaultValue: "Une erreur est survenue. Merci de réessayer." },
    ],
  },
  {
    label: "Section Contact — Confirmation (popup après envoi)",
    keys: [
      { key: "contact.ackTitle", label: "Titre du popup", defaultValue: "Message bien reçu" },
      { key: "contact.ackDesc", label: "Message de remerciement", multiline: true, defaultValue: "Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais." },
      { key: "contact.ackClose", label: "Bouton « Fermer »", defaultValue: "Fermer" },
    ],
  },
  {
    label: "Section Contact — Tarification (Honoraires)",
    keys: [
      { key: "contact.pricing.eyebrow", label: "Surtitre", defaultValue: "Honoraires" },
      { key: "contact.pricing.title", label: "Titre", defaultValue: "Tarifs des consultations" },
      
      { key: "contact.pricing.1.title", label: "Option 1 : Titre", defaultValue: "Rendez-vous cabinet" },
      { key: "contact.pricing.1.desc", label: "Option 1 : Description", defaultValue: "Durée : 60 min" },
      { key: "contact.pricing.1.price", label: "Option 1 : Prix", defaultValue: "180 €" },
      { key: "contact.pricing.1.btn", label: "Option 1 : Bouton", defaultValue: "Prendre RDV" },
      
      { key: "contact.pricing.2.title", label: "Option 2 : Titre", defaultValue: "Consultation vidéo" },
      { key: "contact.pricing.2.desc", label: "Option 2 : Description", defaultValue: "Durée : 60 min" },
      { key: "contact.pricing.2.price", label: "Option 2 : Prix", defaultValue: "180 €" },
      { key: "contact.pricing.2.btn", label: "Option 2 : Bouton", defaultValue: "Prendre RDV" },
      
      { key: "contact.pricing.3.title", label: "Option 3 : Titre", defaultValue: "Consultation écrite" },
      { key: "contact.pricing.3.desc", label: "Option 3 : Description", defaultValue: "Etude de votre dossier + possibilité d'ajout d'une pièce jointe" },
      { key: "contact.pricing.3.price", label: "Option 3 : Prix", defaultValue: "350 €" },
      { key: "contact.pricing.3.btn", label: "Option 3 : Bouton", defaultValue: "Consulter par écrit" },
      
      { key: "contact.pricing.note", label: "Note de bas de section", multiline: true, defaultValue: "Les consultations approfondies, dossiers complexes et missions sur mesure font l'objet d'un devis personnalisé." },
    ],
  },
  {
    label: "Chiffres Clés (Statistiques)",
    keys: [
      { key: "home.metrics.show", label: "Afficher cette section (oui/non)", defaultValue: "oui" },
      { key: "home.metrics.1.value", label: "Chiffre 1", defaultValue: "15" },
      { key: "home.metrics.1.suffix", label: "Suffixe 1 (ex: + ou %)", defaultValue: "+" },
      { key: "home.metrics.1.label", label: "Libellé 1", defaultValue: "Années d'expérience" },
      { key: "home.metrics.2.value", label: "Chiffre 2", defaultValue: "800" },
      { key: "home.metrics.2.suffix", label: "Suffixe 2", defaultValue: "+" },
      { key: "home.metrics.2.label", label: "Libellé 2", defaultValue: "Dossiers Plaidés" },
      { key: "home.metrics.3.value", label: "Chiffre 3", defaultValue: "95" },
      { key: "home.metrics.3.suffix", label: "Suffixe 3", defaultValue: "%" },
      { key: "home.metrics.3.label", label: "Libellé 3", defaultValue: "Clients Satisfaits" },
      { key: "home.metrics.4.value", label: "Chiffre 4", defaultValue: "3" },
      { key: "home.metrics.4.suffix", label: "Suffixe 4", defaultValue: "" },
      { key: "home.metrics.4.label", label: "Libellé 4", defaultValue: "Langues Parlées" },
    ],
  },
  {
    label: "Le Mot de l'Avocate",
    keys: [
      { key: "home.founderQuote.show", label: "Afficher cette section (oui/non)", defaultValue: "oui" },
      { key: "home.founderQuote.eyebrow", label: "Eyebrow", defaultValue: "Le mot de l'avocate" },
      { key: "home.founderQuote.quote", label: "Citation", multiline: true, defaultValue: "\"La justice n'est pas une simple procédure, c'est un droit fondamental. Notre mission est de vous accompagner avec humanité et détermination pour le faire valoir.\"" },
      { key: "home.founderQuote.name", label: "Nom de l'avocate", defaultValue: "Maître Manuela DIABATE" },
      { key: "home.founderQuote.role", label: "Titre / Barreau", defaultValue: "Avocate au Barreau de Paris" },
    ],
  },
];

export const HomeAdmin = () => (
  <ContentSectionEditor
    title="Page d'accueil"
    description="Modifiez tous les textes affichés sur la page d'accueil."
    groups={GROUPS}
    auditAction="content.home.update"
  />
);

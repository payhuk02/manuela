import fs from 'fs';

function esc(str) {
  if (!str) return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

const expertises = [
  {
    slug: 'droit-des-etrangers-et-asile',
    title: "Droit des étrangers et Droit de l'Asile",
    icon: 'Globe',
    tagline: "Accompagnement et défense de vos droits fondamentaux sur le territoire français.",
    intro: "Notre cabinet vous accompagne dans toutes vos démarches d'immigration, d'asile et de nationalité. Que ce soit pour une régularisation, un contentieux ou une urgence, nous mettons notre expertise au service de vos droits.",
    approach: "Une approche humaine, réactive et stratégique face aux complexités de l'administration française.",
    conclusion: "N'attendez pas qu'une situation se dégrade, contactez-nous pour sécuriser votre statut en France.",
    sections: [
      {
        title: "Demandes de titres et regroupement familial",
        content: "Nous vous assistons pour toute demande de visa d'entrée, de titre de séjour, de régularisation, ainsi que pour l'introduction d'une demande de regroupement familial. Nous gérons également les dossiers de nationalité et de naturalisation."
      },
      {
        title: "Mesures d'éloignement et urgences",
        content: "Intervention rapide pour contester un refus de titre, une Obligation de Quitter le Territoire Français (OQTF), une Interdiction de Retour sur le Territoire Français (IRTF) ou un Signalement dans le Système Schengen (SIS). Nous vous assistons en rétention administrative, devant le Juge des libertés et de la détention (JLD), et les tribunaux administratifs."
      },
      {
        title: "Droit d'asile",
        content: "Préparation de l'entretien à l'OFPRA, rédaction du recours devant la Cour Nationale du Droit d'Asile (CNDA) et assistance à l'audience. Nous vous défendons pour l'obtention du statut de réfugié, la protection subsidiaire, et la demande de réexamen."
      }
    ]
  },
  {
    slug: 'droit-de-la-famille',
    title: "Droit de la famille",
    icon: 'Heart',
    tagline: "Protection de vos intérêts et de ceux de vos enfants dans les moments clés de la vie familiale.",
    intro: "Le droit de la famille touche à votre intimité. Notre cabinet vous garantit un accompagnement rigoureux et bienveillant pour toutes les procédures liées à la séparation, à la filiation et à l'autorité parentale.",
    approach: "Privilégier l'apaisement tout en défendant fermement vos droits patrimoniaux et parentaux.",
    conclusion: "Confiez-nous votre situation familiale pour une résolution juste et équilibrée.",
    sections: [
      {
        title: "Divorce et séparation",
        content: "Assistance dans tous types de divorces : divorce par consentement mutuel, divorce pour faute, divorce pour altération définitive du lien conjugal, et divorce pour acceptation du principe de la rupture."
      },
      {
        title: "Droit des enfants",
        content: "Organisation de la résidence habituelle, fixation des droits de visite et d'hébergement, et calcul de la contribution à l'éducation et à l'entretien de l'enfant. Nous veillons aux droits et devoirs des parents vis-à-vis de leur enfant mineur."
      },
      {
        title: "Adoption et filiation",
        content: "Accompagnement dans les procédures d'adoption (simple ou plénière) et les actions relatives à l'établissement ou la contestation de la filiation."
      }
    ]
  },
  {
    slug: 'droit-administratif-et-fonction-publique',
    title: "Droit administratif et Fonction Publique",
    icon: 'Building',
    tagline: "Votre bouclier face à l'administration et la défense de votre carrière publique.",
    intro: "Nous intervenons pour protéger les droits des citoyens et des agents publics face aux décisions de l'État, des collectivités ou des établissements hospitaliers, que ce soit en conseil ou en contentieux.",
    approach: "Une maîtrise technique des rouages administratifs pour faire plier l'arbitraire ou négocier efficacement.",
    conclusion: "Ne restez pas seul face à l'administration. Contactez-nous pour faire valoir vos droits.",
    sections: [
      {
        title: "Contentieux administratif et urgences",
        content: "Recours gracieux, RAPO, recours pour excès de pouvoir, annulation de décisions, procédures d'urgence (référé suspension, référé liberté, référé provision). Nous agissons devant le Tribunal administratif, la Cour administrative d'appel et le Conseil d'État."
      },
      {
        title: "Responsabilité administrative et médicale",
        content: "Action en indemnisation pour illégalité fautive, préjudices causés par l'administration, défaut d'entretien d'un ouvrage public. Nous défendons également les victimes d'erreurs ou fautes médicales impliquant les établissements publics de santé."
      },
      {
        title: "Droit de la fonction publique",
        content: "Assistance sur le déroulement de carrière, la rémunération, la rupture conventionnelle, et les sanctions disciplinaires. Nous contestons les licenciements pour inaptitude, les refus de CITIS ou maladie professionnelle, et agissons contre le harcèlement ou la discrimination au travail."
      },
      {
        title: "Agréments et police administrative",
        content: "Recours contre les refus d'agrément ou cartes professionnelles (CNAPS, sécurité privée). Contestation des mesures de police administrative (arrêtés municipaux, décisions préfectorales, interdictions diverses)."
      }
    ]
  },
  {
    slug: 'droit-du-travail',
    title: "Droit du travail",
    icon: 'Briefcase',
    tagline: "Défense de vos intérêts professionnels et résolution des conflits au travail.",
    intro: "Que vous soyez cadre ou employé, le monde du travail peut générer des situations complexes et conflictuelles. Nous vous accompagnons pour sécuriser votre départ ou faire valoir vos droits en justice.",
    approach: "Combativité devant le Conseil de prud'hommes et recherche d'accords transactionnels optimisés.",
    conclusion: "Un conflit au travail ? Parlons-en pour définir la meilleure stratégie de défense.",
    sections: [
      {
        title: "Rupture du contrat de travail",
        content: "Accompagnement stratégique pour la négociation d'une rupture conventionnelle ou d'un accord amiable, afin de garantir vos intérêts financiers et professionnels."
      },
      {
        title: "Contentieux prud'homal",
        content: "Contestation de licenciement (abusif, économique, pour faute), action en résiliation judiciaire du contrat de travail, et défense de vos droits devant le Conseil de prud'hommes et la Cour d'appel."
      },
      {
        title: "Souffrance au travail",
        content: "Assistance et actions en justice dans les situations de harcèlement moral ou sexuel, ainsi que pour la reconnaissance des discriminations au travail."
      }
    ]
  },
  {
    slug: 'droit-du-dommage-corporel',
    title: "Droit du dommage corporel",
    icon: 'Shield',
    tagline: "Obtenir la réparation intégrale de vos préjudices après un accident.",
    intro: "Être victime d'un accident ou d'une agression bouleverse une vie. Notre rôle est de vous soulager du fardeau administratif et judiciaire pour obtenir la juste et complète indemnisation de l'ensemble de vos préjudices.",
    approach: "Indépendance totale vis-à-vis des compagnies d'assurance et collaboration avec des médecins-conseils.",
    conclusion: "Nous mettons notre force juridique au service de votre reconstruction.",
    sections: [
      {
        title: "Accidents de la route et de la vie",
        content: "Indemnisation des victimes d'accidents de la circulation (loi Badinter) et des accidents de la vie courante. Nous vous assistons lors des expertises médicales pour chiffrer précisément vos préjudices."
      },
      {
        title: "Agressions et attentats",
        content: "Accompagnement des victimes devant les juridictions pénales (constitution de partie civile) et devant la Commission d'Indemnisation des Victimes d'Infractions (CIVI) ou le FGTI."
      },
      {
        title: "Accidents médicaux",
        content: "Assistance dans le cadre d'erreurs médicales, d'infections nosocomiales ou d'aléas thérapeutiques, tant devant les tribunaux que devant les Commissions de Conciliation et d'Indemnisation (CCI)."
      }
    ]
  },
  {
    slug: 'droit-ohada',
    title: "Droit OHADA",
    icon: 'Scale',
    tagline: "Sécurisation de vos investissements et de vos activités commerciales en Afrique.",
    intro: "Le droit OHADA (Organisation pour l'Harmonisation en Afrique du Droit des Affaires) offre un cadre juridique unifié dans 17 pays africains. Nous vous accompagnons pour y investir et opérer en toute sécurité juridique.",
    approach: "Une expertise pointue des Actes uniformes couplée à une connaissance fine du tissu économique ouest-africain.",
    conclusion: "Votre projet d'investissement mérite la meilleure ingénierie juridique. Consultons-nous.",
    sections: [
      {
        title: "Structuration et création de sociétés",
        content: "Conseil dans le choix de la forme sociale, rédaction des statuts, et immatriculation (RCCM). Nous accompagnons les investisseurs étrangers pour leur implantation en zone OHADA (notamment en Côte d'Ivoire)."
      },
      {
        title: "Contrats et sûretés commerciales",
        content: "Rédaction et audit de vos contrats d'affaires, constitution et réalisation des sûretés (gages, hypothèques) pour garantir vos transactions."
      },
      {
        title: "Recouvrement et voies d'exécution",
        content: "Procédures rapides de recouvrement de créances (injonction de payer) et mesures d'exécution forcée (saisies) pour protéger votre trésorerie face aux débiteurs défaillants."
      }
    ]
  },
  {
    slug: 'droit-penal-et-affaires',
    title: "Droit pénal et Pénal des affaires",
    icon: 'Gavel',
    tagline: "Une défense pénale implacable, pour les particuliers comme pour les dirigeants.",
    intro: "Le risque pénal est omniprésent, tant dans la vie privée que dans la sphère de l'entreprise. Notre cabinet assure une défense combative et stratégique à tous les stades de la procédure, que vous soyez mis en cause ou victime.",
    approach: "Rigueur procédurale absolue et préparation minutieuse des audiences.",
    conclusion: "Face à l'urgence pénale, le temps est un facteur clé. Sollicitez notre intervention immédiate.",
    sections: [
      {
        title: "Droit pénal général",
        content: "Assistance en garde à vue, lors des auditions libres, devant le Juge d'instruction et devant les juridictions de jugement (Tribunal de Police, Tribunal Correctionnel, Cour d'Assises)."
      },
      {
        title: "Droit pénal des affaires",
        content: "Défense des dirigeants et des entreprises face aux infractions financières et astucieuses : abus de biens sociaux, abus de confiance, escroquerie, faux et usage de faux, corruption et blanchiment."
      },
      {
        title: "Défense des victimes",
        content: "Constitution de partie civile, accompagnement durant l'instruction et à l'audience, pour garantir que votre voix soit entendue et vos souffrances indemnisées."
      }
    ]
  },
  {
    slug: 'droit-immobilier',
    title: "Droit Immobilier",
    icon: 'Home',
    tagline: "Protection de vos actifs immobiliers et résolution de vos litiges fonciers.",
    intro: "L'immobilier représente souvent l'investissement de toute une vie ou le cœur de votre activité commerciale. Nous sécurisons vos opérations et défendons vos droits face aux locataires, constructeurs ou copropriétaires.",
    approach: "Pragmatisme et réactivité pour préserver la rentabilité et l'intégrité de votre patrimoine.",
    conclusion: "Un litige immobilier ne doit pas s'enliser. Intervenons dès maintenant.",
    sections: [
      {
        title: "Baux commerciaux et d'habitation",
        content: "Rédaction et renouvellement de baux, procédures d'expulsion, fixation et révision de loyers, contentieux des charges et réparations locatives."
      },
      {
        title: "Droit de la construction",
        content: "Assistance lors d'expertises judiciaires, recours en garantie décennale, biennale ou de parfait achèvement face aux malfaçons et retards de livraison."
      },
      {
        title: "Copropriété et propriété foncière",
        content: "Recouvrement de charges impayées, contestation d'assemblées générales, troubles anormaux du voisinage, et actions en revendication de propriété ou servitudes."
      }
    ]
  },
  {
    slug: 'droit-des-affaires',
    title: "Droit des affaires",
    icon: 'TrendingUp',
    tagline: "Le partenaire juridique de la croissance et de la pérennité de votre entreprise.",
    intro: "La vie des affaires exige une sécurisation constante de vos relations commerciales et sociétaires. De la création à la transmission, nous sommes à vos côtés pour prévenir les risques et résoudre vos contentieux stratégiques.",
    approach: "Une vision business orientée solutions, alliée à une rigueur juridique intraitable.",
    conclusion: "Sécurisons ensemble vos projets commerciaux pour vous permettre d'entreprendre sereinement.",
    sections: [
      {
        title: "Droit des sociétés",
        content: "Création d'entreprise, rédaction de statuts sur mesure, secrétariat juridique (AG), rédaction de pactes d'actionnaires et opérations sur le capital."
      },
      {
        title: "Fusions, cessions et acquisitions",
        content: "Audits juridiques, lettres d'intention, garanties d'actif et de passif (GAP), et accompagnement complet dans les opérations de cession de droits sociaux ou de fonds de commerce."
      },
      {
        title: "Contentieux commercial",
        content: "Recouvrement de créances complexes, litiges entre associés, concurrence déloyale, rupture brutale des relations commerciales, et exécution fautive de contrats."
      }
    ]
  }
];

let sql = "DELETE FROM public.expertises;\n\n";

expertises.forEach((e, index) => {
  sql += `INSERT INTO public.expertises (slug, title, icon, tagline, intro, approach, conclusion, sections, sort_order, published)
VALUES (
  ${esc(e.slug)}, 
  ${esc(e.title)}, 
  ${esc(e.icon)}, 
  ${esc(e.tagline)}, 
  ${esc(e.intro)}, 
  ${esc(e.approach)}, 
  ${esc(e.conclusion)}, 
  '${JSON.stringify(e.sections).replace(/'/g, "''")}'::jsonb, 
  ${index}, 
  true
);\n\n`;
});

fs.writeFileSync('c:/Site cabinet Emanuela/update_expertises_premium.sql', sql, 'utf8');
console.log("SQL file generated successfully.");

import { ExpertiseSection } from "@/hooks/useExpertises";

export const FALLBACK_SECTIONS: Record<string, ExpertiseSection[]> = {
  "droit-du-travail": [
    {
      title: "Relations individuelles de travail",
      items: [
        "Rédaction et modification de contrats de travail",
        "Procédures disciplinaires et licenciements (faute, inaptitude, motif économique)",
        "Harcèlement moral et discriminations au travail",
        "Négociation de départs (rupture conventionnelle, transaction)"
      ]
    },
    {
      title: "Relations collectives",
      items: [
        "Mise en place et accompagnement du Comité Social et Économique (CSE)",
        "Négociation et rédaction d'accords d'entreprise",
        "Gestion des restructurations et plans de sauvegarde de l'emploi (PSE)"
      ]
    },
    {
      title: "Contentieux social",
      items: [
        "Représentation devant le Conseil de prud'hommes",
        "Contentieux électoral et syndical",
        "Interventions devant le pôle social du Tribunal Judiciaire"
      ]
    }
  ],
  "droit-du-dommage-corporel": [
    {
      title: "Accidents et traumatismes",
      items: [
        "Accidents de la circulation routière (loi Badinter)",
        "Accidents de la vie courante et accidents domestiques",
        "Accidents du travail, de trajet et maladies professionnelles",
        "Agressions et infractions pénales"
      ]
    },
    {
      title: "Responsabilité médicale",
      items: [
        "Fautes et erreurs médicales, retards de diagnostic",
        "Infections nosocomiales et aléas thérapeutiques",
        "Affections iatrogènes",
        "Défaut d'information du patient"
      ]
    },
    {
      title: "Procédures d'indemnisation",
      items: [
        "Assistance personnalisée lors des expertises médicales",
        "Négociation amiable avec les compagnies d'assurances",
        "Saisine de la CIVI ou de l'ONIAM",
        "Actions en justice pour la réparation intégrale de tous les préjudices"
      ]
    }
  ],
  "droit-de-la-famille": [
    {
      title: "Séparations et divorces",
      items: [
        "Divorce par consentement mutuel par acte d'avocat",
        "Divorces contentieux (faute, altération du lien conjugal, acceptation)",
        "Rupture de PACS et de concubinage",
        "Fixation et révision de la prestation compensatoire"
      ]
    },
    {
      title: "Enfants et autorité parentale",
      items: [
        "Fixation de la résidence de l'enfant et droit de visite/hébergement",
        "Pension alimentaire et contribution à l'entretien et l'éducation",
        "Filiation, adoption et contestation de paternité",
        "Déplacement illicite d'enfant et procédures internationales"
      ]
    },
    {
      title: "Patrimoine et successions",
      items: [
        "Liquidation du régime matrimonial post-divorce",
        "Partage judiciaire et sortie d'indivision",
        "Contentieux des successions et protection du conjoint survivant",
        "Procédures de tutelle, curatelle et sauvegarde de justice"
      ]
    }
  ],
  "droit-administratif-et-de-la-fonction-publique": [
    {
      title: "Fonction publique",
      items: [
        "Procédures disciplinaires et défense devant le conseil de discipline",
        "Litiges liés à la notation, l'évaluation et l'avancement",
        "Protection fonctionnelle de l'agent public",
        "Congés de maladie, invalidité et inaptitude professionnelle"
      ]
    },
    {
      title: "Police administrative et libertés",
      items: [
        "Contestation des mesures de police (fermeture administrative, arrêtés)",
        "Défense des libertés publiques fondamentales",
        "Référés administratifs (référé-liberté, référé-suspension)"
      ]
    },
    {
      title: "Contentieux administratif général",
      items: [
        "Recours pour excès de pouvoir contre les décisions administratives",
        "Recours de plein contentieux et indemnitaires",
        "Mise en jeu de la responsabilité de la puissance publique",
        "Contentieux des contrats administratifs"
      ]
    }
  ]
};

import { ContentSectionEditor, GroupDef } from "./sections/ContentSectionEditor";

const GROUPS: GroupDef[] = [
  {
    label: "Hero",
    keys: [
      { key: "newsPage.hero.eyebrow", label: "Eyebrow", defaultValue: "Actualités / Articles" },
      { key: "newsPage.hero.title", label: "Titre", multiline: true, defaultValue: "Actualités & Articles" },
      { key: "newsPage.hero.subtitle", label: "Sous-titre", multiline: true, defaultValue: "Suivez la vie du cabinet et nos analyses juridiques de fond." },
    ],
  },
  {
    label: "Section Actualités",
    keys: [
      { key: "newsPage.newsEyebrow", label: "Eyebrow", defaultValue: "Actualités" },
      { key: "newsPage.newsTitle", label: "Titre", multiline: true, defaultValue: "Vie du cabinet" },
      { key: "newsPage.newsEmpty", label: "Message si vide", multiline: true, defaultValue: "Aucune actualité publiée pour le moment." },
      { key: "news.readMore", label: "Libellé « Lire l'article »", defaultValue: "Lire l'article" },
    ],
  },
  {
    label: "Section Articles",
    keys: [
      { key: "articles.eyebrow", label: "Eyebrow", defaultValue: "Articles" },
      { key: "articles.title", label: "Titre", multiline: true, defaultValue: "Analyses juridiques de fond" },
      { key: "articles.empty", label: "Message si vide", multiline: true, defaultValue: "Aucun article publié pour le moment." },
      { key: "articles.readMore", label: "Libellé « Lire l'article »", defaultValue: "Lire l'analyse" },
    ],
  },
];

export const NewsPageAdmin = () => (
  <ContentSectionEditor
    title="Page Actualités / Articles"
    description="Modifiez les textes affichés sur la page /actualites (hero, intros des sections)."
    groups={GROUPS}
    auditAction="content.news_page.update"
  />
);

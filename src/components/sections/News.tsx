import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { useText } from "@/hooks/useText";
import { NewsSection } from "./NewsSection";

export const News = () => {
  const { t, lang } = useLang();
  const { news } = useSite();

  const eyebrow = useText("news.eyebrow", t.news.eyebrow);
  const title = useText("news.title", t.news.title);
  const readMore = useText("news.readMore", t.news.readMore);
  const seeAll = useText("news.seeAll", t.news.seeAll);

  const items = news
    .filter((n) => n.lang === lang && (n.content_type ?? "news") === "news")
    .slice(0, 3)
    .map((n) => ({
      key: n.id,
      href: `${lang === "en" ? "/news" : "/actualites"}/${n.id}`,
      category: n.category,
      date: new Date(n.published_date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      title: n.title,
      excerpt: n.excerpt,
      image_url: n.image_url,
    }));

  return (
    <NewsSection
      eyebrow={eyebrow}
      title={title}
      readMoreLabel={readMore}
      items={items}
      seeAllHref="/actualites"
      seeAllLabel={seeAll}
    />
  );
};

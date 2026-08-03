import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { NewsSection } from "@/components/sections/NewsSection";
import { useLang } from "@/i18n/LanguageContext";
import { useSite } from "@/hooks/SiteDataContext";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useBreadcrumbJsonLd } from "@/lib/useBreadcrumbJsonLd";
import { useText } from "@/hooks/useText";
import { Search, Filter, ArrowDownWideNarrow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
/* eslint-disable import/no-unresolved */
import heroNewsPic from "@/assets/hero-news.jpg?responsive";
/* eslint-enable import/no-unresolved */
import { ResponsiveImage, type ResponsivePicture } from "@/components/ResponsiveImage";

const heroNewsPicture = heroNewsPic as unknown as ResponsivePicture;

const ALL = "__all__";

type CategoryItem = { value: string; label: string; count: number };

const PremiumFilterBar = ({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  categories,
  sortOrder,
  setSortOrder,
  allLabel,
  searchPlaceholder = "Rechercher...",
  filterPlaceholder = "Filtrer",
  sortPlaceholder = "Trier",
  sortDescLabel = "Plus récents",
  sortAscLabel = "Plus anciens",
}: {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  categories: CategoryItem[];
  sortOrder: "desc" | "asc";
  setSortOrder: (v: "desc" | "asc") => void;
  allLabel: string;
  searchPlaceholder?: string;
  filterPlaceholder?: string;
  sortPlaceholder?: string;
  sortDescLabel?: string;
  sortAscLabel?: string;
}) => {
  return (
    <div className="container-luxe -mb-8 pt-12 relative z-20">
      <div className="flex flex-col md:flex-row gap-4 items-center bg-background/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 bg-transparent border-none shadow-none focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="flex w-full md:w-auto items-center gap-3">
          {categories.length > 0 && (
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[220px] bg-secondary/40 border-none shadow-none rounded-xl focus:ring-1 focus:ring-accent hover:bg-secondary/60 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-4 w-4 text-accent" />
                  <SelectValue placeholder={filterPlaceholder} />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border/50 shadow-xl">
                <SelectItem value={ALL} className="font-medium">{allLabel}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label} <span className="text-muted-foreground ml-1">({c.count})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "desc" | "asc")}>
            <SelectTrigger className="w-full md:w-[180px] bg-secondary/40 border-none shadow-none rounded-xl focus:ring-1 focus:ring-accent hover:bg-secondary/60 transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ArrowDownWideNarrow className="h-4 w-4 text-accent" />
                <SelectValue placeholder={sortPlaceholder} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50 shadow-xl">
              <SelectItem value="desc">{sortDescLabel}</SelectItem>
              <SelectItem value="asc">{sortAscLabel}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

const Actualites = () => {
  const { t, lang } = useLang();
  const { news } = useSite();

  const path = lang === "en" ? "/news" : "/actualites";
  const { canonical, alternates } = buildLangAlternates(path, lang);

  const seoTitle = useText(
    "seo.news.title",
    lang === "fr"
      ? "Actualités Juridiques & Analyses — Avocats Manuela DIABATE"
      : "Legal news & analyses — Manuela DIABATE Law Firm"
  );
  const seoDescription = useText(
    "seo.news.description",
    lang === "fr"
      ? "Actualités juridiques et analyses du Cabinet Manuela DIABATE : droit des affaires, OHADA, contentieux, fiscalité et droit international à Paris."
      : "Articles, insights and news from the Manuela DIABATE firm: business law, OHADA, litigation, tax and international law."
  );
  const seoImage = useText("seo.news.image", "");

  // Hero editable keys
  const heroEyebrow = useText(
    "newsPage.hero.eyebrow",
    `${t.newsPage.newsEyebrow} / ${t.articles.eyebrow}`
  );
  const heroTitle = useText("newsPage.hero.title", t.newsPage.title);
  const heroSubtitle = useText("newsPage.hero.subtitle", t.newsPage.subtitle);

  // Section labels
  const newsSectionEyebrow = useText("newsPage.newsEyebrow", t.newsPage.newsEyebrow);
  const newsSectionTitle = useText("newsPage.newsTitle", t.newsPage.newsTitle);
  const newsEmpty = useText("newsPage.newsEmpty", t.newsPage.newsEmpty);
  const articlesEyebrow = useText("articles.eyebrow", t.articles.eyebrow);
  const articlesTitle = useText("articles.title", t.articles.title);
  const articlesEmpty = useText("articles.empty", t.articles.empty);
  const readMoreLabel = useText("news.readMore", t.news.readMore);
  const articlesReadMore = useText("articles.readMore", t.articles.readMore);

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage || undefined,
    type: "website",
    lang,
    canonical,
    alternates,
  });

  useBreadcrumbJsonLd([
    { name: lang === "en" ? "Home" : "Accueil", path: "/" },
    { name: lang === "en" ? "News" : "Actualités", path },
  ]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const allNewsItems = useMemo(() => news
    .filter((n) => n.lang === lang && (n.content_type ?? "news") === "news")
    .map((n) => ({
      key: n.id,
      href: `${path}/${n.slug || n.id}`,
      category: n.category,
      date: formatDate(n.published_date),
      rawDate: n.published_date,
      title: n.title,
      excerpt: n.excerpt,
      image_url: n.image_url,
    })), [news, lang, path]);

  const allArticleItems = useMemo(() => news
    .filter((n) => n.lang === lang && n.content_type === "article")
    .map((n) => ({
      key: n.id,
      href: `${path}/${n.slug || n.id}`,
      category: n.category,
      date: formatDate(n.published_date),
      rawDate: n.published_date,
      title: n.title,
      excerpt: n.excerpt,
      image_url: n.image_url,
    })), [news, lang, path]);

  const allLabel = lang === "en" ? "All categories" : "Toutes les catégories";

  const buildCategories = (items: { category: string }[]): CategoryItem[] => {
    const map = new Map<string, number>();
    for (const i of items) {
      const c = (i.category || "").trim();
      if (!c) continue;
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], lang === "fr" ? "fr" : "en"))
      .map(([value, count]) => ({ value, label: value, count }));
  };

  const newsCategories = useMemo(() => buildCategories(allNewsItems), [allNewsItems, lang]);
  const articleCategories = useMemo(() => buildCategories(allArticleItems), [allArticleItems, lang]);

  // States for News
  const [newsCat, setNewsCat] = useState<string>(ALL);
  const [newsSearch, setNewsSearch] = useState<string>("");
  const [newsSort, setNewsSort] = useState<"desc" | "asc">("desc");

  // States for Articles
  const [articleCat, setArticleCat] = useState<string>(ALL);
  const [articleSearch, setArticleSearch] = useState<string>("");
  const [articleSort, setArticleSort] = useState<"desc" | "asc">("desc");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterAndSort = (items: any[], cat: string, query: string, sort: "desc" | "asc") => {
    return items
      .filter((i) => cat === ALL || i.category === cat)
      .filter((i) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return (
          i.title.toLowerCase().includes(q) ||
          (i.excerpt && i.excerpt.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const dA = new Date(a.rawDate || 0).getTime();
        const dB = new Date(b.rawDate || 0).getTime();
        return sort === "desc" ? dB - dA : dA - dB;
      });
  };

  const filteredNews = useMemo(
    () => filterAndSort(allNewsItems, newsCat, newsSearch, newsSort),
    [allNewsItems, newsCat, newsSearch, newsSort]
  );
  
  const filteredArticles = useMemo(
    () => filterAndSort(allArticleItems, articleCat, articleSearch, articleSort),
    [allArticleItems, articleCat, articleSearch, articleSort]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Page hero */}
        <section className="relative pt-48 pb-28 md:pt-60 md:pb-36 bg-night text-primary-foreground overflow-hidden">
          <ResponsiveImage
            data={heroNewsPicture}
            alt=""
            aria-hidden="true"
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover [filter:saturate(1.08)_contrast(1.05)] [image-rendering:auto]"
            pictureClassName="absolute inset-0 w-full h-full"
          />
          
          <div className="absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent))_0%,transparent_55%)]" />
          <div className="container-luxe max-w-3xl relative">
            <p className="eyebrow text-accent">{heroEyebrow}</p>
            <h1 className="mt-6 font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg text-primary-foreground/80 leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="gold-divider mt-10" />
          </div>
        </section>

        {/* Actualités (section 1) */}
        <div className="bg-secondary/30 relative">
          <PremiumFilterBar
            searchQuery={newsSearch}
            setSearchQuery={setNewsSearch}
            category={newsCat}
            setCategory={setNewsCat}
            categories={newsCategories}
            sortOrder={newsSort}
            setSortOrder={setNewsSort}
            allLabel={allLabel}
            searchPlaceholder={lang === "fr" ? "Rechercher une actualité..." : "Search news..."}
            filterPlaceholder={lang === "fr" ? "Toutes les catégories" : "All categories"}
            sortPlaceholder={lang === "fr" ? "Trier" : "Sort"}
            sortDescLabel={lang === "fr" ? "Plus récents" : "Newest"}
            sortAscLabel={lang === "fr" ? "Plus anciens" : "Oldest"}
          />
          <NewsSection
            eyebrow={newsSectionEyebrow}
            title={newsSectionTitle}
            readMoreLabel={readMoreLabel}
            items={filteredNews}
            emptyLabel={lang === "fr" ? "Aucune actualité ne correspond à votre recherche." : "No news match your search."}
            background="muted"
            sectionId="actualites"
          />
        </div>

        {/* Articles (section 2) */}
        <div className="bg-background relative border-t border-border/50">
          <PremiumFilterBar
            searchQuery={articleSearch}
            setSearchQuery={setArticleSearch}
            category={articleCat}
            setCategory={setArticleCat}
            categories={articleCategories}
            sortOrder={articleSort}
            setSortOrder={setArticleSort}
            allLabel={allLabel}
            searchPlaceholder={lang === "fr" ? "Rechercher un article..." : "Search articles..."}
            filterPlaceholder={lang === "fr" ? "Toutes les catégories" : "All categories"}
            sortPlaceholder={lang === "fr" ? "Trier" : "Sort"}
            sortDescLabel={lang === "fr" ? "Plus récents" : "Newest"}
            sortAscLabel={lang === "fr" ? "Plus anciens" : "Oldest"}
          />
          <NewsSection
            eyebrow={articlesEyebrow}
            title={articlesTitle}
            readMoreLabel={articlesReadMore}
            items={filteredArticles}
            emptyLabel={lang === "fr" ? "Aucun article ne correspond à votre recherche." : "No articles match your search."}
            background="default"
            sectionId="articles"
          />
        </div>

      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Actualites;

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLang } from "@/i18n/LanguageContext";
import type { Lang } from "@/i18n/translations";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seoSchemas";
import { RichText } from "@/components/RichText";
import { ArticleInteractions } from "@/components/ArticleInteractions";

type Article = {
  id: string;
  slug: string | null;
  lang: Lang;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  published_date: string;
  image_url: string | null;
  images?: string[] | null;
  published: boolean;
  content_type?: "news" | "article";
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
};

const NewsDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { lang } = useLang();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const routeLang: Lang = location.pathname.startsWith("/news/") ? "en" : "fr";

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      // `id` may be a UUID or a slug — try slug first, then fall back to id.
      const looksUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let row: Article | null = null;
      if (!looksUuid) {
        const { data } = await supabase
          .from("news_articles")
          .select("*")
          .eq("slug", id)
          .eq("published", true)
          .lte("published_date", today)
          .maybeSingle();
        row = (data as Article) ?? null;
      }
      if (!row) {
        const { data } = await supabase
          .from("news_articles")
          .select("*")
          .eq("id", id)
          .eq("published", true)
          .lte("published_date", today)
          .maybeSingle();
        row = (data as Article) ?? null;
      }
      if (!cancelled) {
        setArticle(row);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const formattedDate = article
    ? new Date(article.published_date).toLocaleDateString(
        article.lang === "fr" ? "fr-FR" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : "";

  const pageLang = article?.lang ?? lang;
  const newsBasePath = pageLang === "en" ? "/news" : "/actualites";
  const urlRef = article?.slug || article?.id || id || "";
  const { canonical, alternates } = buildLangAlternates(
    `${newsBasePath}/${urlRef}`,
    pageLang
  );

  const fallbackDesc = article
    ? (article.excerpt || article.body)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160)
    : "";
  const seoTitle = article
    ? (article.seo_title?.trim() || `${article.title} — Cabinet Manuela DIABATE`)
    : "";
  const seoDescription = article
    ? (article.seo_description?.trim() || fallbackDesc)
    : "";
  const seoImage = article ? (article.og_image_url || article.image_url) : null;

  useSeo(
    article
      ? {
          title: seoTitle,
          description: seoDescription,
          image: seoImage,
          type: "article",
          lang: pageLang,
          canonical,
          alternates,
          publishedTime: article.published_date,
          modifiedTime: article.published_date,
          author: "Cabinet Manuela DIABATE",
          jsonLdId: "article-jsonld",
          jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "NewsArticle",
                headline: article.title,
                description: seoDescription,
                datePublished: article.published_date,
                dateModified: article.published_date,
                articleSection: article.category,
                image: seoImage ? [seoImage] : undefined,
                mainEntityOfPage: canonical,
                author: { "@type": "Organization", name: "Cabinet Manuela DIABATE" },
                publisher: {
                  "@type": "Organization",
                  name: "Cabinet Manuela DIABATE",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.cabinet-diabate.com/og-image.jpg",
                  },
                },
                inLanguage: article.lang,
              },
              breadcrumbJsonLd([
                { name: pageLang === "fr" ? "Accueil" : "Home", path: "/" },
                {
                  name: pageLang === "fr" ? "Actualités" : "News",
                  path: newsBasePath,
                },
                { name: article.title, path: `${newsBasePath}/${urlRef}` },
              ]),
            ],
          },
        }
      : null
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        {routeLang === "fr" ? "Chargement…" : "Loading…"}
      </div>
    );
  }
  const isPublishedArticle =
    article?.published === true &&
    article.published_date <= new Date().toISOString().slice(0, 10);

  if (!article || !isPublishedArticle) return <Navigate to={routeLang === "en" ? "/news" : "/actualites"} replace />;
  if (article.lang !== routeLang) {
    return <Navigate to={`${article.lang === "en" ? "/news" : "/actualites"}/${article.slug || article.id}`} replace />;
  }
  // If accessed by id but a slug exists, redirect to the canonical slug URL.
  if (article.slug && id && id !== article.slug && /^[0-9a-f-]{36}$/i.test(id)) {
    return <Navigate to={`${newsBasePath}/${article.slug}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
        <main>
          <article className="pt-32 md:pt-40 pb-20 md:pb-28">
            <div className="container-luxe max-w-3xl">
              <Link
                to={`${newsBasePath}${article.content_type === "article" ? "#articles" : "#actualites"}`}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {article.content_type === "article"
                    ? pageLang === "fr"
                    ? "Tous les articles"
                    : "All articles"
                  : pageLang === "fr"
                    ? "Toutes les actualités"
                    : "All news"}
              </Link>

              <div className="mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <span className="text-accent">{article.category}</span>
                <span className="opacity-40">·</span>
                <span>{formattedDate}</span>
              </div>

              <h1 className="mt-6 font-serif text-4xl md:text-5xl text-primary leading-[1.1]">
                {article.title}
              </h1>

              {article.excerpt && (
                <p className="mt-8 text-lg text-foreground leading-relaxed font-serif text-justify hyphens-auto">
                  {article.excerpt.replace(/<[^>]+>/g, "")}
                </p>
              )}

              <div className="gold-divider mt-10" />

              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  loading="lazy"
                  decoding="async"
                  className="mt-12 w-full aspect-[16/9] object-cover"
                />
              )}

              {article.body && (
                <RichText
                  html={article.body}
                  className="mt-12 prose prose-lg max-w-none text-foreground leading-relaxed text-justify hyphens-auto [&_p]:text-justify [&_li]:text-justify"
                />
              )}

              {Array.isArray(article.images) && article.images.length > 0 && (
                <section className="mt-16">
                  <h2 className="font-serif text-2xl text-primary mb-6">
                    {pageLang === "fr" ? "Galerie" : "Gallery"}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {article.images.map((url, idx) => (
                      <a
                        key={`${url}-${idx}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block overflow-hidden border border-border group"
                      >
                        <img
                          src={url}
                          alt={`${article.title} — ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full aspect-[4/3] object-cover transition-transform duration-500 ease-luxe group-hover:scale-[1.03]"
                        />
                      </a>
                    ))}
                  </div>
                </section>
              )}

              <ArticleInteractions articleId={article.id} title={article.title} articleLang={article.lang} />
            </div>
          </article>

          <section className="py-16 md:py-20 bg-muted/40">
            <div className="container-luxe text-center">
              <h2 className="font-serif text-2xl md:text-3xl text-primary">
                {pageLang === "fr"
                  ? "Une question juridique ?"
                  : "Have a legal question?"}
              </h2>
              <div className="mt-6">
                <Button asChild variant="gold" size="lg">
                  <Link to="/contact">
                    {pageLang === "fr" ? "Nous contacter" : "Get in touch"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default NewsDetail;

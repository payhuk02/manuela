import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "vite";
import { createClient } from "@supabase/supabase-js";

async function generateSitemap() {
  const env = loadEnv("production", process.cwd(), "");
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  const siteUrl = "https://www.diabate-avocat.com";

  const staticRoutes = [
    { loc: "/", changefreq: "weekly", priority: 1.0 },
    { loc: "/cabinet", changefreq: "monthly", priority: 0.8 },
    { loc: "/equipe", changefreq: "monthly", priority: 0.8 },
    { loc: "/expertises", changefreq: "monthly", priority: 0.9 },
    { loc: "/actualites", changefreq: "weekly", priority: 0.8 },
    { loc: "/contact", changefreq: "yearly", priority: 0.7 },
    { loc: "/cabinet/carte", changefreq: "yearly", priority: 0.5 },
  ];

  let dynamicRoutes = [];

  if (supabaseUrl && supabaseAnonKey) {
    console.log("Fetching articles from Supabase for sitemap...");
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Only fetch published articles in French to include in sitemap
    const today = new Date().toISOString().slice(0, 10);
    const { data: articles, error } = await supabase
      .from("news_articles")
      .select("id, slug, published_date, content_type")
      .eq("published", true)
      .eq("lang", "fr")
      .lte("published_date", today);

    if (error) {
      console.error("Error fetching articles from Supabase:", error);
    } else if (articles) {
      console.log(`Found ${articles.length} articles to include in sitemap.`);
      articles.forEach((article) => {
        const route = article.slug || article.id;
        dynamicRoutes.push({
          loc: `/actualites/${route}`,
          changefreq: "monthly",
          priority: 0.7,
        });
      });
    }

    console.log("Fetching expertises from Supabase for sitemap...");
    const { data: expertises, error: expertisesError } = await supabase
      .from("expertises")
      .select("slug")
      .eq("published", true);

    if (expertisesError) {
      console.error("Error fetching expertises from Supabase:", expertisesError);
    } else if (expertises) {
      console.log(`Found ${expertises.length} expertises to include in sitemap.`);
      expertises.forEach((exp) => {
        const route = exp.slug;
        dynamicRoutes.push({
          loc: `/expertises/${route}`,
          changefreq: "monthly",
          priority: 0.8,
        });
        dynamicRoutes.push({
          loc: `/expertises/${route}/faq`,
          changefreq: "monthly",
          priority: 0.6,
        });
      });
    }
  } else {
    console.warn("Skipping dynamic sitemap generation: Missing Supabase credentials.");
  }

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${siteUrl}${route.loc}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const sitemapPath = path.join(publicDir, "sitemap.xml");
  fs.writeFileSync(sitemapPath, sitemapContent, "utf-8");
  console.log(`Sitemap successfully generated at ${sitemapPath} with ${allRoutes.length} URLs.`);
}

generateSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});

import { Link, Navigate, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { AppointmentButton } from "@/components/AppointmentButton";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { useLandingPage } from "@/hooks/useLandingPage";
import { useExpertises } from "@/hooks/useExpertises";
import { useLang } from "@/i18n/LanguageContext";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/seoSchemas";
import NotFound from "./NotFound";

/**
 * Lightweight markdown → safe HTML for landing page content.
 * Supports ## H2, ### H3, - bullets, **bold**, paragraphs.
 */
function mdToHtml(md: string): string {
  if (!md) return "";
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  const inline = (s: string) =>
    esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      flushList();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
    } else {
      flushList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  flushList();
  return out.join("\n");
}

/**
 * Map of legacy slugs → current slugs.
 * Used to issue a client-side replace navigation that mimics a 301 redirect
 * (we also keep canonical pointing to the new URL so search engines consolidate).
 */
const SLUG_REDIRECTS: Record<string, string> = {
  "avocat-fiscaliste-paris": "avocat-fiscalite-affaires-paris",
  "avocat-arbitrage-international-paris": "avocat-arbitrage-ohada-paris",
};

const LandingPage = () => {
  const location = useLocation();
  const { lang } = useLang();
  // Slug = full path without leading slash (e.g. "avocat-droit-affaires-paris")
  const rawSlug = location.pathname.replace(/^\/+/, "").split("/")[0];
  const redirectTarget = SLUG_REDIRECTS[rawSlug];
  // Always call hooks unconditionally — pass empty slug when redirecting
  const slug = redirectTarget ? "" : rawSlug;
  const { data: page, loading } = useLandingPage(slug);
  const { data: expertises } = useExpertises({ onlyPublished: true });

  const isEn = lang === "en";
  const title = page ? (isEn ? page.title_en || page.title_fr : page.title_fr) : "";
  const metaDesc = page
    ? isEn
      ? page.meta_description_en || page.meta_description_fr
      : page.meta_description_fr
    : "";
  const h1 = page ? (isEn ? page.h1_en || page.h1_fr : page.h1_fr) : "";
  const intro = page ? (isEn ? page.intro_en || page.intro_fr : page.intro_fr) : "";
  const content = page ? (isEn ? page.content_en || page.content_fr : page.content_fr) : "";

  const { canonical, alternates } = buildLangAlternates(`/${slug ?? ""}`, lang);

  const html = useMemo(() => mdToHtml(content), [content]);

  const jsonLd = useMemo(() => {
    if (!page) return null;
    return {
      "@context": "https://schema.org",
      "@type": "LegalService",
      name: `Cabinet Manuela DIABATE — ${page.city}`,
      description: metaDesc,
      url: canonical,
      areaServed: [page.city, page.country].filter(Boolean),
      address: {
        "@type": "PostalAddress",
        addressLocality: page.city,
        addressCountry: page.country_code || "FR",
      },
      knowsLanguage: ["fr", "en"],
    };
  }, [page, metaDesc, canonical]);

  const breadcrumb = useMemo(() => {
    if (!page) return null;
    return breadcrumbJsonLd([
      { name: isEn ? "Home" : "Accueil", path: "/" },
      { name: page.city, path: `/${page.slug}` },
    ]);
  }, [page, isEn]);

  useSeo(
    page
      ? {
          title,
          description: metaDesc,
          image: page.image_url || undefined,
          type: "website",
          lang,
          canonical,
          alternates,
          jsonLdId: "landing-jsonld",
          jsonLd: { "@graph": [jsonLd, breadcrumb].filter(Boolean) },
        }
      : null
  );

  // Legacy slug → permanent redirect (after all hooks have run)
  if (redirectTarget) {
    return <Navigate to={`/${redirectTarget}`} replace />;
  }

  // This route is a catch-all: only handle slugs prefixed with "avocat-"
  if (!rawSlug.startsWith("avocat-")) {
    return <NotFound />;
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Chargement…
      </div>
    );
  }

  if (!page) return <NotFound />;

  // Find related expertise to deep-link
  const relatedExpertise = page.expertise_slug
    ? expertises?.find((e) => e.slug === page.expertise_slug)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-accent mb-4">
              <MapPin className="h-4 w-4" />
              {page.city} · {page.country}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              {h1}
            </h1>
            {intro && (
              <p className="text-lg md:text-xl text-primary-foreground/85 max-w-3xl leading-relaxed">
                {intro}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <AppointmentButton
                label={isEn ? "Book an appointment" : "Prendre rendez-vous"}
              />
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">
                  {isEn ? "Contact us" : "Nous contacter"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <article
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:text-primary
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-2
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-li:text-muted-foreground
                prose-strong:text-foreground
                prose-ul:my-4"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {/* CTA mid-page */}
            <div className="mt-12 border-l-4 border-accent bg-accent/5 p-6">
              <h2 className="font-serif text-2xl text-primary mb-2">
                {isEn
                  ? `Need a lawyer in ${page.city}?`
                  : `Besoin d'un avocat à ${page.city} ?`}
              </h2>
              <p className="text-muted-foreground mb-4">
                {isEn
                  ? "Our team responds within 24 hours."
                  : "Notre équipe vous répond sous 24 heures."}
              </p>
              <AppointmentButton
                label={isEn ? "Book an appointment" : "Prendre rendez-vous"}
              />
            </div>

            {/* Related expertise */}
            {relatedExpertise && (
              <div className="mt-12 p-6 border border-border">
                <p className="text-xs uppercase tracking-[0.2em] text-accent mb-2">
                  {isEn ? "Related expertise" : "Expertise associée"}
                </p>
                <h3 className="font-serif text-xl text-primary mb-2">
                  {relatedExpertise.title}
                </h3>
                {relatedExpertise.tagline && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {relatedExpertise.tagline}
                  </p>
                )}
                <Button asChild variant="link" className="px-0">
                  <Link to={`/expertises/${relatedExpertise.slug}`}>
                    {isEn ? "Discover" : "Découvrir"}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}

            {/* Internal mesh: other landing-style links */}
            <div className="mt-12">
              <h2 className="font-serif text-2xl text-primary mb-4">
                {isEn ? "Explore our services" : "Explorez nos services"}
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {expertises?.slice(0, 8).map((e) => (
                  <li key={e.slug}>
                    <Link
                      to={`/expertises/${e.slug}`}
                      className="text-sm text-muted-foreground hover:text-accent transition-colors"
                    >
                      → {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default LandingPage;

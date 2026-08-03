import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Strengths } from "@/components/sections/Strengths";
import { Practice } from "@/components/sections/Practice";
import { News } from "@/components/sections/News";
import { NewsTicker } from "@/components/sections/NewsTicker";
import { CTA } from "@/components/sections/CTA";
import { Contact } from "@/components/sections/Contact";
import { Metrics } from "@/components/sections/Metrics";
import { FounderCard } from "@/components/sections/FounderCard";

import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useLang } from "@/i18n/LanguageContext";
import { useText } from "@/hooks/useText";
import { useSite } from "@/hooks/SiteDataContext";

const Index = () => {
  const { lang } = useLang();
  const { contact } = useSite();
  const { canonical, alternates } = buildLangAlternates("/", lang);

  const seoTitle = useText(
    "seo.home.title",
    lang === "fr"
      ? "Avocat à Paris — Droit des Affaires & OHADA | Manuela DIABATE"
      : "Paris Lawyer — Manuela DIABATE Law Firm | Business & OHADA"
  );
  const seoDescription = useText(
    "seo.home.description",
    lang === "fr"
      ? "Cabinet d'avocats à Paris spécialisé en droit des affaires, OHADA, immobilier, pénal et droit des étrangers. Conseil et contentieux France-Afrique."
      : "Paris law firm: business law, OHADA, real estate, criminal, immigration. Advisory & litigation between France and Africa."
  );
  const jsonLdName = useText("seo.home.jsonld.name", "Cabinet Manuela DIABATE");
  const jsonLdDesc = useText(
    "seo.home.jsonld.description",
    "Cabinet d'avocats à Paris — droit des affaires, OHADA, immobilier, contentieux et conseil international."
  );
  const seoImage = useText("seo.home.image", "");
  const addressParts = (contact?.address || "3 avenue des Ternes, 75017 Paris")
    .split(",")
    .map((s) => s.trim());
  const street = addressParts[0] || "3 avenue des Ternes";
  const cityPart = addressParts[1] || "75017 Paris";
  const cityMatch = cityPart.match(/^(\d{4,5})\s+(.+)$/);
  const postalCode = cityMatch?.[1] || "75017";
  const locality = cityMatch?.[2] || "Paris";
  const phoneClean = (contact?.phone || "+33176586737").replace(/[^\d+]/g, "");

  useSeo({
    title: seoTitle,
    description: seoDescription,
    image: seoImage || undefined,
    type: "website",
    lang,
    canonical,
    alternates,
    jsonLdId: "home-jsonld",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "LegalService",
      "@id": "https://cabinet-diabate.com/#organization",
      name: jsonLdName,
      legalName: "Cabinet Manuela DIABATE",
      description: jsonLdDesc,
      ...(seoImage ? {
        image: seoImage,
        logo: seoImage
      } : {}),
      address: {
        "@type": "PostalAddress",
        streetAddress: street,
        postalCode,
        addressLocality: locality,
        addressCountry: "FR",
      },
      areaServed: [
        { "@type": "Country", name: "France" },
        { "@type": "City", name: "Paris" },
        { "@type": "Country", name: "Côte d'Ivoire" },
        { "@type": "City", name: "Abidjan" },
        { "@type": "Place", name: "OHADA" },
      ],
      knowsLanguage: ["fr", "en"],
      telephone: phoneClean,
      email: contact?.email || "contact@cabinet-diabate.com",
      priceRange: "€€€",
      url: typeof window !== "undefined" ? window.location.origin : "https://cabinet-diabate.com",
      sameAs: [contact?.linkedin_url || "https://www.linkedin.com/in/manuela-diabate"].filter(Boolean),
      contactPoint: {
        "@type": "ContactPoint",
        telephone: phoneClean,
        contactType: "customer service",
        areaServed: ["FR", "CI"],
        availableLanguage: ["French", "English"],
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <Strengths />
        <Metrics />
        <FounderCard />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
};

export default Index;

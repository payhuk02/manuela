import { Link, Navigate, useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingActions } from "@/components/FloatingActions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { useExpertise } from "@/hooks/useExpertises";
import { getExpertiseIcon } from "@/data/expertiseIcons";
import { useSeo, buildLangAlternates } from "@/lib/seo";
import { useLang } from "@/i18n/LanguageContext";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

const ExpertiseFAQ = () => {
  const { slug } = useParams();
  const { lang } = useLang();
  const { data: expertise, loading } = useExpertise(slug);

  const { canonical, alternates } = buildLangAlternates(`/expertises/${slug ?? ""}/faq`, lang);

  useSeo(
    expertise
      ? {
          title: `FAQ ${expertise.title} — Manuela DIABATE`.slice(0, 60),
          description:
            lang === "fr"
              ? `Questions fréquentes en ${expertise.title.toLowerCase()} : réponses claires et concrètes du Cabinet Manuela DIABATE, avocats à Paris.`.slice(0, 158)
              : `Frequently asked questions on ${expertise.title}: clear, practical answers from Cabinet Manuela DIABATE, lawyers in Paris.`.slice(0, 158),
          type: "article",
          lang,
          canonical,
          alternates,
          jsonLdId: "expertise-faq-jsonld",
          jsonLd:
            expertise.faq.length > 0
              ? {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: expertise.faq.map((q) => ({
                    "@type": "Question",
                    name: q.question,
                    acceptedAnswer: { "@type": "Answer", text: q.answer },
                  })),
                }
              : null,
        }
      : null
  );

  if (loading) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground">Chargement…</div>;
  }
  if (!expertise) return <Navigate to="/expertises" replace />;

  const Icon = getExpertiseIcon(expertise.icon);
  const items = expertise.faq.map((q, idx) => ({ ...q, id: `q-${idx + 1}-${slugify(q.question)}` }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="pt-40 pb-16 md:pt-48 md:pb-20 bg-night text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_70%_30%,hsl(var(--accent))_0%,transparent_55%)]" />
          <div className="container-luxe relative">
            <Link
              to={`/expertises/${expertise.slug}`}
              className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-accent mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              {lang === "fr" ? `Retour à ${expertise.title}` : `Back to ${expertise.title}`}
            </Link>
            <div className="flex flex-col items-center text-center gap-5 md:flex-row md:items-start md:text-left">
              <div className="h-14 w-14 shrink-0 flex items-center justify-center border border-accent/60 bg-night/60">
                <Icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              </div>
              <div>
                <p className="eyebrow text-accent">FAQ</p>
                <h1 className="mt-3 font-serif text-3xl md:text-5xl leading-tight">
                  {lang === "fr" ? "Questions fréquentes" : "Frequently asked questions"}
                </h1>
                <p className="mt-4 text-base md:text-lg text-primary-foreground/80 max-w-2xl">
                  {expertise.title} — {expertise.tagline}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        {items.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30 border-b border-border">
            <div className="container-luxe">
              <p className="eyebrow text-accent mb-6">
                {lang === "fr" ? "Accès rapide" : "Quick links"}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((item, idx) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="group flex items-start gap-3 border border-border bg-card p-4 hover:border-accent transition-colors"
                  >
                    <span className="font-serif text-accent text-sm shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-primary group-hover:text-accent transition-colors line-clamp-2">
                      {item.question}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ accordion */}
        <section className="py-20 md:py-28">
          <div className="container-luxe max-w-3xl">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto" strokeWidth={1.25} />
                <p className="mt-4 text-muted-foreground">
                  {lang === "fr" ? "Aucune question pour le moment." : "No questions yet."}
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {items.map((item) => (
                  <AccordionItem key={item.id} value={item.id} id={item.id} className="border-b border-border scroll-mt-32">
                    <AccordionTrigger className="text-left font-serif text-lg text-primary hover:text-accent hover:no-underline py-6">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-24 bg-muted/40">
          <div className="container-luxe text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-primary">
              {lang === "fr" ? "Votre question n'est pas listée ?" : "Question not listed?"}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              {lang === "fr"
                ? "Posez-la directement à notre équipe. Réponse confidentielle sous 24h ouvrées."
                : "Ask our team directly. Confidential reply within 24 business hours."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild variant="appointment" size="lg">
                <Link to={`/expertises/${expertise.slug}#expertise-contact`}>
                  {lang === "fr" ? "Poser ma question" : "Ask my question"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={`/expertises/${expertise.slug}`}>
                  {lang === "fr" ? "Voir l'expertise" : "View expertise"}
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

export default ExpertiseFAQ;

import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { lang } = useLang();

  useEffect(() => {
    document.title =
      lang === "fr"
        ? "Page non trouvée — Cabinet Manuela DIABATE"
        : "Page not found — Manuela DIABATE Law Firm";
    // Tell search engines this page should not be indexed.
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    const previousRobots = robots.getAttribute("content");
    robots.setAttribute("content", "noindex, follow");
    console.error("404 Error: route not found:", location.pathname);
    return () => {
      if (previousRobots) robots!.setAttribute("content", previousRobots);
      else robots!.remove();
    };
  }, [location.pathname, lang]);

  const t = {
    fr: {
      badge: "Erreur 404",
      title: "Page introuvable",
      desc: "La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à l'accueil.",
      home: "Retour à l'accueil",
      back: "Page précédente",
      path: "Chemin demandé",
    },
    en: {
      badge: "Error 404",
      title: "Page not found",
      desc: "The page you are looking for does not exist or has been moved. Please check the URL or return to the homepage.",
      home: "Back to home",
      back: "Previous page",
      path: "Requested path",
    },
  }[lang];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom,hsl(var(--accent)/0.08),transparent_60%)]" />

      <div className="mx-auto w-full max-w-2xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground backdrop-blur">
          <AlertCircle className="h-3.5 w-3.5" />
          {t.badge}
        </div>

        <h1 className="mb-4 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text font-serif text-7xl font-bold text-transparent sm:text-9xl">
          404
        </h1>

        <h2 className="mb-4 font-serif text-2xl font-semibold text-foreground sm:text-3xl">
          {t.title}
        </h2>

        <p className="mx-auto mb-8 max-w-md text-base text-muted-foreground">
          {t.desc}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-[180px]">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              {t.home}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-w-[180px]"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t.back}
          </Button>
        </div>

        {location.pathname && location.pathname !== "/" && (
          <p className="mt-10 text-xs text-muted-foreground/70">
            {t.path}:{" "}
            <code className="rounded bg-muted px-2 py-0.5 font-mono">
              {location.pathname}
            </code>
          </p>
        )}
      </div>
    </main>
  );
};

export default NotFound;

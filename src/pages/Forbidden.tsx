import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert } from "lucide-react";

const Forbidden = () => {
  const { session, signOut } = useAuth();

  useEffect(() => {
    document.title = "Accès refusé (403) — Manuela DIABATE";
    // Discourage indexing of an error page.
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <main className="min-h-screen grid place-items-center bg-secondary/40 px-6 py-16">
      <div className="w-full max-w-lg bg-card border border-border p-10 shadow-elegant text-center">
        <div className="mx-auto h-14 w-14 grid place-items-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Erreur 403
        </p>
        <h1 className="mt-2 font-serif text-3xl text-primary">Accès refusé</h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Votre compte n'est pas autorisé à consulter cette page. L'accès à
          l'administration est réservé aux membres de l'équipe.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="appointment" size="lg">
            <Link to="/">Retour à l'accueil</Link>
          </Button>
          {session ? (
            <Button onClick={signOut} variant="outline" size="lg">
              Se déconnecter
            </Button>
          ) : (
            <Button asChild variant="outline" size="lg">
              <Link to="/auth">Se connecter</Link>
            </Button>
          )}
        </div>

        <p className="mt-8 text-[11px] text-muted-foreground">
          Si vous pensez qu'il s'agit d'une erreur, contactez un administrateur.
        </p>
      </div>
    </main>
  );
};

export default Forbidden;

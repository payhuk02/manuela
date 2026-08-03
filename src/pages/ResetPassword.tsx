import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const schema = z.object({
  password: z.string().min(8, "Au moins 8 caractères").max(72),
});

const ResetPassword = () => {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  // null = checking, true = recovery session detected, false = no recovery
  const [hasRecovery, setHasRecovery] = useState<boolean | null>(null);

  useEffect(() => {
    document.title = "Réinitialiser le mot de passe — Manuela DIABATE";

    // Supabase places `type=recovery` in the URL hash after email link.
    const hash = window.location.hash || "";
    const isRecoveryLink = hash.includes("type=recovery");

    // Listener catches the PASSWORD_RECOVERY event triggered by the recovery link.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setHasRecovery(true);
    });

    // Also accept users who are already signed-in (changing pw from settings).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session || isRecoveryLink) setHasRecovery(true);
      else setHasRecovery(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    const parsed = schema.safeParse({ password: pw });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Mot de passe mis à jour");
    nav("/admin", { replace: true });
  };

  if (hasRecovery === null) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        Vérification du lien…
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border p-8 md:p-10 shadow-elegant">
        <Link
          to="/auth"
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-accent"
        >
          ← Retour à la connexion
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-primary">
          Nouveau mot de passe
        </h1>

        {!hasRecovery ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Ce lien de réinitialisation n'est plus valide ou a expiré.
              Demandez un nouveau lien depuis la page de connexion.
            </p>
            <Button asChild variant="appointment" size="lg" className="w-full">
              <Link to="/auth">Retour à la connexion</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <p className="text-sm text-muted-foreground">
              Choisissez un nouveau mot de passe pour votre compte.
            </p>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Nouveau mot de passe
              </label>
              <Input
                type="password"
                required
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="mt-2"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Confirmer le mot de passe
              </label>
              <Input
                type="password"
                required
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                className="mt-2"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
              />
            </div>
            <Button
              type="submit"
              variant="appointment"
              size="lg"
              disabled={busy}
              className="w-full"
            >
              {busy ? "Mise à jour…" : "Mettre à jour le mot de passe"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;

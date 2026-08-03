import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Nom trop court")
    .max(80, "Nom trop long"),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(8, "Au moins 8 caractères").max(72),
});

const signInSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(1, "Mot de passe requis").max(72),
});

const Auth = () => {
  const { signIn, signUp, signOut, session, isStaff, loading, user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign-in state
  const [siEmail, setSiEmail] = useState("");
  const [siPw, setSiPw] = useState("");
  const [siBusy, setSiBusy] = useState(false);

  // Sign-up state
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPw, setSuPw] = useState("");
  const [suBusy, setSuBusy] = useState(false);

  // Forgot-password state
  const [forgotBusy, setForgotBusy] = useState(false);

  useEffect(() => {
    document.title = "Connexion — Manuela DIABATE";
  }, []);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email: siEmail, password: siPw });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSiBusy(true);
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setSiBusy(false);
    if (error) toast.error(error === "Invalid login credentials" ? "Identifiants invalides" : error);
    else toast.success("Connecté");
  };

  const onSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({
      displayName: suName,
      email: suEmail,
      password: suPw,
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSuBusy(true);
    const { error, needsConfirmation } = await signUp(
      parsed.data.email,
      parsed.data.password,
      parsed.data.displayName,
    );
    setSuBusy(false);
    if (error) {
      toast.error(
        error === "User already registered"
          ? "Un compte existe déjà avec cet email"
          : error,
      );
      return;
    }
    if (needsConfirmation) {
      toast.success("Compte créé. Vérifiez votre email pour confirmer votre inscription.");
    } else {
      toast.success("Compte créé, vous êtes connecté.");
    }
  };

  // Logged-in view: offer password change + quick navigation instead of redirecting away.
  if (!loading && session) {
    return (
      <div className="min-h-screen grid place-items-center bg-secondary/40 px-6 py-12">
        <div className="w-full max-w-md bg-card border border-border p-8 md:p-10 shadow-elegant">
          <Link
            to="/"
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-accent"
          >
            ← Retour au site
          </Link>
          <h1 className="mt-6 font-serif text-3xl text-primary">Mon compte</h1>
          <p className="mt-2 text-sm text-muted-foreground break-all">
            Connecté en tant que <span className="text-foreground">{user?.email}</span>
          </p>

          <div className="mt-8 space-y-3">
            <Button
              variant="appointment"
              size="lg"
              className="w-full"
              onClick={() => nav("/reset-password")}
            >
              Changer mon mot de passe
            </Button>
            {isStaff && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => nav("/admin")}
              >
                Aller à l'administration
              </Button>
            )}
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={async () => {
                await signOut();
                toast.success("Déconnecté");
              }}
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-secondary/40 px-6 py-12">
      <div className="w-full max-w-md bg-card border border-border p-8 md:p-10 shadow-elegant">
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-accent"
        >
          ← Retour au site
        </Link>
        <h1 className="mt-6 font-serif text-3xl text-primary">Espace d'Administration</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connectez-vous ou créez un compte.
        </p>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")} className="mt-8">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-6">
            <form onSubmit={onSignIn} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={siEmail}
                  onChange={(e) => setSiEmail(e.target.value)}
                  className="mt-2"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Mot de passe
                </label>
                <Input
                  type="password"
                  required
                  value={siPw}
                  onChange={(e) => setSiPw(e.target.value)}
                  className="mt-2"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                variant="appointment"
                size="lg"
                disabled={siBusy}
                className="w-full"
              >
                {siBusy ? "Connexion…" : "Se connecter"}
              </Button>
              <button
                type="button"
                onClick={async () => {
                  const email = siEmail.trim();
                  const parsed = z.string().email().safeParse(email);
                  if (!parsed.success) {
                    toast.error("Saisissez d'abord votre email puis cliquez sur ce lien");
                    return;
                  }
                  setForgotBusy(true);
                  const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  setForgotBusy(false);
                  if (error) toast.error(error.message);
                  else toast.success("Email de réinitialisation envoyé. Vérifiez votre boîte.");
                }}
                disabled={forgotBusy}
                className="block w-full text-center text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors"
              >
                {forgotBusy ? "Envoi…" : "Mot de passe oublié ?"}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-6">
            <form onSubmit={onSignUp} className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Nom complet
                </label>
                <Input
                  type="text"
                  required
                  value={suName}
                  onChange={(e) => setSuName(e.target.value)}
                  className="mt-2"
                  autoComplete="name"
                  maxLength={80}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={suEmail}
                  onChange={(e) => setSuEmail(e.target.value)}
                  className="mt-2"
                  autoComplete="email"
                  maxLength={255}
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Mot de passe
                </label>
                <Input
                  type="password"
                  required
                  value={suPw}
                  onChange={(e) => setSuPw(e.target.value)}
                  className="mt-2"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={72}
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  8 caractères minimum.
                </p>
              </div>
              <Button
                type="submit"
                variant="appointment"
                size="lg"
                disabled={suBusy}
                className="w-full"
              >
                {suBusy ? "Création…" : "Créer un compte"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-xs text-muted-foreground leading-relaxed">
          L'accès à l'administration est réservé aux comptes autorisés par
          un administrateur.
        </p>
      </div>
    </div>
  );
};

export default Auth;

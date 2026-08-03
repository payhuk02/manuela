import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Trash2, Shield, ShieldOff } from "lucide-react";

type Role = "admin" | "editor";
type ManagedUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: Role[];
};

const FUNCTION_NAME = "admin-users";

export function UsersAdmin() {
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("editor");
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { type: "list" },
    });
    if (error || (data as { error?: string })?.error) {
      toast({
        title: "Erreur de chargement",
        description: error?.message ?? (data as { error?: string }).error,
        variant: "destructive",
      });
    } else {
      setUsers((data as { users: ManagedUser[] }).users ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const callAction = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, { body });
    setBusy(null);
    if (error || (data as { error?: string })?.error) {
      toast({
        title: "Action échouée",
        description: error?.message ?? (data as { error?: string }).error,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const grantRole = async (user_id: string, role: Role) => {
    if (await callAction({ type: "set_role", user_id, role }, `${user_id}-${role}-grant`)) {
      toast({ title: "Rôle attribué" });
      load();
    }
  };

  const revokeRole = async (user_id: string, role: Role) => {
    if (await callAction({ type: "remove_role", user_id, role }, `${user_id}-${role}-revoke`)) {
      toast({ title: "Rôle retiré" });
      load();
    }
  };

  const deleteUser = async (user_id: string) => {
    if (await callAction({ type: "delete_user", user_id }, `${user_id}-del`)) {
      toast({ title: "Utilisateur supprimé" });
      load();
    }
  };

  const invite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { type: "invite", email: inviteEmail.trim(), role: inviteRole },
    });
    setInviting(false);
    if (error || (data as { error?: string })?.error) {
      toast({
        title: "Invitation échouée",
        description: error?.message ?? (data as { error?: string }).error,
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Invitation envoyée", description: inviteEmail });
    setInviteEmail("");
    load();
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-serif text-xl text-primary">Inviter un utilisateur</h3>
          <p className="text-sm text-muted-foreground">
            Envoie une invitation par email. Le rôle est attribué dès l'acceptation.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="space-y-1">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="utilisateur@exemple.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="invite-role">Rôle</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as Role)}>
              <SelectTrigger id="invite-role" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Éditeur</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={invite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              Inviter
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-primary">Utilisateurs ({users.length})</h3>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="py-12 grid place-items-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">Aucun utilisateur.</p>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((u) => {
              const isAdmin = u.roles.includes("admin");
              const isEditor = u.roles.includes("editor");
              return (
                <li key={u.id} className="py-4 flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-medium text-foreground">{u.email ?? "(sans email)"}</div>
                    <div className="text-xs text-muted-foreground">
                      Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}
                      {u.last_sign_in_at && (
                        <> · Dernière connexion {new Date(u.last_sign_in_at).toLocaleDateString("fr-FR")}</>
                      )}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {u.roles.length === 0 && (
                        <Badge variant="outline" className="text-xs">Aucun rôle</Badge>
                      )}
                      {isAdmin && <Badge className="text-xs">Administrateur</Badge>}
                      {isEditor && <Badge variant="secondary" className="text-xs">Éditeur</Badge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {(["admin", "editor"] as Role[]).map((role) => {
                      const has = u.roles.includes(role);
                      const key = `${u.id}-${role}-${has ? "revoke" : "grant"}`;
                      return (
                        <Button
                          key={role}
                          size="sm"
                          variant={has ? "outline" : "secondary"}
                          disabled={busy === key}
                          onClick={() => (has ? revokeRole(u.id, role) : grantRole(u.id, role))}
                        >
                          {busy === key ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : has ? (
                            <ShieldOff className="h-3 w-3" />
                          ) : (
                            <Shield className="h-3 w-3" />
                          )}
                          {has ? `Retirer ${role === "admin" ? "admin" : "éditeur"}` : `Promouvoir ${role === "admin" ? "admin" : "éditeur"}`}
                        </Button>
                      );
                    })}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. {u.email} perdra immédiatement tout accès.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteUser(u.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

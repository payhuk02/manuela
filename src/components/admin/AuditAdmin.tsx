import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, RefreshCw, Search } from "lucide-react";

type AuditEntry = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_email: string | null;
  details: Record<string, unknown> | null;
};

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  "user.invite": { label: "Invitation utilisateur", variant: "secondary" },
  "user.delete": { label: "Suppression utilisateur", variant: "destructive" },
  "role.grant": { label: "Rôle attribué", variant: "default" },
  "role.revoke": { label: "Rôle retiré", variant: "outline" },
  "content.update": { label: "Textes modifiés", variant: "secondary" },
  "contact.update": { label: "Contact modifié", variant: "secondary" },
  "news.create": { label: "Article créé", variant: "default" },
  "news.update": { label: "Article modifié", variant: "secondary" },
  "news.delete": { label: "Article supprimé", variant: "destructive" },
  "team.create": { label: "Membre créé", variant: "default" },
  "team.update": { label: "Membre modifié", variant: "secondary" },
  "team.delete": { label: "Membre supprimé", variant: "destructive" },
  "expertise.create": { label: "Expertise créée", variant: "default" },
  "expertise.update": { label: "Expertise modifiée", variant: "secondary" },
  "expertise.delete": { label: "Expertise supprimée", variant: "destructive" },
};

export function AuditAdmin() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setEntries((data as AuditEntry[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = entries.filter((e) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      e.action.toLowerCase().includes(q) ||
      (e.actor_email ?? "").toLowerCase().includes(q) ||
      (e.target_email ?? "").toLowerCase().includes(q) ||
      JSON.stringify(e.details ?? {}).toLowerCase().includes(q)
    );
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-serif text-xl text-primary">Journal d'audit</h3>
          <p className="text-sm text-muted-foreground">200 dernières actions sensibles.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filtrer…"
              className="pl-8 w-56"
            />
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualiser
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 grid place-items-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">Aucune entrée.</p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((e) => {
            const meta = ACTION_LABELS[e.action] ?? { label: e.action, variant: "outline" as const };
            const detailEntries = Object.entries(e.details ?? {});
            return (
              <li key={e.id} className="py-3 flex items-start gap-4 flex-wrap">
                <div className="text-xs text-muted-foreground w-40 shrink-0 font-mono">
                  {new Date(e.created_at).toLocaleString("fr-FR")}
                </div>
                <div className="flex-1 min-w-[200px] space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={meta.variant} className="text-xs">{meta.label}</Badge>
                    {detailEntries.map(([k, v]) => (
                      <Badge key={k} variant="outline" className="text-xs font-mono">
                        {k}: {String(v)}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Par </span>
                    <span className="font-medium">{e.actor_email ?? "—"}</span>
                    {e.target_email && (
                      <>
                        <span className="text-muted-foreground"> sur </span>
                        <span className="font-medium">{e.target_email}</span>
                      </>
                    )}
                    {!e.target_email && e.target_id && (
                      <>
                        <span className="text-muted-foreground"> sur </span>
                        <span className="font-mono text-xs">{e.target_id.slice(0, 8)}…</span>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

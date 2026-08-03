import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Mail, Phone, Search, Eye, RefreshCw } from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  lang: string;
  user_agent: string | null;
  status: string;
  created_at: string;
};

export const ContactMessagesAdmin = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState<ContactMessage | null>(null);
  const [view, setView] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessages((data ?? []) as ContactMessage[]);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [messages, query]);

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    const { error } = await (supabase as any)
      .from("contact_messages")
      .delete()
      .eq("id", toDelete.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== toDelete.id));
    logAudit({
      action: "contact_message.delete",
      target_type: "contact_messages",
      target_id: toDelete.id,
      details: { email: toDelete.email },
    });
    toast.success("Demande supprimée");
    setToDelete(null);
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-3xl text-primary">Demandes de contact</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Messages envoyés depuis le formulaire de la page contact.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border p-10 text-center text-sm text-muted-foreground">
          {messages.length === 0
            ? "Aucune demande de contact pour le moment."
            : "Aucun résultat pour cette recherche."}
        </div>
      ) : (
        <div className="bg-card border border-border divide-y divide-border">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="p-4 md:p-5 flex flex-col md:flex-row md:items-start gap-4"
            >
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-medium text-primary">{m.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {fmtDate(m.created_at)} · {m.lang.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <a
                    href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-accent"
                  >
                    <Mail className="h-3 w-3" /> {m.email}
                  </a>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 hover:text-accent"
                    >
                      <Phone className="h-3 w-3" /> {m.phone}
                    </a>
                  )}
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2 mt-1">
                  {m.message}
                </p>
              </div>
              <div className="flex md:flex-col gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView(m)}
                >
                  <Eye className="h-4 w-4" /> Voir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setToDelete(m)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary">
              {view?.name}
            </DialogTitle>
          </DialogHeader>
          {view && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Date</span>
                  <p className="text-foreground/80 mt-1">{fmtDate(view.created_at)}</p>
                </div>
                <div>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Langue</span>
                  <p className="text-foreground/80 mt-1">{view.lang.toUpperCase()}</p>
                </div>
                <div>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Email</span>
                  <a
                    href={`mailto:${view.email}`}
                    className="text-foreground/80 mt-1 block hover:text-accent break-all"
                  >
                    {view.email}
                  </a>
                </div>
                <div>
                  <span className="uppercase tracking-[0.2em] text-[10px]">Téléphone</span>
                  <p className="text-foreground/80 mt-1">{view.phone || "—"}</p>
                </div>
              </div>
              <div>
                <span className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground">
                  Message
                </span>
                <p className="text-foreground/90 mt-2 whitespace-pre-wrap leading-relaxed bg-secondary/40 p-4 border border-border">
                  {view.message}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button asChild variant="gold" size="sm">
                  <a href={`mailto:${view.email}?subject=Re: votre demande`}>
                    <Mail className="h-4 w-4" /> Répondre par email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette demande ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. Le message de{" "}
              <span className="font-medium text-foreground">{toDelete?.name}</span>{" "}
              sera supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

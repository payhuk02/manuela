import { ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage } from "@/lib/imageOptimizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { RotateCcw, Save, Trash2, Upload } from "lucide-react";
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

export type FieldDef = {
  key: string;
  label: string;
  multiline?: boolean;
  /** Valeur affichée par défaut sur le site (fallback) — pré-remplit le champ si la BDD est vide. */
  defaultValue?: string;
  /** Si fournis, affiche un menu déroulant au lieu d'un champ texte. */
  options?: { value: string; label: string }[];
  /** Si true, affiche un sélecteur de couleur (hex). */
  color?: boolean;
  /** Si true, affiche un bouton « Effacer » avec confirmation pour vider le champ. */
  clearable?: boolean;
  /** Si true, affiche un upload d'image (la valeur stockée est l'URL publique). */
  image?: boolean;
  /** Description d'aide sous le label (utile pour les uploads d'image). */
  hint?: string;
};
export type GroupDef = {
  label: string;
  keys: FieldDef[];
  /** Optional render-prop to display a live preview using the editor's current values. */
  renderPreview?: (getValue: (key: string) => string) => ReactNode;
};

type Row = { key: string; lang: "fr" | "en"; value: string };

const EDIT_LANG: "fr" = "fr";

type Props = {
  title: string;
  description?: string;
  groups: GroupDef[];
  auditAction?: string;
};

export const ContentSectionEditor = ({ title, description, groups, auditAction = "content.update" }: Props) => {
  // `rows` holds DB-backed overrides ONLY (what's actually stored in site_content).
  // Empty string here = field was explicitly cleared.
  // `undefined` here = no override yet → the field shows the site default value.
  const [rows, setRows] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmClearKey, setConfirmClearKey] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const editableKeys = useMemo(
    () => groups.flatMap((g) => g.keys.map((k) => k.key)),
    [groups],
  );

  // Build a key→default value map from the field definitions.
  const defaultsByKey = useMemo(() => {
    const map: Record<string, string> = {};
    groups.forEach((g) =>
      g.keys.forEach((k) => {
        if (k.defaultValue != null) map[k.key] = k.defaultValue;
      }),
    );
    return map;
  }, [groups]);

  useEffect(() => {
    if (editableKeys.length === 0) return;
    setLoaded(false);
    supabase
      .from("site_content")
      .select("*")
      .in("key", editableKeys)
      .eq("lang", EDIT_LANG)
      .then(({ data, error }) => {
        if (error) {
          toast.error(error.message);
          setLoaded(true);
          return;
        }
        const map: Record<string, string> = {};
        (data as Row[]).forEach((r) => (map[`${r.key}::${r.lang}`] = r.value ?? ""));
        setRows(map);
        setLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editableKeys.join("|")]);

  /** Effective value displayed in the field (DB override if any, else site default). */
  const valueFor = (key: string): string => {
    const k = `${key}::${EDIT_LANG}`;
    if (k in rows) return rows[k];
    return defaultsByKey[key] ?? "";
  };

  const setValue = (key: string, value: string) => {
    const k = `${key}::${EDIT_LANG}`;
    setRows((prev) => ({ ...prev, [k]: value }));
  };

  const resetToDefault = (key: string) => {
    const k = `${key}::${EDIT_LANG}`;
    setRows((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const save = async () => {
    setBusy(true);
    // We persist the effective value of every editable field so what's shown in
    // the admin matches exactly what's stored — even if the user only tweaked a
    // few fields, the rest are committed with their current default.
    const payload = editableKeys.map((key) => ({
      key,
      lang: EDIT_LANG,
      value: valueFor(key),
    }));
    const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "key,lang" });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Enregistré");
      logAudit({
        action: auditAction,
        target_type: "site_content",
        details: { keys: payload.map((p) => `${p.key}::${p.lang}`) },
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-serif text-3xl text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        <p className="text-xs text-muted-foreground/80 mt-2">
          Les champs sont pré-remplis avec les textes actuellement affichés sur le site.
          Modifiez puis cliquez sur « Sauvegarder ». Le bouton ↺ rétablit le texte d'origine.
        </p>
      </div>

      {!loaded ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.label} className="space-y-4">
              <h3 className="font-serif text-xl text-primary border-b border-border pb-2">
                {group.label}
              </h3>
              <div className="space-y-4">
                {group.keys.map(({ key, label, multiline, defaultValue, options, color, clearable, image, hint }) => {
                  const v = valueFor(key);
                  const hasDefault = defaultValue != null && defaultValue !== "";
                  const isModified = hasDefault && v !== defaultValue;
                  return (
                    <div key={key} className="bg-card border border-border p-6 space-y-3">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <p className="text-xs uppercase tracking-[0.2em] text-accent">{label}</p>
                        <div className="flex items-center gap-3">
                          {clearable && v !== "" && (
                            <button
                              type="button"
                              onClick={() => setConfirmClearKey(key)}
                              title="Effacer le contenu de ce champ"
                              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="h-3 w-3" /> Effacer
                            </button>
                          )}
                          {hasDefault && isModified && (
                            <button
                              type="button"
                              onClick={() => resetToDefault(key)}
                              title="Rétablir le texte d'origine du site"
                              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-accent transition-colors"
                            >
                              <RotateCcw className="h-3 w-3" /> Rétablir
                            </button>
                          )}
                        </div>
                      </div>
                      {hint && <p className="text-xs text-muted-foreground -mt-1">{hint}</p>}
                      {image ? (
                        <div className="space-y-3">
                          {v ? (
                            <div className="border border-border rounded bg-muted/40 p-3 flex items-center justify-center">
                              <img
                                src={v}
                                alt={label}
                                className="max-h-40 w-auto object-contain rounded"
                              />
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Aucune image — l'image OG par défaut du site sera utilisée.
                            </p>
                          )}
                          <div className="flex items-center gap-3 flex-wrap">
                            <label className="inline-flex">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                disabled={uploadingKey === key}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  e.target.value = "";
                                  if (!file) return;
                                  setUploadingKey(key);
                                  try {
                                    const optimized = await optimizeImage(file);
                                    const ext = optimized.name.split(".").pop() || "jpg";
                                    const path = `seo/${key.replace(/\./g, "-")}-${Date.now()}.${ext}`;
                                    const { error: upErr } = await supabase.storage
                                      .from("site-images")
                                      .upload(path, optimized, {
                                        upsert: true,
                                        contentType: optimized.type,
                                      });
                                    if (upErr) throw upErr;
                                    const { data: pub } = supabase.storage
                                      .from("site-images")
                                      .getPublicUrl(path);
                                    setValue(key, pub.publicUrl);
                                    toast.success("Image téléversée — pensez à sauvegarder.");
                                  } catch (err) {
                                    toast.error(
                                      (err as Error).message ?? "Échec du téléversement."
                                    );
                                  } finally {
                                    setUploadingKey(null);
                                  }
                                }}
                              />
                              <span className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-border bg-background hover:bg-accent/10 cursor-pointer rounded">
                                <Upload className="h-4 w-4" />
                                {uploadingKey === key ? "Téléversement…" : "Téléverser une image"}
                              </span>
                            </label>
                            {v && (
                              <Button variant="ghost" size="sm" onClick={() => setValue(key, "")}>
                                <Trash2 className="h-4 w-4" /> Retirer
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : color ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={/^#[0-9a-fA-F]{6}$/.test(v) ? v : (defaultValue || "#d4af37")}
                            onChange={(e) => setValue(key, e.target.value)}
                            className="h-10 w-16 cursor-pointer rounded-md border border-input bg-background p-1"
                          />
                          <Input
                            value={v}
                            onChange={(e) => setValue(key, e.target.value)}
                            placeholder="#d4af37"
                            className="flex-1"
                          />
                        </div>
                      ) : options && options.length > 0 ? (
                        <select
                          value={v}
                          onChange={(e) => setValue(key, e.target.value)}
                          className="w-full h-10 px-3 bg-background border border-input rounded-md text-sm"
                        >
                          {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : multiline ? (
                        <Textarea
                          value={v}
                          onChange={(e) => setValue(key, e.target.value)}
                          rows={Math.min(8, Math.max(3, v.split("\n").length + 1))}
                        />
                      ) : (
                        <Input
                          value={v}
                          onChange={(e) => setValue(key, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {group.renderPreview && (
                <div className="bg-card/50 border border-border p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-accent mb-3">
                    Prévisualisation en temps réel
                  </p>
                  {group.renderPreview(valueFor)}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      <Button onClick={save} variant="gold" disabled={busy || !loaded}>
        <Save className="h-4 w-4" />
        {busy ? "Sauvegarde…" : "Sauvegarder"}
      </Button>

      <AlertDialog open={confirmClearKey !== null} onOpenChange={(open) => !open && setConfirmClearKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer ce champ ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le contenu sera vidé. Cette modification ne sera appliquée qu'après avoir cliqué sur « Sauvegarder ».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmClearKey) setValue(confirmClearKey, "");
                setConfirmClearKey(null);
              }}
            >
              Effacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

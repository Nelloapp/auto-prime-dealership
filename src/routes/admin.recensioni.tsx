import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { Review } from "@/lib/reviews";
import { formatDate } from "@/lib/site";

export const Route = createFileRoute("/admin/recensioni")({
  component: AdminReviews,
});

function AdminReviews() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState(5);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("position", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });

  async function refresh() {
    await qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    await qc.invalidateQueries({ queryKey: ["reviews", "published"] });
  }

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const author_name = String(form.get("author_name") ?? "").trim();
    const body = String(form.get("body") ?? "").trim();
    if (author_name.length < 2 || body.length < 5) {
      toast.error("Inserisci nome e testo della recensione");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      author_name,
      body,
      rating,
      car_label: String(form.get("car_label") ?? "").trim() || null,
      source: String(form.get("source") ?? "").trim() || null,
      position: Number(form.get("position") ?? 0) || 0,
    });
    setSaving(false);
    if (error) {
      toast.error("Errore nel salvataggio");
      return;
    }
    formEl.reset();
    setRating(5);
    await refresh();
    toast.success("Recensione aggiunta");
  }

  async function togglePublished(r: Review) {
    const { error } = await supabase
      .from("reviews")
      .update({ published: !r.published })
      .eq("id", r.id);
    if (error) {
      toast.error("Errore nell'aggiornamento");
      return;
    }
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("Eliminare questa recensione?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      toast.error("Errore nell'eliminazione");
      return;
    }
    await refresh();
    toast.success("Recensione eliminata");
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-black">Recensioni</h1>

      <form onSubmit={add} className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-extrabold">Nuova recensione</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rv-name">Nome cliente *</Label>
            <Input id="rv-name" name="author_name" required maxLength={80} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="rv-car">Auto acquistata</Label>
            <Input id="rv-car" name="car_label" maxLength={80} className="mt-1 h-11" placeholder="Fiat Panda 1.2" />
          </div>
          <div>
            <Label htmlFor="rv-source">Fonte</Label>
            <Input id="rv-source" name="source" maxLength={40} className="mt-1 h-11" placeholder="Google" />
          </div>
          <div>
            <Label htmlFor="rv-pos">Ordine</Label>
            <Input id="rv-pos" name="position" type="number" defaultValue={0} className="mt-1 h-11" />
          </div>
        </div>
        <div>
          <Label>Voto</Label>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stelle`}>
                <Star
                  className={
                    i <= rating ? "size-7 fill-primary text-primary" : "size-7 text-border"
                  }
                />
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="rv-body">Testo *</Label>
          <Textarea id="rv-body" name="body" required maxLength={1000} rows={3} className="mt-1" />
        </div>
        <Button type="submit" variant="cta" disabled={saving}>
          <Plus /> {saving ? "Salvataggio…" : "Aggiungi recensione"}
        </Button>
      </form>

      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}

      <div className="grid gap-3">
        {(data ?? []).map((r) => (
          <div key={r.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-extrabold">{r.author_name}</p>
                  <span className="font-mono text-xs text-muted-foreground">{r.rating}★</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[r.car_label, r.source, formatDate(r.created_at)].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-2 text-sm">{r.body}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <Switch checked={r.published} onCheckedChange={() => togglePublished(r)} />
                  {r.published ? "Visibile" : "Nascosta"}
                </label>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Elimina">
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground shadow-card">
            Nessuna recensione. Aggiungi la prima qui sopra.
          </p>
        )}
      </div>
    </div>
  );
}

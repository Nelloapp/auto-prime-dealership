import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const schema = z.object({
  author_name: z.string().trim().min(2, "Inserisci il tuo nome").max(80),
  car_label: z.string().trim().max(80),
  body: z.string().trim().min(10, "Scrivi almeno 10 caratteri").max(1000),
});

/** Modulo pubblico: la recensione resta nascosta finché l'admin non la approva. */
export function ReviewForm() {
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      author_name: String(f.get("author_name") ?? ""),
      car_label: String(f.get("car_label") ?? ""),
      body: String(f.get("body") ?? ""),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Controlla i campi");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("reviews").insert({
      author_name: parsed.data.author_name,
      body: parsed.data.body,
      car_label: parsed.data.car_label || null,
      rating,
      source: "Sito web",
      published: false,
      position: 0,
    });
    setSaving(false);
    if (error) {
      toast.error("Invio non riuscito, riprova");
      return;
    }
    setSent(true);
  }

  return (
    <section id="lascia-recensione" className="mx-auto max-w-2xl px-4 pb-16">
      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h2 className="font-display text-xl font-bold uppercase text-primary-deep">
          Lascia una recensione
        </h2>
        {sent ? (
          <p className="mt-3 text-sm">
            Grazie! La tua recensione è stata inviata e sarà pubblicata dopo la verifica.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <Label>Voto</Label>
              <div className="mt-1 flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} stelle`}>
                    <Star className={i <= rating ? "size-7 fill-primary text-primary" : "size-7 text-border"} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rf-name">Nome *</Label>
                <Input id="rf-name" name="author_name" required maxLength={80} className="mt-1 h-11" />
              </div>
              <div>
                <Label htmlFor="rf-car">Auto acquistata</Label>
                <Input id="rf-car" name="car_label" maxLength={80} className="mt-1 h-11" />
              </div>
            </div>
            <div>
              <Label htmlFor="rf-body">La tua esperienza *</Label>
              <Textarea id="rf-body" name="body" required maxLength={1000} rows={4} className="mt-1" />
            </div>
            <Button type="submit" variant="cta" disabled={saving}>
              {saving ? "Invio…" : "Invia recensione"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

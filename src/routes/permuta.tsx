import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, HandCoins, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadCarPhoto } from "@/lib/storage";
import { FUEL_LABELS } from "@/lib/site";

export const Route = createFileRoute("/permuta")({
  head: () => ({
    meta: [
      { title: "Valuta la tua auto usata — Auto Prime Pompei" },
      {
        name: "description",
        content:
          "Invia i dati e le foto della tua auto: Auto Prime ti fa una valutazione gratuita per la permuta o l'acquisto in giornata.",
      },
      { property: "og:title", content: "Valuta la tua auto usata — Auto Prime" },
      {
        property: "og:description",
        content: "Valutazione gratuita della tua auto per permuta o vendita diretta.",
      },
    ],
  }),
  component: Permuta,
});

function Permuta() {
  const [files, setFiles] = useState<File[]>([]);
  const [fuel, setFuel] = useState<string>("benzina");
  const [saving, setSaving] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    if (!get("customer_name") || !get("phone") || !get("brand") || !get("model")) {
      toast.error("Compila i campi obbligatori");
      return;
    }
    setSaving(true);
    try {
      const photos: string[] = [];
      for (const file of files) {
        photos.push(await uploadCarPhoto(file, "permute"));
      }
      const { error } = await supabase.from("trade_in_requests").insert({
        customer_name: get("customer_name"),
        phone: get("phone"),
        email: get("email") || null,
        brand: get("brand"),
        model: get("model"),
        year: Number(get("year")) || new Date().getFullYear(),
        km: Number(get("km")) || 0,
        fuel: fuel as "benzina",
        conditions: get("conditions") || null,
        notes: get("notes") || null,
        photos,
      });
      if (error) throw error;
      toast.success("Richiesta inviata! Ti contatteremo con la valutazione.");
      formEl.reset();
      setFiles([]);
    } catch {
      toast.error("Errore nell'invio, riprova");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <HandCoins className="size-8 text-accent" />
        <h1 className="font-display text-3xl font-black sm:text-4xl">Valuta la tua auto</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Compila il modulo con i dati della tua auto e qualche foto: ti ricontattiamo con una
        valutazione gratuita, sia per la permuta che per l'acquisto diretto.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl bg-card p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customer_name">Nome e cognome *</Label>
            <Input id="customer_name" name="customer_name" required maxLength={100} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="phone">Telefono *</Label>
            <Input id="phone" name="phone" type="tel" required maxLength={30} className="mt-1 h-11" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" maxLength={150} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="brand">Marca *</Label>
            <Input id="brand" name="brand" required maxLength={50} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="model">Modello *</Label>
            <Input id="model" name="model" required maxLength={80} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="year">Anno *</Label>
            <Input
              id="year"
              name="year"
              inputMode="numeric"
              required
              maxLength={4}
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="km">Chilometri *</Label>
            <Input id="km" name="km" inputMode="numeric" required className="mt-1 h-11" />
          </div>
          <div>
            <Label className="mb-1 block">Alimentazione</Label>
            <Select value={fuel} onValueChange={setFuel}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FUEL_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="conditions">Condizioni generali</Label>
            <Input
              id="conditions"
              name="conditions"
              maxLength={120}
              placeholder="es. ottime, piccoli graffi"
              className="mt-1 h-11"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Note</Label>
          <Textarea id="notes" name="notes" rows={4} maxLength={800} className="mt-1" />
        </div>

        <div>
          <Label className="mb-2 block">Foto dell'auto (max 8)</Label>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm font-semibold text-muted-foreground hover:bg-secondary">
            <Camera className="size-5" /> Aggiungi foto
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-destructive text-destructive-foreground"
                    aria-label="Rimuovi foto"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" variant="cta" size="xl" className="w-full" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />}
          {saving ? "Invio in corso…" : "Richiedi valutazione gratuita"}
        </Button>
      </form>
    </main>
  );
}

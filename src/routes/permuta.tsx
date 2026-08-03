import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Camera, CheckCircle2, HandCoins, Loader2, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { uploadCarPhoto } from "@/lib/storage";
import { FUEL_LABELS, genericWhatsappMessage, whatsappHref } from "@/lib/site";
import { useSettings } from "@/lib/cars";

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
  const [step, setStep] = useState<1 | 2>(1);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [fuel, setFuel] = useState<string>("benzina");
  const [saving, setSaving] = useState(false);
  const { data: settings } = useSettings();

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 8));
  }

  /** Step 1: salva subito il lead con i dati essenziali. */
  async function submitStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    if (!get("customer_name") || !get("phone") || !get("brand") || !get("model")) {
      toast.error("Compila i campi obbligatori");
      return;
    }
    const id = crypto.randomUUID();
    setSaving(true);
    const { error } = await supabase.from("trade_in_requests").insert({
      id,
      customer_name: get("customer_name"),
      phone: get("phone"),
      email: null,
      brand: get("brand"),
      model: get("model"),
      year: Number(get("year")) || new Date().getFullYear(),
      km: Number(get("km")) || 0,
      fuel: fuel as "benzina",
      conditions: null,
      notes: null,
      photos: [],
    });
    setSaving(false);
    if (error) {
      toast.error("Errore nell'invio, riprova");
      return;
    }
    setRequestId(id);
    setStep(2);
    toast.success("Richiesta ricevuta! Ti ricontattiamo con la valutazione.");
  }

  /** Step 2 (facoltativo): allega le foto alla richiesta già salvata. */
  async function submitStep2() {
    if (!requestId || files.length === 0) return;
    setSaving(true);
    try {
      const photos: string[] = [];
      for (const file of files) {
        photos.push(await uploadCarPhoto(file, "permute"));
      }
      const res = await attachTradeInPhotos({ data: { id: requestId, photos } });
      if (!res.ok) throw new Error("attach_failed");

      toast.success("Foto allegate alla tua richiesta!");
      setFiles([]);
      setStep(1);
      setRequestId(null);
    } catch {
      toast.error("Non siamo riusciti a caricare le foto, puoi inviarle su WhatsApp");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center gap-3">
        <HandCoins className="size-8 text-primary" />
        <h1 className="font-display text-3xl font-black uppercase sm:text-4xl">
          Valuta la tua auto
        </h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Bastano pochi dati: ti ricontattiamo con una valutazione gratuita, sia per la permuta che
        per l&apos;acquisto diretto. Le foto puoi aggiungerle dopo.
      </p>

      <div className="mt-6 flex items-center gap-2 font-mono text-xs font-bold uppercase">
        <span className={step === 1 ? "text-primary" : "text-muted-foreground"}>1. Dati auto</span>
        <span className="text-muted-foreground">—</span>
        <span className={step === 2 ? "text-primary" : "text-muted-foreground"}>
          2. Foto (facoltativo)
        </span>
      </div>

      {step === 1 ? (
        <form onSubmit={submitStep1} className="mt-4 space-y-5 rounded-2xl bg-card p-5 shadow-card">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="customer_name">Nome e cognome *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                required
                maxLength={100}
                className="mt-1 h-11"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono *</Label>
              <Input id="phone" name="phone" type="tel" required maxLength={30} className="mt-1 h-11" />
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
            <div className="sm:col-span-2">
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
          </div>

          <Button type="submit" variant="cta" size="xl" className="w-full" disabled={saving}>
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Invio in corso…" : "Richiedi valutazione gratuita"}
          </Button>
        </form>
      ) : (
        <div className="mt-4 space-y-5 rounded-2xl bg-card p-5 shadow-card">
          <div className="rounded-xl border-l-4 border-success bg-secondary p-4">
            <p className="flex items-center gap-2 font-display text-base font-extrabold uppercase">
              <CheckCircle2 className="size-5 text-success" /> Richiesta inviata
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vuoi una valutazione più precisa? Aggiungi qualche foto (facoltativo): puoi
              anche inviarcele dopo su WhatsApp.
            </p>
          </div>

          <div>
            <Label className="mb-2 block">Foto dell&apos;auto (max 8)</Label>
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

          <Button
            type="button"
            variant="cta"
            size="xl"
            className="w-full"
            disabled={saving || files.length === 0}
            onClick={submitStep2}
          >
            {saving && <Loader2 className="animate-spin" />}
            {saving ? "Caricamento…" : "Invia le foto"}
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full">
            <a
              href={whatsappHref(
                settings?.whatsapp ?? "393297897193",
                genericWhatsappMessage("Valuta la tua auto"),
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle /> Inviale su WhatsApp
            </a>
          </Button>
        </div>
      )}
    </main>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoredImage } from "@/components/StoredImage";
import { supabase } from "@/integrations/supabase/client";
import { uploadCarPhoto } from "@/lib/storage";
import type { CarWithImages } from "@/lib/cars";
import { sortedImages } from "@/lib/cars";
import { CAR_STATUS_LABELS, FUEL_LABELS, GEARBOX_LABELS, slugify } from "@/lib/site";

type ImageRow = { id?: string; url: string; is_primary: boolean };

export function CarForm({ car }: { car?: CarWithImages }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [fuel, setFuel] = useState(car?.fuel ?? "benzina");
  const [gearbox, setGearbox] = useState(car?.gearbox ?? "manuale");
  const [status, setStatus] = useState(car?.status ?? "disponibile");
  const [featured, setFeatured] = useState(car?.featured ?? false);
  const [readyDelivery, setReadyDelivery] = useState(car?.ready_delivery ?? false);

  useEffect(() => {
    if (car) {
      setImages(sortedImages(car).map((i) => ({ id: i.id, url: i.url, is_primary: i.is_primary })));
    }
  }, [car]);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setUploading(true);
    try {
      const uploaded: ImageRow[] = [];
      for (const file of Array.from(list)) {
        const path = await uploadCarPhoto(file, "auto");
        uploaded.push({ url: path, is_primary: false });
      }
      setImages((prev) => {
        const next = [...prev, ...uploaded];
        if (!next.some((i) => i.is_primary) && next[0]) next[0].is_primary = true;
        return next;
      });
    } catch {
      toast.error("Errore nel caricamento delle foto");
    } finally {
      setUploading(false);
    }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim();
    const num = (k: string) => (get(k) ? Number(get(k)) : null);

    const brand = get("brand");
    const model = get("model");
    if (!brand || !model) {
      toast.error("Marca e modello sono obbligatori");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        brand,
        model,
        version: get("version") || null,
        year: Number(get("year")) || new Date().getFullYear(),
        km: Number(get("km")) || 0,
        price: Number(get("price")) || 0,
        previous_price: num("previous_price"),
        engine_size: num("engine_size"),
        power_hp: num("power_hp"),
        color: get("color") || null,
        owners: num("owners"),
        inspection_until: get("inspection_until") || null,
        warranty: get("warranty") || null,
        description: get("description") || null,
        fuel: fuel as "benzina",
        gearbox: gearbox as "manuale",
        status: status as "disponibile",
        featured,
        ready_delivery: readyDelivery,
        slug:
          car?.slug ??
          `${slugify(`${brand} ${model} ${get("version")} ${get("year")}`)}-${Date.now().toString(36)}`,
      };

      let carId = car?.id;
      if (car) {
        const { error } = await supabase.from("cars").update(payload).eq("id", car.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("cars").insert(payload).select("id").single();
        if (error) throw error;
        carId = data.id;
      }

      if (carId) {
        await supabase.from("car_images").delete().eq("car_id", carId);
        if (images.length) {
          const { error: imgErr } = await supabase.from("car_images").insert(
            images.map((img, i) => ({
              car_id: carId!,
              url: img.url,
              position: i,
              is_primary: img.is_primary,
            })),
          );
          if (imgErr) throw imgErr;
        }
      }

      await qc.invalidateQueries({ queryKey: ["cars"] });
      toast.success(car ? "Auto aggiornata" : "Auto creata");
      navigate({ to: "/admin/auto" });
    } catch {
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!car) return;
    if (!confirm("Eliminare definitivamente questa auto?")) return;
    const { error } = await supabase.from("cars").delete().eq("id", car.id);
    if (error) {
      toast.error("Errore nell'eliminazione");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["cars"] });
    toast.success("Auto eliminata");
    navigate({ to: "/admin/auto" });
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-extrabold">Dati principali</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "brand", label: "Marca *", defaultValue: car?.brand },
            { name: "model", label: "Modello *", defaultValue: car?.model },
            { name: "version", label: "Versione", defaultValue: car?.version ?? "" },
            { name: "year", label: "Anno *", defaultValue: car?.year },
            { name: "km", label: "Chilometri *", defaultValue: car?.km },
            { name: "price", label: "Prezzo (€) *", defaultValue: car?.price },
            {
              name: "previous_price",
              label: "Prezzo precedente (€)",
              defaultValue: car?.previous_price ?? "",
            },
            { name: "engine_size", label: "Cilindrata (cc)", defaultValue: car?.engine_size ?? "" },
            { name: "power_hp", label: "Potenza (CV)", defaultValue: car?.power_hp ?? "" },
            { name: "color", label: "Colore", defaultValue: car?.color ?? "" },
            { name: "owners", label: "N° proprietari", defaultValue: car?.owners ?? "" },
            {
              name: "inspection_until",
              label: "Revisione fino a",
              defaultValue: car?.inspection_until ?? "",
            },
            { name: "warranty", label: "Garanzia", defaultValue: car?.warranty ?? "" },
          ].map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input
                id={f.name}
                name={f.name}
                defaultValue={String(f.defaultValue ?? "")}
                className="mt-1 h-11"
              />
            </div>
          ))}

          <div>
            <Label className="mb-1 block">Alimentazione</Label>
            <Select value={fuel} onValueChange={(v) => setFuel(v as typeof fuel)}>
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
            <Label className="mb-1 block">Cambio</Label>
            <Select value={gearbox} onValueChange={(v) => setGearbox(v as typeof gearbox)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GEARBOX_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1 block">Stato</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CAR_STATUS_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Switch checked={featured} onCheckedChange={setFeatured} /> In evidenza
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Switch checked={readyDelivery} onCheckedChange={setReadyDelivery} /> Pronta consegna
          </label>
        </div>

        <div className="mt-4">
          <Label htmlFor="description">Descrizione</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={car?.description ?? ""}
            className="mt-1"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-extrabold">Foto</h2>
        <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm font-semibold text-muted-foreground hover:bg-secondary">
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
          {uploading ? "Caricamento…" : "Carica foto"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((img, i) => (
              <div key={img.url} className="overflow-hidden rounded-xl border">
                <StoredImage path={img.url} alt="Foto auto" className="aspect-4/3 w-full object-cover" />
                <div className="flex items-center justify-between gap-1 p-1.5">
                  <Button
                    type="button"
                    variant={img.is_primary ? "cta" : "ghost"}
                    size="sm"
                    onClick={() =>
                      setImages((prev) => prev.map((p, idx) => ({ ...p, is_primary: idx === i })))
                    }
                  >
                    <Star className="size-3.5" /> {img.is_primary ? "Copertina" : "Imposta"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="cta" size="lg" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} Salva
        </Button>
        {car && (
          <Button type="button" variant="destructive" size="lg" onClick={remove}>
            <Trash2 /> Elimina
          </Button>
        )}
      </div>
    </form>
  );
}

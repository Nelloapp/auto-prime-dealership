import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { History, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/StoredImage";
import { carsQuery, primaryImage } from "@/lib/cars";
import { CAR_STATUS_LABELS, carTitle, formatKm, formatPrice } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/auto/")({
  staticData: { sitemap: false },
  component: AdminCars,
});

function AdminCars() {
  const { data: cars, isLoading } = useQuery(carsQuery);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-black">Auto</h1>
        <Button asChild variant="cta">
          <Link to="/admin/auto/nuova">
            <Plus /> Nuova auto
          </Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}

      <div className="grid gap-3">
        {(cars ?? []).map((car) => (
          <Link
            key={car.id}
            to="/admin/auto/$id"
            params={{ id: car.id }}
            className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-card transition-shadow hover:shadow-elevated"
          >
            <StoredImage
              path={primaryImage(car)}
              alt={carTitle(car)}
              className="size-20 shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display font-extrabold">{carTitle(car)}</p>
              <p className="text-sm text-muted-foreground">
                {car.year} · {formatKm(car.km)} · {formatPrice(car.price)}
              </p>
            </div>
            <span
              className={
                car.status === "venduta"
                  ? "shrink-0 rounded-md bg-destructive px-3 py-1.5 font-display text-sm font-black uppercase tracking-wide text-destructive-foreground"
                  : "shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold"
              }
            >
              {CAR_STATUS_LABELS[car.status] ?? car.status}
            </span>
          </Link>
        ))}
        {!isLoading && (cars ?? []).length === 0 && (
          <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground shadow-card">
            Nessuna auto inserita. Aggiungi la prima!
          </p>
        )}
      </div>

      <HistorySection />
    </div>
  );
}

function HistorySection() {
  const qc = useQueryClient();
  const { data: history, isLoading } = useQuery({
    queryKey: ["cars-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars_history")
        .select("*")
        .order("deleted_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function removeEntry(id: string) {
    if (!confirm("Eliminare questa voce dallo storico?")) return;
    const { error } = await supabase.from("cars_history").delete().eq("id", id);
    if (error) {
      toast.error("Errore nell'eliminazione");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["cars-history"] });
    toast.success("Voce eliminata dallo storico");
  }

  return (
    <section className="space-y-3 border-t pt-5">
      <h2 className="flex items-center gap-2 font-display text-xl font-black">
        <History className="size-5" /> Storico auto eliminate
      </h2>
      <p className="text-sm text-muted-foreground">
        Le auto che elimini vengono salvate qui come promemoria (utili per ricordare le vendite passate).
      </p>

      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}

      <div className="grid gap-3">
        {(history ?? []).map((h) => {
          const snap = (h.snapshot ?? {}) as Record<string, unknown>;
          const images = Array.isArray(snap.car_images)
            ? (snap.car_images as { url: string; is_primary: boolean; position: number }[])
            : [];
          const img =
            [...images].sort(
              (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
            )[0]?.url ?? null;
          const statusLabel =
            h.status && CAR_STATUS_LABELS[h.status as keyof typeof CAR_STATUS_LABELS]
              ? CAR_STATUS_LABELS[h.status as keyof typeof CAR_STATUS_LABELS]
              : h.status;
          return (
            <div
              key={h.id}
              className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-card"
            >
              <StoredImage
                path={img}
                alt={`${h.brand} ${h.model}`}
                className="size-20 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-extrabold">
                  {h.brand} {h.model}
                  {h.version ? ` ${h.version}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">
                  {h.year ?? "—"} · {h.km != null ? formatKm(h.km) : "—"} ·{" "}
                  {h.price != null ? formatPrice(Number(h.price)) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Eliminata il {new Date(h.deleted_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={
                    h.status === "venduta"
                      ? "rounded-md bg-destructive px-3 py-1.5 font-display text-sm font-black uppercase tracking-wide text-destructive-foreground"
                      : "rounded-full bg-secondary px-3 py-1 text-xs font-bold"
                  }
                >
                  {statusLabel ?? "—"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(h.id)}
                  aria-label="Elimina dallo storico"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
        {!isLoading && (history ?? []).length === 0 && (
          <p className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">
            Nessuna auto nello storico.
          </p>
        )}
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/StoredImage";
import { carsQuery, primaryImage } from "@/lib/cars";
import { CAR_STATUS_LABELS, carTitle, formatKm, formatPrice } from "@/lib/site";

export const Route = createFileRoute("/admin/auto/")({
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
            <span className="shrink-0 rounded-full bg-secondary px-3 py-1 text-xs font-bold">
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
    </div>
  );
}

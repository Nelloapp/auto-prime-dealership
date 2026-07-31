import { Link } from "@tanstack/react-router";
import { Gauge, Calendar, Fuel, Cog } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { primaryImage, type CarWithImages } from "@/lib/cars";
import { FUEL_LABELS, GEARBOX_LABELS, carTitle, formatKm, formatPrice } from "@/lib/site";

function Badges({ car }: { car: CarWithImages }) {
  const isNew = Date.now() - new Date(car.created_at).getTime() < 1000 * 60 * 60 * 24 * 21;
  return (
    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
      {isNew && (
        <span className="rounded-full bg-highlight px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-highlight-foreground shadow">
          Nuovo arrivo
        </span>
      )}
      {car.previous_price && Number(car.previous_price) > Number(car.price) && (
        <span className="rounded-full bg-destructive px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-destructive-foreground shadow">
          Prezzo ribassato
        </span>
      )}
      {car.ready_delivery && (
        <span className="rounded-full bg-success px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-success-foreground shadow">
          Pronta consegna
        </span>
      )}
      {car.status === "venduta" && (
        <span className="rounded-full bg-foreground px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-background shadow">
          Venduta
        </span>
      )}
      {car.status === "riservata" && (
        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary-foreground shadow">
          Riservata
        </span>
      )}
      {car.status === "in_arrivo" && (
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground shadow">
          In arrivo
        </span>
      )}
    </div>
  );
}

export function CarCard({ car }: { car: CarWithImages }) {
  return (
    <Link
      to="/auto/$slug"
      params={{ slug: car.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-card shadow-card transition-transform hover:-translate-y-1 hover:shadow-pop"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <StoredImage
          path={primaryImage(car)}
          alt={carTitle(car)}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Badges car={car} />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-lg leading-tight font-extrabold">{carTitle(car)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {car.year} · {formatKm(car.km)}
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" /> {car.year}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="size-3.5" /> {formatKm(car.km)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Fuel className="size-3.5" /> {FUEL_LABELS[car.fuel]}
          </span>
          <span className="inline-flex items-center gap-1">
            <Cog className="size-3.5" /> {GEARBOX_LABELS[car.gearbox]}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {car.previous_price && Number(car.previous_price) > Number(car.price) && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(car.previous_price)}
              </div>
            )}
            <div className="font-display text-2xl font-black text-primary">
              {formatPrice(car.price)}
            </div>
          </div>
          <span className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-accent-foreground">
            Vedi auto
          </span>
        </div>
      </div>
    </Link>
  );
}

import { Link } from "@tanstack/react-router";
import { Car as CarIcon, MessageCircle } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { Button } from "@/components/ui/button";
import { primaryImage, useSettings, type CarWithImages } from "@/lib/cars";
import {
  FUEL_LABELS,
  GEARBOX_LABELS,
  carTitle,
  formatKm,
  formatPrice,
  whatsappHref,
} from "@/lib/site";

/** Badge "targa" con il prezzo al posto del numero. */
function PlatePrice({ price }: { price: number | string }) {
  return (
    <div className="absolute right-3 top-3 flex items-stretch overflow-hidden rounded-[4px] border-2 border-primary-deep bg-background shadow-card">
      <div className="flex w-6 items-center justify-center bg-primary">
        <CarIcon className="size-3.5 text-primary-foreground" />
      </div>
      <span className="px-2.5 py-1.5 font-mono text-sm font-bold tracking-tight text-primary-deep">
        {formatPrice(price)}
      </span>
    </div>
  );
}

function StatusBadges({ car }: { car: CarWithImages }) {
  const isNew = Date.now() - new Date(car.created_at).getTime() < 1000 * 60 * 60 * 24 * 21;
  const cut = car.previous_price && Number(car.previous_price) > Number(car.price);
  const chip =
    "rounded-[4px] px-2 py-1 font-display text-[11px] font-bold uppercase tracking-wide";
  return (
    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
      {isNew && (
        <span className={`${chip} bg-primary text-primary-foreground`}>Nuovo arrivo</span>
      )}
      {cut && (
        <span className={`${chip} bg-primary text-primary-foreground`}>Prezzo ribassato</span>
      )}
      {car.ready_delivery && car.status === "disponibile" && (
        <span className={`${chip} bg-success text-success-foreground`}>Disponibile</span>
      )}
      {car.status === "venduta" && (
        <span className={`${chip} bg-primary-deep text-primary-foreground`}>Venduta</span>
      )}
      {car.status === "riservata" && (
        <span className={`${chip} bg-primary-deep text-primary-foreground`}>Riservata</span>
      )}
      {car.status === "in_arrivo" && (
        <span className={`${chip} bg-secondary text-secondary-foreground`}>In arrivo</span>
      )}
    </div>
  );
}

export function CarCard({ car }: { car: CarWithImages }) {
  const { data: settings } = useSettings();
  const title = carTitle(car);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-transform duration-200 hover:-translate-y-1 hover:shadow-pop">
      <Link
        to="/auto/$slug"
        params={{ slug: car.slug }}
        className="relative block aspect-4/3 overflow-hidden"
        aria-label={title}
      >
        <StoredImage
          path={primaryImage(car)}
          alt={title}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <StatusBadges car={car} />
        <PlatePrice price={car.price} />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link to="/auto/$slug" params={{ slug: car.slug }}>
          <h3 className="font-display text-lg font-bold uppercase leading-tight text-primary-deep">
            {title}
          </h3>
        </Link>

        <p className="font-mono text-xs text-foreground">
          {car.year} · {formatKm(car.km)} · {FUEL_LABELS[car.fuel]} ·{" "}
          {GEARBOX_LABELS[car.gearbox]}
        </p>

        {car.previous_price && Number(car.previous_price) > Number(car.price) && (
          <p className="font-mono text-xs text-muted-foreground line-through">
            {formatPrice(car.previous_price)}
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Button asChild variant="cta" size="sm" className="h-11">
            <Link to="/auto/$slug" params={{ slug: car.slug }}>
              Prenota
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-11">
            <a
              href={whatsappHref(
                settings?.whatsapp ?? "393297897193",
                `Ciao Auto Prime, sono interessato a ${title}.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle /> WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}

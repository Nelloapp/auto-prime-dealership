import { useQuery } from "@tanstack/react-query";
import { Instagram } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { carsQuery, primaryImage, useSettings } from "@/lib/cars";

/**
 * Striscia in stile Instagram: le ultime auto arrivate come "post" quadrati.
 * Visibile solo quando è configurato il link Instagram in Admin → Impostazioni.
 */
export function InstagramStrip() {
  const { data: s } = useSettings();
  const ig = s?.social_instagram?.trim() || "";
  const { data: cars } = useQuery(carsQuery);

  if (!ig) return null;
  const handle = ig.replace(/\/+$/, "").split("/").pop() || "auto_prime";
  const shots = (cars ?? [])
    .filter((c) => c.status !== "venduta" && primaryImage(c))
    .slice(0, 6);
  if (shots.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16" aria-label="Seguici su Instagram">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-bold uppercase text-primary-deep sm:text-3xl">
          Seguici su Instagram
        </h2>
        <a
          href={ig}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-primary hover:underline"
        >
          <Instagram className="size-4" /> @{handle}
        </a>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {shots.map((car, i) => {
          const img = primaryImage(car);
          const title = [car.brand, car.model, car.version].filter(Boolean).join(" ");
          return (
            <a
              key={car.id}
              href={i === 0 ? ig : undefined}
              {...(i === 0 ? { target: "_blank", rel: "noreferrer" } : {})}
              className="group relative block aspect-square overflow-hidden rounded-lg border border-border bg-secondary shadow-card"
              aria-label={title}
            >
              <StoredImage
                path={img}
                alt={title}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <span className="font-display text-[11px] font-bold uppercase leading-tight text-white">
                  {title}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

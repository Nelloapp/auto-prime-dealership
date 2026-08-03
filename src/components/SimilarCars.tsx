import { useQuery } from "@tanstack/react-query";
import { CarCard } from "@/components/CarCard";
import { carsQuery, type CarWithImages } from "@/lib/cars";

/** Punteggio di somiglianza: stessa marca, prezzo vicino, stesso segmento tecnico. */
function score(base: CarWithImages, other: CarWithImages) {
  let s = 0;
  const price = Number(base.price);
  const diff = Math.abs(Number(other.price) - price) / Math.max(price, 1);
  s += Math.max(0, 40 - diff * 100);
  if (other.brand === base.brand) s += 25;
  if (other.fuel === base.fuel) s += 15;
  if (other.gearbox === base.gearbox) s += 10;
  s += Math.max(0, 10 - Math.abs(other.year - base.year) * 2);
  return s;
}

export function SimilarCars({ car }: { car: CarWithImages }) {
  const { data: cars } = useQuery(carsQuery);

  const similar = (cars ?? [])
    .filter((c) => c.id !== car.id && c.status !== "venduta")
    .map((c) => ({ c, s: score(car, c) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.c);

  if (similar.length === 0) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-black uppercase tracking-tight">Auto simili</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Altre proposte in linea con questa per prezzo e caratteristiche.
      </p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((c) => (
          <CarCard key={c.id} car={c} />
        ))}
      </div>
    </section>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { CarCard } from "@/components/CarCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { carsQuery } from "@/lib/cars";
import { FUEL_LABELS, GEARBOX_LABELS } from "@/lib/site";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Parco auto usate — Auto Prime Pompei" },
      {
        name: "description",
        content:
          "Sfoglia tutte le auto usate disponibili da Auto Prime a Pompei: filtra per marca, alimentazione, cambio, prezzo e chilometraggio.",
      },
      { property: "og:title", content: "Parco auto usate — Auto Prime Pompei" },
      {
        property: "og:description",
        content: "Tutte le auto usate disponibili da Auto Prime a Pompei.",
      },
    ],
  }),
  component: Catalogo,
});

const ANY = "tutte";

function Catalogo() {
  const { data: cars, isLoading } = useQuery(carsQuery);
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState(ANY);
  const [fuel, setFuel] = useState(ANY);
  const [gearbox, setGearbox] = useState(ANY);
  const [maxPrice, setMaxPrice] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [sort, setSort] = useState("recenti");
  const [showFilters, setShowFilters] = useState(false);

  const brands = useMemo(
    () => Array.from(new Set((cars ?? []).map((c) => c.brand))).sort(),
    [cars],
  );

  const results = useMemo(() => {
    let list = (cars ?? []).filter((c) => {
      const text = `${c.brand} ${c.model} ${c.version ?? ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (brand !== ANY && c.brand !== brand) return false;
      if (fuel !== ANY && c.fuel !== fuel) return false;
      if (gearbox !== ANY && c.gearbox !== gearbox) return false;
      if (maxPrice && Number(c.price) > Number(maxPrice)) return false;
      if (maxKm && c.km > Number(maxKm)) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "prezzo-asc") return Number(a.price) - Number(b.price);
      if (sort === "prezzo-desc") return Number(b.price) - Number(a.price);
      if (sort === "km-asc") return a.km - b.km;
      if (sort === "anno-desc") return b.year - a.year;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list.sort((a, b) => Number(a.status === "venduta") - Number(b.status === "venduta"));
  }, [cars, q, brand, fuel, gearbox, maxPrice, maxKm, sort]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-black sm:text-4xl">Parco auto</h1>
      <p className="mt-1 text-muted-foreground">
        {isLoading ? "Caricamento..." : `${results.length} auto disponibili`}
      </p>

      <div className="mt-6 space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca marca o modello"
              className="h-12 pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="lg"
            className="shrink-0"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal /> Filtri
          </Button>
        </div>

        {showFilters && (
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label className="mb-1 block text-xs">Marca</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Tutte le marche</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Alimentazione</Label>
              <Select value={fuel} onValueChange={setFuel}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Tutte</SelectItem>
                  {Object.entries(FUEL_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Cambio</Label>
              <Select value={gearbox} onValueChange={setGearbox}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Tutti</SelectItem>
                  {Object.entries(GEARBOX_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Prezzo massimo (€)</Label>
              <Input
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                className="h-11"
                placeholder="es. 15000"
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Km massimi</Label>
              <Input
                inputMode="numeric"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value.replace(/\D/g, ""))}
                className="h-11"
                placeholder="es. 120000"
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Ordina per</Label>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recenti">Più recenti</SelectItem>
                  <SelectItem value="prezzo-asc">Prezzo crescente</SelectItem>
                  <SelectItem value="prezzo-desc">Prezzo decrescente</SelectItem>
                  <SelectItem value="km-asc">Km crescenti</SelectItem>
                  <SelectItem value="anno-desc">Anno più recente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {results.length === 0 && !isLoading ? (
        <p className="mt-10 rounded-2xl bg-card p-10 text-center text-muted-foreground shadow-card">
          Nessuna auto corrisponde ai filtri selezionati.
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </main>
  );
}

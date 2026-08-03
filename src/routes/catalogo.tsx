import { useMemo } from "react";
import { createFileRoute, stripSearchParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
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
import { FUEL_LABELS, GEARBOX_LABELS, formatPrice } from "@/lib/site";

const ANY = "tutte";

type CatalogSearch = {
  q: string;
  brand: string;
  fuel: string;
  gearbox: string;
  maxPrice: string;
  maxKm: string;
  sort: string;
  pronta: boolean;
  filtri: boolean;
};

const DEFAULTS: CatalogSearch = {
  q: "",
  brand: ANY,
  fuel: ANY,
  gearbox: ANY,
  maxPrice: "",
  maxKm: "",
  sort: "recenti",
  pronta: false,
  filtri: false,
};

const str = (v: unknown, fallback: string) =>
  typeof v === "string" ? v.slice(0, 60) : fallback;

export const Route = createFileRoute("/catalogo")({
  validateSearch: (search: Record<string, unknown>): CatalogSearch => ({
    q: str(search["q"], DEFAULTS.q),
    brand: str(search["brand"], DEFAULTS.brand),
    fuel: str(search["fuel"], DEFAULTS.fuel),
    gearbox: str(search["gearbox"], DEFAULTS.gearbox),
    maxPrice: str(search["maxPrice"], DEFAULTS.maxPrice).replace(/\D/g, ""),
    maxKm: str(search["maxKm"], DEFAULTS.maxKm).replace(/\D/g, ""),
    sort: str(search["sort"], DEFAULTS.sort),
    pronta: search["pronta"] === true || search["pronta"] === "true",
    filtri: search["filtri"] === true || search["filtri"] === "true",
  }),
  search: { middlewares: [stripSearchParams(DEFAULTS)] },
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
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-black">Errore nel caricamento</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </main>
  ),
});

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg border px-3 py-2 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:border-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Catalogo() {
  const { data: cars, isLoading } = useQuery(carsQuery);
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogo" });

  const set = (patch: Partial<CatalogSearch>) =>
    navigate({ search: (prev: CatalogSearch) => ({ ...prev, ...patch }), replace: true });

  const { q, brand, fuel, gearbox, maxPrice, maxKm, sort, pronta, filtri } = search;

  const brands = useMemo(
    () => Array.from(new Set((cars ?? []).map((c) => c.brand))).sort(),
    [cars],
  );

  const activeCount = [
    q !== "",
    brand !== ANY,
    fuel !== ANY,
    gearbox !== ANY,
    maxPrice !== "",
    maxKm !== "",
    pronta,
  ].filter(Boolean).length;

  const results = useMemo(() => {
    let list = (cars ?? []).filter((c) => {
      const text = `${c.brand} ${c.model} ${c.version ?? ""}`.toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (brand !== ANY && c.brand !== brand) return false;
      if (fuel !== ANY && c.fuel !== fuel) return false;
      if (gearbox !== ANY && c.gearbox !== gearbox) return false;
      if (maxPrice && Number(c.price) > Number(maxPrice)) return false;
      if (maxKm && c.km > Number(maxKm)) return false;
      if (pronta && !(c.ready_delivery && c.status === "disponibile")) return false;
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
  }, [cars, q, brand, fuel, gearbox, maxPrice, maxKm, sort, pronta]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-black uppercase sm:text-4xl">Parco auto</h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {isLoading ? "Caricamento..." : `${results.length} auto trovate`}
      </p>

      <div className="mt-6 space-y-3 rounded-2xl bg-card p-4 shadow-card">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => set({ q: e.target.value })}
              placeholder="Cerca marca o modello"
              className="h-12 pl-9"
            />
          </div>
          <Button
            variant={filtri ? "cta" : "outline"}
            size="lg"
            className="shrink-0"
            onClick={() => set({ filtri: !filtri })}
          >
            <SlidersHorizontal /> Filtri
            {activeCount > 0 && (
              <span className="ml-1 rounded-full bg-primary-deep px-1.5 font-mono text-[11px] text-primary-foreground">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <Chip active={pronta} onClick={() => set({ pronta: !pronta })}>
            Pronta consegna
          </Chip>
          <Chip
            active={maxPrice === "10000"}
            onClick={() => set({ maxPrice: maxPrice === "10000" ? "" : "10000" })}
          >
            Fino a {formatPrice(10000)}
          </Chip>
          <Chip
            active={maxPrice === "15000"}
            onClick={() => set({ maxPrice: maxPrice === "15000" ? "" : "15000" })}
          >
            Fino a {formatPrice(15000)}
          </Chip>
          <Chip
            active={maxKm === "100000"}
            onClick={() => set({ maxKm: maxKm === "100000" ? "" : "100000" })}
          >
            Meno di 100.000 km
          </Chip>
          <Chip
            active={gearbox === "automatico"}
            onClick={() => set({ gearbox: gearbox === "automatico" ? ANY : "automatico" })}
          >
            Automatico
          </Chip>
          <Chip
            active={fuel === "diesel"}
            onClick={() => set({ fuel: fuel === "diesel" ? ANY : "diesel" })}
          >
            Diesel
          </Chip>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => set({ ...DEFAULTS, filtri, sort })}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 font-display text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-primary"
            >
              <X className="size-3.5" /> Azzera
            </button>
          )}
        </div>

        {filtri && (
          <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label className="mb-1 block text-xs">Marca</Label>
              <Select value={brand} onValueChange={(v) => set({ brand: v })}>
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
              <Select value={fuel} onValueChange={(v) => set({ fuel: v })}>
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
              <Select value={gearbox} onValueChange={(v) => set({ gearbox: v })}>
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
                onChange={(e) => set({ maxPrice: e.target.value.replace(/\D/g, "") })}
                className="h-11"
                placeholder="es. 15000"
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Km massimi</Label>
              <Input
                inputMode="numeric"
                value={maxKm}
                onChange={(e) => set({ maxKm: e.target.value.replace(/\D/g, "") })}
                className="h-11"
                placeholder="es. 120000"
              />
            </div>
            <div>
              <Label className="mb-1 block text-xs">Ordina per</Label>
              <Select value={sort} onValueChange={(v) => set({ sort: v })}>
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
        <div className="mt-10 rounded-2xl bg-card p-10 text-center shadow-card">
          <p className="text-muted-foreground">Nessuna auto corrisponde ai filtri selezionati.</p>
          <Button
            variant="cta"
            size="lg"
            className="mt-5"
            onClick={() => set({ ...DEFAULTS, filtri, sort })}
          >
            Azzera i filtri
          </Button>
        </div>
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

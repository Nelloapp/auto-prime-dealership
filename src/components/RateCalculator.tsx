import { useEffect, useMemo, useState } from "react";
import { Calculator, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/lib/cars";
import { formatPrice, monthlyPayment, whatsappHref } from "@/lib/site";
import { useFinance } from "@/lib/theme";

export function RateCalculator({
  price,
  carLabel,
  carUrl,
}: {
  price: number;
  carLabel: string;
  carUrl: string;
}) {
  const { data: settings } = useSettings();
  const finance = useFinance();
  const maxDown = Math.round((price * finance.downMaxPct) / 100);
  const [down, setDown] = useState(() => Math.round((price * finance.downDefaultPct) / 100));
  const [months, setMonths] = useState(finance.defaultTerm);

  useEffect(() => {
    setDown(Math.round((price * finance.downDefaultPct) / 100));
    setMonths(finance.defaultTerm);
  }, [price, finance.downDefaultPct, finance.defaultTerm]);

  const rate = useMemo(
    () => monthlyPayment(Math.max(price - down, 0), finance.tan, months),
    [price, down, months, finance.tan],
  );

  if (!finance.enabled) return null;

  const tanLabel = String(finance.tan).replace(".", ",");
  const waText = [
    `Ciao Auto Prime, vorrei un preventivo finanziamento per:`,
    `${carLabel} — ${formatPrice(price)}`,
    `Anticipo: ${formatPrice(down)} · Durata: ${months} mesi`,
    `Rata indicativa: ${formatPrice(Math.round(rate))}/mese`,
    carUrl,
  ].join("\n");

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold uppercase">
        <Calculator className="size-5 text-primary" /> {finance.title}
      </h2>

      <div className="mt-4 space-y-5">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Anticipo</span>
            <span className="font-mono text-sm font-bold">{formatPrice(down)}</span>
          </div>
          <Slider
            className="mt-3"
            value={[Math.min(down, maxDown)]}
            min={0}
            max={Math.max(maxDown, 500)}
            step={500}
            onValueChange={(v) => setDown(v[0] ?? 0)}
            aria-label="Anticipo"
          />
        </div>

        <div>
          <span className="text-sm font-semibold text-muted-foreground">Durata</span>
          <div
            className="mt-2 grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${Math.min(finance.terms.length, 5)}, minmax(0,1fr))` }}
          >
            {finance.terms.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                aria-pressed={months === m}
                className={`h-10 rounded-lg border font-mono text-xs font-bold transition-colors ${
                  months === m
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border-l-4 border-primary bg-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Rata indicativa
          </p>
          <p className="font-mono text-3xl font-bold text-primary">
            {formatPrice(Math.round(rate))}
            <span className="text-base text-muted-foreground">/mese</span>
          </p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {months} mesi · TAN {tanLabel}% · anticipo {formatPrice(down)}
          </p>
        </div>

        <Button asChild variant="whatsapp" size="lg" className="w-full">
          <a
            href={whatsappHref(settings?.whatsapp ?? "393297897193", waText)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle /> Chiedi questo finanziamento
          </a>
        </Button>

        <p className="text-xs text-muted-foreground">
          {finance.disclaimer.trim() ||
            `Preventivo indicativo calcolato con TAN ${tanLabel}%: non è un'offerta contrattuale. Il piano definitivo è soggetto ad approvazione della finanziaria.`}
        </p>
      </div>
    </div>
  );
}

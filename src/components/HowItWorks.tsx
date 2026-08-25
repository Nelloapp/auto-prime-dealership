import { Link } from "@tanstack/react-router";
import { CalendarCheck, Car, HandCoins, Search } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useSettings } from "@/lib/cars";
import { DEFAULT_STEPS, parseBlocks } from "@/lib/theme";

const ICONS = [Search, CalendarCheck, HandCoins, Car];

/** Sezione "Come funziona" — passi editabili dal pannello admin. */
export function HowItWorks() {
  const { data: s } = useSettings();
  const steps = parseBlocks(s?.how_steps, DEFAULT_STEPS);

  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold uppercase text-primary-deep sm:text-3xl">
          Come funziona
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Passi semplici, nessuna sorpresa: dal primo contatto alla consegna.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ title, text }, i) => {
            const Icon = ICONS[i % ICONS.length]!;
            return (
              <li key={title} className="relative rounded-xl border border-border bg-card p-6">
                <span className="absolute right-4 top-4 font-mono text-3xl font-bold text-border">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Icon className="size-8 text-primary" />
                <h3 className="mt-3 font-display text-lg font-bold uppercase text-primary-deep">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-6">
          <Link
            to="/catalogo" search={{}}
            className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
          >
            Inizia dal parco auto <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

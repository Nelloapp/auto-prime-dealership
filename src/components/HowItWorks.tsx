import { Link } from "@tanstack/react-router";
import { CalendarCheck, Car, HandCoins, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Scegli l'auto",
    text: "Sfoglia il parco auto con foto reali, scheda tecnica completa e prezzo chiaro.",
  },
  {
    icon: CalendarCheck,
    title: "Prenota la prova",
    text: "Fissa un appuntamento in salone in pochi secondi, oppure scrivici su WhatsApp.",
  },
  {
    icon: HandCoins,
    title: "Permuta e pagamento",
    text: "Valutiamo il tuo usato e troviamo insieme la formula di pagamento o la rata giusta.",
  },
  {
    icon: Car,
    title: "Ritiri e vai",
    text: "Ci occupiamo noi del passaggio di proprietà: tu ritiri l'auto pronta.",
  },
];

/** Sezione "Come funziona" — 4 passi dal primo contatto alla consegna. */
export function HowItWorks() {
  return (
    <section className="bg-secondary">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-bold uppercase text-primary-deep sm:text-3xl">
          Come funziona
        </h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Quattro passi semplici, nessuna sorpresa: dal primo contatto alla consegna.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-xl border border-border bg-card p-6">
              <span className="absolute right-4 top-4 font-mono text-3xl font-bold text-border">
                0{i + 1}
              </span>
              <Icon className="size-8 text-primary" />
              <h3 className="mt-3 font-display text-lg font-bold uppercase text-primary-deep">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <Link
            to="/catalogo"
            className="font-display text-sm font-bold uppercase tracking-wide text-primary hover:underline"
          >
            Inizia dal parco auto →
          </Link>
        </div>
      </div>
    </section>
  );
}

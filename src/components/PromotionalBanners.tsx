import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const promotions = [
  {
    eyebrow: "Valuta il tuo usato",
    title: "Dai valore alla tua prossima auto",
    text: "Invia i dati della tua vettura e richiedi una valutazione senza impegno.",
    action: "Richiedi valutazione",
    to: "/permuta" as const,
    icon: RefreshCw,
  },
  {
    eyebrow: "Provala su strada",
    title: "Scegli l’auto, al resto pensiamo noi",
    text: "Consulta le auto disponibili e prenota un appuntamento dalla scheda del veicolo.",
    action: "Scegli la tua auto",
    to: "/catalogo" as const,
    icon: CalendarCheck,
  },
];

export function PromotionalBanners() {
  return (
    <section className="bg-background" aria-label="Servizi Auto Prime">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 md:grid-cols-2">
        {promotions.map(({ eyebrow, title, text, action, to, icon: Icon }, index) => (
          <article
            key={title}
            className="promo-panel group relative isolate overflow-hidden rounded-xl bg-primary-deep p-6 shadow-card sm:p-8"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="track-stripes pointer-events-none absolute inset-0 -z-10" aria-hidden />
            <Icon className="mb-5 size-8 text-primary transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110" />
            <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-primary-foreground/70">
              {eyebrow}
            </p>
            <h2 className="mt-2 max-w-md font-display text-2xl font-bold uppercase leading-tight text-primary-foreground">
              {title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-primary-foreground/75">{text}</p>
            <Button asChild variant="cta" className="mt-6">
              <Link to={to} search={to === "/catalogo" ? {} : undefined}>
                {action} <ArrowRight className="transition-transform duration-200 group-hover/cta:translate-x-1" />
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
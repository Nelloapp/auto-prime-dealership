import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Handshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/cars";

export const Route = createFileRoute("/chi-siamo")({
  head: () => ({
    meta: [
      { title: "Chi siamo — Auto Prime, concessionaria a Pompei" },
      {
        name: "description",
        content:
          "Auto Prime di Enrico Auricchio: esperienza, trasparenza e assistenza nella vendita di auto usate a Pompei e in provincia di Napoli.",
      },
      { property: "og:title", content: "Chi siamo — Auto Prime, concessionaria a Pompei" },
      {
        property: "og:description",
        content: "La storia e i valori di Auto Prime, concessionaria di auto usate a Pompei.",
      },
    ],
  }),
  component: ChiSiamo,
});

const VALUES = [
  {
    icon: BadgeCheck,
    title: "Trasparenza",
    text: "Prezzi chiari, storia del veicolo verificabile e nessun costo nascosto.",
  },
  {
    icon: Sparkles,
    title: "Selezione",
    text: "Scegliamo poche auto ma buone: controllate, tagliandate e pronte all'uso.",
  },
  {
    icon: Handshake,
    title: "Rapporto diretto",
    text: "Parli sempre con noi, prima e dopo l'acquisto. Nessun call center.",
  },
];

function ChiSiamo() {
  const { data: s } = useSettings();

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-hero track-stripes py-16 text-primary-foreground">
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-accent" />
        <div className="mx-auto max-w-4xl px-4">
          <div className="hero-rise">
            <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
              Chi siamo
            </h1>
            <p className="mt-3 max-w-xl text-lg text-primary-foreground/80">
              {s?.company_name ?? "Auto Prime"} — concessionaria di auto usate a Pompei, dal 2024.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="relative rounded-2xl border-l-8 border-primary bg-card p-8 shadow-card sm:p-10">
          <div className="absolute -left-1 top-0 h-full w-1 bg-gradient-accent" />
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            {s?.about_text ? (
              <p className="whitespace-pre-line text-xl font-medium text-foreground">
                {s.about_text}
              </p>
            ) : (
              <>
                <p className="text-xl font-medium text-foreground">
                  <strong className="text-primary">{s?.company_name ?? "Auto Prime"}</strong> è
                  la concessionaria di {s?.owner_name ?? "Enrico Auricchio"} a Pompei: un punto di
                  riferimento per chi cerca un'auto usata affidabile senza sorprese.
                </p>
                <p>
                  Ogni vettura del nostro parco viene selezionata a mano, controllata in officina e
                  messa in vendita solo quando è davvero pronta. Ti seguiamo passo passo: dalla prova
                  su strada al passaggio di proprietà, dalla permuta del tuo usato fino
                  all'assistenza dopo l'acquisto.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-card p-6 shadow-card transition-transform hover:-translate-y-1"
            >
              <Icon className="size-8 text-primary" />
              <h2 className="mt-3 font-display text-lg font-extrabold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="cta" size="xl">
            <Link to="/catalogo" search={{}}>Scopri le auto disponibili</Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link to="/contatti">Contattaci</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

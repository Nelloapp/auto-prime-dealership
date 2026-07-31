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
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-black sm:text-4xl">Chi siamo</h1>
      <div className="mt-4 space-y-4 text-lg leading-relaxed text-muted-foreground">
        {s?.about_text ? (
          <p className="whitespace-pre-line">{s.about_text}</p>
        ) : (
          <>
            <p>
              <strong className="text-foreground">{s?.company_name ?? "Auto Prime"}</strong> è la
              concessionaria di {s?.owner_name ?? "Enrico Auricchio"} a Pompei: un punto di
              riferimento per chi cerca un'auto usata affidabile senza sorprese.
            </p>
            <p>
              Ogni vettura del nostro parco viene selezionata a mano, controllata in officina e
              messa in vendita solo quando è davvero pronta. Ti seguiamo passo passo: dalla prova su
              strada al passaggio di proprietà, dalla permuta del tuo usato fino all'assistenza
              dopo l'acquisto.
            </p>
          </>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-card p-6 shadow-card">
            <Icon className="size-8 text-accent" />
            <h2 className="mt-3 font-display text-lg font-extrabold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="cta" size="xl">
          <Link to="/catalogo">Scopri le auto disponibili</Link>
        </Button>
        <Button asChild variant="outline" size="xl">
          <Link to="/contatti">Contattaci</Link>
        </Button>
      </div>
    </main>
  );
}

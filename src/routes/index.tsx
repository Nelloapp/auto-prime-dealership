import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, HandCoins, Wrench, ArrowRight, Phone, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-autoprime.jpg";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/CarCard";
import { carsQuery, useSettings } from "@/lib/cars";
import { telHref, whatsappHref } from "@/lib/site";
import { useHeroImage } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auto Prime Pompei — Auto usate selezionate" },
      {
        name: "description",
        content:
          "Auto usate selezionate a Pompei (NA). Prezzi chiari, permuta valutata subito, assistenza dedicata. Scopri il nostro parco auto.",
      },
      { property: "og:title", content: "Auto Prime Pompei — Auto usate selezionate" },
      {
        property: "og:description",
        content: "Auto usate selezionate a Pompei. Scopri il parco auto Auto Prime.",
      },
    ],
  }),
  component: Home,
});

const PLUSES = [
  {
    icon: ShieldCheck,
    title: "Auto controllate",
    text: "Ogni vettura passa un check tecnico completo prima di entrare in vendita.",
  },
  {
    icon: HandCoins,
    title: "Permuta e finanziamenti",
    text: "Valutiamo il tuo usato in giornata e troviamo la formula di pagamento giusta.",
  },
  {
    icon: Wrench,
    title: "Assistenza post-vendita",
    text: "Supporto diretto anche dopo l'acquisto.",
  },
];

function Home() {
  const { data: settings } = useSettings();
  const { data: cars } = useQuery(carsQuery);
  const customHero = useHeroImage();
  const featured = (cars ?? []).filter((c) => c.status !== "venduta").slice(0, 6);

  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <img
          src={customHero ?? heroImg}
          alt="Piazzale Auto Prime con auto usate in vendita"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-deep/95 via-primary-deep/85 to-primary/35" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">
            Pompei · Napoli
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-black leading-tight text-primary-foreground sm:text-6xl">
            L'auto giusta, al prezzo giusto.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/85">
            Usato selezionato e controllato. Vieni a provarlo o prenota un appuntamento
            in pochi secondi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="cta" size="xl">
              <Link to="/catalogo">
                Vedi il parco auto <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="onDark" size="xl">
              <Link to="/permuta">Valuta la tua auto</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {PLUSES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl bg-card p-6 shadow-card">
              <Icon className="size-8 text-accent" />
              <h2 className="mt-3 font-display text-lg font-extrabold">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-black sm:text-3xl">Ultimi arrivi</h2>
          <Link to="/catalogo" className="text-sm font-bold text-primary hover:underline">
            Vedi tutte
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground shadow-card">
            Nuove auto in arrivo. Contattaci per sapere cosa abbiamo disponibile.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-gradient-hero border-y border-primary/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-display text-2xl font-black text-primary-foreground sm:text-3xl">
            Hai una domanda su un'auto?
          </h2>
          <p className="max-w-lg text-primary-foreground/80">
            Scrivici su WhatsApp o chiamaci: ti rispondiamo subito negli orari di apertura.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="whatsapp" size="lg">
              <a
                href={whatsappHref(
                  settings?.whatsapp ?? "393297897193",
                  "Ciao Auto Prime, vorrei informazioni su un'auto.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle /> Scrivi su WhatsApp
              </a>
            </Button>
            <Button asChild variant="onDark" size="lg">
              <a href={telHref(settings?.phone ?? "329 789 7193")}>
                <Phone /> Chiama ora
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

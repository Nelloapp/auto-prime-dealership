import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, HandCoins, Wrench, ArrowRight, Phone, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero-autoprime.jpg";
import { Button } from "@/components/ui/button";
import { CarCard } from "@/components/CarCard";
import { HowItWorks } from "@/components/HowItWorks";
import { OpenStatus } from "@/components/OpenStatus";
import { Reviews } from "@/components/Reviews";
import { carsQuery, useSettings } from "@/lib/cars";
import { telHref, whatsappHref } from "@/lib/site";
import { DEFAULT_PLUSES, parseBlocks, useHeroImage, useSiteLogo } from "@/lib/theme";

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

const PLUS_ICONS = [ShieldCheck, HandCoins, Wrench];

function Home() {
  const { data: settings } = useSettings();
  const { data: cars } = useQuery(carsQuery);
  const customHero = useHeroImage();
  const heroLogo = useSiteLogo("hero");
  const pluses = parseBlocks(settings?.pluses, DEFAULT_PLUSES);
  const featured = (cars ?? []).filter((c) => c.status !== "venduta").slice(0, 6);


  return (
    <main>
      <section className="relative isolate overflow-hidden bg-primary-deep track-stripes">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <img
            src={customHero ?? heroImg}
            alt="Piazzale Auto Prime con auto usate in vendita"
            width={1920}
            height={1088}
            className="size-full object-cover [clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/40 to-transparent" />
        </div>

        <div className="hero-rise relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          {settings?.hero_show_logo && (
            <img
              src={heroLogo.url}
              alt={`${settings?.company_name ?? "Auto Prime"} logo`}
              className="mb-6 w-auto max-w-full object-contain"
              style={{ height: heroLogo.height }}
            />
          )}
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
            {settings?.hero_eyebrow ?? "Pompei · Napoli"}
          </p>
          <h1 className="mt-4 max-w-xl whitespace-pre-line font-display text-5xl font-bold uppercase leading-[0.95] text-primary-foreground sm:text-7xl">
            {settings?.hero_title?.trim() || "Auto di qualità.\nPrezzi onesti."}
          </h1>

          {/* striscia livrea allineata al CTA */}
          <div className="mt-8 h-1 w-40 bg-primary" />

          <p className="mt-6 max-w-md text-base text-primary-foreground/75">
            {settings?.hero_subtitle?.trim() ||
              "Usato selezionato e controllato. Vieni a provarlo o prenota un appuntamento in pochi secondi."}
          </p>

          <div className="mt-6">
            <OpenStatus className="border-white/15 bg-white/10 text-primary-foreground" />
          </div>

          <div className="mt-6">
            <Button asChild variant="cta" size="xl">
              <Link to="/catalogo" search={(prev) => prev}>
                {settings?.hero_cta_label?.trim() || "Vedi il parco auto"} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>

        <div className="relative lg:hidden">
          <img
            src={customHero ?? heroImg}
            alt=""
            aria-hidden
            className="h-48 w-full object-cover [clip-path:polygon(0_18%,100%_0,100%_100%,0_100%)]"
          />
        </div>
      </section>

      {settings?.show_pluses !== false && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {pluses.map(({ title, text }, i) => {
              const Icon = PLUS_ICONS[i % PLUS_ICONS.length]!;
              return (
                <div key={title} className="rounded-xl border border-border bg-secondary p-6">
                  <Icon className="size-8 text-primary" />
                  <h2 className="mt-3 font-display text-lg font-bold uppercase text-primary-deep">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {settings?.show_featured !== false && (
        <section className="bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-bold uppercase text-primary-deep sm:text-3xl">
                {settings?.featured_title?.trim() || "Ultimi arrivi"}
              </h2>
              <Link to="/catalogo" search={(prev) => prev} className="text-sm font-semibold text-primary hover:underline">
                Vedi tutte
              </Link>
            </div>
            {featured.length === 0 ? (
              <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
                Nuove auto in arrivo. Contattaci per sapere cosa abbiamo disponibile.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {settings?.show_how_it_works !== false && <HowItWorks />}

      {settings?.show_reviews !== false && <Reviews />}


      <section className="bg-primary-deep track-stripes">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-display text-2xl font-bold uppercase text-primary-foreground sm:text-3xl">
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

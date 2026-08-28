import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  Cog,
  Fuel,
  Gauge,
  MessageCircle,
  Palette,
  Phone,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import { CarGallery } from "@/components/CarGallery";
import { BookingDialog } from "@/components/BookingDialog";
import { ContactForm } from "@/components/ContactForm";
import { RateCalculator } from "@/components/RateCalculator";
import { SimilarCars } from "@/components/SimilarCars";
import { StickyActions } from "@/components/StickyActions";
import { Button } from "@/components/ui/button";
import { carQuery, sortedImages, useSettings } from "@/lib/cars";
import {
  CAR_STATUS_LABELS,
  FUEL_LABELS,
  GEARBOX_LABELS,
  absoluteUrl,
  carTitle,
  carWhatsappMessage,
  formatKm,
  formatPrice,
  telHref,
  whatsappHref,
} from "@/lib/site";

export const Route = createFileRoute("/auto/$slug")({
  head: () => ({
    meta: [
      { title: "Dettaglio auto — Auto Prime Pompei" },
      {
        name: "description",
        content:
          "Scheda tecnica completa, foto e prenotazione appuntamento per questa auto usata disponibile da Auto Prime a Pompei.",
      },
      { property: "og:title", content: "Dettaglio auto — Auto Prime Pompei" },
      {
        property: "og:description",
        content: "Foto, scheda tecnica e prenotazione appuntamento da Auto Prime.",
      },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(carQuery(params.slug)),
  component: CarDetail,
  notFoundComponent: () => (
    <main className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-black">Auto non trovata</h1>
      <p className="mt-2 text-muted-foreground">
        Questo annuncio non è più disponibile o è stato rimosso.
      </p>
      <Button asChild variant="cta" size="lg" className="mt-6">
        <Link to="/catalogo" search={{}}>Torna al parco auto</Link>
      </Button>
    </main>
  ),
});

function Spec({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 font-display text-base font-extrabold">{value}</p>
    </div>
  );
}

function CarDetail() {
  const { slug } = Route.useParams();
  const { data: car, isLoading } = useQuery(carQuery(slug));
  const { data: settings } = useSettings();

  if (isLoading) {
    return <main className="mx-auto max-w-6xl px-4 py-20 text-muted-foreground">Caricamento…</main>;
  }
  if (!car) throw notFound();

  const title = carTitle(car);
  const images = sortedImages(car).map((i) => i.url);
  const discounted = car.previous_price && Number(car.previous_price) > Number(car.price);
  const waMessage = carWhatsappMessage(car);
  const carUrl = absoluteUrl(`/auto/${car.slug}`);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        to="/catalogo" search={{}}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Torna al parco auto
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <CarGallery paths={images} alt={title} />
          {car.description && (
            <div className="mt-6 rounded-2xl bg-card p-5 shadow-card">
              <h2 className="font-display text-xl font-extrabold">Descrizione</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{car.description}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wide text-accent">
              {CAR_STATUS_LABELS[car.status] ?? car.status}
            </p>
            <h1 className="mt-1 font-display text-2xl font-black leading-tight sm:text-3xl">
              {title}
            </h1>
            <div className="mt-3 flex items-end gap-3">
              <span className="font-display text-3xl font-black text-primary">
                {formatPrice(car.price)}
              </span>
              {discounted && (
                <span className="pb-1 text-lg text-muted-foreground line-through">
                  {formatPrice(car.previous_price)}
                </span>
              )}
            </div>
            {car.ready_delivery && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-xs font-bold text-highlight-foreground">
                <Zap className="size-3.5" /> Pronta consegna
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Spec icon={Calendar} label="Anno" value={String(car.year)} />
              <Spec icon={Gauge} label="Km" value={formatKm(car.km)} />
              <Spec icon={Fuel} label="Alimentazione" value={FUEL_LABELS[car.fuel] ?? car.fuel} />
              <Spec
                icon={Cog}
                label="Cambio"
                value={GEARBOX_LABELS[car.gearbox] ?? car.gearbox}
              />
              {car.power_hp && <Spec icon={Zap} label="Potenza" value={`${car.power_hp} CV`} />}
              {car.engine_size && (
                <Spec icon={Cog} label="Cilindrata" value={`${car.engine_size} cc`} />
              )}
              {car.color && <Spec icon={Palette} label="Colore" value={car.color} />}
              {car.owners != null && (
                <Spec icon={Users} label="Proprietari" value={String(car.owners)} />
              )}
              {car.inspection_until && (
                <Spec icon={ShieldCheck} label="Revisione" value={car.inspection_until} />
              )}
              {car.warranty && <Spec icon={ShieldCheck} label="Garanzia" value={car.warranty} />}
            </div>

            <div className="mt-5 space-y-2">
              <BookingDialog carId={car.id} carLabel={title} />
              <Button asChild variant="whatsapp" size="lg" className="w-full">
                <a
                  href={whatsappHref(settings?.whatsapp ?? "393297897193", waMessage)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle /> Chiedi info su WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href={telHref(settings?.phone ?? "329 789 7193")}>
                  <Phone /> Chiama {settings?.phone ?? "329 789 7193"}
                </a>
              </Button>
            </div>
          </div>

          <RateCalculator price={Number(car.price)} carLabel={title} carUrl={carUrl} />

          <ContactForm carId={car.id} title="Richiedi informazioni" />
        </div>
      </div>
      <SimilarCars car={car} />

      <StickyActions
        waMessage={waMessage}
        extra={
          <BookingDialog
            carId={car.id}
            carLabel={title}
            trigger={
              <button
                type="button"
                className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-primary-deep px-2 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground"
              >
                <CalendarCheck className="size-4" /> Prenota
              </button>
            }
          />
        }
      />
    </main>
  );
}

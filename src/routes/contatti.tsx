import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { OpenStatus } from "@/components/OpenStatus";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/cars";
import { mapEmbedSrc, mapsHref, telHref, whatsappHref } from "@/lib/site";

export const Route = createFileRoute("/contatti")({
  head: () => ({
    meta: [
      { title: "Contatti e dove siamo — Auto Prime Pompei" },
      {
        name: "description",
        content:
          "Auto Prime, Traversa Andolfi 11, Pompei (NA). Telefono, WhatsApp, orari di apertura e mappa per raggiungerci.",
      },
      { property: "og:title", content: "Contatti e dove siamo — Auto Prime Pompei" },
      {
        property: "og:description",
        content: "Indirizzo, telefono, WhatsApp e orari di Auto Prime a Pompei.",
      },
    ],
  }),
  component: Contatti,
});

function Contatti() {
  const { data: s } = useSettings();
  const phone = s?.phone ?? "329 789 7193";
  const address = s?.address ?? "Traversa Andolfi 11, 80045 Pompei (NA)";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl font-black sm:text-4xl">Contatti</h1>
      <p className="mt-2 text-muted-foreground">
        Passa a trovarci in salone oppure scrivici: rispondiamo in giornata.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
            <div className="flex gap-3">
              <MapPin className="size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">Indirizzo</p>
                <a href={mapsHref(address)} target="_blank" rel="noreferrer" className="text-muted-foreground hover:underline">
                  {address}
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">Telefono</p>
                <a href={telHref(phone)} className="text-muted-foreground hover:underline">
                  {phone}
                </a>
              </div>
            </div>
            {s?.email && (
              <div className="flex gap-3">
                <Mail className="size-5 shrink-0 text-accent" />
                <div>
                  <p className="font-semibold">Email</p>
                  <a href={`mailto:${s.email}`} className="text-muted-foreground hover:underline">
                    {s.email}
                  </a>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Clock className="size-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">Orari</p>
                <p className="text-muted-foreground">
                  {s?.opening_hours ?? "Lun-Sab 9:00-13:00 / 15:00-19:30"}
                </p>
                <OpenStatus className="mt-2" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="whatsapp" size="lg">
                <a
                  href={whatsappHref(s?.whatsapp ?? "393297897193", "Ciao Auto Prime!")}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle /> WhatsApp
                </a>
              </Button>
              <Button asChild variant="cta" size="lg">
                <a href={telHref(phone)}>
                  <Phone /> Chiama
                </a>
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-card">
            <iframe
              title="Mappa Auto Prime"
              src={mapEmbedSrc(address)}
              className="h-72 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <ContactForm />
      </div>
    </main>
  );
}

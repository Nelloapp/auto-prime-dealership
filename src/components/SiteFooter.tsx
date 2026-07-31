import { Link } from "@tanstack/react-router";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/cars";
import { mapsHref, telHref, whatsappHref } from "@/lib/site";
import { useSiteLogo } from "@/lib/theme";

export function SiteFooter() {
  const { data: s } = useSettings();
  const logo = useSiteLogo();
  const phone = s?.phone ?? "329 789 7193";
  const address = s?.address ?? "Traversa Andolfi 11, 80045 Pompei (NA)";

  return (
    <footer className="mt-16 bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <img
            src={logo.url}
            alt="Auto Prime logo"
            className="w-auto rounded-md"
            style={{ height: logo.height }}
          />
          <p className="mt-3 text-sm text-primary-foreground/70">
            Auto usate di qualità a prezzi onesti. Titolare {s?.owner_name ?? "Enrico Auricchio"}.
          </p>
          <p className="mt-3 text-xs text-primary-foreground/60">
            P.IVA {s?.vat_number ?? "11121961210"}
          </p>
        </div>

        <div className="space-y-3 text-sm">
          <a href={telHref(phone)} className="flex items-center gap-2 hover:text-accent">
            <Phone className="size-4 text-accent" /> {phone}
          </a>
          <a
            href={whatsappHref(s?.whatsapp ?? "393297897193", "Ciao Auto Prime!")}
            className="flex items-center gap-2 hover:text-accent"
          >
            <MessageCircle className="size-4 text-accent" /> Scrivi su WhatsApp
          </a>
          <a
            href={mapsHref(address)}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 hover:text-accent"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-accent" /> {address}
          </a>
          <p className="flex items-start gap-2 text-primary-foreground/70">
            <Clock className="mt-0.5 size-4 shrink-0 text-accent" />{" "}
            {s?.opening_hours ?? "Lun-Sab 9:00-13:00 / 15:00-19:30"}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <Link to="/catalogo" className="block hover:text-accent">
            Catalogo auto
          </Link>
          <Link to="/permuta" className="block hover:text-accent">
            Valuta la tua auto
          </Link>
          <Link to="/contatti" className="block hover:text-accent">
            Chi siamo e contatti
          </Link>
          <Link to="/auth" className="block text-primary-foreground/50 hover:text-accent">
            Area riservata
          </Link>
        </div>
      </div>
      <div className="border-t border-primary/40 py-4 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} Auto Prime — Tutti i diritti riservati
      </div>
    </footer>
  );
}

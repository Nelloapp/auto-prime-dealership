import { Link, useLocation } from "@tanstack/react-router";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";

import { useSettings } from "@/lib/cars";
import { mapsHref, telHref, whatsappHref } from "@/lib/site";
import { SiteNavLink } from "@/components/SiteNavLink";
import { useNavItems, useSiteLogo, useSocials } from "@/lib/theme";

export function SiteFooter() {
  const { data: s } = useSettings();
  const logo = useSiteLogo("footer");
  const socials = useSocials();
  const { items: NAV } = useNavItems();
  const pathname = useLocation({ select: (l) => l.pathname });
  const phone = s?.phone ?? "329 789 7193";
  const address = s?.address ?? "Traversa Andolfi 11, 80045 Pompei (NA)";
  const company = s?.company_name ?? "Auto Prime";

  return (
    <footer className={`${pathname === "/" ? "mt-0" : "mt-16"} bg-primary-deep text-primary-foreground`}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          {logo.url ? (
            <img
              src={logo.url}
              alt={`${company} logo`}
              className="w-auto max-w-full rounded-md object-contain"
              style={{ height: logo.height }}
            />
          ) : (
            <span aria-hidden className="block w-32" style={{ height: logo.height }} />
          )}
          <p className="mt-3 text-sm text-primary-foreground/70">
            {s?.footer_note?.trim() ||
              `Auto usate di qualità a prezzi onesti. Titolare ${s?.owner_name ?? "Enrico Auricchio"}.`}
          </p>
          <p className="mt-3 text-xs text-primary-foreground/60">
            P.IVA {s?.vat_number ?? "11121961210"}
          </p>
          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wider">
              {socials.map((sn) => (
                <a
                  key={sn.key}
                  href={sn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-foreground/70 hover:text-accent"
                >
                  {sn.label}
                </a>
              ))}
            </div>
          )}
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
          {NAV.filter((i) => i.to !== "/").map((item) => (
            <SiteNavLink key={item.to} item={item} className="block hover:text-accent" />
          ))}
          <SiteNavLink
            item={{ to: "/", label: "Home", visible: true }}
            className="block hover:text-accent"
          />
          <Link to="/privacy" className="block hover:text-accent">
            Privacy Policy
          </Link>

        </div>

      </div>
      <div className="border-t border-primary/40 py-4 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} {company} — Tutti i diritti riservati
      </div>
    </footer>
  );
}

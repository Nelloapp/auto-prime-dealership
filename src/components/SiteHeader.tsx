import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Menu, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/cars";
import { telHref, whatsappHref } from "@/lib/site";
import { SiteNavLink } from "@/components/SiteNavLink";
import { useNavItems, useSiteLogo, useSocials } from "@/lib/theme";

import { cn } from "@/lib/utils";

/** Icone social: Facebook/Instagram/YouTube da lucide, TikTok con SVG dedicato. */
function SocialIcon({ keyName, className }: { keyName: string; className?: string }) {
  if (keyName === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
        <path d="M16.6 3c.36 2.05 1.7 3.6 3.9 3.74v2.5c-1.43.06-2.75-.36-3.9-1.16v5.44c0 3.63-2.4 5.98-5.66 5.98C8.03 19.5 6 17.4 6 14.9c0-2.6 2.06-4.6 4.87-4.6.3 0 .6.03.9.08v2.62a2.7 2.7 0 0 0-.86-.14c-1.3 0-2.3.94-2.3 2.1 0 1.2 1 2.1 2.32 2.1 1.44 0 2.5-1.05 2.5-2.75V3h3.17Z" />
      </svg>
    );
  }
  if (keyName === "facebook") return <Facebook className={className} />;
  if (keyName === "youtube") return <Youtube className={className} />;
  return <Instagram className={className} />;
}

export function SiteHeader() {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const phone = settings?.phone ?? "329 789 7193";
  const whatsapp = settings?.whatsapp ?? "393297897193";
  const logo = useSiteLogo();
  const { items: NAV, showAdminLink } = useNavItems();
  const socials = useSocials();

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-primary/25 bg-primary-deep/95 text-primary-foreground backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 md:flex md:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          {logo.url ? (
            <img
              src={logo.url}
              alt="Auto Prime logo"
              className="h-[min(3.5rem,var(--logo-h))] w-auto max-w-[55vw] rounded-md object-contain sm:h-[var(--logo-h)] sm:max-w-none"
              style={{ ["--logo-h" as string]: `${logo.height}px` }}
            />
          ) : (
            <span
              aria-hidden
              className="block h-[min(3.5rem,var(--logo-h))] w-32 sm:h-[var(--logo-h)]"
              style={{ ["--logo-h" as string]: `${logo.height}px` }}
            />
          )}


          <span className="sr-only">Auto Prime</span>
        </Link>



        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <SiteNavLink
              key={item.to}
              item={item}
              className="rounded-md px-3 py-2 text-sm font-semibold text-primary-foreground/80 transition-colors hover:bg-primary/40 hover:text-primary-foreground"
              activeClassName="bg-primary/50 text-primary-foreground rounded-md px-3 py-2 text-sm font-semibold text-primary-foreground"
            />
          ))}

          {socials.length > 0 && (
            <>
              <span aria-hidden className="mx-1 h-5 w-px bg-primary-foreground/20" />
              {socials.map((sn) => (
                <a
                  key={sn.key}
                  href={sn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sn.label}
                  title={sn.label}
                  className="grid size-9 place-items-center rounded-md text-primary-foreground/70 transition-colors hover:bg-primary/40 hover:text-accent"
                >
                  <SocialIcon keyName={sn.key} className="size-[1.15rem]" />
                </a>
              ))}
            </>
          )}
        </nav>


        <div className="flex items-center gap-2">
          {showAdminLink && (
            <Link
              to="/auth"
              className="hidden items-center gap-1.5 rounded-full border border-primary-foreground/20 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/70 transition-colors hover:border-accent/60 hover:text-accent md:inline-flex"
            >
              <Lock className="size-3.5" /> Admin
            </Link>
          )}

          <Button asChild variant="cta" size="sm" className="hidden sm:inline-flex">
            <a href={telHref(phone)}>
              <Phone /> Chiama ora
            </a>
          </Button>

          <Button asChild variant="whatsapp" size="icon" className="sm:hidden">
            <a
              href={whatsappHref(whatsapp, "Ciao Auto Prime!")}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <MessageCircle />
            </a>
          </Button>

          <Button asChild variant="cta" size="icon" className="sm:hidden">
            <a href={telHref(phone)} aria-label="Chiama">
              <Phone />
            </a>
          </Button>
          <button
            className="grid size-10 place-items-center rounded-lg bg-primary/40 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <div className={cn("border-t border-primary/40 md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col p-2">
          {NAV.map((item) => (
            <SiteNavLink
              key={item.to}
              item={item}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-semibold text-primary-foreground/90 hover:bg-primary/40"
            />
          ))}

          {socials.length > 0 && (
            <div className="mt-2 flex items-center gap-2 border-t border-primary/40 px-3 pt-3">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                Seguici
              </span>
              {socials.map((sn) => (
                <a
                  key={sn.key}
                  href={sn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={sn.label}
                  onClick={() => setOpen(false)}
                  className="grid size-10 place-items-center rounded-full border border-primary-foreground/20 text-primary-foreground/80 transition-colors hover:border-accent/60 hover:text-accent"
                >
                  <SocialIcon keyName={sn.key} className="size-5" />
                </a>
              ))}
            </div>
          )}

          {showAdminLink && (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-2 rounded-md border-t border-primary/40 px-3 py-3 text-sm font-semibold text-primary-foreground/70 hover:text-accent"
            >
              <Lock className="size-4" /> Accesso admin
            </Link>
          )}

        </nav>
      </div>
    </header>
  );
}

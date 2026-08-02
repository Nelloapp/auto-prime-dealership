import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Menu, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/cars";
import { telHref, whatsappHref } from "@/lib/site";
import { useNavItems, useSiteLogo } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const phone = settings?.phone ?? "329 789 7193";
  const whatsapp = settings?.whatsapp ?? "393297897193";
  const logo = useSiteLogo();
  const { items: NAV, showAdminLink } = useNavItems();

  return (
    <header className="sticky top-0 z-50 w-full overflow-x-clip border-b border-primary/25 bg-primary-deep/95 text-primary-foreground backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 md:flex md:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img
            src={logo.url}
            alt="Auto Prime logo"
            className="h-[min(3.5rem,var(--logo-h))] w-auto max-w-[55vw] rounded-md object-contain sm:h-[var(--logo-h)] sm:max-w-none"
            style={{ ["--logo-h" as string]: `${logo.height}px` }}
          />


          <span className="sr-only">Auto Prime</span>
        </Link>



        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-semibold text-primary-foreground/80 transition-colors hover:bg-primary/40 hover:text-primary-foreground"
              activeProps={{ className: "bg-primary/50 text-primary-foreground" }}
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
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
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3 text-base font-semibold text-primary-foreground/90 hover:bg-primary/40"
            >
              {item.label}
            </Link>
          ))}
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

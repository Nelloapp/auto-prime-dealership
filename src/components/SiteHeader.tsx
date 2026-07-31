import { Link } from "@tanstack/react-router";
import { Phone, MessageCircle, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/cars";
import { telHref, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/catalogo", label: "Catalogo" },
  { to: "/permuta", label: "Valuta la tua auto" },
  { to: "/contatti", label: "Chi siamo" },
];

export function SiteHeader() {
  const { data: settings } = useSettings();
  const [open, setOpen] = useState(false);
  const phone = settings?.phone ?? "329 789 7193";
  const whatsapp = settings?.whatsapp ?? "393297897193";

  return (
    <header className="sticky top-0 z-50 border-b border-primary-deep/30 bg-primary-deep text-primary-foreground">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-accent font-display text-lg font-black text-accent-foreground">
            A
          </span>
          <span className="font-display text-xl font-black tracking-tight">
            Auto<span className="text-accent">Prime</span>
          </span>
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
          <Button asChild variant="cta" size="sm" className="hidden sm:inline-flex">
            <a href={telHref(phone)}>
              <Phone /> Chiama ora
            </a>
          </Button>
          <Button asChild variant="whatsapp" size="icon" className="sm:hidden">
            <a href={whatsappHref(whatsapp, "Ciao Auto Prime!")} aria-label="WhatsApp">
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
        </nav>
      </div>
    </header>
  );
}

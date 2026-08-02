import type { ReactNode } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { useSettings } from "@/lib/cars";
import { genericWhatsappMessage, telHref, whatsappHref } from "@/lib/site";

/**
 * Barra azioni fissa in fondo allo schermo, solo su mobile.
 * `extra` permette di aggiungere un terzo pulsante (es. Prenota nella scheda auto).
 */
export function StickyActions({
  waMessage,
  extra,
}: {
  waMessage?: string;
  extra?: ReactNode;
}) {
  const { data: s } = useSettings();
  const phone = s?.phone ?? "329 789 7193";
  const whatsapp = s?.whatsapp ?? "393297897193";

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-pop backdrop-blur sm:hidden">
      <div className={`grid gap-2 ${extra ? "grid-cols-3" : "grid-cols-2"}`}>
        <a
          href={telHref(phone)}
          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 font-display text-sm font-bold uppercase tracking-wide text-primary-foreground"
        >
          <Phone className="size-4" /> Chiama
        </a>
        <a
          href={whatsappHref(whatsapp, waMessage ?? genericWhatsappMessage())}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg bg-success px-2 font-display text-sm font-bold uppercase tracking-wide text-success-foreground"
        >
          <MessageCircle className="size-4" /> WhatsApp
        </a>
        {extra}
      </div>
    </div>
  );
}

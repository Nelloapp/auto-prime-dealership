import { MessageCircle } from "lucide-react";
import { useSettings } from "@/lib/cars";
import { genericWhatsappMessage, whatsappHref } from "@/lib/site";

/**
 * Pulsante WhatsApp flottante in basso a destra, solo desktop
 * (su mobile c'è già la barra azioni fissa in fondo).
 */
export function FloatingWhatsapp() {
  const { data: s } = useSettings();
  const whatsapp = s?.whatsapp ?? "393297897193";

  return (
    <a
      href={whatsappHref(whatsapp, genericWhatsappMessage())}
      target="_blank"
      rel="noreferrer"
      aria-label="Scrivici su WhatsApp"
      className="group fixed bottom-6 right-6 z-40 hidden size-14 items-center justify-center rounded-full bg-success text-success-foreground shadow-pop transition-transform duration-200 hover:scale-105 sm:flex"
    >
      <span
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-success/40 [animation-duration:3s]"
        aria-hidden
      />
      <MessageCircle className="size-7" />
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg border border-border bg-card px-3 py-2 font-display text-xs font-bold uppercase tracking-wide text-foreground opacity-0 shadow-card transition-opacity duration-200 group-hover:opacity-100">
        Scrivici su WhatsApp
      </span>
    </a>
  );
}

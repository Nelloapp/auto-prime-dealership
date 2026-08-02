export const FUEL_LABELS: Record<string, string> = {
  benzina: "Benzina",
  diesel: "Diesel",
  gpl: "GPL",
  metano: "Metano",
  ibrida: "Ibrida",
  elettrica: "Elettrica",
};

export const GEARBOX_LABELS: Record<string, string> = {
  manuale: "Manuale",
  automatico: "Automatico",
};

export const CAR_STATUS_LABELS: Record<string, string> = {
  disponibile: "Disponibile",
  venduta: "Venduta",
  riservata: "Riservata",
  in_arrivo: "In arrivo",
};

export const APPOINTMENT_STATUS_LABELS: Record<string, string> = {
  in_attesa: "In attesa",
  confermato: "Confermato",
  rifiutato: "Rifiutato",
  riprogrammato: "Riprogrammato",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  nuovo: "Nuovo",
  in_lavorazione: "In lavorazione",
  chiuso: "Chiuso",
};

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export function formatPrice(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "-";
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatKm(km: number | null | undefined) {
  if (km === null || km === undefined) return "-";
  return `${new Intl.NumberFormat("it-IT").format(km)} km`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium" }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

export function whatsappHref(whatsapp: string, message: string) {
  let num = whatsapp.replace(/[^\d]/g, "");
  if (num.startsWith("00")) num = num.slice(2);
  // numeri italiani salvati senza prefisso internazionale (es. 3297897193)
  if (num.length === 10 && num.startsWith("3")) num = `39${num}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}


export function mapsHref(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function mapEmbedSrc(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function carTitle(car: { brand: string; model: string; version?: string | null }) {
  return [car.brand, car.model, car.version].filter(Boolean).join(" ");
}

/** URL assoluto di una pagina del sito (usa l'origin corrente lato client). */
export function absoluteUrl(path: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://auto-prime-dealership.lovable.app";
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

type CarLike = {
  slug: string;
  brand: string;
  model: string;
  version?: string | null;
  year: number;
  km: number;
  price: number | string;
};

/** Messaggio WhatsApp precompilato con i dati dell'auto e il link alla scheda. */
export function carWhatsappMessage(car: CarLike, extra?: string) {
  const lines = [
    `Ciao Auto Prime, sono interessato a:`,
    `${carTitle(car)} — ${car.year} — ${formatKm(car.km)}`,
    `Prezzo: ${formatPrice(car.price)}`,
  ];
  if (extra) lines.push(extra);
  lines.push(absoluteUrl(`/auto/${car.slug}`));
  return lines.join("\n");
}

/** Messaggio WhatsApp generico, con il contesto della pagina di partenza. */
export function genericWhatsappMessage(pageLabel?: string) {
  return pageLabel
    ? `Ciao Auto Prime! Vi scrivo dalla pagina "${pageLabel}" del sito.`
    : "Ciao Auto Prime! Vorrei avere informazioni.";
}

/** Rata mensile con ammortamento francese. */
export function monthlyPayment(amount: number, annualRatePercent: number, months: number) {
  if (amount <= 0 || months <= 0) return 0;
  const i = annualRatePercent / 100 / 12;
  if (i === 0) return amount / months;
  return (amount * i) / (1 - Math.pow(1 + i, -months));
}

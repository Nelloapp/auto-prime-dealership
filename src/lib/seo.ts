import ogImage from "@/assets/og-home.jpg.asset.json";
import { parseOpeningHours } from "@/lib/hours";
import type { CarWithImages, SiteSettings } from "@/lib/cars";
import { CAR_STATUS_LABELS, FUEL_LABELS, GEARBOX_LABELS, carTitle } from "@/lib/site";

export const SITE_URL = "https://auto-prime-dealership.lovable.app";

/** Immagine di anteprima social condivisa (1200x630). */
export const OG_IMAGE = `${SITE_URL}${ogImage.url}`;

export function canonical(path: string) {
  return `${SITE_URL}${path}`;
}

/** Meta per l'anteprima social delle pagine interne. */
export function socialMeta({
  title,
  description,
  path,
  image = OG_IMAGE,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical(path) },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Auto Prime – Auto usate selezionate a Pompei" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: canonical(path) }],
  };
}

/** Public, crawler-friendly URL for a photo stored in the private bucket. */
export function publicPhotoUrl(path: string | null | undefined) {
  return path ? `${SITE_URL}/api/public/foto?p=${encodeURIComponent(path)}` : null;
}

const SCHEMA_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function toClock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function dealerJsonLd(settings: SiteSettings | null | undefined) {
  const name = settings?.company_name?.trim() || "Auto Prime";
  const address = settings?.address?.trim() || "Traversa Andolfi 11, 80045 Pompei (NA)";
  const openingHoursSpecification = parseOpeningHours(settings?.opening_hours).flatMap((schedule) =>
    schedule.ranges.map((range) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: schedule.days.map((d) => SCHEMA_DAYS[d]),
      opens: toClock(range.start),
      closes: toClock(range.end),
    })),
  );

  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name,
    url: SITE_URL,
    image: `${SITE_URL}/favicon.png`,
    ...(settings?.phone ? { telephone: settings.phone } : {}),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.vat_number ? { vatID: settings.vat_number } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: address,
      addressLocality: "Pompei",
      addressRegion: "NA",
      addressCountry: "IT",
    },
    areaServed: "Pompei, Napoli e provincia",
    priceRange: "€€",
    ...(openingHoursSpecification.length > 0 ? { openingHoursSpecification } : {}),
  };
}

export function carHeadContent(car: CarWithImages) {
  const title = carTitle(car);
  const price = Number(car.price);
  const parts = [
    `${car.year}`,
    `${new Intl.NumberFormat("it-IT").format(car.km)} km`,
    FUEL_LABELS[car.fuel] ?? car.fuel,
    GEARBOX_LABELS[car.gearbox] ?? car.gearbox,
  ];
  const priceText = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);

  return {
    pageTitle: `${title} ${car.year} — ${priceText} | Auto Prime Pompei`,
    description: `${title}: ${parts.join(", ")} a ${priceText}. ${
      CAR_STATUS_LABELS[car.status] ?? car.status
    } da Auto Prime, Pompei (NA). Prenota una prova o scrivici su WhatsApp.`,
    title,
    priceText,
  };
}

export function carJsonLd(car: CarWithImages, imageUrls: string[]) {
  const title = carTitle(car);
  const availability =
    car.status === "venduta"
      ? "https://schema.org/SoldOut"
      : car.status === "riservata"
        ? "https://schema.org/LimitedAvailability"
        : car.status === "in_arrivo"
          ? "https://schema.org/PreOrder"
          : "https://schema.org/InStock";

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${title} ${car.year}`,
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    ...(car.version ? { vehicleConfiguration: car.version } : {}),
    vehicleModelDate: String(car.year),
    ...(car.description ? { description: car.description } : {}),
    ...(imageUrls.length > 0 ? { image: imageUrls } : {}),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: car.km, unitCode: "KMT" },
    fuelType: FUEL_LABELS[car.fuel] ?? car.fuel,
    vehicleTransmission: GEARBOX_LABELS[car.gearbox] ?? car.gearbox,
    ...(car.power_hp ? { vehicleEngine: { "@type": "EngineSpecification", enginePower: { "@type": "QuantitativeValue", value: car.power_hp, unitCode: "N12" } } } : {}),
    ...(car.color ? { color: car.color } : {}),
    ...(car.owners != null ? { numberOfPreviousOwners: car.owners } : {}),
    itemCondition: "https://schema.org/UsedCondition",
    url: canonical(`/auto/${car.slug}`),
    offers: {
      "@type": "Offer",
      price: Number(car.price),
      priceCurrency: "EUR",
      availability,
      itemCondition: "https://schema.org/UsedCondition",
      url: canonical(`/auto/${car.slug}`),
      seller: { "@type": "AutoDealer", name: "Auto Prime" },
    },
  };
}

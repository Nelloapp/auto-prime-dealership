import { useSettings } from "@/lib/cars";
import { useSignedUrls } from "@/lib/storage";
import defaultLogo from "@/assets/autoprime-logo.jpg.asset.json";

export type NavItem = { to: string; label: string; visible: boolean };

export const DEFAULT_NAV: NavItem[] = [
  { to: "/", label: "Home", visible: true },
  { to: "/catalogo", label: "Catalogo", visible: true },
  { to: "/permuta", label: "Valuta la tua auto", visible: true },
  { to: "/chi-siamo", label: "Chi siamo", visible: true },
  { to: "/contatti", label: "Contatti", visible: true },
];

export const NAV_ROUTES = DEFAULT_NAV.map((n) => n.to);

/** Un link del menù è valido se punta a una rotta del sito, a una pagina personalizzata o a un URL esterno. */
export function isValidNavTarget(to: string) {
  return (
    NAV_ROUTES.includes(to) ||
    /^\/p\/[a-z0-9-]+$/.test(to) ||
    /^https?:\/\/\S+$/i.test(to) ||
    /^(tel:|mailto:)\S+$/i.test(to)
  );
}

export function parseNavItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) return DEFAULT_NAV;
  const items = value
    .map((raw) => {
      const item = raw as Partial<NavItem>;
      if (typeof item?.to !== "string" || !isValidNavTarget(item.to)) return null;
      return {
        to: item.to,
        label: typeof item.label === "string" && item.label.trim() ? item.label : item.to,
        visible: item.visible !== false,
      } satisfies NavItem;
    })
    .filter(Boolean) as NavItem[];
  // keep any default route missing from stored config
  DEFAULT_NAV.forEach((d) => {
    if (!items.some((i) => i.to === d.to)) items.push(d);
  });
  return items.length ? items : DEFAULT_NAV;
}

/* ---------------- pagine personalizzate ---------------- */

export type CustomPage = { slug: string; title: string; body: string; visible: boolean };

export function parseCustomPages(value: unknown): CustomPage[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((raw) => {
      const p = raw as Partial<CustomPage>;
      if (typeof p?.slug !== "string" || !/^[a-z0-9-]+$/.test(p.slug)) return null;
      return {
        slug: p.slug,
        title: typeof p.title === "string" && p.title.trim() ? p.title : p.slug,
        body: typeof p.body === "string" ? p.body : "",
        visible: p.visible !== false,
      } satisfies CustomPage;
    })
    .filter(Boolean) as CustomPage[];
}

export function useCustomPages() {
  const { data } = useSettings();
  return parseCustomPages(data?.custom_pages);
}

/* ---------------- blocchi editabili della home ---------------- */

export type ContentBlock = { title: string; text: string };

export const DEFAULT_PLUSES: ContentBlock[] = [
  {
    title: "Auto controllate",
    text: "Ogni vettura passa un check tecnico completo prima di entrare in vendita.",
  },
  {
    title: "Permuta e finanziamenti",
    text: "Valutiamo il tuo usato in giornata e troviamo la formula di pagamento giusta.",
  },
  { title: "Assistenza post-vendita", text: "Supporto diretto anche dopo l'acquisto." },
];

export const DEFAULT_STEPS: ContentBlock[] = [
  {
    title: "Scegli l'auto",
    text: "Sfoglia il parco auto con foto reali, scheda tecnica completa e prezzo chiaro.",
  },
  {
    title: "Prenota la prova",
    text: "Fissa un appuntamento in salone in pochi secondi, oppure scrivici su WhatsApp.",
  },
  {
    title: "Permuta e pagamento",
    text: "Valutiamo il tuo usato e troviamo insieme la formula di pagamento o la rata giusta.",
  },
  {
    title: "Ritiri e vai",
    text: "Ci occupiamo noi del passaggio di proprietà: tu ritiri l'auto pronta.",
  },
];

export function parseBlocks(value: unknown, fallback: ContentBlock[]): ContentBlock[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const blocks = value
    .map((raw) => {
      const b = raw as Partial<ContentBlock>;
      if (typeof b?.title !== "string" || !b.title.trim()) return null;
      return { title: b.title, text: typeof b.text === "string" ? b.text : "" } satisfies ContentBlock;
    })
    .filter(Boolean) as ContentBlock[];
  return blocks.length ? blocks : fallback;
}

/* ---------------- calcolatore rate ---------------- */

export type FinanceConfig = {
  enabled: boolean;
  tan: number;
  terms: number[];
  defaultTerm: number;
  downDefaultPct: number;
  downMaxPct: number;
  title: string;
  disclaimer: string;
};

export const DEFAULT_FINANCE: FinanceConfig = {
  enabled: true,
  tan: 7.9,
  terms: [24, 36, 48, 60, 72],
  defaultTerm: 60,
  downDefaultPct: 20,
  downMaxPct: 50,
  title: "Calcola la rata",
  disclaimer: "",
};

export function parseTerms(value: unknown): number[] {
  if (!Array.isArray(value)) return DEFAULT_FINANCE.terms;
  const terms = value
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n >= 6 && n <= 144)
    .map((n) => Math.round(n));
  return terms.length ? [...new Set(terms)].sort((a, b) => a - b) : DEFAULT_FINANCE.terms;
}

export function useFinance(): FinanceConfig {
  const { data: s } = useSettings();
  if (!s) return DEFAULT_FINANCE;
  const terms = parseTerms(s.finance_terms);
  return {
    enabled: s.finance_enabled !== false,
    tan: Number(s.finance_tan) || DEFAULT_FINANCE.tan,
    terms,
    defaultTerm: terms.includes(s.finance_default_term)
      ? s.finance_default_term
      : (terms[Math.floor(terms.length / 2)] ?? 60),
    downDefaultPct: Math.min(Math.max(s.finance_down_default_pct ?? 20, 0), 90),
    downMaxPct: Math.min(Math.max(s.finance_down_max_pct ?? 50, 5), 95),
    title: s.finance_title?.trim() || DEFAULT_FINANCE.title,
    disclaimer: s.finance_disclaimer ?? "",
  };
}

/* ---------------- tema ---------------- */

export const FONT_OPTIONS = [
  "Oswald",
  "Inter",
  "Manrope",
  "Poppins",
  "Montserrat",
  "Playfair Display",
  "Bebas Neue",
  "Archivo",
  "Space Grotesk",
] as const;

function googleFontHref(families: string[]) {
  const unique = [...new Set([...families, "Space Mono"])];
  const query = unique
    .map((f) => `family=${f.replace(/\s+/g, "+")}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

function isHex(value: string | null | undefined): value is string {
  return typeof value === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

function luminance(hex: string) {
  let h = hex.trim().slice(1);
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Injects the admin-configured palette as CSS variable overrides. */
export function SiteTheme() {
  const { data: s } = useSettings();
  if (!s) return null;

  const primary = isHex(s.color_primary) ? s.color_primary : null;
  const accent = isHex(s.color_accent) ? s.color_accent : null;
  const background = isHex(s.color_background) ? s.color_background : null;
  const header = isHex(s.color_header) ? s.color_header : null;

  const light = background ? luminance(background) > 0.55 : false;
  const tint = light ? "black" : "white";
  const lines: string[] = [];

  if (background) {
    lines.push(
      `--background:${background}`,
      `--card:color-mix(in oklab, ${background} 93%, ${tint})`,
      `--popover:color-mix(in oklab, ${background} 93%, ${tint})`,
      `--secondary:color-mix(in oklab, ${background} 88%, ${tint})`,
      `--muted:color-mix(in oklab, ${background} 90%, ${tint})`,
      `--foreground:${light ? "oklch(0.18 0.006 265)" : "oklch(0.97 0.003 250)"}`,
      `--card-foreground:${light ? "oklch(0.18 0.006 265)" : "oklch(0.97 0.003 250)"}`,
      `--popover-foreground:${light ? "oklch(0.18 0.006 265)" : "oklch(0.97 0.003 250)"}`,
      `--secondary-foreground:${light ? "oklch(0.2 0.006 265)" : "oklch(0.95 0.003 250)"}`,
      `--muted-foreground:color-mix(in oklab, ${background} 35%, ${light ? "black" : "white"})`,
      `--border:${light ? "oklch(0 0 0 / 12%)" : "oklch(1 0 0 / 12%)"}`,
      `--input:${light ? "oklch(0 0 0 / 16%)" : "oklch(1 0 0 / 16%)"}`,
    );
  }
  if (primary) {
    lines.push(
      `--primary:${primary}`,
      `--primary-glow:color-mix(in oklab, ${primary} 78%, white)`,
      `--highlight:${primary}`,
      `--ring:${primary}`,
      `--sidebar-primary:${primary}`,
    );
  }
  if (accent) {
    lines.push(
      `--accent:${accent}`,
      `--accent-foreground:${luminance(accent) > 0.55 ? "oklch(0.15 0.006 265)" : "oklch(0.98 0.002 250)"}`,
    );
  }
  if (header) {
    lines.push(`--primary-deep:${header}`, `--sidebar:${header}`);
  }
  if (primary || header || background) {
    const h = header ?? background ?? "#0d0f14";
    const b = background ?? h;
    const p = primary ?? "#d62828";
    lines.push(
      `--gradient-hero:linear-gradient(135deg, ${h} 0%, ${b} 55%, color-mix(in oklab, ${p} 55%, ${b}) 100%)`,
      `--gradient-accent:linear-gradient(100deg, ${p} 0%, color-mix(in oklab, ${p} 70%, white) 100%)`,
    );
  }

  const heading = s.font_heading?.trim() || "Oswald";
  const body = s.font_body?.trim() || "Inter";
  lines.push(
    `--font-display:"${heading}", "Inter", ui-sans-serif, sans-serif`,
    `--font-sans:"${body}", ui-sans-serif, system-ui, sans-serif`,
  );

  const radius = Math.min(Math.max(s.radius_px ?? 8, 0), 32);
  lines.push(`--radius:${radius}px`);

  return (
    <>
      <link rel="stylesheet" href={googleFontHref([heading, body])} />
      <style dangerouslySetInnerHTML={{ __html: `:root{${lines.join(";")}}` }} />
    </>
  );
}

/** Logo configured in admin settings, with the bundled Auto Prime logo as fallback. */
export function useSiteLogo(variant: "header" | "footer" | "hero" = "header") {
  const { data: s } = useSettings();
  const main = s?.logo_path?.trim() || "";
  const footer = s?.footer_logo_path?.trim() || "";
  const path = variant === "footer" && footer ? footer : main;
  const { data: signed } = useSignedUrls(path ? [path] : []);
  const height =
    variant === "footer"
      ? s?.footer_logo_height || 128
      : variant === "hero"
        ? s?.hero_logo_height || 160
        : s?.logo_height || 128;
  return {
    url: (path && signed?.[path]) || defaultLogo.url,
    height: height > 0 ? height : 128,
  };
}

/** Optional hero background image configured in admin settings. */
export function useHeroImage() {
  const { data: s } = useSettings();
  const path = s?.hero_image_path?.trim() || "";
  const { data: signed } = useSignedUrls(path ? [path] : []);
  return path ? (signed?.[path] ?? null) : null;
}

export function useNavItems() {
  const { data: s } = useSettings();
  const pages = parseCustomPages(s?.custom_pages);
  const items = parseNavItems(s?.nav_items).filter((i) => {
    if (!i.visible) return false;
    const match = /^\/p\/([a-z0-9-]+)$/.exec(i.to);
    if (match) return pages.some((p) => p.slug === match[1] && p.visible);
    return true;
  });
  return { items, showAdminLink: s?.show_admin_link !== false };
}

/** Link social configurati in admin. */
export function useSocials() {
  const { data: s } = useSettings();
  return [
    { key: "facebook", label: "Facebook", url: s?.social_facebook?.trim() || "" },
    { key: "instagram", label: "Instagram", url: s?.social_instagram?.trim() || "" },
    { key: "tiktok", label: "TikTok", url: s?.social_tiktok?.trim() || "" },
    { key: "youtube", label: "YouTube", url: s?.social_youtube?.trim() || "" },
  ].filter((x) => x.url);
}

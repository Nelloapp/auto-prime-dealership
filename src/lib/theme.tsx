import { useSettings } from "@/lib/cars";
import { useSignedUrls } from "@/lib/storage";
import defaultLogo from "@/assets/autoprime-logo.jpg.asset.json";

export type NavItem = { to: string; label: string; visible: boolean };

export const DEFAULT_NAV: NavItem[] = [
  { to: "/", label: "Home", visible: true },
  { to: "/catalogo", label: "Catalogo", visible: true },
  { to: "/permuta", label: "Valuta la tua auto", visible: true },
  { to: "/contatti", label: "Chi siamo", visible: true },
];

export const NAV_ROUTES = DEFAULT_NAV.map((n) => n.to);

export function parseNavItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) return DEFAULT_NAV;
  const items = value
    .map((raw) => {
      const item = raw as Partial<NavItem>;
      if (typeof item?.to !== "string" || !NAV_ROUTES.includes(item.to)) return null;
      return {
        to: item.to,
        label: typeof item.label === "string" && item.label.trim() ? item.label : item.to,
        visible: item.visible !== false,
      } satisfies NavItem;
    })
    .filter(Boolean) as NavItem[];
  // keep any route missing from stored config
  DEFAULT_NAV.forEach((d) => {
    if (!items.some((i) => i.to === d.to)) items.push(d);
  });
  return items.length ? items : DEFAULT_NAV;
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
  if (!primary && !accent && !background && !header) return null;

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

  return <style dangerouslySetInnerHTML={{ __html: `:root{${lines.join(";")}}` }} />;
}

/** Logo configured in admin settings, with the bundled Auto Prime logo as fallback. */
export function useSiteLogo() {
  const { data: s } = useSettings();
  const path = s?.logo_path?.trim() || "";
  const { data: signed } = useSignedUrls(path ? [path] : []);
  return {
    url: (path && signed?.[path]) || defaultLogo.url,
    height: s?.logo_height && s.logo_height > 0 ? s.logo_height : 128,
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
  return {
    items: parseNavItems(s?.nav_items).filter((i) => i.visible),
    showAdminLink: s?.show_admin_link !== false,
  };
}

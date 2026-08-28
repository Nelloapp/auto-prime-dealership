import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { StoredImage } from "@/components/StoredImage";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/cars";
import { slugify } from "@/lib/site";
import { uploadCarPhoto } from "@/lib/storage";
import {
  DEFAULT_NAV,
  DEFAULT_PLUSES,
  DEFAULT_STEPS,
  FONT_OPTIONS,
  NAV_ROUTES,
  isValidNavTarget,
  parseBlocks,
  parseCustomPages,
  parseNavItems,
  parseTerms,
  type ContentBlock,
  type CustomPage,
  type NavItem,
} from "@/lib/theme";

export const Route = createFileRoute("/admin/impostazioni")({
  component: SettingsPage,
});

const FIELDS = [
  { name: "company_name", label: "Nome attività" },
  { name: "owner_name", label: "Titolare" },
  { name: "vat_number", label: "Partita IVA" },
  { name: "phone", label: "Telefono" },
  { name: "whatsapp", label: "WhatsApp (formato 39...)" },
  { name: "email", label: "Email" },
  { name: "address", label: "Indirizzo" },
  { name: "opening_hours", label: "Orari di apertura" },
] as const;

const SOCIALS = [
  { name: "social_facebook", label: "Facebook" },
  { name: "social_instagram", label: "Instagram" },
  { name: "social_tiktok", label: "TikTok" },
  { name: "social_youtube", label: "YouTube" },
] as const;

const COLORS = [
  { name: "color_primary", label: "Colore principale", fallback: "#176B87" },
  { name: "color_accent", label: "Colore accento", fallback: "#F4B942" },
  { name: "color_background", label: "Sfondo pagine", fallback: "#F7F7F5" },
  { name: "color_header", label: "Sfondo header/footer", fallback: "#18252D" },
] as const;

const DEFAULT_COLORS: Record<string, string> = {
  color_primary: "#176B87",
  color_accent: "#F4B942",
  color_background: "#F7F7F5",
  color_header: "#18252D",
};

function SettingsPage() {
  const { isLoading } = useQuery(settingsQuery);
  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Impostazioni</h1>
      <BusinessCard />
      <AppearanceCard />
      <HomeCard />
      <FinanceCard />
      <PagesCard />
      <MenuCard />
      <PasswordCard />
    </div>
  );
}

function useSettingsData() {
  const qc = useQueryClient();
  const { data } = useQuery(settingsQuery);

  async function save(payload: Record<string, unknown>, message = "Impostazioni salvate") {
    const { error } = await supabase.from("site_settings").upsert({ id: true, ...payload });
    if (error) {
      toast.error("Errore nel salvataggio");
      return false;
    }
    await qc.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success(message);
    return true;
  }

  return { data, save };
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-2xl bg-card p-5 shadow-card">
      <div>
        <h2 className="font-display text-lg font-black">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function BusinessCard() {
  const { data, save } = useSettingsData();
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const keys = [
      ...FIELDS.map((f) => f.name),
      ...SOCIALS.map((s) => s.name),
      "about_text",
      "footer_note",
    ];
    const payload = Object.fromEntries(keys.map((k) => [k, String(form.get(k) ?? "")]));
    setSaving(true);
    await save(payload);
    setSaving(false);
  }

  return (
    <form onSubmit={submit}>
      <Card title="Dati attività" subtitle="Contatti, social e testi istituzionali.">
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input
                id={f.name}
                name={f.name}
                defaultValue={(data?.[f.name] as string) ?? ""}
                className="mt-1 h-11"
              />
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIALS.map((s) => (
            <div key={s.name}>
              <Label htmlFor={s.name}>{s.label} (URL)</Label>
              <Input
                id={s.name}
                name={s.name}
                placeholder="https://…"
                defaultValue={(data?.[s.name] as string) ?? ""}
                className="mt-1 h-11"
              />
            </div>
          ))}
        </div>

        <div>
          <Label htmlFor="about_text">Testo "Chi siamo"</Label>
          <Textarea
            id="about_text"
            name="about_text"
            rows={6}
            defaultValue={data?.about_text ?? ""}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="footer_note">Testo nel footer</Label>
          <Textarea
            id="footer_note"
            name="footer_note"
            rows={3}
            defaultValue={data?.footer_note ?? ""}
            className="mt-1"
          />
        </div>
        <Button type="submit" variant="cta" size="lg" disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} Salva dati attività
        </Button>
      </Card>
    </form>
  );
}

function AppearanceCard() {
  const { data, save } = useSettingsData();
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [logoPath, setLogoPath] = useState("");
  const [heroPath, setHeroPath] = useState("");
  const [footerLogoPath, setFooterLogoPath] = useState("");
  const [logoHeight, setLogoHeight] = useState(128);
  const [footerLogoHeight, setFooterLogoHeight] = useState(128);
  const [heroLogoHeight, setHeroLogoHeight] = useState(160);
  const [fontHeading, setFontHeading] = useState("Oswald");
  const [fontBody, setFontBody] = useState("Inter");
  const [radius, setRadius] = useState(8);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "hero" | "footer" | null>(null);

  useEffect(() => {
    if (!data) return;
    setColors(
      Object.fromEntries(
        COLORS.map((c) => [c.name, (data[c.name] as string) || c.fallback]),
      ) as Record<string, string>,
    );
    setLogoPath(data.logo_path ?? "");
    setHeroPath(data.hero_image_path ?? "");
    setFooterLogoPath(data.footer_logo_path ?? "");
    setLogoHeight(data.logo_height || 128);
    setFooterLogoHeight(data.footer_logo_height || 128);
    setHeroLogoHeight(data.hero_logo_height || 160);
    setFontHeading(data.font_heading || "Oswald");
    setFontBody(data.font_body || "Inter");
    setRadius(data.radius_px ?? 8);
  }, [data]);

  async function upload(kind: "logo" | "hero" | "footer", file: File) {
    setUploading(kind);
    try {
      const path = await uploadCarPhoto(file, "brand");
      if (kind === "logo") setLogoPath(path);
      else if (kind === "hero") setHeroPath(path);
      else setFooterLogoPath(path);
      toast.success("Immagine caricata, ricordati di salvare");
    } catch {
      toast.error("Caricamento non riuscito");
    }
    setUploading(null);
  }

  async function submit() {
    setSaving(true);
    await save(
      {
        ...colors,
        logo_path: logoPath,
        hero_image_path: heroPath,
        footer_logo_path: footerLogoPath,
        logo_height: logoHeight,
        footer_logo_height: footerLogoHeight,
        hero_logo_height: heroLogoHeight,
        font_heading: fontHeading,
        font_body: fontBody,
        radius_px: radius,
      },
      "Aspetto aggiornato",
    );
    setSaving(false);
  }

  return (
    <Card
      title="Aspetto del sito"
      subtitle="Logo (header, footer, hero), immagini, colori, font e forma degli angoli."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <ImageField
          label="Logo header"
          path={logoPath}
          busy={uploading === "logo"}
          onFile={(f) => upload("logo", f)}
          onClear={() => setLogoPath("")}
          hint="Se vuoto si usa il logo Auto Prime predefinito."
        />
        <ImageField
          label="Logo footer"
          path={footerLogoPath}
          busy={uploading === "footer"}
          onFile={(f) => upload("footer", f)}
          onClear={() => setFooterLogoPath("")}
          hint="Se vuoto si usa il logo dell'header."
        />
        <ImageField
          label="Immagine hero (home)"
          path={heroPath}
          busy={uploading === "hero"}
          onFile={(f) => upload("hero", f)}
          onClear={() => setHeroPath("")}
          hint="Sostituisce la foto grande in cima alla home."
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <SliderField
          label="Altezza logo header"
          value={logoHeight}
          onChange={setLogoHeight}
          min={40}
          max={220}
        />
        <SliderField
          label="Altezza logo footer"
          value={footerLogoHeight}
          onChange={setFooterLogoHeight}
          min={40}
          max={260}
        />
        <SliderField
          label="Altezza logo nell'hero"
          value={heroLogoHeight}
          onChange={setHeroLogoHeight}
          min={60}
          max={320}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="font_heading">Font titoli</Label>
          <FontSelect id="font_heading" value={fontHeading} onChange={setFontHeading} />
        </div>
        <div>
          <Label htmlFor="font_body">Font testi</Label>
          <FontSelect id="font_body" value={fontBody} onChange={setFontBody} />
        </div>
        <SliderField
          label="Angoli arrotondati"
          value={radius}
          onChange={setRadius}
          min={0}
          max={28}
          step={1}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COLORS.map((c) => (
          <div key={c.name}>
            <Label htmlFor={c.name}>{c.label}</Label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id={c.name}
                type="color"
                value={colors[c.name] ?? c.fallback}
                onChange={(e) => setColors((s) => ({ ...s, [c.name]: e.target.value }))}
                className="h-11 w-14 cursor-pointer rounded-md border bg-transparent p-1"
              />
              <Input
                value={colors[c.name] ?? c.fallback}
                onChange={(e) => setColors((s) => ({ ...s, [c.name]: e.target.value }))}
                className="h-11"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="cta" size="lg" onClick={submit} disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} Salva aspetto
        </Button>
        <Button variant="outline" size="lg" onClick={() => setColors(DEFAULT_COLORS)}>
          Ripristina colori predefiniti
        </Button>
      </div>
    </Card>
  );
}

function FontSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      {FONT_OPTIONS.map((f) => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 4,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div>
      <Label>
        {label}: {value}px
      </Label>
      <Slider
        className="mt-3"
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0] ?? min)}
      />
    </div>
  );
}

function ImageField({
  label,
  path,
  busy,
  onFile,
  onClear,
  hint,
}: {
  label: string;
  path: string;
  busy: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
  hint: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex items-center gap-3">
        <div className="grid h-20 w-32 place-items-center overflow-hidden rounded-lg bg-secondary">
          {path ? (
            <StoredImage path={path} alt={label} className="size-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">Nessuna</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold hover:bg-secondary">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            Carica
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = "";
              }}
            />
          </label>
          {path && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" /> Rimuovi
            </button>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

/* ---------------- home page ---------------- */

function HomeCard() {
  const { data, save } = useSettingsData();
  const [hero, setHero] = useState({
    hero_eyebrow: "",
    hero_title: "",
    hero_subtitle: "",
    hero_cta_label: "",
    featured_title: "",
  });
  const [toggles, setToggles] = useState({
    hero_show_logo: false,
    show_pluses: true,
    show_featured: true,
    show_how_it_works: true,
    show_reviews: true,
  });
  const [pluses, setPluses] = useState<ContentBlock[]>(DEFAULT_PLUSES);
  const [steps, setSteps] = useState<ContentBlock[]>(DEFAULT_STEPS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setHero({
      hero_eyebrow: data.hero_eyebrow ?? "",
      hero_title: data.hero_title ?? "",
      hero_subtitle: data.hero_subtitle ?? "",
      hero_cta_label: data.hero_cta_label ?? "",
      featured_title: data.featured_title ?? "",
    });
    setToggles({
      hero_show_logo: data.hero_show_logo === true,
      show_pluses: data.show_pluses !== false,
      show_featured: data.show_featured !== false,
      show_how_it_works: data.show_how_it_works !== false,
      show_reviews: data.show_reviews !== false,
    });
    setPluses(parseBlocks(data.pluses, DEFAULT_PLUSES));
    setSteps(parseBlocks(data.how_steps, DEFAULT_STEPS));
  }, [data]);

  async function submit() {
    setSaving(true);
    await save({ ...hero, ...toggles, pluses, how_steps: steps }, "Home aggiornata");
    setSaving(false);
  }

  return (
    <Card title="Home page" subtitle="Testi dell'hero, sezioni visibili e blocchi di contenuto.">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="hero_eyebrow">Sopra-titolo hero</Label>
          <Input
            id="hero_eyebrow"
            value={hero.hero_eyebrow}
            onChange={(e) => setHero((h) => ({ ...h, hero_eyebrow: e.target.value }))}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="hero_cta_label">Testo del pulsante hero</Label>
          <Input
            id="hero_cta_label"
            value={hero.hero_cta_label}
            onChange={(e) => setHero((h) => ({ ...h, hero_cta_label: e.target.value }))}
            className="mt-1 h-11"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="hero_title">Titolo hero (vai a capo per spezzarlo)</Label>
        <Textarea
          id="hero_title"
          rows={2}
          value={hero.hero_title}
          onChange={(e) => setHero((h) => ({ ...h, hero_title: e.target.value }))}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="hero_subtitle">Sottotitolo hero</Label>
        <Textarea
          id="hero_subtitle"
          rows={2}
          value={hero.hero_subtitle}
          onChange={(e) => setHero((h) => ({ ...h, hero_subtitle: e.target.value }))}
          className="mt-1"
        />
      </div>
      <div className="sm:max-w-sm">
        <Label htmlFor="featured_title">Titolo sezione auto in evidenza</Label>
        <Input
          id="featured_title"
          value={hero.featured_title}
          onChange={(e) => setHero((h) => ({ ...h, featured_title: e.target.value }))}
          className="mt-1 h-11"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["hero_show_logo", "Mostra il logo nell'hero"],
            ["show_pluses", "Mostra i punti di forza"],
            ["show_featured", "Mostra le auto in evidenza"],
            ["show_how_it_works", 'Mostra "Come funziona"'],
            ["show_reviews", "Mostra le recensioni"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <Switch
              checked={toggles[key]}
              onCheckedChange={(v) => setToggles((t) => ({ ...t, [key]: v }))}
            />
            {label}
          </label>
        ))}
      </div>

      <BlockEditor
        title="Punti di forza"
        blocks={pluses}
        onChange={setPluses}
        max={6}
        onReset={() => setPluses(DEFAULT_PLUSES)}
      />
      <BlockEditor
        title='Passi "Come funziona"'
        blocks={steps}
        onChange={setSteps}
        max={6}
        onReset={() => setSteps(DEFAULT_STEPS)}
      />

      <Button variant="cta" size="lg" onClick={submit} disabled={saving}>
        {saving && <Loader2 className="animate-spin" />} Salva home
      </Button>
    </Card>
  );
}

function BlockEditor({
  title,
  blocks,
  onChange,
  max,
  onReset,
}: {
  title: string;
  blocks: ContentBlock[];
  onChange: (b: ContentBlock[]) => void;
  max: number;
  onReset: () => void;
}) {
  function update(i: number, patch: Partial<ContentBlock>) {
    onChange(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  return (
    <div className="space-y-3 rounded-xl bg-secondary/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-bold uppercase">{title}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            Ripristina
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={blocks.length >= max}
            onClick={() => onChange([...blocks, { title: "Nuovo blocco", text: "" }])}
          >
            <Plus className="size-4" /> Aggiungi
          </Button>
        </div>
      </div>
      {blocks.map((b, i) => (
        <div key={i} className="space-y-2 rounded-lg bg-card p-3">
          <div className="flex gap-2">
            <Input
              value={b.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder="Titolo"
              className="h-10"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChange(blocks.filter((_, idx) => idx !== i))}
              aria-label="Elimina blocco"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
          <Textarea
            value={b.text}
            rows={2}
            placeholder="Descrizione"
            onChange={(e) => update(i, { text: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

/* ---------------- calcolatore rate ---------------- */

function FinanceCard() {
  const { data, save } = useSettingsData();
  const [state, setState] = useState({
    finance_enabled: true,
    finance_tan: 7.9,
    finance_terms: "24, 36, 48, 60, 72",
    finance_default_term: 60,
    finance_down_default_pct: 20,
    finance_down_max_pct: 50,
    finance_title: "Calcola la rata",
    finance_disclaimer: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setState({
      finance_enabled: data.finance_enabled !== false,
      finance_tan: Number(data.finance_tan) || 7.9,
      finance_terms: parseTerms(data.finance_terms).join(", "),
      finance_default_term: data.finance_default_term || 60,
      finance_down_default_pct: data.finance_down_default_pct ?? 20,
      finance_down_max_pct: data.finance_down_max_pct ?? 50,
      finance_title: data.finance_title ?? "Calcola la rata",
      finance_disclaimer: data.finance_disclaimer ?? "",
    });
  }, [data]);

  async function submit() {
    const terms = parseTerms(state.finance_terms.split(/[,\s]+/).filter(Boolean));
    setSaving(true);
    await save(
      {
        finance_enabled: state.finance_enabled,
        finance_tan: Number(state.finance_tan) || 7.9,
        finance_terms: terms,
        finance_default_term: terms.includes(Number(state.finance_default_term))
          ? Number(state.finance_default_term)
          : (terms[0] ?? 60),
        finance_down_default_pct: Number(state.finance_down_default_pct) || 0,
        finance_down_max_pct: Number(state.finance_down_max_pct) || 50,
        finance_title: state.finance_title,
        finance_disclaimer: state.finance_disclaimer,
      },
      "Calcolatore aggiornato",
    );
    setSaving(false);
  }

  return (
    <Card
      title="Calcolatore rate"
      subtitle="Tasso, durate disponibili, anticipo e testi mostrati nella scheda auto."
    >
      <label className="flex items-center gap-2 text-sm">
        <Switch
          checked={state.finance_enabled}
          onCheckedChange={(v) => setState((s) => ({ ...s, finance_enabled: v }))}
        />
        Mostra il calcolatore nelle schede auto
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label htmlFor="finance_title">Titolo del box</Label>
          <Input
            id="finance_title"
            value={state.finance_title}
            onChange={(e) => setState((s) => ({ ...s, finance_title: e.target.value }))}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="finance_tan">TAN %</Label>
          <Input
            id="finance_tan"
            type="number"
            step="0.1"
            min="0"
            max="30"
            value={state.finance_tan}
            onChange={(e) => setState((s) => ({ ...s, finance_tan: Number(e.target.value) }))}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="finance_terms">Durate in mesi (separate da virgola)</Label>
          <Input
            id="finance_terms"
            value={state.finance_terms}
            onChange={(e) => setState((s) => ({ ...s, finance_terms: e.target.value }))}
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="finance_default_term">Durata preselezionata</Label>
          <Input
            id="finance_default_term"
            type="number"
            value={state.finance_default_term}
            onChange={(e) =>
              setState((s) => ({ ...s, finance_default_term: Number(e.target.value) }))
            }
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="finance_down_default_pct">Anticipo iniziale (% del prezzo)</Label>
          <Input
            id="finance_down_default_pct"
            type="number"
            min="0"
            max="90"
            value={state.finance_down_default_pct}
            onChange={(e) =>
              setState((s) => ({ ...s, finance_down_default_pct: Number(e.target.value) }))
            }
            className="mt-1 h-11"
          />
        </div>
        <div>
          <Label htmlFor="finance_down_max_pct">Anticipo massimo (% del prezzo)</Label>
          <Input
            id="finance_down_max_pct"
            type="number"
            min="5"
            max="95"
            value={state.finance_down_max_pct}
            onChange={(e) =>
              setState((s) => ({ ...s, finance_down_max_pct: Number(e.target.value) }))
            }
            className="mt-1 h-11"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="finance_disclaimer">Nota legale (opzionale)</Label>
        <Textarea
          id="finance_disclaimer"
          rows={3}
          value={state.finance_disclaimer}
          onChange={(e) => setState((s) => ({ ...s, finance_disclaimer: e.target.value }))}
          className="mt-1"
        />
      </div>

      <Button variant="cta" size="lg" onClick={submit} disabled={saving}>
        {saving && <Loader2 className="animate-spin" />} Salva calcolatore
      </Button>
    </Card>
  );
}

/* ---------------- pagine personalizzate ---------------- */

function PagesCard() {
  const { data, save } = useSettingsData();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    setPages(parseCustomPages(data.custom_pages));
  }, [data]);

  function update(i: number, patch: Partial<CustomPage>) {
    setPages((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  async function submit() {
    const cleaned = pages
      .map((p) => ({ ...p, slug: slugify(p.slug || p.title) }))
      .filter((p) => p.slug);
    if (new Set(cleaned.map((p) => p.slug)).size !== cleaned.length) {
      toast.error("Ci sono due pagine con lo stesso indirizzo");
      return;
    }
    setSaving(true);
    const ok = await save({ custom_pages: cleaned }, "Pagine aggiornate");
    if (ok) setPages(cleaned);
    setSaving(false);
  }

  return (
    <Card
      title="Pagine del sito"
      subtitle="Crea pagine libere (es. Garanzia, Finanziamenti, Privacy). Le trovi su /p/indirizzo e puoi aggiungerle al menù."
    >
      <div className="space-y-4">
        {pages.map((p, i) => (
          <div key={i} className="space-y-3 rounded-xl bg-secondary/50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Titolo</Label>
                <Input
                  value={p.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  className="mt-1 h-11"
                />
              </div>
              <div>
                <Label>Indirizzo</Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">/p/</span>
                  <Input
                    value={p.slug}
                    onChange={(e) => update(i, { slug: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Contenuto</Label>
              <Textarea
                rows={6}
                value={p.body}
                onChange={(e) => update(i, { body: e.target.value })}
                className="mt-1"
                placeholder="Scrivi il testo. Lascia una riga vuota per separare i paragrafi."
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={p.visible} onCheckedChange={(v) => update(i, { visible: v })} />
                Pubblicata
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPages((list) => list.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="size-4 text-destructive" /> Elimina
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            setPages((list) => [
              ...list,
              { slug: `pagina-${list.length + 1}`, title: "Nuova pagina", body: "", visible: true },
            ])
          }
        >
          <Plus /> Nuova pagina
        </Button>
        <Button variant="cta" size="lg" onClick={submit} disabled={saving}>
          {saving && <Loader2 className="animate-spin" />} Salva pagine
        </Button>
      </div>
    </Card>
  );
}

/* ---------------- menù ---------------- */

function MenuCard() {
  const { data, save } = useSettingsData();
  const [items, setItems] = useState<NavItem[]>(DEFAULT_NAV);
  const [showAdmin, setShowAdmin] = useState(true);
  const [newTarget, setNewTarget] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const pages = parseCustomPages(data?.custom_pages);

  useEffect(() => {
    if (!data) return;
    setItems(parseNavItems(data.nav_items));
    setShowAdmin(data.show_admin_link !== false);
  }, [data]);

  function update(index: number, patch: Partial<NavItem>) {
    setItems((list) => list.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function move(index: number, dir: -1 | 1) {
    setItems((list) => {
      const next = [...list];
      const target = index + dir;
      if (target < 0 || target >= next.length) return list;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function addItem() {
    const to = newTarget.trim();
    if (!isValidNavTarget(to)) {
      toast.error("Indirizzo non valido: usa una pagina del sito o un URL https://");
      return;
    }
    if (items.some((i) => i.to === to)) {
      toast.error("Questa voce è già nel menù");
      return;
    }
    const label =
      newLabel.trim() || pages.find((p) => `/p/${p.slug}` === to)?.title || to.replace(/^\//, "");
    setItems((list) => [...list, { to, label, visible: true }]);
    setNewTarget("");
    setNewLabel("");
  }

  async function submit() {
    setSaving(true);
    await save({ nav_items: items, show_admin_link: showAdmin }, "Menù aggiornato");
    setSaving(false);
  }

  return (
    <Card
      title="Menù di navigazione"
      subtitle="Scritte, ordine, visibilità e nuove voci verso pagine personalizzate o link esterni."
    >
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={item.to}
            className="flex flex-wrap items-center gap-3 rounded-xl bg-secondary/50 p-3"
          >
            <Input
              value={item.label}
              onChange={(e) => update(i, { label: e.target.value })}
              className="h-11 w-full sm:w-64"
            />
            <span className="font-mono text-xs text-muted-foreground">{item.to}</span>
            <div className="ml-auto flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={item.visible}
                  onCheckedChange={(v) => update(i, { visible: v })}
                />
                Visibile
              </label>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => move(i, -1)}>
                  ↑
                </Button>
                <Button variant="outline" size="sm" onClick={() => move(i, 1)}>
                  ↓
                </Button>
                {!NAV_ROUTES.includes(item.to) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                    aria-label="Rimuovi voce"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border border-dashed p-4 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <Label htmlFor="new_target">Nuova voce</Label>
          <select
            id="new_target"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Scegli o incolla un URL…</option>
            {pages.map((p) => (
              <option key={p.slug} value={`/p/${p.slug}`}>
                Pagina: {p.title}
              </option>
            ))}
          </select>
          <Input
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            placeholder="/p/garanzia oppure https://…"
            className="mt-2 h-11"
          />
        </div>
        <div>
          <Label htmlFor="new_label">Etichetta</Label>
          <Input
            id="new_label"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="mt-1 h-11"
            placeholder="Es. Garanzia"
          />
        </div>
        <div className="flex items-end">
          <Button variant="outline" size="lg" onClick={addItem}>
            <Plus /> Aggiungi
          </Button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={showAdmin} onCheckedChange={setShowAdmin} />
        Mostra il link "Admin" nel sito pubblico
      </label>

      <Button variant="cta" size="lg" onClick={submit} disabled={saving}>
        {saving && <Loader2 className="animate-spin" />} Salva menù
      </Button>
    </Card>
  );
}

function PasswordCard() {
  const [busy, setBusy] = useState(false);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("new_password") ?? "");
    const confirm = String(data.get("confirm_password") ?? "");

    if (password.length < 6) {
      toast.error("La password deve avere almeno 6 caratteri");
      return;
    }
    if (password !== confirm) {
      toast.error("Le due password non coincidono");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error("Impossibile aggiornare la password");
      return;
    }
    form.reset();
    toast.success("Password aggiornata");
  }

  return (
    <form onSubmit={changePassword}>
      <Card title="Cambia password" subtitle="Aggiorna la password del tuo accesso amministratore.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="new_password">Nuova password</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 h-11"
            />
          </div>
          <div>
            <Label htmlFor="confirm_password">Conferma password</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              className="mt-1 h-11"
            />
          </div>
        </div>
        <Button type="submit" variant="outline" size="lg" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />} Aggiorna password
        </Button>
      </Card>
    </form>
  );
}

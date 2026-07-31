import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { StoredImage } from "@/components/StoredImage";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/cars";
import { uploadCarPhoto } from "@/lib/storage";
import { DEFAULT_NAV, parseNavItems, type NavItem } from "@/lib/theme";

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

const COLORS = [
  { name: "color_primary", label: "Colore principale", fallback: "#d62828" },
  { name: "color_accent", label: "Colore accento", fallback: "#d6d6d6" },
  { name: "color_background", label: "Sfondo pagine", fallback: "#0d0f14" },
  { name: "color_header", label: "Sfondo header/footer", fallback: "#08090c" },
] as const;

const DEFAULT_COLORS: Record<string, string> = {
  color_primary: "#d62828",
  color_accent: "#d6d6d6",
  color_background: "#0d0f14",
  color_header: "#08090c",
};


function SettingsPage() {
  const { isLoading } = useQuery(settingsQuery);
  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Impostazioni</h1>
      <BusinessCard />
      <AppearanceCard />
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

function BusinessCard() {
  const { data, save } = useSettingsData();
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      [...FIELDS.map((f) => f.name), "about_text"].map((k) => [k, String(form.get(k) ?? "")]),
    );
    setSaving(true);
    await save(payload);
    setSaving(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl bg-card p-5 shadow-card">
      <h2 className="font-display text-lg font-black">Dati attività</h2>
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
      <Button type="submit" variant="cta" size="lg" disabled={saving}>
        {saving && <Loader2 className="animate-spin" />} Salva dati attività
      </Button>
    </form>
  );
}

function AppearanceCard() {
  const { data, save } = useSettingsData();
  const [colors, setColors] = useState<Record<string, string>>(DEFAULT_COLORS);
  const [logoPath, setLogoPath] = useState("");
  const [heroPath, setHeroPath] = useState("");
  const [logoHeight, setLogoHeight] = useState(128);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "hero" | null>(null);

  useEffect(() => {
    if (!data) return;
    setColors({
      color_primary: data.color_primary || DEFAULT_COLORS.color_primary,
      color_accent: data.color_accent || DEFAULT_COLORS.color_accent,
      color_background: data.color_background || DEFAULT_COLORS.color_background,
      color_header: data.color_header || DEFAULT_COLORS.color_header,
    });
    setLogoPath(data.logo_path ?? "");
    setHeroPath(data.hero_image_path ?? "");
    setLogoHeight(data.logo_height || 128);
  }, [data]);

  async function upload(kind: "logo" | "hero", file: File) {
    setUploading(kind);
    try {
      const path = await uploadCarPhoto(file, "brand");
      if (kind === "logo") setLogoPath(path);
      else setHeroPath(path);
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
        logo_height: logoHeight,
      },
      "Aspetto aggiornato",
    );
    setSaving(false);
  }

  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-card">
      <div>
        <h2 className="font-display text-lg font-black">Aspetto del sito</h2>
        <p className="text-sm text-muted-foreground">
          Logo, immagine di sfondo della home e colori del tema.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageField
          label="Logo"
          path={logoPath}
          busy={uploading === "logo"}
          onFile={(f) => upload("logo", f)}
          onClear={() => setLogoPath("")}
          hint="Lasciando vuoto si usa il logo Auto Prime predefinito."
        />
        <ImageField
          label="Immagine di sfondo (home)"
          path={heroPath}
          busy={uploading === "hero"}
          onFile={(f) => upload("hero", f)}
          onClear={() => setHeroPath("")}
          hint="Sostituisce la foto grande in cima alla home."
        />
      </div>

      <div>
        <Label>Dimensione logo: {logoHeight}px</Label>
        <Slider
          className="mt-3 max-w-sm"
          min={40}
          max={220}
          step={4}
          value={[logoHeight]}
          onValueChange={(v) => setLogoHeight(v[0] ?? 128)}
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

function MenuCard() {
  const { data, save } = useSettingsData();
  const [items, setItems] = useState<NavItem[]>(DEFAULT_NAV);
  const [showAdmin, setShowAdmin] = useState(true);
  const [saving, setSaving] = useState(false);

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

  async function submit() {
    setSaving(true);
    await save({ nav_items: items, show_admin_link: showAdmin }, "Menù aggiornato");
    setSaving(false);
  }

  return (
    <div className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
      <div>
        <h2 className="font-display text-lg font-black">Menù di navigazione</h2>
        <p className="text-sm text-muted-foreground">
          Cambia le scritte, l'ordine e nascondi le voci che non ti servono.
        </p>
      </div>

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
            <span className="text-xs text-muted-foreground">{item.to}</span>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Switch checked={showAdmin} onCheckedChange={setShowAdmin} />
        Mostra il link "Admin" nel sito pubblico
      </label>

      <Button variant="cta" size="lg" onClick={submit} disabled={saving}>
        {saving && <Loader2 className="animate-spin" />} Salva menù
      </Button>
    </div>
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
    <form onSubmit={changePassword} className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
      <div>
        <h2 className="font-display text-lg font-black">Cambia password</h2>
        <p className="text-sm text-muted-foreground">
          Aggiorna la password del tuo accesso amministratore.
        </p>
      </div>
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
    </form>
  );
}

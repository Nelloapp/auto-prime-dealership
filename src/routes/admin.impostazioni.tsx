import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { settingsQuery } from "@/lib/cars";

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

function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(settingsQuery);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(
      [...FIELDS.map((f) => f.name), "about_text"].map((k) => [k, String(form.get(k) ?? "")]),
    );
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert({ id: true, ...payload });
    setSaving(false);
    if (error) {
      toast.error("Errore nel salvataggio");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["site-settings"] });
    toast.success("Impostazioni salvate");
  }

  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Impostazioni</h1>
      <form onSubmit={submit} className="space-y-5 rounded-2xl bg-card p-5 shadow-card">
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
          {saving && <Loader2 className="animate-spin" />} Salva impostazioni
        </Button>
      </form>

      <PasswordCard />
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

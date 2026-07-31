import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export function ContactForm({ carId, title }: { carId?: string; title?: string }) {
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();
    const contact = String(form.get("contact") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name || !contact || !message) {
      toast.error("Compila tutti i campi");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("contact_messages")
      .insert({ car_id: carId ?? null, name, contact, message });
    setSaving(false);
    if (error) {
      toast.error("Errore nell'invio, riprova");
      return;
    }
    toast.success("Messaggio inviato! Ti risponderemo al più presto.");
    formEl.reset();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
      <h3 className="font-display text-xl font-extrabold">{title ?? "Scrivici un messaggio"}</h3>
      <div>
        <Label htmlFor="cf-name">Nome *</Label>
        <Input id="cf-name" name="name" required maxLength={100} className="mt-1 h-11" />
      </div>
      <div>
        <Label htmlFor="cf-contact">Telefono o email *</Label>
        <Input id="cf-contact" name="contact" required maxLength={150} className="mt-1 h-11" />
      </div>
      <div>
        <Label htmlFor="cf-message">Messaggio *</Label>
        <Textarea id="cf-message" name="message" required maxLength={1000} rows={4} className="mt-1" />
      </div>
      <Button type="submit" variant="cta" size="lg" className="w-full" disabled={saving}>
        <Send /> {saving ? "Invio..." : "Invia messaggio"}
      </Button>
    </form>
  );
}

import { useState } from "react";
import { it } from "date-fns/locale";
import { toast } from "sonner";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { TIME_SLOTS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function BookingDialog({
  carId,
  carLabel,
  trigger,
}: {
  carId?: string;
  carLabel?: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    if (!name || !phone) {
      toast.error("Nome e telefono sono obbligatori");
      return;
    }
    if (!date || !time) {
      toast.error("Scegli data e ora");
      return;
    }


    setSaving(true);
    const { error } = await supabase.from("appointments").insert({
      car_id: carId ?? null,
      customer_name: name,
      phone,
      email: String(form.get("email") ?? "").trim() || null,
      appointment_date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
      appointment_time: time,
      notes: String(form.get("notes") ?? "").trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Errore nell'invio, riprova");
      return;
    }
    toast.success("Richiesta inviata! Ti confermeremo l'appuntamento al più presto.");
    setOpen(false);
    setDate(undefined);
    setTime("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="cta" size="lg" className="w-full">
            <CalendarCheck /> Prenota appuntamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Prenota un appuntamento</DialogTitle>
          <DialogDescription>
            {carLabel ? `Vieni a vedere: ${carLabel}` : "Scegli data e ora per la tua visita."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label className="mb-2 block">Scegli il giorno</Label>
            <Calendar
              mode="single"
              locale={it}
              selected={date}
              onSelect={setDate}
              disabled={(d) =>
                d < new Date(new Date().setHours(0, 0, 0, 0)) || d.getDay() === 0
              }
              className="pointer-events-auto rounded-lg border p-3"
            />
          </div>

          <div>
            <Label className="mb-2 block">Orario</Label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTime(slot)}
                  className={cn(
                    "rounded-lg border py-2 text-sm font-semibold transition-colors",
                    time === slot
                      ? "border-accent bg-accent text-accent-foreground"
                      : "border-border bg-card hover:bg-secondary",
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="bk-name">Nome e cognome *</Label>
              <Input id="bk-name" name="name" required maxLength={100} className="mt-1 h-11" />
            </div>
            <div>
              <Label htmlFor="bk-phone">Telefono *</Label>
              <Input
                id="bk-phone"
                name="phone"
                type="tel"
                required
                maxLength={30}
                className="mt-1 h-11"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bk-email">Email (facoltativa)</Label>
            <Input id="bk-email" name="email" type="email" maxLength={150} className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="bk-notes">Note</Label>
            <Textarea id="bk-notes" name="notes" maxLength={500} className="mt-1" rows={3} />
          </div>

          <Button type="submit" variant="cta" size="lg" className="w-full" disabled={saving}>
            {saving ? "Invio..." : "Conferma richiesta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

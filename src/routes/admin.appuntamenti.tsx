import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { APPOINTMENT_STATUS_LABELS, formatDate, telHref } from "@/lib/site";

export const Route = createFileRoute("/admin/appuntamenti")({
  component: Appointments,
});

function Appointments() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, cars(brand, model)")
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: status as "confermato" })
      .eq("id", id);
    if (error) {
      toast.error("Errore nell'aggiornamento");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin-appointments"] });
    toast.success("Stato aggiornato");
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Appuntamenti</h1>
      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      <div className="grid gap-3">
        {(data ?? []).map((a) => {
          const car = a.cars as { brand: string; model: string } | null;
          return (
            <div key={a.id} className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display font-extrabold">
                    {formatDate(a.appointment_date)} · {a.appointment_time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.customer_name} · {a.phone}
                    {a.email ? ` · ${a.email}` : ""}
                  </p>
                  {car && (
                    <p className="mt-1 text-sm">
                      Auto: <strong>{`${car.brand} ${car.model}`}</strong>
                    </p>
                  )}
                  {a.notes && <p className="mt-1 text-sm text-muted-foreground">{a.notes}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <a href={telHref(a.phone)}>
                      <Phone className="size-4" />
                    </a>
                  </Button>
                  <Select value={a.status} onValueChange={(v) => setStatus(a.id, v)}>
                    <SelectTrigger className="h-10 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(APPOINTMENT_STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground shadow-card">
            Nessun appuntamento ricevuto.
          </p>
        )}
      </div>
    </div>
  );
}

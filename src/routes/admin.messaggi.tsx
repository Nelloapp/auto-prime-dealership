import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LEAD_STATUS_LABELS, formatDateTime } from "@/lib/site";

export const Route = createFileRoute("/admin/messaggi")({
  component: Messages,
});

function Messages() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*, cars(brand, model)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: status as "nuovo" })
      .eq("id", id);
    if (error) {
      toast.error("Errore nell'aggiornamento");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin-messages"] });
    toast.success("Stato aggiornato");
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Messaggi</h1>
      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      <div className="grid gap-3">
        {(data ?? []).map((m) => {
          const car = m.cars as { brand: string; model: string } | null;
          return (
            <div key={m.id} className="rounded-2xl bg-card p-4 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display font-extrabold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.contact}</p>
                  {car && (
                    <p className="mt-1 text-sm">
                      Auto: <strong>{`${car.brand} ${car.model}`}</strong>
                    </p>
                  )}
                  <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(m.created_at)}
                  </p>
                </div>
                <Select value={m.status} onValueChange={(v) => setStatus(m.id, v)}>
                  <SelectTrigger className="h-10 w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground shadow-card">
            Nessun messaggio ricevuto.
          </p>
        )}
      </div>
    </div>
  );
}

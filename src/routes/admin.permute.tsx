import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/StoredImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FUEL_LABELS, LEAD_STATUS_LABELS, formatDateTime, formatKm, telHref } from "@/lib/site";

export const Route = createFileRoute("/admin/permute")({
  component: TradeIns,
});

function TradeIns() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-trade-ins"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_in_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function setStatus(id: string, status: string) {
    const { error } = await supabase
      .from("trade_in_requests")
      .update({ status: status as "nuovo" })
      .eq("id", id);
    if (error) {
      toast.error("Errore nell'aggiornamento");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["admin-trade-ins"] });
    toast.success("Stato aggiornato");
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Richieste di permuta</h1>
      {isLoading && <p className="text-muted-foreground">Caricamento…</p>}
      <div className="grid gap-3">
        {(data ?? []).map((r) => (
          <div key={r.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display font-extrabold">
                  {r.brand} {r.model} · {r.year}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatKm(r.km)}
                  {r.fuel ? ` · ${FUEL_LABELS[r.fuel] ?? r.fuel}` : ""}
                  {r.conditions ? ` · ${r.conditions}` : ""}
                </p>
                <p className="mt-1 text-sm">
                  {r.customer_name} · {r.phone}
                  {r.email ? ` · ${r.email}` : ""}
                </p>
                {r.notes && <p className="mt-1 text-sm text-muted-foreground">{r.notes}</p>}
                <p className="mt-1 text-xs text-muted-foreground">
                  Ricevuta il {formatDateTime(r.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <a href={telHref(r.phone)}>
                    <Phone className="size-4" />
                  </a>
                </Button>
                <Select value={r.status} onValueChange={(v) => setStatus(r.id, v)}>
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

            {r.photos.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
                {r.photos.map((p) => (
                  <StoredImage
                    key={p}
                    path={p}
                    alt="Foto auto in permuta"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground shadow-card">
            Nessuna richiesta di permuta.
          </p>
        )}
      </div>
    </div>
  );
}

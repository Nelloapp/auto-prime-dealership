import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CarForm } from "@/components/admin/CarForm";
import type { CarWithImages } from "@/lib/cars";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/auto/$id")({
  component: EditCar,
});

function EditCar() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-car", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as CarWithImages | null;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;
  if (!data) {
    return (
      <div>
        <p className="text-muted-foreground">Auto non trovata.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin/auto">Torna all'elenco</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Modifica auto</h1>
      <CarForm car={data} />
    </div>
  );
}

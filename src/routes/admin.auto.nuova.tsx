import { createFileRoute } from "@tanstack/react-router";
import { CarForm } from "@/components/admin/CarForm";

export const Route = createFileRoute("/admin/auto/nuova")({
  component: () => (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-black">Nuova auto</h1>
      <CarForm />
    </div>
  ),
});

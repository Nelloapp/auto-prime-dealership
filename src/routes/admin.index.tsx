import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Car, HandCoins, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { carsQuery } from "@/lib/cars";
import { formatDate, formatPrice, carTitle } from "@/lib/site";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: cars } = useQuery(carsQuery);
  const { data: counts } = useQuery({
    queryKey: ["admin-counts"],
    queryFn: async () => {
      const [appts, trades, msgs] = await Promise.all([
        supabase.from("appointments").select("id, status", { count: "exact" }),
        supabase.from("trade_in_requests").select("id, status", { count: "exact" }),
        supabase.from("contact_messages").select("id, status", { count: "exact" }),
      ]);
      return {
        pendingAppointments: (appts.data ?? []).filter((a) => a.status === "in_attesa").length,
        newTrades: (trades.data ?? []).filter((t) => t.status === "nuovo").length,
        newMessages: (msgs.data ?? []).filter((m) => m.status === "nuovo").length,
      };
    },
  });

  const available = (cars ?? []).filter((c) => c.status === "disponibile").length;

  const tiles = [
    { to: "/admin/auto", label: "Auto disponibili", value: available, icon: Car },
    {
      to: "/admin/appuntamenti",
      label: "Appuntamenti da confermare",
      value: counts?.pendingAppointments ?? 0,
      icon: CalendarCheck,
    },
    {
      to: "/admin/permute",
      label: "Nuove permute",
      value: counts?.newTrades ?? 0,
      icon: HandCoins,
    },
    {
      to: "/admin/messaggi",
      label: "Nuovi messaggi",
      value: counts?.newMessages ?? 0,
      icon: MessageSquare,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-black">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(({ to, label, value, icon: Icon }) => (
          <Link key={label} to={to} className="rounded-2xl bg-card p-5 shadow-card transition-shadow hover:shadow-elevated">
            <Icon className="size-6 text-accent" />
            <p className="mt-3 font-display text-3xl font-black">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-card p-5 shadow-card">
        <h2 className="font-display text-lg font-extrabold">Ultime auto inserite</h2>
        <ul className="mt-3 divide-y">
          {(cars ?? []).slice(0, 6).map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <Link to="/admin/auto/$id" params={{ id: c.id }} className="font-semibold hover:underline">
                {carTitle(c)}
              </Link>
              <span className="text-muted-foreground">
                {formatPrice(c.price)} · {formatDate(c.created_at)}
              </span>
            </li>
          ))}
          {(cars ?? []).length === 0 && (
            <li className="py-3 text-sm text-muted-foreground">Nessuna auto inserita.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

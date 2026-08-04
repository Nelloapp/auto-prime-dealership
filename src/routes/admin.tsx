import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  CalendarCheck,
  Car,
  HandCoins,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsAdmin, useSession } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pannello gestionale — Auto Prime" },
      { name: "description", content: "Gestione parco auto, appuntamenti e richieste." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Pannello gestionale — Auto Prime" },
      { property: "og:description", content: "Area di gestione riservata Auto Prime." },
    ],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/auto", label: "Auto", icon: Car },
  { to: "/admin/appuntamenti", label: "Appuntamenti", icon: CalendarCheck },
  { to: "/admin/permute", label: "Permute", icon: HandCoins },
  { to: "/admin/messaggi", label: "Messaggi", icon: MessageSquare },
  { to: "/admin/recensioni", label: "Recensioni", icon: Star },
  { to: "/admin/impostazioni", label: "Impostazioni", icon: Settings },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session, loading } = useSession();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin(session?.user.id);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/auth", replace: true });
  }, [loading, session, navigate]);

  if (loading || (session && roleLoading)) {
    return <div className="p-10 text-muted-foreground">Caricamento…</div>;
  }
  if (!session) return null;

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-black">Accesso non autorizzato</h1>
        <p className="mt-2 text-muted-foreground">
          Il tuo account non ha i permessi di amministratore.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth", replace: true });
          }}
        >
          Esci
        </Button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-black">
            <Car className="text-accent" /> Auto Prime
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            <LogOut /> Esci
          </Button>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 pb-2">
          {NAV.map(({ to, label, icon: Icon, ...rest }) => {
            const active =
              "exact" in rest && rest.exact ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                )}
              >
                <Icon className="size-4" /> {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

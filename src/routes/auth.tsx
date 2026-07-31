import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Car, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Area riservata — Auto Prime" },
      { name: "description", content: "Accesso riservato allo staff Auto Prime." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Area riservata — Auto Prime" },
      { property: "og:description", content: "Accesso riservato allo staff Auto Prime." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    setLoading(false);
    if (error) {
      toast.error("Credenziali non valide");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-elevated">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-black">
          <Car className="text-accent" /> Auto Prime
        </Link>
        <h1 className="mt-5 font-display text-2xl font-black">Area riservata</h1>
        <p className="mt-1 text-sm text-muted-foreground">Accedi per gestire il parco auto.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="mt-1 h-11" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required className="mt-1 h-11" />
          </div>
          <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Accedi
          </Button>
        </form>
      </div>
    </main>
  );
}

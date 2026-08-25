import { createFileRoute, Link } from "@tanstack/react-router";
import { useSettings } from "@/lib/cars";
import { parseCustomPages } from "@/lib/theme";

export const Route = createFileRoute("/p/$slug")({
  head: () => ({
    meta: [
      { title: "Informazioni — Auto Prime Pompei" },
      {
        name: "description",
        content: "Pagina informativa di Auto Prime, concessionaria di auto usate a Pompei (NA).",
      },
      { property: "og:title", content: "Informazioni — Auto Prime Pompei" },
      {
        property: "og:description",
        content: "Pagina informativa di Auto Prime, auto usate selezionate a Pompei.",
      },
    ],
  }),
  component: CustomPageView,
});

function CustomPageView() {
  const { slug } = Route.useParams();
  const { data: settings, isLoading } = useSettings();
  const page = parseCustomPages(settings?.custom_pages).find(
    (p) => p.slug === slug && p.visible,
  );

  if (isLoading) {
    return <main className="mx-auto max-w-3xl px-4 py-20 text-muted-foreground">Caricamento…</main>;
  }

  if (!page) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold uppercase">Pagina non trovata</h1>
        <p className="mt-3 text-muted-foreground">
          Questa pagina non è disponibile o è stata nascosta.
        </p>
        <Link to="/" className="mt-6 inline-block font-semibold text-primary hover:underline">
          Torna alla home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
        {page.title}
      </h1>
      <div className="mt-4 h-1 w-24 bg-primary" />
      <div className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground">
        {page.body
          .split(/\n{2,}/)
          .filter((p) => p.trim())
          .map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
      </div>
    </main>
  );
}

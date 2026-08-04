import { Quote, Star } from "lucide-react";
import { usePublishedReviews } from "@/lib/reviews";
import { cn } from "@/lib/utils";

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`${rating} stelle su 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-4", i <= rating ? "fill-primary text-primary" : "text-border")}
        />
      ))}
    </div>
  );
}

/** Sezione recensioni clienti, gestita da /admin/recensioni. */
export function Reviews() {
  const { data } = usePublishedReviews();
  const reviews = data ?? [];
  if (reviews.length === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-2xl font-bold uppercase text-primary-deep sm:text-3xl">
          Dicono di noi
        </h2>
        <div className="flex items-center gap-2">
          <Stars rating={Math.round(average)} />
          <span className="font-mono text-sm font-bold">
            {average.toFixed(1).replace(".", ",")}/5
          </span>
          <span className="text-sm text-muted-foreground">
            · {reviews.length} recension{reviews.length === 1 ? "e" : "i"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, 6).map((r) => (
          <figure
            key={r.id}
            className="relative rounded-xl border border-border bg-card p-6 shadow-card"
          >
            <span className="absolute left-0 top-6 h-8 w-1 bg-primary" />
            <Quote className="size-5 text-primary/40" />
            <blockquote className="mt-3 text-sm leading-relaxed text-foreground">
              {r.body}
            </blockquote>
            <figcaption className="mt-4 border-t border-border pt-3">
              <Stars rating={r.rating} />
              <p className="mt-2 font-display text-sm font-bold uppercase">{r.author_name}</p>
              {(r.car_label || r.source) && (
                <p className="font-mono text-xs text-muted-foreground">
                  {[r.car_label, r.source].filter(Boolean).join(" · ")}
                </p>
              )}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

import { ChevronRight, Star } from "lucide-react";
import { useSettings } from "@/lib/cars";

/** Logo "G" di Google (marchio ufficiale, inline SVG). */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating.toFixed(1)} stelle su 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={
            i <= Math.round(rating) ? "size-4 fill-primary text-primary" : "size-4 text-border"
          }
        />
      ))}
    </span>
  );
}

/**
 * Badge "Recensioni su Google" con voto e numero recensioni configurati
 * in Admin → Impostazioni. Visibile solo quando è impostato il link Google.
 */
export function GoogleReviews() {
  const { data: s } = useSettings();
  const url = s?.google_maps_url?.trim();
  if (!url) return null;

  const rating = Number(s?.google_rating) || 0;
  const count = Number(s?.google_reviews_count) || 0;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16" aria-label="Recensioni su Google">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="group flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-pop"
      >
        <div className="flex items-center gap-3">
          <GoogleG className="size-8 shrink-0" />
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-wide text-primary-deep">
              Recensioni su Google
            </p>
            {rating > 0 && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Stars rating={rating} />
                <span className="font-mono font-bold text-foreground">
                  {rating.toFixed(1).replace(".", ",")}
                </span>
                {count > 0 && (
                  <span>
                    · {new Intl.NumberFormat("it-IT").format(count)} recension
                    {count === 1 ? "e" : "i"}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 font-display text-sm font-bold uppercase tracking-wide text-primary group-hover:underline">
          Leggi tutte <ChevronRight className="size-4" />
        </span>
      </a>
    </section>
  );
}

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { StoredImage } from "@/components/StoredImage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function CarGallery({ paths, alt }: { paths: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const total = paths.length;
  const current = paths[index];

  const go = (dir: number) => setIndex((i) => (i + dir + Math.max(total, 1)) % Math.max(total, 1));

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-secondary shadow-card">
        <button
          type="button"
          onClick={() => total > 0 && setZoom(true)}
          className="block aspect-4/3 w-full cursor-zoom-in"
          aria-label="Ingrandisci foto"
        >
          <StoredImage
            path={current}
            alt={alt}
            loading="eager"
            className="size-full object-cover"
          />
        </button>
        {total > 0 && (
          <span className="pointer-events-none absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground/60 px-2.5 py-1 text-xs font-semibold text-background">
            <ZoomIn className="size-3.5" /> {index + 1}/{total}
          </span>
        )}
        {total > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Foto precedente"
              className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Foto successiva"
              className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-background/85 shadow"
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {paths.map((p, i) => (
            <button
              key={p}
              onClick={() => setIndex(i)}
              className={cn(
                "size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === index ? "border-accent" : "border-transparent opacity-70",
              )}
            >
              <StoredImage path={p} alt={`${alt} ${i + 1}`} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <StoredImage path={current} alt={alt} className="w-full rounded-xl object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

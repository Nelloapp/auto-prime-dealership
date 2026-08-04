import { useEffect, useState } from "react";
import { useSettings } from "@/lib/cars";
import { getOpenState } from "@/lib/hours";
import { cn } from "@/lib/utils";

/** Badge "Aperto ora / Chiuso" calcolato dagli orari nelle impostazioni. */
export function OpenStatus({ className }: { className?: string }) {
  const { data: s } = useSettings();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;
  const state = getOpenState(s?.opening_hours ?? "Lun-Sab 9:00-13:00 / 15:00-19:30", now);
  if (!state) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold",
        className,
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          state.open ? "bg-success animate-pulse" : "bg-muted-foreground",
        )}
      />
      {state.detail}
    </span>
  );
}

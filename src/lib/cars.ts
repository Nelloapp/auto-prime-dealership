import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Car = Tables<"cars">;
export type CarImage = Tables<"car_images">;
export type SiteSettings = Tables<"site_settings">;
export type CarWithImages = Car & { car_images: CarImage[] };

export const settingsQuery = queryOptions({
  queryKey: ["site-settings"],
  queryFn: async () => {
    const { data, error } = await supabase.from("site_settings").select("*").maybeSingle();
    if (error) throw error;
    return data as SiteSettings | null;
  },
  staleTime: 1000 * 60 * 5,
});

export function useSettings() {
  return useQuery(settingsQuery);
}

export const carsQuery = queryOptions({
  queryKey: ["cars"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("cars")
      .select("*, car_images(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as CarWithImages[];
  },
});

export function carQuery(slug: string) {
  return queryOptions({
    queryKey: ["car", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*, car_images(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as CarWithImages | null;
    },
  });
}

export function primaryImage(car: CarWithImages): string | null {
  const images = [...(car.car_images ?? [])].sort((a, b) => a.position - b.position);
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? null;
}

export function sortedImages(car: CarWithImages): CarImage[] {
  return [...(car.car_images ?? [])].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.position - b.position,
  );
}

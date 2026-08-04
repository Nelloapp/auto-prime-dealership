import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Review = Tables<"reviews">;

export const publishedReviewsQuery = queryOptions({
  queryKey: ["reviews", "published"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Review[];
  },
  staleTime: 1000 * 60 * 5,
});

export function usePublishedReviews() {
  return useQuery(publishedReviewsQuery);
}

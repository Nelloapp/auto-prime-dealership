import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoredImage } from "@/components/StoredImage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FUEL_LABELS, LEAD_STATUS_LABELS, formatDateTime, formatKm, telHref } from "@/lib/site";

export const Route = createFileRoute("/admin/permute")({
  component: TradeIns;
});

function TradeIns() {
  return null;
}

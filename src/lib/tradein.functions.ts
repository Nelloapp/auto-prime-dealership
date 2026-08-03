import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  id: z.string().uuid(),
  photos: z
    .array(z.string().max(300).regex(/^permute\/[A-Za-z0-9._/-]+$/))
    .min(1)
    .max(8),
});

/**
 * Allega le foto a una richiesta di permuta appena creata.
 * Eseguita lato server: il client anonimo non può più chiamare la funzione DB.
 */
export const attachTradeInPhotos = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: ok, error } = await supabaseAdmin.rpc("attach_trade_in_photos", {
      _id: data.id,
      _photos: data.photos,
    });
    if (error) throw new Error("attach_failed");
    return { ok: Boolean(ok) };
  });

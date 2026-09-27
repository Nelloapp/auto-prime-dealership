import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  paths: z
    .array(
      z
        .string()
        .min(1)
        .max(300)
        .regex(/^[A-Za-z0-9._/-]+$/)
        .refine((p) => !p.includes("..") && !p.startsWith("/"), "invalid path")
        // Trade-in photos are customer data: never sign them for anonymous callers.
        .refine((p) => !p.startsWith("permute/"), "forbidden folder"),
    )
    .min(1)
    .max(50),
});

const responsiveSchema = schema.extend({
  widths: z.array(z.number().int().min(64).max(1920)).min(1).max(6),
  aspectRatio: z.number().positive().max(4),
  quality: z.number().int().min(20).max(100),
  resize: z.enum(["cover", "contain", "fill"]),
});

/**
 * Firma URL temporanei per le foto pubbliche (annunci, logo, hero).
 * Eseguita lato server con privilegi di servizio: il bucket resta privato
 * e non serve alcuna policy di lettura pubblica su storage.objects.
 */
export const getPublicSignedPhotoUrls = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("car-photos")
      .createSignedUrls(data.paths, 60 * 60 * 24);
    if (error) throw new Error("sign_failed");
    const out: Record<string, string> = {};
    signed?.forEach((item) => {
      if (item.signedUrl && item.path) out[item.path] = item.signedUrl;
    });
    return out;
  });

export const getPublicResponsivePhotoUrls = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => responsiveSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const entries = await Promise.all(
      data.paths.flatMap((path) =>
        data.widths.map(async (width) => {
          const height = Math.round(width * data.aspectRatio);
          const { data: signed, error } = await supabaseAdmin.storage
            .from("car-photos")
            .createSignedUrl(path, 60 * 60 * 24, {
              transform: { width, height, quality: data.quality, resize: data.resize },
            });
          if (error || !signed?.signedUrl) return null;
          return [`${path}::${width}`, signed.signedUrl] as const;
        }),
      ),
    );
    return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => entry !== null));
  });

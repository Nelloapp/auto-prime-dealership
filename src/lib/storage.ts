import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CAR_BUCKET = "car-photos";

const signedCache = new Map<string, string>();

/** Public buckets are disabled on this workspace, so photos are served via signed URLs. */
export async function getSignedUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  const missing = unique.filter((p) => !signedCache.has(p));
  if (missing.length > 0) {
    const { data } = await supabase.storage.from(CAR_BUCKET).createSignedUrls(missing, 60 * 60 * 24);
    data?.forEach((item) => {
      if (item.signedUrl && item.path) signedCache.set(item.path, item.signedUrl);
    });
  }
  const out: Record<string, string> = {};
  unique.forEach((p) => {
    const url = signedCache.get(p);
    if (url) out[p] = url;
  });
  return out;
}

export function useSignedUrls(paths: string[]) {
  const key = Array.from(new Set(paths.filter(Boolean))).sort();
  return useQuery({
    queryKey: ["signed-urls", key],
    queryFn: () => getSignedUrls(key),
    enabled: key.length > 0,
    staleTime: 1000 * 60 * 30,
  });
}

/** Compress + resize an image in the browser before uploading. */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", quality),
  );
  return blob ?? file;
}

export async function uploadCarPhoto(file: File, folder: string): Promise<string> {
  const blob = await compressImage(file);
  const path = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from(CAR_BUCKET)
    .upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  return path;
}

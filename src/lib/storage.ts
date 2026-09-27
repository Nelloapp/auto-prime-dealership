import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CAR_BUCKET = "car-photos";

const signedCache = new Map<string, string>();

export type ResponsiveImageOptions = {
  widths: number[];
  aspectRatio: number;
  quality: number;
  resize: "cover" | "contain" | "fill";
};

/** Public buckets are disabled on this workspace, so photos are served via signed URLs. */
export async function getSignedUrls(paths: string[]): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  const missing = unique.filter((p) => !signedCache.has(p));
  if (missing.length > 0) {
    // Authenticated admins (es. foto permute) firmano direttamente con la loro sessione;
    // i visitatori anonimi passano dalla funzione server, senza policy di lettura pubblica.
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      const { data } = await supabase.storage.from(CAR_BUCKET).createSignedUrls(missing, 60 * 60 * 24);
      data?.forEach((item) => {
        if (item.signedUrl && item.path) signedCache.set(item.path, item.signedUrl);
      });
    } else {
      const { getPublicSignedPhotoUrls } = await import("@/lib/storage.functions");
      const out = await getPublicSignedPhotoUrls({ data: { paths: missing } });
      Object.entries(out).forEach(([path, url]) => signedCache.set(path, url));
    }
  }
  const out: Record<string, string> = {};
  unique.forEach((p) => {
    const url = signedCache.get(p);
    if (url) out[p] = url;
  });
  return out;
}

export function signedUrlsQuery(paths: string[]) {
  const key = Array.from(new Set(paths.filter(Boolean))).sort();
  return {
    queryKey: ["signed-urls", key] as const,
    queryFn: () => getSignedUrls(key),
    // Le firme durano 24 ore: 12 ore evitano nuove richieste durante la visita,
    // lasciando un margine ampio prima della scadenza.
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 12,
  };
}

export function useSignedUrls(paths: string[]) {
  const key = Array.from(new Set(paths.filter(Boolean))).sort();
  return useQuery({
    ...signedUrlsQuery(key),
    enabled: key.length > 0,
  });
}

export async function getResponsiveSignedUrls(
  paths: string[],
  options: ResponsiveImageOptions,
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter(Boolean)));
  const widths = Array.from(new Set(options.widths)).sort((a, b) => a - b);
  const cachePrefix = `${options.aspectRatio}:${options.quality}:${options.resize}`;
  const keyFor = (path: string, width: number) => `${cachePrefix}:${path}::${width}`;
  const missingPaths = unique.filter((path) => widths.some((width) => !signedCache.has(keyFor(path, width))));

  if (missingPaths.length > 0) {
    const { getPublicResponsivePhotoUrls } = await import("@/lib/storage.functions");
    const variants = await getPublicResponsivePhotoUrls({ data: { paths: missingPaths, ...options, widths } });
    Object.entries(variants).forEach(([variant, url]) => {
      const separator = variant.lastIndexOf("::");
      const path = variant.slice(0, separator);
      const width = Number(variant.slice(separator + 2));
      signedCache.set(keyFor(path, width), url);
    });
  }

  const out: Record<string, string> = {};
  unique.forEach((path) => widths.forEach((width) => {
    const url = signedCache.get(keyFor(path, width));
    if (url) out[`${path}::${width}`] = url;
  }));
  return out;
}

export function responsiveSignedUrlsQuery(paths: string[], options: ResponsiveImageOptions) {
  const key = Array.from(new Set(paths.filter(Boolean))).sort();
  const widths = Array.from(new Set(options.widths)).sort((a, b) => a - b);
  return {
    queryKey: ["responsive-signed-urls", key, widths, options.aspectRatio, options.quality, options.resize] as const,
    queryFn: () => getResponsiveSignedUrls(key, { ...options, widths }),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 12,
  };
}

export function useResponsiveSignedUrls(paths: string[], options: ResponsiveImageOptions | undefined) {
  const key = Array.from(new Set(paths.filter(Boolean))).sort();
  const fallback: ResponsiveImageOptions = options ?? {
    widths: [64],
    aspectRatio: 1,
    quality: 80,
    resize: "cover",
  };
  return useQuery({
    ...responsiveSignedUrlsQuery(key, fallback),
    enabled: key.length > 0 && Boolean(options),
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

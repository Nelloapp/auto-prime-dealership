import { createFileRoute } from "@tanstack/react-router";

const BUCKET = "car-photos";

/**
 * Public, stable URL for a car photo stored in the private bucket.
 * Social crawlers (WhatsApp, Facebook, X) cannot use expiring signed URLs,
 * so this endpoint streams the image for paths that belong to a published car.
 */
export const Route = createFileRoute("/api/public/foto")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = new URL(request.url).searchParams.get("p") ?? "";
        if (!path || path.includes("..") || path.startsWith("/")) {
          return new Response("Bad request", { status: 400 });
        }

        const { createClient } = await import("@supabase/supabase-js");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const url = process.env["SUPABASE_URL"]!;
        const supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input: RequestInfo | URL, init?: RequestInit) => {
              const headers = new Headers(init?.headers);
              if (key.startsWith("sb_") && headers.get("Authorization") === "Bearer " + key) {
                headers.delete("Authorization");
              }
              headers.set("apikey", key);
              return fetch(input, { ...init, headers });
            },
          },
        });

        // Only serve paths that are actually referenced by a car listing.
        const { data: image, error } = await supabase
          .from("car_images")
          .select("url")
          .eq("url", path)
          .limit(1)
          .maybeSingle();
        if (error) return new Response("Errore", { status: 502 });
        if (!image) return new Response("Not found", { status: 404 });

        // Share previews are capped in size by WhatsApp/X, so serve a 1200x630 rendition.
        const transformed = await supabase.storage.from(BUCKET).createSignedUrl(path, 60, {
          transform: { width: 1200, height: 630, resize: "cover", quality: 80 },
        });
        const signed = transformed.data?.signedUrl
          ? transformed
          : await supabase.storage.from(BUCKET).createSignedUrl(path, 60);
        const signedUrl = signed.data?.signedUrl;
        if (!signedUrl) return new Response("Not found", { status: 404 });

        const upstream = await fetch(signedUrl);
        if (!upstream.ok || !upstream.body) return new Response("Not found", { status: 404 });

        return new Response(upstream.body, {
          headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});

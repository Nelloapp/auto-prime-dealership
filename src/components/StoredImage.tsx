import { createContext, useContext, useState, type ReactNode } from "react";
import { useSignedUrls } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

const SignedImagesContext = createContext<Record<string, string> | null>(null);

type ImageResize = "cover" | "contain" | "fill";

function transformedImageUrl(
  signedUrl: string,
  width: number,
  height: number | undefined,
  quality: number,
  resize: ImageResize,
) {
  try {
    const url = new URL(signedUrl, typeof window === "undefined" ? "http://localhost" : window.location.origin);
    url.pathname = url.pathname.replace("/object/sign/", "/render/image/sign/");
    url.searchParams.set("width", String(width));
    if (height) url.searchParams.set("height", String(height));
    url.searchParams.set("quality", String(quality));
    url.searchParams.set("resize", resize);
    return url.origin === "http://localhost" ? `${url.pathname}${url.search}` : url.toString();
  } catch {
    return signedUrl;
  }
}

export function SignedImagesProvider({ paths, children }: { paths: string[]; children: ReactNode }) {
  const { data } = useSignedUrls(paths);
  return <SignedImagesContext.Provider value={data ?? {}}>{children}</SignedImagesContext.Provider>;
}

export function StoredImage({
  path,
  alt,
  className,
  loading = "lazy",
  fetchPriority = "auto",
  width,
  height,
  responsiveWidths,
  sizes,
  quality = 78,
  resize = "cover",
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
  responsiveWidths?: number[];
  sizes?: string;
  quality?: number;
  resize?: ImageResize;
}) {
  const batch = useContext(SignedImagesContext);
  const single = useSignedUrls(batch === null && path ? [path] : []);
  const url = path ? batch?.[path] ?? single.data?.[path] : undefined;
  const [loaded, setLoaded] = useState(false);

  if (!url) {
    return (
      <div className={cn("flex items-center justify-center bg-secondary", className)}>
        <Car className="size-10 text-muted-foreground/50" />
      </div>
    );
  }

  const candidates = Array.from(new Set((responsiveWidths ?? []).filter((item) => item > 0))).sort(
    (a, b) => a - b,
  );
  const aspectRatio = width && height ? height / width : undefined;
  const srcWidth = width ?? candidates.at(-1);
  const src = srcWidth
    ? transformedImageUrl(
        url,
        srcWidth,
        aspectRatio ? Math.round(srcWidth * aspectRatio) : undefined,
        quality,
        resize,
      )
    : url;
  const srcSet = candidates.length
    ? candidates
        .map((candidate) =>
          `${transformedImageUrl(
            url,
            candidate,
            aspectRatio ? Math.round(candidate * aspectRatio) : undefined,
            quality,
            resize,
          )} ${candidate}w`,
        )
        .join(", ")
    : undefined;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      width={width}
      height={height}
      onLoad={() => setLoaded(true)}
      className={cn("transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0", className)}
    />
  );
}

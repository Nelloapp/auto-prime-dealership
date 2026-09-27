import { createContext, useContext, useState, type ReactNode } from "react";
import { useResponsiveSignedUrls, useSignedUrls, type ResponsiveImageOptions } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

const SignedImagesContext = createContext<Record<string, string> | null>(null);
const ResponsiveImagesContext = createContext<Record<string, string> | null>(null);

export function SignedImagesProvider({
  paths,
  children,
  responsive,
}: {
  paths: string[];
  children: ReactNode;
  responsive?: ResponsiveImageOptions;
}) {
  const { data } = useSignedUrls(paths);
  const { data: responsiveData } = useResponsiveSignedUrls(paths, responsive);
  return (
    <SignedImagesContext.Provider value={data ?? {}}>
      <ResponsiveImagesContext.Provider value={responsiveData ?? {}}>
        {children}
      </ResponsiveImagesContext.Provider>
    </SignedImagesContext.Provider>
  );
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
}) {
  const batch = useContext(SignedImagesContext);
  const responsiveBatch = useContext(ResponsiveImagesContext);
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
  const variantUrl = (candidate: number) => responsiveBatch?.[`${path}::${candidate}`];
  const srcWidth = width ?? candidates.at(-1);
  const src = srcWidth && variantUrl(srcWidth) ? variantUrl(srcWidth) ?? url : url;
  const srcSet = candidates.length
    ? candidates
        .filter((candidate) => variantUrl(candidate))
        .map((candidate) =>
          `${variantUrl(candidate)} ${candidate}w`,
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

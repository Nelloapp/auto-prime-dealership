import { createContext, useContext, useState, type ReactNode } from "react";
import { useSignedUrls } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

const SignedImagesContext = createContext<Record<string, string> | null>(null);

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
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
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

  return (
    <img
      src={url}
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

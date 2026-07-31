import { useSignedUrls } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

export function StoredImage({
  path,
  alt,
  className,
  loading = "lazy",
}: {
  path: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const { data } = useSignedUrls(path ? [path] : []);
  const url = path ? data?.[path] : undefined;

  if (!url) {
    return (
      <div className={cn("flex items-center justify-center bg-secondary", className)}>
        <Car className="size-10 text-muted-foreground/50" />
      </div>
    );
  }

  return <img src={url} alt={alt} loading={loading} decoding="async" className={className} />;
}

import type { Media } from "@/lib/content";

type LinkedMediaProps = {
  caption?: boolean;
  className?: string;
  fallbackAlt: string;
  loading?: "eager" | "lazy";
  media: Media | null | undefined;
  sizes?: string;
};

/**
 * Displays a CMS-managed image while keeping public cards resilient when the
 * linked media has been removed. The API route serves the original file from
 * the configured object storage, so no external image allowlist is required.
 */
export function LinkedMedia({
  caption = false,
  className = "",
  fallbackAlt,
  loading = "lazy",
  media,
  sizes,
}: LinkedMediaProps) {
  if (!media) return null;

  return (
    <figure className={`m-0 overflow-hidden bg-slate-100 ${className}`}>
      <img
        alt={media.altText || fallbackAlt}
        className="block h-full w-full object-cover"
        loading={loading}
        sizes={sizes}
        src={`/api/media/${media.id}`}
      />
      {caption && media.caption ? (
        <figcaption className="border-t border-slate-200 bg-white px-3 py-2 text-sm leading-snug text-slate-600">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

import type { SupportLink } from "@/lib/content";
import { cn } from "@/lib/utils";

const providerLabel: Record<SupportLink["provider"], string> = {
  helloasso: "HelloAsso",
  tipeee: "Tipeee",
  other: "Soutenir",
};

export function SupportLinks({
  links,
  className,
  compact = false,
}: {
  links: SupportLink[];
  className?: string;
  compact?: boolean;
}) {
  if (!links.length) return null;

  return (
    <div className={cn("support-links", compact && "is-compact", className)}>
      {links.map((link, index) => (
        <a
          className="support-link"
          href={link.url}
          key={link.id}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="support-link-index">0{index + 1}</span>
          <span className="support-link-label">{link.label}</span>
          <span className="support-link-provider">{providerLabel[link.provider]}</span>
          <span className="support-link-arrow" aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

import type { SupportLink } from "@/lib/content";
import { cn } from "@/lib/utils";

const providerLabel: Record<SupportLink["provider"], string> = {
  helloasso: "HelloAsso",
  tipeee: "Tipeee",
  other: "Soutenir le projet",
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
    <div className={cn("nova-support-links", compact && "is-compact", className)}>
      {links.map((link) => (
        <a
          className="nova-support-link"
          href={link.url}
          key={link.id}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className="nova-support-provider">{providerLabel[link.provider]}</span>
          <span className="nova-support-label">{link.label}</span>
        </a>
      ))}
    </div>
  );
}

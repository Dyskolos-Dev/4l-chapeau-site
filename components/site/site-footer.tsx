import Link from "next/link";
import { getSiteSettings } from "@/lib/content-repository";

export async function SiteFooter() {
  const settings = await getSiteSettings();
  const { navigation, footer, identity, contact } = settings;
  const contacts = [
    contact.email
      ? { href: `mailto:${contact.email}`, label: contact.email, external: false }
      : null,
    contact.instagramUrl
      ? { href: contact.instagramUrl, label: "Instagram", external: true }
      : null,
    contact.facebookUrl
      ? { href: contact.facebookUrl, label: "Facebook", external: true }
      : null,
    contact.tiktokUrl
      ? { href: contact.tiktokUrl, label: "TikTok", external: true }
      : null,
  ].filter((contactItem): contactItem is NonNullable<typeof contactItem> => Boolean(contactItem));

  return (
    <footer className="nova-footer">
      <div className="nova-container nova-footer-grid">
        <div>
          <p className="nova-footer-brand">{identity.associationName}</p>
          <p className="nova-footer-copy">
            {footer.copy}
          </p>
        </div>
        <nav className="nova-footer-nav" aria-label="Navigation pied de page">
          <Link href="/le-projet">{navigation.association}</Link>
          <Link href="/4l-trophy">{navigation.trophy}</Link>
          <Link href="/evenements">{navigation.events}</Link>
          <Link href="/actualites">{navigation.news}</Link>
          <Link href="/galerie">{navigation.gallery}</Link>
          <Link href="/soutenir">{navigation.support}</Link>
        </nav>
        {contacts.length ? (
          <nav className="nova-footer-contacts" aria-label="Nous contacter">
            {contacts.map((contactItem) => (
              <a
                href={contactItem.href}
                key={contactItem.href}
                rel={contactItem.external ? "noopener noreferrer" : undefined}
                target={contactItem.external ? "_blank" : undefined}
              >
                {contactItem.label}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="nova-footer-meta">
          <span>© {new Date().getFullYear()} {identity.associationName}</span>
          <Link href="/admin">{footer.adminLabel}</Link>
        </div>
      </div>
    </footer>
  );
}

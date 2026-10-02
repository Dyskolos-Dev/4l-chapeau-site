import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="nova-footer">
      <div className="nova-container nova-footer-grid">
        <div>
          <p className="nova-footer-brand">4L CHAPEAU</p>
          <p className="nova-footer-copy">
            Une association qui prépare une 4L, partage son aventure et prend part aux rendez-vous qui font rouler les idées.
          </p>
        </div>
        <nav className="nova-footer-nav" aria-label="Navigation pied de page">
          <Link href="/le-projet">L’association</Link>
          <Link href="/4l-trophy">4L Trophy</Link>
          <Link href="/evenements">Événements</Link>
          <Link href="/actualites">Actualités</Link>
          <Link href="/galerie">Galerie</Link>
          <Link href="/soutenir">Soutenir</Link>
        </nav>
        <div className="nova-footer-meta">
          <span>© {new Date().getFullYear()} 4L CHAPEAU</span>
          <Link href="/admin">Espace équipage</Link>
        </div>
      </div>
    </footer>
  );
}

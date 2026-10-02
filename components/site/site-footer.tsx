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
          <a href="/le-projet">L’association</a>
          <a href="/4l-trophy">4L Trophy</a>
          <a href="/evenements">Événements</a>
          <a href="/actualites">Actualités</a>
          <a href="/galerie">Galerie</a>
          <a href="/soutenir">Soutenir</a>
        </nav>
        <div className="nova-footer-meta">
          <span>© {new Date().getFullYear()} 4L CHAPEAU</span>
          <a href="/admin">Espace équipage</a>
        </div>
      </div>
    </footer>
  );
}

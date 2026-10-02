import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="route-footer">
      <div className="route-footer-mark">
        <span>4L / CHAPEAU</span>
        <p>Une voiture qui nous ressemble : simple, vive et toujours partante.</p>
      </div>
      <div className="route-footer-links">
        <Link href="/le-projet">Le projet</Link>
        <Link href="/carnet">Carnet</Link>
        <Link href="/galerie">Galerie</Link>
        <Link href="/soutenir">Soutenir</Link>
      </div>
      <div className="route-footer-meta">
        <span>© {new Date().getFullYear()} 4L CHAPEAU</span>
        <Link href="/admin">Accès équipage</Link>
      </div>
    </footer>
  );
}

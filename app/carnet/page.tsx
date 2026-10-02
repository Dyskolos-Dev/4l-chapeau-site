import Link from "next/link";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { formatDate, starterArticles } from "@/lib/content";
import { getPublishedArticles } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const storedArticles = await getPublishedArticles(48);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <main className="route-app route-carnet">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        index="02 / CARNET"
        eyebrow="Nouvelles du garage, de la route et de l’équipage"
        title="Ce qu’on garde du trajet, entre deux virages."
        lead="Le carnet de 4L CHAPEAU suit la voiture dans les bons jours comme dans les imprévus. Ici, l’atelier sent autant l’huile que l’envie de repartir."
      />

      <section className="carnet-feature route-frame">
        <MotionReveal className="carnet-feature-heading">
          <p className="signal-label">DERNIÈRE TRANSMISSION</p>
          <span>FEUILLET / 01</span>
        </MotionReveal>
        <MotionReveal className="carnet-feature-card" delay={100}>
          <Link href={`/carnet/${featured.slug}`}>
            <div className="carnet-feature-art" aria-hidden="true">
              <img src="/images/4l-chapeau-hero-day.png" alt="" />
              <span>{featured.category}</span>
            </div>
            <div className="carnet-feature-copy">
              <time dateTime={featured.publishedAt ?? featured.createdAt}>{formatDate(featured.publishedAt ?? featured.createdAt)}</time>
              <h2>{featured.title}</h2>
              <p>{featured.excerpt}</p>
              <span className="route-text-link">Lire la transmission <b>↗</b></span>
            </div>
          </Link>
        </MotionReveal>
      </section>

      <section className="carnet-stream route-frame">
        <MotionReveal className="carnet-stream-title">
          <p className="signal-label">TOUTES LES NOTES</p>
          <p>{articles.length} transmission{articles.length > 1 ? "s" : ""} dans les archives.</p>
        </MotionReveal>
        <div className="carnet-entries">
          {remaining.map((article, index) => (
            <MotionReveal className="carnet-entry" delay={(index % 3) * 80} key={article.id}>
              <Link href={`/carnet/${article.slug}`}>
                <div className="carnet-entry-index">{String(index + 2).padStart(2, "0")}</div>
                <div className="carnet-entry-heading">
                  <span>{article.category}</span>
                  <h2>{article.title}</h2>
                </div>
                <p>{article.excerpt}</p>
                <time dateTime={article.publishedAt ?? article.createdAt}>{formatDate(article.publishedAt ?? article.createdAt)}</time>
                <i aria-hidden="true">↗</i>
              </Link>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="carnet-outro route-frame">
        <MotionReveal>
          <p>On continue d’écrire dehors.</p>
          <Link href="/galerie">Voir les images du trajet <span>↗</span></Link>
        </MotionReveal>
      </section>
      <SiteFooter />
    </main>
  );
}

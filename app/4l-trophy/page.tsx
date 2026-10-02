import Link from "next/link";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  normalizeArticleCategory,
  starterArticles,
  starterUpdates,
  updateStatusLabel,
} from "@/lib/content";
import { getPublishedArticles, getPublishedUpdates } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function TrophyPage() {
  const [storedUpdates, storedArticles] = await Promise.all([
    getPublishedUpdates(),
    getPublishedArticles(36),
  ]);
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const projectNotes = articles
    .filter((article) => {
      const category = normalizeArticleCategory(article.category);
      return category === "4L Trophy" || category === "Atelier & préparation";
    })
    .slice(0, 3);

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        eyebrow="4L Trophy"
        title="Un défi collectif, préparé avec méthode."
        lead="Le 4L Trophy est le grand rendez-vous qui guide notre préparation : une 4L fiable, une équipe prête et une aventure solidaire à construire ensemble."
      />

      <section className="nova-container nova-split-section">
        <MotionReveal className="nova-split-media">
          <img src="/images/4l-chapeau-hero-day.png" alt="La 4L de l’association sur une piste" />
        </MotionReveal>
        <MotionReveal className="nova-split-copy" delay={100}>
          <p className="nova-eyebrow">Notre préparation</p>
          <h2>Le départ se prépare bien avant la ligne de départ.</h2>
          <p>La mécanique, la sécurité, l’équipement et les soutiens se préparent un à un. Cette page rassemble les avancées du projet 4L Trophy.</p>
          <Link className="nova-button nova-button-primary" href="/soutenir">Accompagner l’équipage</Link>
        </MotionReveal>
      </section>

      <section className="nova-roadmap-section">
        <div className="nova-container">
          <div className="nova-section-heading">
            <p className="nova-eyebrow nova-eyebrow-light">Feuille de route</p>
            <h2>Les étapes de la préparation.</h2>
          </div>
          <ol className="nova-roadmap">
            {updates.map((update, index) => (
              <MotionReveal className="nova-roadmap-item" delay={index * 45} key={update.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <time>{update.period}</time>
                <div>
                  <h3>{update.title}</h3>
                  <p>{update.summary}</p>
                </div>
                <small>{updateStatusLabel(update.status)}</small>
              </MotionReveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="nova-container nova-related-section">
        <div className="nova-section-heading nova-section-heading-row">
          <div>
            <p className="nova-eyebrow">Journal de préparation</p>
            <h2>Les dernières nouvelles.</h2>
          </div>
          <Link className="nova-text-link" href="/actualites">Voir toutes les actualités</Link>
        </div>
        {projectNotes.length ? (
          <div className="nova-news-grid">
            {projectNotes.map((article) => (
              <MotionReveal className="nova-news-card" key={article.id}>
                <p>{normalizeArticleCategory(article.category)}</p>
                <h3>{article.title}</h3>
                <span>{article.excerpt}</span>
                <Link href={`/actualites/${article.slug}`}>Lire l’article</Link>
              </MotionReveal>
            ))}
          </div>
        ) : (
          <div className="nova-empty-panel">Les prochaines nouvelles de préparation apparaîtront ici.</div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

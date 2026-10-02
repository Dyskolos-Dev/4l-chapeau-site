import Link from "next/link";
import { CountUp, MotionReveal, RouteProgress } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SupportLinks } from "@/components/site/support-links";
import {
  formatDate,
  starterArticles,
  starterUpdates,
  updateStatusLabel,
} from "@/lib/content";
import {
  getPublishedArticles,
  getPublishedSupportLinks,
  getPublishedUpdates,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const manifesto = [
  ["01", "Réparer", "Comprendre la voiture, pièce par pièce, plutôt que simplement la faire rouler."],
  ["02", "Traverser", "Faire des événements une histoire à vivre ensemble, pas une ligne d’arrivée."],
  ["03", "Transmettre", "Partager les clés, les erreurs et la poussière avec celles et ceux qui montent à bord."],
];

export default async function Home() {
  const [storedArticles, storedUpdates, supportLinks] = await Promise.all([
    getPublishedArticles(2),
    getPublishedUpdates(),
    getPublishedSupportLinks(),
  ]);
  const articles = storedArticles.length ? storedArticles : starterArticles.slice(0, 2);
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;
  const currentUpdate = updates.find((item) => item.status === "current") ?? updates.at(-1);

  return (
    <main className="route-app route-home">
      <RouteProgress />
      <SiteHeader />

      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="route-frame home-hero-inner">
          <div className="home-hero-copy">
            <MotionReveal>
              <div className="signal-label">
                <span className="signal-dot" />
                4L CHAPEAU · Association sportive & solidaire
              </div>
              <p className="hero-route-code">4L TROPHY · ATELIER · ÉVÉNEMENTS · AVENTURE</p>
              <h1 id="home-title">
                Une 4L.
                <em>Une aventure à vivre.</em>
              </h1>
            </MotionReveal>
            <MotionReveal delay={130}>
              <p className="home-hero-lead">
                Notre équipage prépare sa 4L pour le 4L Trophy et pour tous les
                rendez-vous qui font grandir une aventure collective.
              </p>
              <div className="hero-actions route-actions">
                <Link className="route-button route-button-acid" href="/le-projet">
                  Découvrir le projet <span>↗</span>
                </Link>
                <Link className="route-text-link" href="/soutenir">
                  Nous soutenir <span>→</span>
                </Link>
              </div>
            </MotionReveal>
          </div>

          <MotionReveal className="home-hero-visual" delay={80}>
            <div className="hero-image-window">
              <img
                src="/images/4l-chapeau-hero-day.png"
                alt="La 4L de l’association roule sur une piste ocre dans un paysage ensoleillé."
              />
            </div>
            <div className="hero-image-caption">
              <span>4L CHAPEAU</span>
              <b>La route nous attend.</b>
            </div>
            <div className="hero-coordinate-mark" aria-hidden="true">
              <span>N 32° 17′</span>
              <span>W 06° 18′</span>
            </div>
            <div className="hero-spoke hero-spoke-one" aria-hidden="true" />
            <div className="hero-spoke hero-spoke-two" aria-hidden="true" />
          </MotionReveal>

          <MotionReveal className="home-telemetry" delay={240}>
            <div>
              <span>NOTRE CAP</span>
              <strong>4L TROPHY</strong>
            </div>
            <p>{currentUpdate?.title ?? "La préparation est lancée"}</p>
            <Link href="/le-projet">Suivre la préparation <span>↗</span></Link>
          </MotionReveal>
        </div>
      </section>

      <section className="home-rally-strip" aria-label="L’esprit 4L CHAPEAU">
        <div className="route-frame">
          <span>Préparer ensemble</span>
          <span>Prendre la route</span>
          <span>Faire vivre l’aventure</span>
        </div>
      </section>

      <section className="home-manifesto route-frame">
        <MotionReveal className="manifesto-head">
          <p className="signal-label">CE QUI NOUS TIENT SUR LA ROUTE</p>
          <h2>Une équipe.<br />Une 4L.<br /><em>Beaucoup d’envies d’aller loin.</em></h2>
        </MotionReveal>
        <div className="manifesto-list">
          {manifesto.map(([index, title, text], number) => (
            <MotionReveal className="manifesto-item" delay={number * 90} key={index}>
              <span>{index}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <i aria-hidden="true">↘</i>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="home-route-snapshot">
        <div className="route-frame snapshot-grid">
          <MotionReveal className="snapshot-quote">
            <p className="signal-label">LA FEUILLE DE ROUTE</p>
            <h2>La préparation avance.<br />L’aventure approche.</h2>
            <Link className="route-text-link" href="/le-projet">Voir les avancées <span>→</span></Link>
          </MotionReveal>
          <MotionReveal className="snapshot-stats" delay={140}>
            <div className="snapshot-stat">
              <strong><CountUp value={updates.length} /></strong>
              <span>étapes de préparation</span>
            </div>
            <div className="snapshot-stat">
              <strong><CountUp value={3} /></strong>
              <span>piliers de l’association</span>
            </div>
            <div className="snapshot-current">
              <span>EN CE MOMENT</span>
              <h3>{currentUpdate?.title ?? "Préparation en cours"}</h3>
              <p>{currentUpdate?.summary}</p>
              {currentUpdate && <small>{updateStatusLabel(currentUpdate.status)} · {currentUpdate.period}</small>}
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="home-carnet route-frame">
        <MotionReveal className="section-heading-rail">
          <div>
            <p className="signal-label">NOS DERNIÈRES NOUVELLES</p>
            <h2>L’aventure se vit.<br /><em>Elle se raconte aussi.</em></h2>
          </div>
          <Link className="route-button route-button-outline" href="/carnet">Tout le carnet <span>↗</span></Link>
        </MotionReveal>
        <div className="dispatch-list">
          {articles.map((article, index) => (
            <MotionReveal className="dispatch-item" delay={index * 110} key={article.id}>
              <Link href={`/carnet/${article.slug}`}>
                <div className="dispatch-meta">
                  <span>0{index + 1}</span>
                  <time dateTime={article.publishedAt ?? article.createdAt}>
                    {formatDate(article.publishedAt ?? article.createdAt)}
                  </time>
                </div>
                <div className="dispatch-body">
                  <p>{article.category}</p>
                  <h3>{article.title}</h3>
                  <span>{article.excerpt}</span>
                </div>
                <i aria-hidden="true">↗</i>
              </Link>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="home-gallery-tease">
        <div className="route-frame gallery-tease-grid">
          <MotionReveal className="gallery-tease-image">
            <img
              src="/images/4l-chapeau-hero-day.png"
              alt="La 4L de l’association roule sous le soleil sur une route de terre."
            />
            <span>PLAN / 007</span>
          </MotionReveal>
          <MotionReveal className="gallery-tease-copy" delay={120}>
            <p className="signal-label">EN IMAGES</p>
            <h2>Les kilomètres, les rencontres, les souvenirs.</h2>
            <p>Une galerie vivante, enrichie au fil de l’atelier, des événements et des départs.</p>
            <Link className="route-button route-button-paper" href="/galerie">Ouvrir la galerie <span>↗</span></Link>
          </MotionReveal>
        </div>
      </section>

      <section className="home-support route-frame">
        <MotionReveal className="home-support-copy">
          <p className="signal-label">MONTER À BORD</p>
          <h2>Les bons voyages n’avancent jamais seuls.</h2>
          <p>
            Une aide financière, un contact, une pièce ou une idée : chaque coup de pouce déplace un peu le prochain départ.
          </p>
          <Link className="route-text-link" href="/soutenir">Toutes les façons d’aider <span>→</span></Link>
        </MotionReveal>
        <MotionReveal delay={150}>
          {supportLinks.length ? (
            <SupportLinks links={supportLinks} compact />
          ) : (
            <div className="support-empty-rail">
              <span>LES BOUTONS DE SOUTIEN ARRIVENT ICI</span>
              <p>L’équipage pourra publier ses liens HelloAsso, Tipeee ou partenaires depuis son espace privé.</p>
            </div>
          )}
        </MotionReveal>
      </section>

      <SiteFooter />
    </main>
  );
}

import {
  formatDate,
  starterArticles,
  starterUpdates,
  updateStatusLabel,
} from "@/lib/content";
import {
  getPublicMedia,
  getPublishedArticles,
  getPublishedUpdates,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const featureCards = [
  {
    number: "01",
    title: "Préparer",
    text: "Restaurer et fiabiliser la 4L, étape après étape, pour des kilomètres plus sereins.",
  },
  {
    number: "02",
    title: "Rouler",
    text: "Prendre part à des événements où la route, l’entraide et la curiosité comptent autant que l’arrivée.",
  },
  {
    number: "03",
    title: "Partager",
    text: "Faire vivre l’aventure avec celles et ceux qui nous soutiennent, suivent le projet ou prennent les outils.",
  },
];

export default async function Home() {
  const [storedArticles, storedUpdates, storedMedia] = await Promise.all([
    getPublishedArticles(3),
    getPublishedUpdates(),
    getPublicMedia(8),
  ]);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="4L CHAPEAU, accueil">
          <span className="brand-mark">4L</span>
          <span>CHAPEAU</span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#aventure">L’aventure</a>
          <a href="#avancements">Avancées</a>
          <a href="#journal">Journal</a>
          <a href="#galerie">Galerie</a>
        </nav>
        <a className="header-cta" href="#soutenir">
          Soutenir l’aventure
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Association 4L CHAPEAU · France</p>
          <h1>
            Faire rouler une 4L.
            <span>Vivre l’aventure.</span>
            Partager le chemin.
          </h1>
          <p className="hero-lede">
            4L CHAPEAU prépare une Renault 4L pour le 4L Trophy et d’autres
            rendez-vous sportifs et solidaires. Entre atelier, routes et
            rencontres, on vous embarque à chaque étape.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#aventure">
              Découvrir le projet
            </a>
            <a className="text-link" href="#avancements">
              Suivre nos avancées
            </a>
          </div>
          <div className="hero-footnote">
            <span className="route-dot" aria-hidden="true" />
            Cap sur la prochaine édition du 4L Trophy.
          </div>
        </div>
        <div className="hero-photo-wrap">
          <div className="hero-photo-label">Piste ouverte · 2026</div>
          <img
            className="hero-photo"
            src="/images/4l-chapeau-hero.png"
            alt="Une Renault 4L de rallye roule sur une piste ocre dans un paysage aride."
          />
        </div>
      </section>

      <section className="intro-section section-shell" id="aventure">
        <div className="section-kicker">Le projet</div>
        <div className="intro-heading">
          <h2>Une aventure mécanique et humaine.</h2>
          <p>
            Notre association réunit des passionnés autour d’une même idée :
            remettre une 4L sur la route, apprendre à la connaître et faire
            vivre son esprit d’aventure. Le 4L Trophy est notre grand cap,
            mais le projet se construit aussi lors de balades, rassemblements
            et événements sportifs.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <span className="feature-number">{feature.number}</span>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-section" id="avancements">
        <div className="section-shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Journal de préparation</p>
              <h2>Le projet, kilomètre après kilomètre.</h2>
            </div>
            <p className="section-aside">
              Une frise vivante, mise à jour au fil de l’atelier et des
              sorties.
            </p>
          </div>
          <ol className="roadmap-list">
            {updates.map((update) => (
              <li className="roadmap-item" key={update.id}>
                <div className="roadmap-marker" aria-hidden="true">
                  <span className={`marker-dot marker-${update.status}`} />
                </div>
                <div className="roadmap-period">{update.period}</div>
                <article>
                  <div className="roadmap-title-row">
                    <h3>{update.title}</h3>
                    <span className={`status status-${update.status}`}>
                      {updateStatusLabel(update.status)}
                    </span>
                  </div>
                  <p>{update.summary}</p>
                </article>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="journal-section section-shell" id="journal">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Journal de bord</p>
            <h2>Les nouvelles de la route.</h2>
          </div>
          <span className="section-aside">Atelier, essais et vie de l’association.</span>
        </div>
        <div className="journal-grid">
          {articles.map((article) => (
            <article className="journal-card" key={article.id}>
              <div className="journal-meta">
                <span>{article.category}</span>
                <time dateTime={article.publishedAt ?? article.createdAt}>
                  {formatDate(article.publishedAt ?? article.createdAt)}
                </time>
              </div>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <span className="journal-more">Lire le carnet</span>
            </article>
          ))}
        </div>
      </section>

      <section className="gallery-section" id="galerie">
        <div className="section-shell gallery-layout">
          <div className="gallery-heading">
            <p className="eyebrow">Galerie</p>
            <h2>Des traces de pneus, des mains et des souvenirs.</h2>
            <p>
              Les photos de l’association arrivent ici au fil des sorties. La
              galerie est pensée pour raconter la préparation autant que les
              grands départs.
            </p>
          </div>
          <div className="gallery-grid">
            <figure className="gallery-lead">
              <img
                src="/images/4l-chapeau-hero.png"
                alt="La 4L de l’association roule sur une piste de terre sous une lumière chaude."
              />
              <figcaption>
                <span>Essais sur route</span>
                <strong>Les premiers tours de roue</strong>
              </figcaption>
            </figure>
            {storedMedia.map((item) => (
              <figure className="gallery-uploaded" key={item.id}>
                <img src={`/api/media/${item.id}`} alt={item.altText} />
                <figcaption>{item.caption || item.fileName}</figcaption>
              </figure>
            ))}
            {!storedMedia.length && (
              <div className="gallery-empty">
                <span>À suivre</span>
                <p>Les prochains clichés de l’atelier et des événements seront publiés ici.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="support-section" id="soutenir">
        <div className="section-shell support-inner">
          <p className="eyebrow">Faire partie du voyage</p>
          <h2>Un coup de main, un conseil ou une rencontre peut faire avancer la 4L.</h2>
          <p>
            Vous voulez suivre l’aventure de près ou accompagner l’association ?
            Parlons-en autour d’un café, d’une clé de 13 ou d’une carte routière.
          </p>
          <a className="button button-light" href="#top">
            Rejoindre le départ
          </a>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <a className="brand" href="#top">
          <span className="brand-mark">4L</span>
          <span>CHAPEAU</span>
        </a>
        <p>4L CHAPEAU · une association, une voiture, beaucoup de chemin.</p>
        <a href="/admin" className="admin-link">
          Espace administration
        </a>
      </footer>
    </main>
  );
}

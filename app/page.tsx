import Link from "next/link";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SupportLinks } from "@/components/site/support-links";
import {
  formatDate,
  normalizeArticleCategory,
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

const categories = [
  {
    label: "4L Trophy",
    text: "Le cap, la préparation et les étapes de notre équipage.",
    href: "/4l-trophy",
  },
  {
    label: "Atelier",
    text: "Les réparations, les essais et les détails qui font avancer la 4L.",
    href: "/actualites",
  },
  {
    label: "Événements",
    text: "Les sorties, rassemblements et rendez-vous sportifs de l’association.",
    href: "/evenements",
  },
  {
    label: "Actualités",
    text: "Toutes les nouvelles classées par thème, au même endroit.",
    href: "/actualites",
  },
];

export default async function Home() {
  const [storedArticles, storedUpdates, supportLinks] = await Promise.all([
    getPublishedArticles(3),
    getPublishedUpdates(),
    getPublishedSupportLinks(),
  ]);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;
  const currentUpdate = updates.find((item) => item.status === "current") ?? updates.at(-1);

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />

      <section className="nova-home-hero">
        <img
          className="nova-home-hero-image"
          src="/images/4l-chapeau-hero-day.png"
          alt="La 4L de l’association sur une piste sous le soleil"
        />
        <div className="nova-home-hero-shade" />
        <div className="nova-container nova-home-hero-content">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">Association sportive et solidaire</p>
            <h1>Une 4L, une équipe, une aventure à partager.</h1>
            <p className="nova-hero-lead">
              4L CHAPEAU prépare son équipage pour le 4L Trophy et fait vivre d’autres événements autour de la route, du sport et de la solidarité.
            </p>
            <div className="nova-hero-actions">
              <Link className="nova-button nova-button-primary" href="/4l-trophy">Découvrir le projet</Link>
              <Link className="nova-button nova-button-ghost" href="/soutenir">Soutenir l’aventure</Link>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="nova-category-section">
        <div className="nova-container">
          <div className="nova-section-heading">
            <p className="nova-eyebrow">Explorer l’association</p>
            <h2>Chaque sujet a sa page.</h2>
          </div>
          <div className="nova-category-grid">
            {categories.map((category) => (
              <Link className="nova-category-card" href={category.href} key={category.label}>
                <span>{category.label}</span>
                <p>{category.text}</p>
                <strong>Voir la rubrique</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="nova-progress-section">
        <div className="nova-container nova-progress-grid">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">En ce moment</p>
            <h2>{currentUpdate?.title ?? "La préparation est en route."}</h2>
            <p>{currentUpdate?.summary ?? "Suivez les avancées de l’équipage, étape après étape."}</p>
            <Link className="nova-text-link nova-text-link-light" href="/4l-trophy">Voir la préparation</Link>
          </MotionReveal>
          <div className="nova-progress-list">
            {updates.slice(-3).map((update) => (
              <MotionReveal className="nova-progress-item" delay={80} key={update.id}>
                <span>{update.period}</span>
                <div>
                  <strong>{update.title}</strong>
                  <small>{updateStatusLabel(update.status)}</small>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="nova-news-section nova-container">
        <div className="nova-section-heading nova-section-heading-row">
          <div>
            <p className="nova-eyebrow">Actualités</p>
            <h2>Le journal de l’équipage.</h2>
          </div>
          <Link className="nova-text-link" href="/actualites">Toutes les actualités</Link>
        </div>
        <div className="nova-news-grid">
          {articles.map((article) => (
            <MotionReveal className="nova-news-card" key={article.id}>
              <p>{normalizeArticleCategory(article.category)}</p>
              <time dateTime={article.publishedAt ?? article.createdAt}>
                {formatDate(article.publishedAt ?? article.createdAt)}
              </time>
              <h3>{article.title}</h3>
              <span>{article.excerpt}</span>
              <Link href={`/actualites/${article.slug}`}>Lire l’article</Link>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-home-support">
        <div className="nova-container nova-home-support-grid">
          <MotionReveal>
            <p className="nova-eyebrow">Nous soutenir</p>
            <h2>Les projets qui roulent ne se construisent jamais seuls.</h2>
            <p>Un don, un partenariat, une pièce ou un partage : chaque aide compte pour l’équipe.</p>
            <Link className="nova-button nova-button-primary" href="/soutenir">Voir les possibilités</Link>
          </MotionReveal>
          <MotionReveal delay={100}>
            {supportLinks.length ? (
              <SupportLinks links={supportLinks} compact />
            ) : (
              <div className="nova-support-note">
                <strong>Vous souhaitez nous accompagner ?</strong>
                <p>Les liens de soutien seront publiés ici par l’équipage. En attendant, découvrez comment prendre contact.</p>
                <Link className="nova-text-link" href="/soutenir">Contacter l’association</Link>
              </div>
            )}
          </MotionReveal>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

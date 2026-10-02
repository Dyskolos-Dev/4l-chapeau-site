import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { normalizeArticleCategory, starterArticles } from "@/lib/content";
import { getPublishedArticles } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const formats = [
  ["Sorties & rassemblements", "Pour retrouver d’autres passionnés, partager la route et faire connaître le projet."],
  ["Rendez-vous sportifs", "Des étapes qui donnent du rythme à la préparation et permettent à l’équipe de se dépasser."],
  ["Rencontres solidaires", "Des temps forts pour faire vivre l’entraide qui est au cœur de l’aventure."],
];

export default async function EventsPage() {
  const storedArticles = await getPublishedArticles(48);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const eventNews = articles.filter(
    (article) => normalizeArticleCategory(article.category) === "Événements",
  );

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        eyebrow="Événements"
        title="Faire vivre la 4L, sur la route et avec les autres."
        lead="À côté du 4L Trophy, 4L CHAPEAU participe et organise des moments sportifs, mécaniques et solidaires. Les rendez-vous confirmés sont annoncés ici."
      />

      <section className="nova-container nova-format-section">
        <div className="nova-section-heading">
          <p className="nova-eyebrow">Nos formats</p>
          <h2>Des occasions de se retrouver.</h2>
        </div>
        <div className="nova-format-grid">
          {formats.map(([title, text], index) => (
            <MotionReveal className="nova-format-card" delay={index * 75} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-event-news-section">
        <div className="nova-container">
          <div className="nova-section-heading nova-section-heading-row">
            <div>
              <p className="nova-eyebrow nova-eyebrow-light">Rendez-vous annoncés</p>
              <h2>Les prochaines dates.</h2>
            </div>
            <a className="nova-text-link nova-text-link-light" href="/actualites">Toutes les actualités</a>
          </div>
          {eventNews.length ? (
            <div className="nova-event-news-grid">
              {eventNews.map((article) => (
                <MotionReveal className="nova-event-news-card" key={article.id}>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <a href={`/actualites/${article.slug}`}>Voir le rendez-vous</a>
                </MotionReveal>
              ))}
            </div>
          ) : (
            <MotionReveal className="nova-empty-panel nova-empty-panel-dark">
              Les prochains rendez-vous seront annoncés ici par l’équipe. Revenez bientôt ou consultez les actualités.
            </MotionReveal>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { LinkedMedia } from "@/components/site/linked-media";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { normalizeArticleCategory, starterArticles } from "@/lib/content";
import {
  getPublishedArticles,
  getPublicMediaByIds,
  getSiteSettings,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [settings, storedArticles] = await Promise.all([
    getSiteSettings(),
    getPublishedArticles(48),
  ]);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const events = settings.events;
  const eventNews = articles.filter(
    (article) => normalizeArticleCategory(article.category) === "Événements",
  );
  const articleMedia = await getPublicMediaByIds(
    eventNews.map((article) => article.coverMediaId),
  );

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <PageIntro
        eyebrow={events.eyebrow}
        title={events.title}
        lead={events.lead}
      />

      <section className="nova-container nova-format-section">
        <div className="nova-section-heading">
            <p className="nova-eyebrow">{events.formatsEyebrow}</p>
            <h2>{events.formatsTitle}</h2>
        </div>
        <div className="nova-format-grid">
          {events.formats.map((format, index) => (
            <MotionReveal className="nova-format-card" delay={index * 75} key={`${index}-${format.title}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{format.title}</h3>
              <p>{format.text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-event-news-section">
        <div className="nova-container">
          <div className="nova-section-heading nova-section-heading-row">
            <div>
              <p className="nova-eyebrow nova-eyebrow-light">{events.scheduleEyebrow}</p>
              <h2>{events.scheduleTitle}</h2>
            </div>
            <a className="nova-text-link nova-text-link-light" href={events.scheduleAction.href}>{events.scheduleAction.label}</a>
          </div>
          {eventNews.length ? (
            <div className="nova-event-news-grid">
              {eventNews.map((article) => (
                <MotionReveal className="nova-event-news-card" key={article.id}>
                  <LinkedMedia
                    className="mb-5 aspect-[16/9] rounded-md"
                    fallbackAlt={`Illustration de l’événement ${article.title}`}
                    media={
                      article.coverMediaId
                        ? articleMedia.get(article.coverMediaId)
                        : null
                    }
                    sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 33vw"
                  />
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                  <a href={`/actualites/${article.slug}`}>{events.articleActionLabel}</a>
                </MotionReveal>
              ))}
            </div>
          ) : (
            <MotionReveal className="nova-empty-panel nova-empty-panel-dark">
              {events.scheduleEmpty}
            </MotionReveal>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { DonationTrigger } from "@/components/site/donation-dialog";
import { LinkedMedia } from "@/components/site/linked-media";
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
  getPublicMediaById,
  getPublicMediaByIds,
  getSiteSettings,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, storedArticles, storedUpdates, supportLinks] = await Promise.all([
    getSiteSettings(),
    getPublishedArticles(3),
    getPublishedUpdates(),
    getPublishedSupportLinks(),
  ]);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;
  const [heroMedia, linkedMedia] = await Promise.all([
    getPublicMediaById(settings.media.homeHeroMediaId),
    getPublicMediaByIds([
      ...articles.map((article) => article.coverMediaId),
      ...updates.map((update) => update.imageMediaId),
    ]),
  ]);
  const currentUpdate = updates.find((item) => item.status === "current") ?? updates.at(-1);
  const home = settings.home;

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />

      <section className="nova-home-hero">
        <img
          className="nova-home-hero-image"
          src={heroMedia ? `/api/media/${heroMedia.id}` : "/images/4l-chapeau-hero-day.png"}
          alt={heroMedia?.altText || "Une Renault 4L, symbole de l’aventure que prépare l’association"}
        />
        <div className="nova-home-hero-shade" />
        <div className="nova-container nova-home-hero-content">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">{home.heroEyebrow}</p>
            <h1>{home.heroTitle}</h1>
            <p className="nova-hero-lead">
              {home.heroLead}
            </p>
            <p className="nova-hero-status">{settings.identity.currentStatus}</p>
            <p className="nova-hero-note">{settings.identity.vehicleSearchNote}</p>
            <div className="nova-hero-actions">
              <a className="nova-button nova-button-primary" href={home.primaryAction.href}>{home.primaryAction.label}</a>
              <a className="nova-button nova-button-ghost" href={home.secondaryAction.href}>{home.secondaryAction.label}</a>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="nova-category-section">
        <div className="nova-container">
          <div className="nova-section-heading">
            <p className="nova-eyebrow">{home.explorationEyebrow}</p>
            <h2>{home.explorationTitle}</h2>
          </div>
          <div className="nova-category-grid">
            {home.categories.map((category) => (
              <a className="nova-category-card" href={category.href} key={category.label}>
                <span>{category.title}</span>
                <p>{category.text}</p>
                <strong>{category.label}</strong>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="nova-progress-section">
        <div className="nova-container nova-progress-grid">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">{home.progressEyebrow}</p>
            <h2>{currentUpdate?.title ?? home.progressFallbackTitle}</h2>
            <p>{currentUpdate?.summary ?? home.progressFallbackLead}</p>
            <a className="nova-text-link nova-text-link-light" href={home.progressAction.href}>{home.progressAction.label}</a>
          </MotionReveal>
          <div className="nova-progress-list">
            {updates.slice(-3).map((update) => (
              <MotionReveal className="nova-progress-item" delay={80} key={update.id}>
                <span>{update.period}</span>
                <div>
                  <LinkedMedia
                    className="mb-3 h-28 rounded-md border border-white/15"
                    fallbackAlt={`Illustration de l’avancée ${update.title}`}
                    media={
                      update.imageMediaId
                        ? linkedMedia.get(update.imageMediaId)
                        : null
                    }
                    sizes="(max-width: 620px) calc(100vw - 72px), 500px"
                  />
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
            <p className="nova-eyebrow">{home.newsEyebrow}</p>
            <h2>{home.newsTitle}</h2>
          </div>
          <a className="nova-text-link" href={home.newsAction.href}>{home.newsAction.label}</a>
        </div>
        <div className="nova-news-grid">
          {articles.map((article) => (
            <MotionReveal className="nova-news-card" key={article.id}>
              <LinkedMedia
                className="mb-5 aspect-[16/10] rounded-md shadow-sm"
                fallbackAlt={`Illustration de l’article ${article.title}`}
                media={
                  article.coverMediaId
                    ? linkedMedia.get(article.coverMediaId)
                    : null
                }
                sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 33vw"
              />
              <p>{normalizeArticleCategory(article.category)}</p>
              <time dateTime={article.publishedAt ?? article.createdAt}>
                {formatDate(article.publishedAt ?? article.createdAt)}
              </time>
              <h3>{article.title}</h3>
              <span>{article.excerpt}</span>
              <a href={`/actualites/${article.slug}`}>{settings.news.articleActionLabel}</a>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-home-support">
        <div className="nova-container nova-home-support-grid">
          <MotionReveal>
            <p className="nova-eyebrow">{home.supportEyebrow}</p>
            <h2>{home.supportTitle}</h2>
            <p>{home.supportLead}</p>
            <div className="nova-action-pair">
              <DonationTrigger className="nova-button nova-button-primary" />
              <a className="nova-text-link" href={home.supportAction.href}>{home.supportAction.label}</a>
            </div>
          </MotionReveal>
          <MotionReveal delay={100}>
            {supportLinks.length ? (
              <SupportLinks links={supportLinks} compact />
            ) : (
              <div className="nova-support-note">
                <strong>{home.supportEmptyTitle}</strong>
                <p>{home.supportEmptyLead}</p>
                <a className="nova-text-link" href={home.supportEmptyAction.href}>{home.supportEmptyAction.label}</a>
              </div>
            )}
          </MotionReveal>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

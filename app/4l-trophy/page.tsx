import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { DonationTrigger } from "@/components/site/donation-dialog";
import { LinkedMedia } from "@/components/site/linked-media";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  normalizeArticleCategory,
  starterArticles,
  starterUpdates,
  updateStatusLabel,
} from "@/lib/content";
import {
  getPublishedArticles,
  getPublishedUpdates,
  getPublicMediaById,
  getPublicMediaByIds,
  getSiteSettings,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function TrophyPage() {
  const [settings, storedUpdates, storedArticles] = await Promise.all([
    getSiteSettings(),
    getPublishedUpdates(),
    getPublishedArticles(36),
  ]);
  const trophyMedia = await getPublicMediaById(settings.media.trophyHeroMediaId);
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const linkedMedia = await getPublicMediaByIds([
    ...updates.map((update) => update.imageMediaId),
    ...articles.map((article) => article.coverMediaId),
  ]);
  const trophy = settings.trophy;
  const projectNotes = articles
    .filter((article) => {
      const category = normalizeArticleCategory(article.category);
      return category === "4L Trophy" || category === "Atelier & préparation";
    })
    .slice(0, 3);

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <PageIntro
        eyebrow={trophy.eyebrow}
        title={trophy.title}
        lead={trophy.lead}
      />

      <section className="nova-container nova-split-section">
        <MotionReveal className="nova-split-media">
          <img
            src={trophyMedia ? `/api/media/${trophyMedia.id}` : "/images/4l-chapeau-hero-day.png"}
            alt={trophyMedia?.altText || "Une Renault 4L, future compagne de route de l’équipage"}
          />
        </MotionReveal>
        <MotionReveal className="nova-split-copy" delay={100}>
          <p className="nova-eyebrow">{trophy.preparationEyebrow}</p>
          <h2>{trophy.preparationTitle}</h2>
          <p>{trophy.preparationLead}</p>
          <div className="nova-action-pair">
            <DonationTrigger className="nova-button nova-button-primary" />
            <a className="nova-text-link" href={trophy.supportAction.href}>{trophy.supportAction.label}</a>
          </div>
        </MotionReveal>
      </section>

      <section className="nova-roadmap-section">
        <div className="nova-container">
          <div className="nova-section-heading">
            <p className="nova-eyebrow nova-eyebrow-light">{trophy.roadmapEyebrow}</p>
            <h2>{trophy.roadmapTitle}</h2>
          </div>
          <ol className="nova-roadmap">
            {updates.map((update, index) => (
              <MotionReveal className="nova-roadmap-item" delay={index * 45} key={update.id}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <time>{update.period}</time>
                <div>
                  <h3>{update.title}</h3>
                  <p>{update.summary}</p>
                  <LinkedMedia
                    className="mt-4 aspect-[16/9] max-w-sm rounded-md border border-white/20"
                    fallbackAlt={`Illustration de l’avancée ${update.title}`}
                    media={
                      update.imageMediaId
                        ? linkedMedia.get(update.imageMediaId)
                        : null
                    }
                    sizes="(max-width: 620px) calc(100vw - 90px), 560px"
                  />
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
            <p className="nova-eyebrow">{trophy.journalEyebrow}</p>
            <h2>{trophy.journalTitle}</h2>
          </div>
          <a className="nova-text-link" href={trophy.journalAction.href}>{trophy.journalAction.label}</a>
        </div>
        {projectNotes.length ? (
          <div className="nova-news-grid">
            {projectNotes.map((article) => (
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
                <h3>{article.title}</h3>
                <span>{article.excerpt}</span>
                <a href={`/actualites/${article.slug}`}>{settings.news.articleActionLabel}</a>
              </MotionReveal>
            ))}
          </div>
        ) : (
          <div className="nova-empty-panel">{trophy.journalEmpty}</div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

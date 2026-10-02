import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { LinkedMedia } from "@/components/site/linked-media";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  articleCategoryOptions,
  formatDate,
  normalizeArticleCategory,
  slugify,
  starterArticles,
} from "@/lib/content";
import {
  getPublishedArticles,
  getPublicMediaByIds,
  getSiteSettings,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const [settings, storedArticles] = await Promise.all([
    getSiteSettings(),
    getPublishedArticles(48),
  ]);
  const articles = storedArticles.length ? storedArticles : starterArticles;
  const articleMedia = await getPublicMediaByIds(
    articles.map((article) => article.coverMediaId),
  );
  const news = settings.news;
  const categories = [...new Map(
    [...articleCategoryOptions, ...articles.map((article) => normalizeArticleCategory(article.category))]
      .map((category) => [category.toLocaleLowerCase("fr-FR"), category]),
  ).values()];

  const categoryAnchor = (category: string) => `category-${slugify(category) || "articles"}`;

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <PageIntro
        eyebrow={news.eyebrow}
        title={news.title}
        lead={news.lead}
      />

      <section className="nova-container nova-news-index">
        <nav className="nova-category-nav" aria-label="Catégories d’actualités">
          {categories.map((category) => (
            <a href={`#${categoryAnchor(category)}`} key={category}>
              {category}
            </a>
          ))}
        </nav>

        {categories.map((category) => {
          const categoryArticles = articles.filter(
            (article) => normalizeArticleCategory(article.category) === category,
          );
          return (
            <section
              className="nova-news-category"
              id={categoryAnchor(category)}
              key={category}
            >
              <div className="nova-news-category-heading">
                <h2>{category}</h2>
                <span>{categoryArticles.length} article{categoryArticles.length > 1 ? "s" : ""}</span>
              </div>
              {categoryArticles.length ? (
                <div className="nova-news-grid">
                  {categoryArticles.map((article) => (
                    <MotionReveal className="nova-news-card" key={article.id}>
                      <LinkedMedia
                        className="mb-5 aspect-[16/10] rounded-md shadow-sm"
                        fallbackAlt={`Illustration de l’article ${article.title}`}
                        media={
                          article.coverMediaId
                            ? articleMedia.get(article.coverMediaId)
                            : null
                        }
                        sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 33vw"
                      />
                      <time dateTime={article.publishedAt ?? article.createdAt}>
                        {formatDate(article.publishedAt ?? article.createdAt)}
                      </time>
                      <h3>{article.title}</h3>
                      <span>{article.excerpt}</span>
                      <a href={`/actualites/${article.slug}`}>{news.articleActionLabel}</a>
                    </MotionReveal>
                  ))}
                </div>
              ) : (
                <p className="nova-category-empty">{news.emptyCategory}</p>
              )}
            </section>
          );
        })}
      </section>
      <SiteFooter />
    </main>
  );
}

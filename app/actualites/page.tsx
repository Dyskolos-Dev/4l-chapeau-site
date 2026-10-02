import Link from "next/link";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  articleCategoryOptions,
  formatDate,
  normalizeArticleCategory,
  starterArticles,
} from "@/lib/content";
import { getPublishedArticles } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const storedArticles = await getPublishedArticles(48);
  const articles = storedArticles.length ? storedArticles : starterArticles;

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        eyebrow="Actualités"
        title="Le journal de bord de 4L CHAPEAU."
        lead="Suivez les nouvelles de l’association, rangées par catégorie pour retrouver facilement le 4L Trophy, l’atelier, les événements et la vie de l’équipe."
      />

      <section className="nova-container nova-news-index">
        <nav className="nova-category-nav" aria-label="Catégories d’actualités">
          {articleCategoryOptions.map((category) => (
            <a href={`#${category.toLowerCase().replaceAll(" ", "-").replaceAll("&", "et")}`} key={category}>
              {category}
            </a>
          ))}
        </nav>

        {articleCategoryOptions.map((category) => {
          const categoryArticles = articles.filter(
            (article) => normalizeArticleCategory(article.category) === category,
          );
          return (
            <section
              className="nova-news-category"
              id={category.toLowerCase().replaceAll(" ", "-").replaceAll("&", "et")}
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
                      <time dateTime={article.publishedAt ?? article.createdAt}>
                        {formatDate(article.publishedAt ?? article.createdAt)}
                      </time>
                      <h3>{article.title}</h3>
                      <span>{article.excerpt}</span>
                      <Link href={`/actualites/${article.slug}`}>Lire l’article</Link>
                    </MotionReveal>
                  ))}
                </div>
              ) : (
                <p className="nova-category-empty">Aucune publication dans cette catégorie pour le moment.</p>
              )}
            </section>
          );
        })}
      </section>
      <SiteFooter />
    </main>
  );
}

import { notFound } from "next/navigation";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  formatDate,
  normalizeArticleCategory,
  starterArticles,
} from "@/lib/content";
import { getPublishedArticleBySlug } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const storedArticle = await getPublishedArticleBySlug(slug);
  const article = storedArticle ?? starterArticles.find((item) => item.slug === slug);
  if (!article) notFound();

  const paragraphs = article.content
    ? article.content.split(/\n\s*\n/).filter(Boolean)
    : [
        article.excerpt,
        "Les prochaines étapes se construisent avec patience : on vérifie, on échange et on repart dès que la route appelle.",
      ];

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <article className="nova-container nova-article">
        <MotionReveal className="nova-article-meta">
          <a href="/actualites">Toutes les actualités</a>
          <span>{normalizeArticleCategory(article.category)}</span>
          <time dateTime={article.publishedAt ?? article.createdAt}>
            {formatDate(article.publishedAt ?? article.createdAt)}
          </time>
        </MotionReveal>
        <MotionReveal className="nova-article-heading" delay={60}>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
        </MotionReveal>
        <MotionReveal className="nova-article-body" delay={110}>
          {paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}
        </MotionReveal>
        <MotionReveal className="nova-article-footer" delay={100}>
          <a className="nova-button nova-button-secondary" href="/actualites">Revenir aux actualités</a>
          <a className="nova-text-link" href="/4l-trophy">Suivre le projet 4L Trophy</a>
        </MotionReveal>
      </article>
      <SiteFooter />
    </main>
  );
}

/* eslint-disable @next/next/no-html-link-for-pages -- Vinext's Link shim blocks native navigation in this deployment. */

import { notFound } from "next/navigation";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { LinkedMedia } from "@/components/site/linked-media";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import {
  formatDate,
  normalizeArticleCategory,
  starterArticles,
} from "@/lib/content";
import {
  getPublishedArticleBySlug,
  getPublicMediaById,
  getSiteSettings,
} from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, storedArticle] = await Promise.all([
    getSiteSettings(),
    getPublishedArticleBySlug(slug),
  ]);
  const article = storedArticle ?? starterArticles.find((item) => item.slug === slug);
  if (!article) notFound();
  const coverMedia = await getPublicMediaById(article.coverMediaId);

  const paragraphs = article.content
    ? article.content.split(/\n\s*\n/).filter(Boolean)
    : [
        article.excerpt,
        settings.news.articleFallbackParagraph,
      ];

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <article className="nova-container nova-article">
        <MotionReveal className="nova-article-meta">
          <a href="/actualites">{settings.news.allArticlesActionLabel}</a>
          <span>{normalizeArticleCategory(article.category)}</span>
          <time dateTime={article.publishedAt ?? article.createdAt}>
            {formatDate(article.publishedAt ?? article.createdAt)}
          </time>
        </MotionReveal>
        <MotionReveal className="nova-article-heading" delay={60}>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
        </MotionReveal>
        {coverMedia ? (
          <MotionReveal className="mt-9" delay={85}>
            <LinkedMedia
              caption
              className="aspect-[16/9] rounded-xl shadow-[0_18px_42px_rgba(20,43,74,0.16)]"
              fallbackAlt={`Illustration de l’article ${article.title}`}
              loading="eager"
              media={coverMedia}
              sizes="(max-width: 920px) 100vw, 860px"
            />
          </MotionReveal>
        ) : null}
        <MotionReveal className="nova-article-body" delay={110}>
          {paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}
        </MotionReveal>
        <MotionReveal className="nova-article-footer" delay={100}>
          <a className="nova-button nova-button-secondary" href="/actualites">{settings.news.articleBackLabel}</a>
          <a className="nova-text-link" href={settings.news.articleProjectAction.href}>{settings.news.articleProjectAction.label}</a>
        </MotionReveal>
      </article>
      <SiteFooter />
    </main>
  );
}

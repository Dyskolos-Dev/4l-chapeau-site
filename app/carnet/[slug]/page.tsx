import Link from "next/link";
import { notFound } from "next/navigation";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { formatDate, starterArticles } from "@/lib/content";
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
    : [article.excerpt, "Les prochaines étapes se construisent avec patience : on vérifie, on échange et on repart dès que la route appelle."];

  return (
    <main className="route-app route-article">
      <RouteProgress />
      <SiteHeader />
      <article className="article-shell route-frame">
        <MotionReveal className="article-rail">
          <Link href="/carnet">← Retour au carnet</Link>
          <div>
            <span>{article.category}</span>
            <time dateTime={article.publishedAt ?? article.createdAt}>{formatDate(article.publishedAt ?? article.createdAt)}</time>
          </div>
        </MotionReveal>
        <MotionReveal className="article-heading" delay={80}>
          <p className="signal-label">TRANSMISSION / 4L CHAPEAU</p>
          <h1>{article.title}</h1>
          <p>{article.excerpt}</p>
        </MotionReveal>
        <MotionReveal className="article-visual" delay={160}>
          <img src="/images/4l-chapeau-hero-day.png" alt="Une Renault 4L roule sur une piste ensoleillée." />
          <span>ARCHIVE VISUELLE / 4L CHAPEAU</span>
        </MotionReveal>
        <MotionReveal className="article-content" delay={130}>
          {paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}
        </MotionReveal>
        <MotionReveal className="article-next" delay={100}>
          <span>LA ROUTE CONTINUE</span>
          <Link href="/le-projet">Voir la feuille de route <b>↗</b></Link>
        </MotionReveal>
      </article>
      <SiteFooter />
    </main>
  );
}

import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPublicMedia } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const media = await getPublicMedia(60);

  return (
    <main className="route-app route-gallery">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        index="03 / GALERIE"
        eyebrow="Planche-contact en évolution permanente"
        title="Des traces. Pas seulement des photos."
        lead="Les vrais instants de 4L CHAPEAU : une carrosserie poussiéreuse, un matin trop tôt, une réparation improvisée et les sourires qui vont avec."
      />

      <section className="gallery-board route-frame">
        <MotionReveal className="gallery-board-meta">
          <div><span>ARCHIVES VISUELLES</span><b>{String(media.length + 1).padStart(2, "0")} vues disponibles</b></div>
          <p>Les images ajoutées depuis l’espace équipage rejoignent automatiquement cette planche.</p>
        </MotionReveal>
        <div className="gallery-contact-sheet">
          <MotionReveal className="gallery-contact gallery-contact-lead">
            <figure>
              <img src="/images/4l-chapeau-hero-day.png" alt="Une Renault 4L roule sur une route de terre sous le soleil." />
              <figcaption><span>01 / DÉPART</span><b>La première lueur.</b></figcaption>
            </figure>
          </MotionReveal>
          {media.map((item, index) => (
            <MotionReveal className="gallery-contact" delay={(index % 4) * 80} key={item.id}>
              <figure>
                <img src={`/api/media/${item.id}`} alt={item.altText} />
                <figcaption><span>{String(index + 2).padStart(2, "0")} / ARCHIVE</span><b>{item.caption || item.fileName}</b></figcaption>
              </figure>
            </MotionReveal>
          ))}
          {!media.length && (
            <MotionReveal className="gallery-contact gallery-contact-empty" delay={100}>
              <span>LA PLANCHE S’AGRANDIT ICI</span>
              <p>Les prochaines images de l’équipe arriveront depuis l’atelier.</p>
              <i>+ 001</i>
            </MotionReveal>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

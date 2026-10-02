import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPublicMedia } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const media = await getPublicMedia(60);

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        eyebrow="Galerie"
        title="Les images de la route, de l’atelier et de l’équipe."
        lead="Cette galerie est alimentée directement depuis l’espace équipage. Les photos importées apparaissent ici sans avoir à modifier le site."
      />

      <section className="nova-container nova-gallery-section">
        {media.length ? (
          <div className="nova-gallery-grid">
            {media.map((item, index) => (
              <MotionReveal className={index === 0 ? "nova-gallery-item is-featured" : "nova-gallery-item"} delay={(index % 4) * 55} key={item.id}>
                <figure>
                  <img
                    src={`/api/media/${item.id}`}
                    alt={item.altText}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  {(item.caption || item.fileName) && <figcaption>{item.caption || item.fileName}</figcaption>}
                </figure>
              </MotionReveal>
            ))}
          </div>
        ) : (
          <MotionReveal className="nova-gallery-empty">
            <img src="/images/4l-chapeau-hero-day.png" alt="La 4L de l’association sur une piste" />
            <div>
              <p className="nova-eyebrow">La galerie arrive</p>
              <h2>Les prochaines images seront publiées ici.</h2>
              <p>Ajoutez vos photos depuis l’espace équipage : elles rejoindront automatiquement cette page.</p>
            </div>
          </MotionReveal>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

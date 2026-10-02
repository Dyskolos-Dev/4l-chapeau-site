import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getPublicMedia, getSiteSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const [settings, media] = await Promise.all([
    getSiteSettings(),
    getPublicMedia(60),
  ]);
  const gallery = settings.gallery;

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <PageIntro
        eyebrow={gallery.eyebrow}
        title={gallery.title}
        lead={gallery.lead}
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
              <p className="nova-eyebrow">{gallery.emptyEyebrow}</p>
              <h2>{gallery.emptyTitle}</h2>
              <p>{gallery.emptyLead}</p>
            </div>
          </MotionReveal>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

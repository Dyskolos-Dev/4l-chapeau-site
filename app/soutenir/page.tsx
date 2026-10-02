import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { DonationTrigger } from "@/components/site/donation-dialog";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SupportLinks } from "@/components/site/support-links";
import { getPublishedSupportLinks, getSiteSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function SupportPage() {
  const [settings, supportLinks] = await Promise.all([
    getSiteSettings(),
    getPublishedSupportLinks(),
  ]);
  const support = settings.support;

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <PageIntro
        eyebrow={support.eyebrow}
        title={support.title}
        lead={support.lead}
      />

      <section className="nova-support-page-section">
        <div className="nova-container nova-support-page-grid">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">{support.participationEyebrow}</p>
            <h2>{support.participationTitle}</h2>
            <p>{support.participationLead}</p>
            <DonationTrigger className="nova-button nova-button-light nova-support-donation-cta" />
          </MotionReveal>
          <MotionReveal delay={90}>
            {supportLinks.length ? (
              <SupportLinks links={supportLinks} />
            ) : (
              <div className="nova-empty-panel nova-empty-panel-dark">
                {support.emptyState}
              </div>
            )}
          </MotionReveal>
        </div>
      </section>

      <section className="nova-container nova-help-section">
        <div className="nova-section-heading">
          <p className="nova-eyebrow">{support.waysEyebrow}</p>
          <h2>{support.waysTitle}</h2>
        </div>
        <div className="nova-format-grid">
          {support.ways.map((way, index) => (
            <MotionReveal className="nova-format-card" delay={index * 70} key={`${index}-${way.title}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{way.title}</h3>
              <p>{way.text}</p>
            </MotionReveal>
          ))}
        </div>
        <MotionReveal className="nova-support-bottom" delay={120}>
          <a className="nova-button nova-button-primary" href={support.newsAction.href}>{support.newsAction.label}</a>
        </MotionReveal>
      </section>
      <SiteFooter />
    </main>
  );
}

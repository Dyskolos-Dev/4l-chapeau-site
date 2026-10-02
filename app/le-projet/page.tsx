import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { starterUpdates } from "@/lib/content";
import { getPublishedUpdates, getSiteSettings } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

export default async function AssociationPage() {
  const [settings, storedUpdates] = await Promise.all([
    getSiteSettings(),
    getPublishedUpdates(),
  ]);
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;
  const association = settings.association;
  const progressTitle = association.progressTitleTemplate.replace(
    "{count}",
    String(updates.length),
  );
  const teamHeading = settings.identity.teamHeadingTemplate
    .replaceAll("{team}", settings.identity.team.map((member) => member.name).join(" & "))
    .replaceAll("{city}", settings.identity.city);

  return (
    <main className="nova-site" id="main-content">
      <RouteProgress />
      <SiteHeader
        associationName={settings.identity.associationName}
        brandMark={settings.branding.mark}
        navigationLabels={settings.navigation}
      />
      <PageIntro
        eyebrow={association.eyebrow}
        title={association.title}
        lead={association.lead}
      />

      <section className="nova-container nova-association-intro">
        <MotionReveal>
          <p className="nova-eyebrow">{association.ideaEyebrow}</p>
          <h2>{association.ideaTitle}</h2>
        </MotionReveal>
        <MotionReveal delay={90}>
          {association.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
        </MotionReveal>
      </section>

      <section className="nova-container nova-team-section">
        <MotionReveal>
          <p className="nova-eyebrow">{settings.identity.targetEvent} {settings.identity.targetYear}</p>
          <h2>{teamHeading}</h2>
          <p>{settings.identity.vehicleSearchNote}</p>
        </MotionReveal>
        <div className="nova-team-list">
          {settings.identity.team.map((member, index) => (
            <MotionReveal className="nova-team-member" delay={index * 70} key={`${index}-${member.name}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-container nova-pillar-section">
        <div className="nova-pillar-grid">
          {association.pillars.map((pillar, index) => (
            <MotionReveal className="nova-pillar" delay={index * 80} key={`${index}-${pillar.title}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-association-status">
        <div className="nova-container nova-association-status-grid">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">{association.progressEyebrow}</p>
            <h2>{progressTitle}</h2>
            <p>{association.progressLead}</p>
          </MotionReveal>
          <MotionReveal delay={80} className="nova-association-actions">
            <a className="nova-button nova-button-light" href={association.trophyAction.href}>{association.trophyAction.label}</a>
            <a className="nova-button nova-button-outline-light" href={association.eventsAction.href}>{association.eventsAction.label}</a>
          </MotionReveal>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

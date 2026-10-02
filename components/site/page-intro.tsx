import { MotionReveal } from "./motion";

export function PageIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="nova-page-intro">
      <div className="nova-container nova-page-intro-grid">
        <MotionReveal>
          <p className="nova-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </MotionReveal>
        <MotionReveal delay={90}>
          <p className="nova-page-lead">{lead}</p>
        </MotionReveal>
      </div>
    </section>
  );
}

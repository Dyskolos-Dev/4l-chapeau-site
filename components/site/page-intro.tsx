import { MotionReveal } from "./motion";

export function PageIntro({
  eyebrow,
  index,
  title,
  lead,
}: {
  eyebrow: string;
  index: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="page-intro route-frame">
      <MotionReveal>
        <div className="page-intro-meta">
          <span>{index}</span>
          <p>{eyebrow}</p>
          <i>48° 51′ N · 2° 21′ E</i>
        </div>
        <h1>{title}</h1>
      </MotionReveal>
      <MotionReveal delay={120}>
        <p className="page-intro-lead">{lead}</p>
      </MotionReveal>
    </section>
  );
}

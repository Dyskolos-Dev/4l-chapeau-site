import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { starterUpdates } from "@/lib/content";
import { getPublishedUpdates } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const pillars = [
  ["Préparer", "Remettre la 4L en forme, apprendre à l’entretenir et prendre la route avec confiance."],
  ["Participer", "Vivre le 4L Trophy et d’autres événements sportifs qui donnent une vraie place à l’aventure."],
  ["Partager", "Faire connaître les coulisses du projet, les rencontres et les progrès de toute l’équipe."],
];

export default async function AssociationPage() {
  const storedUpdates = await getPublishedUpdates();
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        eyebrow="L’association"
        title="4L CHAPEAU, une aventure mécanique et humaine."
        lead="Notre association rassemble une équipe autour d’une Renault 4L, du 4L Trophy et de rendez-vous où le sport, l’entraide et les rencontres comptent autant que les kilomètres."
      />

      <section className="nova-container nova-association-intro">
        <MotionReveal>
          <p className="nova-eyebrow">Notre idée</p>
          <h2>Une voiture simple, un projet qui rassemble.</h2>
        </MotionReveal>
        <MotionReveal delay={90}>
          <p>La 4L est notre point de départ. Elle nous pousse à apprendre, à organiser, à chercher des soutiens et à partager le chemin avec les personnes qui suivent le projet.</p>
          <p>Notre site sert à présenter l’association, suivre la préparation et donner une place claire à chaque rendez-vous de l’équipe.</p>
        </MotionReveal>
      </section>

      <section className="nova-container nova-pillar-section">
        <div className="nova-pillar-grid">
          {pillars.map(([title, text], index) => (
            <MotionReveal className="nova-pillar" delay={index * 80} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="nova-association-status">
        <div className="nova-container nova-association-status-grid">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">Le projet avance</p>
            <h2>{updates.length} étapes déjà suivies.</h2>
            <p>La préparation est mise à jour depuis l’espace équipage, pour garder le site utile et fidèle à la réalité du projet.</p>
          </MotionReveal>
          <MotionReveal delay={80} className="nova-association-actions">
            <a className="nova-button nova-button-light" href="/4l-trophy">Suivre le 4L Trophy</a>
            <a className="nova-button nova-button-outline-light" href="/evenements">Voir les événements</a>
          </MotionReveal>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

import Link from "next/link";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { starterUpdates, updateStatusLabel } from "@/lib/content";
import { getPublishedUpdates } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const ways = [
  { tag: "MÉCANIQUE", title: "Faire mieux que démarrer.", text: "On apprend à connaître une voiture d’époque pour lui donner des kilomètres fiables, sans effacer ce qui fait son caractère." },
  { tag: "ÉVÉNEMENTS", title: "Se retrouver dehors.", text: "Le 4L Trophy est un grand cap. Les balades, rassemblements et épreuves sportives nourrissent le reste du trajet." },
  { tag: "COLLECTIF", title: "Passer les clés.", text: "Le projet est prétexte à construire une équipe, rencontrer des gens et transmettre ce que l’on découvre au fil des réparations." },
];

export default async function ProjectPage() {
  const storedUpdates = await getPublishedUpdates();
  const updates = storedUpdates.length ? storedUpdates : starterUpdates;

  return (
    <main className="route-app route-project">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        index="01 / LE PROJET"
        eyebrow="Une association, une Renault 4L, une route à inventer"
        title="Nous avons choisi la petite voiture qui va loin."
        lead="4L CHAPEAU transforme une Renault 4L en point de départ : apprendre, rouler, se dépasser et emmener du monde avec nous."
      />

      <section className="project-opening route-frame">
        <MotionReveal className="project-opening-image">
          <img src="/images/4l-chapeau-hero-day.png" alt="Une Renault 4L sur une piste ensoleillée." />
          <span>PLANCHE 01 / L’IMPULSION</span>
        </MotionReveal>
        <MotionReveal className="project-opening-copy" delay={120}>
          <p className="signal-label">NOTRE LIGNE DE DÉPART</p>
          <h2>Le 4L Trophy est notre horizon. L’aventure commence bien avant.</h2>
          <p>
            Il y a les sessions d’atelier, les check-lists griffonnées, les essais qui rassurent ou obligent à recommencer. Et il y a tout ce qui se crée autour : les rencontres, les événements, la solidarité et l’envie de faire ensemble.
          </p>
          <p>
            4L CHAPEAU ne cherche pas la ligne droite. Nous construisons un projet vivant, capable de prendre la route dès qu’une occasion se présente.
          </p>
        </MotionReveal>
      </section>

      <section className="project-pillars route-frame">
        <MotionReveal className="section-heading-rail">
          <div>
            <p className="signal-label">LE MODE D’EMPLOI</p>
            <h2>Trois bonnes raisons<br />de mettre les mains dedans.</h2>
          </div>
        </MotionReveal>
        <div className="project-pillar-list">
          {ways.map((way, index) => (
            <MotionReveal className="project-pillar" delay={index * 100} key={way.tag}>
              <span>0{index + 1} / {way.tag}</span>
              <h3>{way.title}</h3>
              <p>{way.text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="project-roadbook">
        <div className="route-frame">
          <MotionReveal className="roadbook-heading">
            <div>
              <p className="signal-label">KILOMÈTRE APRÈS KILOMÈTRE</p>
              <h2>La feuille de route<br /><em>reste ouverte.</em></h2>
            </div>
            <p>Elle se met à jour au rythme de l’atelier, des sorties et des idées qu’on décide de poursuivre.</p>
          </MotionReveal>
          <ol className="roadbook-list">
            {updates.map((update, index) => (
              <MotionReveal className="roadbook-item" delay={(index % 3) * 80} key={update.id}>
                <div className="roadbook-index"><span>0{index + 1}</span><i /></div>
                <div className="roadbook-period">{update.period}</div>
                <article>
                  <div>
                    <span className={`roadbook-status status-${update.status}`}>{updateStatusLabel(update.status)}</span>
                    <h3>{update.title}</h3>
                  </div>
                  <p>{update.summary}</p>
                </article>
              </MotionReveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="project-outro route-frame">
        <MotionReveal>
          <p className="signal-label">LA SUITE DU TRAJET</p>
          <h2>La voiture est le prétexte.<br />Le collectif est l’essentiel.</h2>
          <Link className="route-button route-button-acid" href="/soutenir">Rejoindre le départ <span>↗</span></Link>
        </MotionReveal>
      </section>
      <SiteFooter />
    </main>
  );
}

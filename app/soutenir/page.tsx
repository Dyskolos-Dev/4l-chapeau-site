import Link from "next/link";
import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SupportLinks } from "@/components/site/support-links";
import { getPublishedSupportLinks } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const supportModes = [
  ["01", "Un coup de pouce", "Aider à financer les kilomètres, le matériel et la préparation de l’équipage."],
  ["02", "Un bon contact", "Mettre l’équipe en relation avec une entreprise, un média, un garage ou un passionné."],
  ["03", "Une présence", "Suivre les nouvelles, partager l’aventure et venir nous voir lors des événements."],
];

export default async function SupportPage() {
  const supportLinks = await getPublishedSupportLinks();

  return (
    <main className="route-app route-support">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        index="04 / SOUTENIR"
        eyebrow="Chaque soutien donne un peu plus de portée au projet"
        title="La 4L se conduit à deux. Le projet aussi."
        lead="Un soutien peut prendre beaucoup de formes : un don, une rencontre, une pièce, un conseil ou simplement l’envie de faire connaître l’aventure."
      />

      <section className="support-station route-frame">
        <MotionReveal className="support-station-heading">
          <p className="signal-label">BOUTONS DE SOUTIEN</p>
          <h2>Choisissez votre façon de faire avancer le voyage.</h2>
        </MotionReveal>
        <MotionReveal className="support-station-links" delay={120}>
          {supportLinks.length ? (
            <SupportLinks links={supportLinks} />
          ) : (
            <div className="support-empty-station">
              <span>EN PRÉPARATION</span>
              <h3>Les liens de soutien seront publiés ici par l’équipage.</h3>
              <p>Ils pourront être ajoutés ou désactivés depuis l’espace administration, sans modifier le site.</p>
            </div>
          )}
        </MotionReveal>
      </section>

      <section className="support-modes route-frame">
        <MotionReveal>
          <p className="signal-label">IL N’Y A PAS QU’UNE SEULE FAÇON D’AIDER</p>
        </MotionReveal>
        <div className="support-mode-list">
          {supportModes.map(([index, title, text], position) => (
            <MotionReveal className="support-mode" delay={position * 100} key={index}>
              <span>{index}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </MotionReveal>
          ))}
        </div>
      </section>

      <section className="support-final route-frame">
        <MotionReveal>
          <p className="signal-label">DÉJÀ CURIEUX ?</p>
          <h2>Suivez les nouvelles<br />avant le prochain départ.</h2>
          <Link className="route-button route-button-acid" href="/carnet">Ouvrir le carnet <span>↗</span></Link>
        </MotionReveal>
      </section>
      <SiteFooter />
    </main>
  );
}

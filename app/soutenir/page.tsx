import { MotionReveal, RouteProgress } from "@/components/site/motion";
import { PageIntro } from "@/components/site/page-intro";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SupportLinks } from "@/components/site/support-links";
import { getPublishedSupportLinks } from "@/lib/content-repository";

export const dynamic = "force-dynamic";

const waysToHelp = [
  ["Soutenir", "Participer au financement de la préparation, des kilomètres et du matériel."],
  ["Devenir partenaire", "Associer votre entreprise ou votre projet à une aventure sportive et solidaire."],
  ["Faire connaître", "Partager les actualités, venir aux rendez-vous et relayer l’association autour de vous."],
];

export default async function SupportPage() {
  const supportLinks = await getPublishedSupportLinks();

  return (
    <main className="nova-site">
      <RouteProgress />
      <SiteHeader />
      <PageIntro
        eyebrow="Nous soutenir"
        title="Chaque coup de pouce fait avancer l’aventure."
        lead="Les contributions financières, les partenaires, les conseils et les relais permettent à 4L CHAPEAU de préparer ses projets dans de bonnes conditions."
      />

      <section className="nova-support-page-section">
        <div className="nova-container nova-support-page-grid">
          <MotionReveal>
            <p className="nova-eyebrow nova-eyebrow-light">Participer au projet</p>
            <h2>Choisissez la manière qui vous ressemble.</h2>
            <p>Les liens officiels ajoutés par l’équipage apparaissent ci-contre. Ils peuvent être activés ou masqués depuis l’administration.</p>
          </MotionReveal>
          <MotionReveal delay={90}>
            {supportLinks.length ? (
              <SupportLinks links={supportLinks} />
            ) : (
              <div className="nova-empty-panel nova-empty-panel-dark">
                Les boutons de soutien sont en préparation. Vous pouvez déjà suivre l’association et prendre contact via les prochaines actualités.
              </div>
            )}
          </MotionReveal>
        </div>
      </section>

      <section className="nova-container nova-help-section">
        <div className="nova-section-heading">
          <p className="nova-eyebrow">Trois façons d’aider</p>
          <h2>Une place pour chaque soutien.</h2>
        </div>
        <div className="nova-format-grid">
          {waysToHelp.map(([title, text], index) => (
            <MotionReveal className="nova-format-card" delay={index * 70} key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </MotionReveal>
          ))}
        </div>
        <MotionReveal className="nova-support-bottom" delay={120}>
          <a className="nova-button nova-button-primary" href="/actualites">Suivre les actualités</a>
        </MotionReveal>
      </section>
      <SiteFooter />
    </main>
  );
}

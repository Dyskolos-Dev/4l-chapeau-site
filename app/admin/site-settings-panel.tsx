"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  Media,
  SiteAction,
  SiteCard,
  SiteSettings,
  SiteTextCard,
  TeamMember,
} from "@/lib/content";

type Props = {
  initialSettings: SiteSettings;
  media: Media[];
};

type ApiError = { error?: string };

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  wide?: boolean;
};

function TextField({
  label,
  value,
  onChange,
  description,
  placeholder,
  multiline = false,
  maxLength = 3_000,
  wide = false,
}: TextFieldProps) {
  return (
    <label className={`admin-settings-field${wide ? " is-wide" : ""}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <input
          maxLength={maxLength}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      )}
      {description ? <small>{description}</small> : null}
    </label>
  );
}

function ActionFields({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SiteAction;
  onChange: (value: SiteAction) => void;
}) {
  return (
    <fieldset className="admin-settings-action">
      <legend>{label}</legend>
      <div className="admin-settings-grid">
        <TextField
          label="Texte du bouton"
          maxLength={180}
          onChange={(nextLabel) => onChange({ ...value, label: nextLabel })}
          value={value.label}
        />
        <TextField
          label="Lien"
          description="Une page interne commence par /, un lien externe par https://."
          maxLength={1_500}
          onChange={(href) => onChange({ ...value, href })}
          placeholder="/4l-trophy ou https://…"
          value={value.href}
        />
      </div>
    </fieldset>
  );
}

function Section({
  title,
  description,
  children,
  open = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <details
      className="admin-settings-section"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary>
        <span>{title}</span>
        <small>{description}</small>
      </summary>
      <div className="admin-settings-section-content">{children}</div>
    </details>
  );
}

function removeAt<T>(items: T[], index: number): T[] {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function replaceAt<T>(items: T[], index: number, value: T): T[] {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function TeamEditor({
  team,
  onChange,
}: {
  team: TeamMember[];
  onChange: (team: TeamMember[]) => void;
}) {
  return (
    <fieldset className="admin-settings-list-fieldset">
      <legend>L’équipe</legend>
      <p>Ajoutez les équipiers et le rôle que vous souhaitez afficher sur le site.</p>
      <div className="admin-settings-list">
        {team.map((member, index) => (
          <div className="admin-settings-list-item" key={`team-${index}`}>
            <div className="admin-settings-grid">
              <TextField
                label="Prénom"
                maxLength={180}
                onChange={(name) =>
                  onChange(replaceAt(team, index, { ...member, name }))
                }
                value={member.name}
              />
              <TextField
                label="Rôle"
                maxLength={180}
                onChange={(role) =>
                  onChange(replaceAt(team, index, { ...member, role }))
                }
                placeholder="Équipier"
                value={member.role}
              />
            </div>
            <button
              className="admin-settings-remove"
              disabled={team.length <= 1}
              onClick={() => onChange(removeAt(team, index))}
              type="button"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        className="admin-settings-add"
        disabled={team.length >= 12}
        onClick={() => onChange([...team, { name: "", role: "Équipier" }])}
        type="button"
      >
        Ajouter un équipier
      </button>
    </fieldset>
  );
}

function TextListEditor({
  legend,
  items,
  onChange,
  itemLabel,
  placeholder,
}: {
  legend: string;
  items: string[];
  onChange: (items: string[]) => void;
  itemLabel: string;
  placeholder?: string;
}) {
  return (
    <fieldset className="admin-settings-list-fieldset">
      <legend>{legend}</legend>
      <div className="admin-settings-list">
        {items.map((item, index) => (
          <div className="admin-settings-list-item" key={`${legend}-${index}`}>
            <TextField
              label={`${itemLabel} ${index + 1}`}
              multiline
              onChange={(value) => onChange(replaceAt(items, index, value))}
              placeholder={placeholder}
              value={item}
              wide
            />
            <button
              className="admin-settings-remove"
              disabled={items.length <= 1}
              onClick={() => onChange(removeAt(items, index))}
              type="button"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        className="admin-settings-add"
        disabled={items.length >= 8}
        onClick={() => onChange([...items, ""])}
        type="button"
      >
        Ajouter un texte
      </button>
    </fieldset>
  );
}

function TextCardListEditor({
  legend,
  items,
  onChange,
}: {
  legend: string;
  items: SiteTextCard[];
  onChange: (items: SiteTextCard[]) => void;
}) {
  return (
    <fieldset className="admin-settings-list-fieldset">
      <legend>{legend}</legend>
      <div className="admin-settings-list">
        {items.map((item, index) => (
          <div className="admin-settings-list-item" key={`${legend}-${index}`}>
            <div className="admin-settings-grid">
              <TextField
                label={`Titre ${index + 1}`}
                maxLength={180}
                onChange={(title) =>
                  onChange(replaceAt(items, index, { ...item, title }))
                }
                value={item.title}
              />
              <TextField
                label={`Texte ${index + 1}`}
                multiline
                onChange={(text) =>
                  onChange(replaceAt(items, index, { ...item, text }))
                }
                value={item.text}
              />
            </div>
            <button
              className="admin-settings-remove"
              disabled={items.length <= 1}
              onClick={() => onChange(removeAt(items, index))}
              type="button"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        className="admin-settings-add"
        disabled={items.length >= 8}
        onClick={() => onChange([...items, { title: "", text: "" }])}
        type="button"
      >
        Ajouter un bloc
      </button>
    </fieldset>
  );
}

function SiteCardListEditor({
  items,
  onChange,
}: {
  items: SiteCard[];
  onChange: (items: SiteCard[]) => void;
}) {
  return (
    <fieldset className="admin-settings-list-fieldset">
      <legend>Cartes de l’accueil</legend>
      <p>Chaque carte présente une rubrique et son lien de destination.</p>
      <div className="admin-settings-list">
        {items.map((item, index) => (
          <div className="admin-settings-list-item" key={`home-card-${index}`}>
            <div className="admin-settings-grid">
              <TextField
                label={`Rubrique ${index + 1}`}
                maxLength={180}
                onChange={(title) =>
                  onChange(replaceAt(items, index, { ...item, title }))
                }
                value={item.title}
              />
              <TextField
                label="Lien"
                maxLength={1_500}
                onChange={(href) =>
                  onChange(replaceAt(items, index, { ...item, href }))
                }
                placeholder="/actualites"
                value={item.href}
              />
              <TextField
                label="Texte du bouton"
                maxLength={180}
                onChange={(label) =>
                  onChange(replaceAt(items, index, { ...item, label }))
                }
                value={item.label}
              />
              <TextField
                label="Description"
                multiline
                onChange={(text) =>
                  onChange(replaceAt(items, index, { ...item, text }))
                }
                value={item.text}
              />
            </div>
            <button
              className="admin-settings-remove"
              disabled={items.length <= 1}
              onClick={() => onChange(removeAt(items, index))}
              type="button"
            >
              Retirer
            </button>
          </div>
        ))}
      </div>
      <button
        className="admin-settings-add"
        disabled={items.length >= 8}
        onClick={() =>
          onChange([
            ...items,
            { title: "", text: "", href: "/", label: "Découvrir" },
          ])
        }
        type="button"
      >
        Ajouter une rubrique
      </button>
    </fieldset>
  );
}

function HeroMediaSelect({
  label,
  value,
  media,
  onChange,
}: {
  label: string;
  value: string | null;
  media: Media[];
  onChange: (value: string | null) => void;
}) {
  const missing = value && !media.some((item) => item.id === value);

  return (
    <label className="admin-settings-field">
      <span>{label}</span>
      <select
        onChange={(event) => onChange(event.target.value || null)}
        value={value ?? ""}
      >
        <option value="">Utiliser l’image par défaut du site</option>
        {missing ? <option value={value ?? ""}>Image introuvable ({value})</option> : null}
        {media.map((item) => (
          <option key={item.id} value={item.id}>
            {item.caption || item.fileName}
          </option>
        ))}
      </select>
      <small>Importez d’abord l’image dans « Galerie & médias ».</small>
    </label>
  );
}

async function errorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => ({}))) as ApiError;
  return body.error ?? "Une erreur est survenue. Réessayez dans un instant.";
}

export function SiteSettingsPanel({ initialSettings, media }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(() =>
    structuredClone(initialSettings),
  );
  const [savedSettings, setSavedSettings] = useState<SiteSettings>(() =>
    structuredClone(initialSettings),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [savedSettings, settings],
  );

  useEffect(() => {
    if (!isDirty) return;

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [isDirty]);

  const updateBranding = (patch: Partial<SiteSettings["branding"]>) => {
    setSettings((current) => ({
      ...current,
      branding: { ...current.branding, ...patch },
    }));
  };

  const updateIdentity = (patch: Partial<SiteSettings["identity"]>) => {
    setSettings((current) => ({
      ...current,
      identity: { ...current.identity, ...patch },
    }));
  };
  const updateMedia = (patch: Partial<SiteSettings["media"]>) => {
    setSettings((current) => ({ ...current, media: { ...current.media, ...patch } }));
  };
  const updateContact = (patch: Partial<SiteSettings["contact"]>) => {
    setSettings((current) => ({
      ...current,
      contact: { ...current.contact, ...patch },
    }));
  };
  const updateSeo = (patch: Partial<SiteSettings["seo"]>) => {
    setSettings((current) => ({ ...current, seo: { ...current.seo, ...patch } }));
  };
  const updateNavigation = (patch: Partial<SiteSettings["navigation"]>) => {
    setSettings((current) => ({
      ...current,
      navigation: { ...current.navigation, ...patch },
    }));
  };
  const updateHome = (patch: Partial<SiteSettings["home"]>) => {
    setSettings((current) => ({ ...current, home: { ...current.home, ...patch } }));
  };
  const updateAssociation = (patch: Partial<SiteSettings["association"]>) => {
    setSettings((current) => ({
      ...current,
      association: { ...current.association, ...patch },
    }));
  };
  const updateTrophy = (patch: Partial<SiteSettings["trophy"]>) => {
    setSettings((current) => ({ ...current, trophy: { ...current.trophy, ...patch } }));
  };
  const updateEvents = (patch: Partial<SiteSettings["events"]>) => {
    setSettings((current) => ({ ...current, events: { ...current.events, ...patch } }));
  };
  const updateNews = (patch: Partial<SiteSettings["news"]>) => {
    setSettings((current) => ({ ...current, news: { ...current.news, ...patch } }));
  };
  const updateGallery = (patch: Partial<SiteSettings["gallery"]>) => {
    setSettings((current) => ({
      ...current,
      gallery: { ...current.gallery, ...patch },
    }));
  };
  const updateSupport = (patch: Partial<SiteSettings["support"]>) => {
    setSettings((current) => ({
      ...current,
      support: { ...current.support, ...patch },
    }));
  };
  const updateDonation = (patch: Partial<SiteSettings["support"]["donation"]>) => {
    setSettings((current) => ({
      ...current,
      support: {
        ...current.support,
        donation: { ...current.support.donation, ...patch },
      },
    }));
  };
  const updateFooter = (patch: Partial<SiteSettings["footer"]>) => {
    setSettings((current) => ({ ...current, footer: { ...current.footer, ...patch } }));
  };

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) throw new Error(await errorMessage(response));
      const result = (await response.json()) as { settings: SiteSettings };
      setSettings(result.settings);
      setSavedSettings(result.settings);
      setNotice("Les textes et réglages du site sont enregistrés.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer les réglages du site.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="admin-settings-panel" onSubmit={saveSettings}>
      <div className="admin-settings-panel-heading">
        <div>
          <p className="eyebrow">Site & équipage</p>
          <h2>Modifier le site sans toucher au code.</h2>
          <p>
            Toutes les phrases, rubriques, boutons et informations d’équipage
            visibles sur le site sont regroupés ici.
          </p>
        </div>
        <button className="admin-submit" disabled={isSaving || !isDirty} type="submit">
          {isSaving
            ? "Enregistrement…"
            : isDirty
              ? "Enregistrer le site"
              : "Tout est enregistré"}
        </button>
      </div>

      {notice ? <p className="admin-notice" role="status">{notice}</p> : null}
      {isDirty ? (
        <p className="admin-settings-dirty" role="status">
          Modifications non enregistrées. Pensez à sauvegarder avant de quitter cette page.
        </p>
      ) : null}

      <Section
        description="Nom, équipage, statut actuel et visuels principaux."
        open
        title="Général & équipage"
      >
        <div className="admin-settings-grid">
          <TextField
            label="Nom de l’association"
            maxLength={180}
            onChange={(associationName) => updateIdentity({ associationName })}
            value={settings.identity.associationName}
          />
          <TextField
            label="Initiales du logo"
            description="Courtes initiales affichées dans le carré rouge du menu."
            maxLength={12}
            onChange={(mark) => updateBranding({ mark })}
            value={settings.branding.mark}
          />
          <TextField
            label="Ville"
            maxLength={180}
            onChange={(city) => updateIdentity({ city })}
            value={settings.identity.city}
          />
          <TextField
            label="Événement visé"
            maxLength={180}
            onChange={(targetEvent) => updateIdentity({ targetEvent })}
            value={settings.identity.targetEvent}
          />
          <TextField
            label="Année objectif"
            maxLength={12}
            onChange={(targetYear) => updateIdentity({ targetYear })}
            value={settings.identity.targetYear}
          />
          <TextField
            label="Statut actuel"
            multiline
            onChange={(currentStatus) => updateIdentity({ currentStatus })}
            value={settings.identity.currentStatus}
            wide
          />
          <TextField
            label="Texte sur la recherche de la 4L"
            multiline
            onChange={(vehicleSearchNote) => updateIdentity({ vehicleSearchNote })}
            value={settings.identity.vehicleSearchNote}
            wide
          />
          <TextField
            label="Titre de l’équipage"
            description="Utilisez {team} pour les prénoms et {city} pour la ville."
            onChange={(teamHeadingTemplate) => updateIdentity({ teamHeadingTemplate })}
            value={settings.identity.teamHeadingTemplate}
            wide
          />
          <TextField
            label="Phrase de chargement"
            description="Texte affiché sous la 4L pendant le chargement du site."
            maxLength={180}
            onChange={(loaderMessage) => updateBranding({ loaderMessage })}
            value={settings.branding.loaderMessage}
            wide
          />
          <HeroMediaSelect
            label="Image héro de l’accueil"
            media={media}
            onChange={(homeHeroMediaId) => updateMedia({ homeHeroMediaId })}
            value={settings.media.homeHeroMediaId}
          />
          <HeroMediaSelect
            label="Image héro 4L Trophy"
            media={media}
            onChange={(trophyHeroMediaId) => updateMedia({ trophyHeroMediaId })}
            value={settings.media.trophyHeroMediaId}
          />
        </div>
        <TeamEditor
          onChange={(team) => updateIdentity({ team })}
          team={settings.identity.team}
        />
      </Section>

      <Section
        description="Coordonnées affichées dans le pied de page et métadonnées du site."
        title="Contact & référencement"
      >
        <div className="admin-settings-grid">
          <TextField
            label="E-mail de contact"
            description="Laissez vide si vous ne souhaitez pas l’afficher."
            maxLength={180}
            onChange={(email) => updateContact({ email })}
            placeholder="contact@4l-chapeau.fr"
            value={settings.contact.email}
          />
          <TextField
            label="Instagram"
            description="Lien complet vers votre profil."
            maxLength={1_500}
            onChange={(instagramUrl) => updateContact({ instagramUrl })}
            placeholder="https://instagram.com/..."
            value={settings.contact.instagramUrl}
          />
          <TextField
            label="Facebook"
            description="Lien complet vers votre page."
            maxLength={1_500}
            onChange={(facebookUrl) => updateContact({ facebookUrl })}
            placeholder="https://facebook.com/..."
            value={settings.contact.facebookUrl}
          />
          <TextField
            label="TikTok"
            description="Lien complet vers votre profil."
            maxLength={1_500}
            onChange={(tiktokUrl) => updateContact({ tiktokUrl })}
            placeholder="https://tiktok.com/@..."
            value={settings.contact.tiktokUrl}
          />
          <TextField
            label="Titre affiché dans les moteurs de recherche"
            description="Conseillé : 55 à 60 caractères."
            maxLength={180}
            onChange={(title) => updateSeo({ title })}
            value={settings.seo.title}
            wide
          />
          <TextField
            label="Description pour les moteurs de recherche"
            description="Conseillé : 140 à 160 caractères."
            maxLength={300}
            multiline
            onChange={(description) => updateSeo({ description })}
            value={settings.seo.description}
            wide
          />
        </div>
      </Section>

      <Section
        description="Hero, cartes de rubrique, suivi du projet, actualités et appel au soutien."
        title="Accueil"
      >
        <div className="admin-settings-grid">
          <TextField
            label="Surtitre du hero"
            maxLength={180}
            onChange={(heroEyebrow) => updateHome({ heroEyebrow })}
            value={settings.home.heroEyebrow}
          />
          <TextField
            label="Titre du hero"
            onChange={(heroTitle) => updateHome({ heroTitle })}
            value={settings.home.heroTitle}
          />
          <TextField
            label="Texte du hero"
            multiline
            onChange={(heroLead) => updateHome({ heroLead })}
            value={settings.home.heroLead}
            wide
          />
        </div>
        <div className="admin-settings-actions-grid">
          <ActionFields
            label="Bouton principal du hero"
            onChange={(primaryAction) => updateHome({ primaryAction })}
            value={settings.home.primaryAction}
          />
          <ActionFields
            label="Bouton secondaire du hero"
            onChange={(secondaryAction) => updateHome({ secondaryAction })}
            value={settings.home.secondaryAction}
          />
        </div>
        <div className="admin-settings-grid">
          <TextField
            label="Surtitre des rubriques"
            maxLength={180}
            onChange={(explorationEyebrow) => updateHome({ explorationEyebrow })}
            value={settings.home.explorationEyebrow}
          />
          <TextField
            label="Titre des rubriques"
            onChange={(explorationTitle) => updateHome({ explorationTitle })}
            value={settings.home.explorationTitle}
          />
        </div>
        <SiteCardListEditor
          items={settings.home.categories}
          onChange={(categories) => updateHome({ categories })}
        />
        <div className="admin-settings-grid">
          <TextField
            label="Surtitre de l’avancée"
            maxLength={180}
            onChange={(progressEyebrow) => updateHome({ progressEyebrow })}
            value={settings.home.progressEyebrow}
          />
          <TextField
            label="Titre si aucune avancée n’est publiée"
            onChange={(progressFallbackTitle) => updateHome({ progressFallbackTitle })}
            value={settings.home.progressFallbackTitle}
          />
          <TextField
            label="Texte si aucune avancée n’est publiée"
            multiline
            onChange={(progressFallbackLead) => updateHome({ progressFallbackLead })}
            value={settings.home.progressFallbackLead}
            wide
          />
          <TextField
            label="Surtitre des actualités"
            maxLength={180}
            onChange={(newsEyebrow) => updateHome({ newsEyebrow })}
            value={settings.home.newsEyebrow}
          />
          <TextField
            label="Titre des actualités"
            onChange={(newsTitle) => updateHome({ newsTitle })}
            value={settings.home.newsTitle}
          />
          <TextField
            label="Surtitre du soutien"
            maxLength={180}
            onChange={(supportEyebrow) => updateHome({ supportEyebrow })}
            value={settings.home.supportEyebrow}
          />
          <TextField
            label="Titre du soutien"
            onChange={(supportTitle) => updateHome({ supportTitle })}
            value={settings.home.supportTitle}
          />
          <TextField
            label="Texte du soutien"
            multiline
            onChange={(supportLead) => updateHome({ supportLead })}
            value={settings.home.supportLead}
            wide
          />
          <TextField
            label="Titre sans bouton de soutien"
            onChange={(supportEmptyTitle) => updateHome({ supportEmptyTitle })}
            value={settings.home.supportEmptyTitle}
          />
          <TextField
            label="Texte sans bouton de soutien"
            multiline
            onChange={(supportEmptyLead) => updateHome({ supportEmptyLead })}
            value={settings.home.supportEmptyLead}
            wide
          />
        </div>
        <div className="admin-settings-actions-grid">
          <ActionFields
            label="Lien de l’avancée"
            onChange={(progressAction) => updateHome({ progressAction })}
            value={settings.home.progressAction}
          />
          <ActionFields
            label="Lien « Toutes les actualités »"
            onChange={(newsAction) => updateHome({ newsAction })}
            value={settings.home.newsAction}
          />
          <ActionFields
            label="Lien de soutien"
            onChange={(supportAction) => updateHome({ supportAction })}
            value={settings.home.supportAction}
          />
          <ActionFields
            label="Lien sans bouton de soutien"
            onChange={(supportEmptyAction) => updateHome({ supportEmptyAction })}
            value={settings.home.supportEmptyAction}
          />
        </div>
      </Section>

      <Section
        description="Présentation de l’association, idées fortes et appels à l’action."
        title="L’association"
      >
        <div className="admin-settings-grid">
          <TextField label="Surtitre" maxLength={180} onChange={(eyebrow) => updateAssociation({ eyebrow })} value={settings.association.eyebrow} />
          <TextField label="Titre" onChange={(title) => updateAssociation({ title })} value={settings.association.title} />
          <TextField label="Introduction" multiline onChange={(lead) => updateAssociation({ lead })} value={settings.association.lead} wide />
          <TextField label="Surtitre de l’idée" maxLength={180} onChange={(ideaEyebrow) => updateAssociation({ ideaEyebrow })} value={settings.association.ideaEyebrow} />
          <TextField label="Titre de l’idée" onChange={(ideaTitle) => updateAssociation({ ideaTitle })} value={settings.association.ideaTitle} />
          <TextField label="Surtitre du suivi" maxLength={180} onChange={(progressEyebrow) => updateAssociation({ progressEyebrow })} value={settings.association.progressEyebrow} />
          <TextField label="Titre du suivi" description="Utilisez {count} pour afficher le nombre d’étapes." onChange={(progressTitleTemplate) => updateAssociation({ progressTitleTemplate })} value={settings.association.progressTitleTemplate} />
          <TextField label="Texte du suivi" multiline onChange={(progressLead) => updateAssociation({ progressLead })} value={settings.association.progressLead} wide />
        </div>
        <TextListEditor
          itemLabel="Paragraphe"
          items={settings.association.paragraphs}
          legend="Paragraphes de présentation"
          onChange={(paragraphs) => updateAssociation({ paragraphs })}
        />
        <TextCardListEditor
          items={settings.association.pillars}
          legend="Piliers du projet"
          onChange={(pillars) => updateAssociation({ pillars })}
        />
        <div className="admin-settings-actions-grid">
          <ActionFields label="Lien 4L Trophy" onChange={(trophyAction) => updateAssociation({ trophyAction })} value={settings.association.trophyAction} />
          <ActionFields label="Lien événements" onChange={(eventsAction) => updateAssociation({ eventsAction })} value={settings.association.eventsAction} />
        </div>
      </Section>

      <Section
        description="Introduction, feuille de route et journal de préparation."
        title="4L Trophy"
      >
        <div className="admin-settings-grid">
          <TextField label="Surtitre" maxLength={180} onChange={(eyebrow) => updateTrophy({ eyebrow })} value={settings.trophy.eyebrow} />
          <TextField label="Titre" onChange={(title) => updateTrophy({ title })} value={settings.trophy.title} />
          <TextField label="Introduction" multiline onChange={(lead) => updateTrophy({ lead })} value={settings.trophy.lead} wide />
          <TextField label="Surtitre préparation" maxLength={180} onChange={(preparationEyebrow) => updateTrophy({ preparationEyebrow })} value={settings.trophy.preparationEyebrow} />
          <TextField label="Titre préparation" onChange={(preparationTitle) => updateTrophy({ preparationTitle })} value={settings.trophy.preparationTitle} />
          <TextField label="Texte préparation" multiline onChange={(preparationLead) => updateTrophy({ preparationLead })} value={settings.trophy.preparationLead} wide />
          <TextField label="Surtitre feuille de route" maxLength={180} onChange={(roadmapEyebrow) => updateTrophy({ roadmapEyebrow })} value={settings.trophy.roadmapEyebrow} />
          <TextField label="Titre feuille de route" onChange={(roadmapTitle) => updateTrophy({ roadmapTitle })} value={settings.trophy.roadmapTitle} />
          <TextField label="Surtitre du journal" maxLength={180} onChange={(journalEyebrow) => updateTrophy({ journalEyebrow })} value={settings.trophy.journalEyebrow} />
          <TextField label="Titre du journal" onChange={(journalTitle) => updateTrophy({ journalTitle })} value={settings.trophy.journalTitle} />
          <TextField label="Texte si le journal est vide" multiline onChange={(journalEmpty) => updateTrophy({ journalEmpty })} value={settings.trophy.journalEmpty} wide />
        </div>
        <div className="admin-settings-actions-grid">
          <ActionFields label="Lien de soutien" onChange={(supportAction) => updateTrophy({ supportAction })} value={settings.trophy.supportAction} />
          <ActionFields label="Lien du journal" onChange={(journalAction) => updateTrophy({ journalAction })} value={settings.trophy.journalAction} />
        </div>
      </Section>

      <Section
        description="Présentation des rendez-vous et messages lorsque le calendrier est vide."
        title="Événements"
      >
        <div className="admin-settings-grid">
          <TextField label="Surtitre" maxLength={180} onChange={(eyebrow) => updateEvents({ eyebrow })} value={settings.events.eyebrow} />
          <TextField label="Titre" onChange={(title) => updateEvents({ title })} value={settings.events.title} />
          <TextField label="Introduction" multiline onChange={(lead) => updateEvents({ lead })} value={settings.events.lead} wide />
          <TextField label="Surtitre des formats" maxLength={180} onChange={(formatsEyebrow) => updateEvents({ formatsEyebrow })} value={settings.events.formatsEyebrow} />
          <TextField label="Titre des formats" onChange={(formatsTitle) => updateEvents({ formatsTitle })} value={settings.events.formatsTitle} />
          <TextField label="Surtitre des dates" maxLength={180} onChange={(scheduleEyebrow) => updateEvents({ scheduleEyebrow })} value={settings.events.scheduleEyebrow} />
          <TextField label="Titre des dates" onChange={(scheduleTitle) => updateEvents({ scheduleTitle })} value={settings.events.scheduleTitle} />
          <TextField label="Texte si aucune date n’est annoncée" multiline onChange={(scheduleEmpty) => updateEvents({ scheduleEmpty })} value={settings.events.scheduleEmpty} wide />
            <TextField label="Libellé des rendez-vous" maxLength={180} onChange={(articleActionLabel) => updateEvents({ articleActionLabel })} value={settings.events.articleActionLabel} />
        </div>
        <TextCardListEditor items={settings.events.formats} legend="Formats d’événements" onChange={(formats) => updateEvents({ formats })} />
        <ActionFields label="Lien du calendrier" onChange={(scheduleAction) => updateEvents({ scheduleAction })} value={settings.events.scheduleAction} />
      </Section>

      <Section
        description="Titre de la rubrique et textes utilisés dans les articles."
        title="Actualités"
      >
        <div className="admin-settings-grid">
          <TextField label="Surtitre" maxLength={180} onChange={(eyebrow) => updateNews({ eyebrow })} value={settings.news.eyebrow} />
          <TextField label="Titre" onChange={(title) => updateNews({ title })} value={settings.news.title} />
          <TextField label="Introduction" multiline onChange={(lead) => updateNews({ lead })} value={settings.news.lead} wide />
          <TextField label="Texte de catégorie vide" multiline onChange={(emptyCategory) => updateNews({ emptyCategory })} value={settings.news.emptyCategory} wide />
          <TextField label="Libellé « Lire l’article »" maxLength={180} onChange={(articleActionLabel) => updateNews({ articleActionLabel })} value={settings.news.articleActionLabel} />
          <TextField label="Libellé « Toutes les actualités »" maxLength={180} onChange={(allArticlesActionLabel) => updateNews({ allArticlesActionLabel })} value={settings.news.allArticlesActionLabel} />
          <TextField label="Libellé de retour d’article" maxLength={180} onChange={(articleBackLabel) => updateNews({ articleBackLabel })} value={settings.news.articleBackLabel} />
          <TextField label="Paragraphe par défaut d’un article" multiline onChange={(articleFallbackParagraph) => updateNews({ articleFallbackParagraph })} value={settings.news.articleFallbackParagraph} wide />
        </div>
        <ActionFields label="Lien projet sous un article" onChange={(articleProjectAction) => updateNews({ articleProjectAction })} value={settings.news.articleProjectAction} />
      </Section>

      <Section
        description="Introduction et message affiché avant les premières images."
        title="Galerie"
      >
        <div className="admin-settings-grid">
          <TextField label="Surtitre" maxLength={180} onChange={(eyebrow) => updateGallery({ eyebrow })} value={settings.gallery.eyebrow} />
          <TextField label="Titre" onChange={(title) => updateGallery({ title })} value={settings.gallery.title} />
          <TextField label="Introduction" multiline onChange={(lead) => updateGallery({ lead })} value={settings.gallery.lead} wide />
          <TextField label="Surtitre sans image" maxLength={180} onChange={(emptyEyebrow) => updateGallery({ emptyEyebrow })} value={settings.gallery.emptyEyebrow} />
          <TextField label="Titre sans image" onChange={(emptyTitle) => updateGallery({ emptyTitle })} value={settings.gallery.emptyTitle} />
          <TextField label="Texte sans image" multiline onChange={(emptyLead) => updateGallery({ emptyLead })} value={settings.gallery.emptyLead} wide />
        </div>
      </Section>

      <Section
        description="Page soutien, texte des contributions et trois manières d’aider."
        title="Soutenir"
      >
        <div className="admin-settings-grid">
          <TextField label="Surtitre" maxLength={180} onChange={(eyebrow) => updateSupport({ eyebrow })} value={settings.support.eyebrow} />
          <TextField label="Titre" onChange={(title) => updateSupport({ title })} value={settings.support.title} />
          <TextField label="Introduction" multiline onChange={(lead) => updateSupport({ lead })} value={settings.support.lead} wide />
          <TextField label="Surtitre participer" maxLength={180} onChange={(participationEyebrow) => updateSupport({ participationEyebrow })} value={settings.support.participationEyebrow} />
          <TextField label="Titre participer" onChange={(participationTitle) => updateSupport({ participationTitle })} value={settings.support.participationTitle} />
          <TextField label="Texte participer" multiline onChange={(participationLead) => updateSupport({ participationLead })} value={settings.support.participationLead} wide />
          <TextField label="Texte sans bouton" multiline onChange={(emptyState) => updateSupport({ emptyState })} value={settings.support.emptyState} wide />
          <TextField label="Surtitre des aides" maxLength={180} onChange={(waysEyebrow) => updateSupport({ waysEyebrow })} value={settings.support.waysEyebrow} />
          <TextField label="Titre des aides" onChange={(waysTitle) => updateSupport({ waysTitle })} value={settings.support.waysTitle} />
        </div>
        <TextCardListEditor items={settings.support.ways} legend="Manières d’aider" onChange={(ways) => updateSupport({ ways })} />
        <ActionFields label="Lien vers les actualités" onChange={(newsAction) => updateSupport({ newsAction })} value={settings.support.newsAction} />
        <div className="admin-settings-grid">
          <TextField
            label="Libellé du bouton de don"
            maxLength={180}
            onChange={(buttonLabel) => updateDonation({ buttonLabel })}
            value={settings.support.donation.buttonLabel}
          />
          <TextField
            label="Titre de la fenêtre de don"
            maxLength={180}
            onChange={(dialogTitle) => updateDonation({ dialogTitle })}
            value={settings.support.donation.dialogTitle}
          />
          <TextField
            label="Texte de la fenêtre de don"
            multiline
            onChange={(dialogDescription) => updateDonation({ dialogDescription })}
            value={settings.support.donation.dialogDescription}
            wide
          />
          <TextField
            description="Adresse officielle du widget de formulaire HelloAsso, affiché dans la fenêtre."
            label="Widget HelloAsso"
            maxLength={1_500}
            onChange={(widgetUrl) => updateDonation({ widgetUrl })}
            value={settings.support.donation.widgetUrl}
            wide
          />
          <TextField
            description="Lien de secours proposé si le formulaire intégré est bloqué."
            label="Lien direct HelloAsso"
            maxLength={1_500}
            onChange={(directUrl) => updateDonation({ directUrl })}
            value={settings.support.donation.directUrl}
            wide
          />
          <TextField
            label="Libellé du lien de secours"
            maxLength={180}
            onChange={(fallbackLabel) => updateDonation({ fallbackLabel })}
            value={settings.support.donation.fallbackLabel}
            wide
          />
        </div>
      </Section>

      <Section
        description="Libellés de navigation et texte en bas de page."
        title="Navigation & pied de page"
      >
        <div className="admin-settings-grid">
          <TextField label="Accueil" maxLength={48} onChange={(home) => updateNavigation({ home })} value={settings.navigation.home} />
          <TextField label="Association" maxLength={48} onChange={(association) => updateNavigation({ association })} value={settings.navigation.association} />
          <TextField label="4L Trophy" maxLength={48} onChange={(trophy) => updateNavigation({ trophy })} value={settings.navigation.trophy} />
          <TextField label="Événements" maxLength={48} onChange={(events) => updateNavigation({ events })} value={settings.navigation.events} />
          <TextField label="Actualités" maxLength={48} onChange={(news) => updateNavigation({ news })} value={settings.navigation.news} />
          <TextField label="Galerie" maxLength={48} onChange={(gallery) => updateNavigation({ gallery })} value={settings.navigation.gallery} />
          <TextField label="Soutenir" maxLength={48} onChange={(support) => updateNavigation({ support })} value={settings.navigation.support} />
          <TextField label="Texte du pied de page" multiline onChange={(copy) => updateFooter({ copy })} value={settings.footer.copy} wide />
          <TextField label="Lien administration" maxLength={180} onChange={(adminLabel) => updateFooter({ adminLabel })} value={settings.footer.adminLabel} />
        </div>
      </Section>

      <div className="admin-settings-save-bottom">
        <button className="admin-submit" disabled={isSaving || !isDirty} type="submit">
          {isSaving
            ? "Enregistrement…"
            : isDirty
              ? "Enregistrer toutes les modifications"
              : "Tout est enregistré"}
        </button>
      </div>
    </form>
  );
}

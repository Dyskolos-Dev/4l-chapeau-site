import { z } from "zod";

export type ArticleStatus = "draft" | "published";
export type UpdateStatus = "complete" | "current" | "upcoming";
export type SupportProvider = "helloasso" | "tipeee" | "other";

export const articleCategoryOptions = [
  "4L Trophy",
  "Atelier & préparation",
  "Événements",
  "Vie de l’association",
] as const;

/**
 * The built-in categories are suggestions, not a limit. The crew can type a
 * new category directly from the dashboard and it will become its own public
 * section in the news index.
 */
export type ArticleCategory = string;

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  status: ArticleStatus;
  coverMediaId: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectUpdate = {
  id: string;
  period: string;
  title: string;
  summary: string;
  status: UpdateStatus;
  position: number;
  imageMediaId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  altText: string;
  caption: string;
  createdAt: string;
};

export type SupportLink = {
  id: string;
  provider: SupportProvider;
  label: string;
  url: string;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * The editorial content that is not a record in its own right (an article,
 * an update, a gallery image, or a support link). Keeping it in one document
 * makes the public copy easy to manage from a single "Site & équipe" screen.
 */
export type SiteAction = {
  label: string;
  href: string;
};

export type SiteCard = {
  title: string;
  text: string;
  href: string;
  label: string;
};

export type SiteTextCard = {
  title: string;
  text: string;
};

export type TeamMember = {
  name: string;
  role: string;
};

export type SiteSettings = {
  branding: {
    mark: string;
    loaderMessage: string;
  };
  identity: {
    associationName: string;
    city: string;
    team: TeamMember[];
    targetEvent: string;
    targetYear: string;
    currentStatus: string;
    vehicleSearchNote: string;
    teamHeadingTemplate: string;
  };
  media: {
    homeHeroMediaId: string | null;
    trophyHeroMediaId: string | null;
  };
  contact: {
    email: string;
    instagramUrl: string;
    facebookUrl: string;
    tiktokUrl: string;
  };
  seo: {
    title: string;
    description: string;
  };
  navigation: {
    home: string;
    association: string;
    trophy: string;
    events: string;
    news: string;
    gallery: string;
    support: string;
  };
  home: {
    heroEyebrow: string;
    heroTitle: string;
    heroLead: string;
    primaryAction: SiteAction;
    secondaryAction: SiteAction;
    explorationEyebrow: string;
    explorationTitle: string;
    categories: SiteCard[];
    progressEyebrow: string;
    progressFallbackTitle: string;
    progressFallbackLead: string;
    progressAction: SiteAction;
    newsEyebrow: string;
    newsTitle: string;
    newsAction: SiteAction;
    supportEyebrow: string;
    supportTitle: string;
    supportLead: string;
    supportAction: SiteAction;
    supportEmptyTitle: string;
    supportEmptyLead: string;
    supportEmptyAction: SiteAction;
  };
  association: {
    eyebrow: string;
    title: string;
    lead: string;
    ideaEyebrow: string;
    ideaTitle: string;
    paragraphs: string[];
    pillars: SiteTextCard[];
    progressEyebrow: string;
    progressTitleTemplate: string;
    progressLead: string;
    trophyAction: SiteAction;
    eventsAction: SiteAction;
  };
  trophy: {
    eyebrow: string;
    title: string;
    lead: string;
    preparationEyebrow: string;
    preparationTitle: string;
    preparationLead: string;
    supportAction: SiteAction;
    roadmapEyebrow: string;
    roadmapTitle: string;
    journalEyebrow: string;
    journalTitle: string;
    journalAction: SiteAction;
    journalEmpty: string;
  };
  events: {
    eyebrow: string;
    title: string;
    lead: string;
    formatsEyebrow: string;
    formatsTitle: string;
    formats: SiteTextCard[];
    scheduleEyebrow: string;
    scheduleTitle: string;
    scheduleAction: SiteAction;
    scheduleEmpty: string;
    articleActionLabel: string;
  };
  news: {
    eyebrow: string;
    title: string;
    lead: string;
    emptyCategory: string;
    articleActionLabel: string;
    allArticlesActionLabel: string;
    articleBackLabel: string;
    articleProjectAction: SiteAction;
    articleFallbackParagraph: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    lead: string;
    emptyEyebrow: string;
    emptyTitle: string;
    emptyLead: string;
  };
  support: {
    eyebrow: string;
    title: string;
    lead: string;
    participationEyebrow: string;
    participationTitle: string;
    participationLead: string;
    emptyState: string;
    waysEyebrow: string;
    waysTitle: string;
    ways: SiteTextCard[];
    newsAction: SiteAction;
    donation: {
      buttonLabel: string;
      dialogTitle: string;
      dialogDescription: string;
      widgetUrl: string;
      directUrl: string;
      fallbackLabel: string;
    };
  };
  footer: {
    copy: string;
    adminLabel: string;
  };
};

const shortText = z.string().trim().max(180);
const navigationText = z.string().trim().min(1).max(48);
const copyText = z.string().trim().max(3_000);
const actionSchema = z.object({
  label: shortText,
  href: z.string().trim().max(1_500),
});
const cardSchema = z.object({
  title: shortText,
  text: copyText,
  href: z.string().trim().max(1_500),
  label: shortText,
});
const textCardSchema = z.object({
  title: shortText,
  text: copyText,
});
const teamMemberSchema = z.object({
  name: shortText,
  role: shortText,
});
const helloAssoUrl = z.string().trim().max(1_500).refine(
  (value) => {
    if (!value) return true;

    try {
      const url = new URL(value);
      return (
        url.protocol === "https:" &&
        (url.hostname === "www.helloasso.com" || url.hostname === "helloasso.com") &&
        url.pathname.startsWith("/associations/")
      );
    } catch {
      return false;
    }
  },
  "Utilisez une adresse HTTPS officielle HelloAsso.",
);

export const siteSettingsSchema: z.ZodType<SiteSettings> = z.object({
  branding: z.object({
    mark: z.string().trim().max(12),
    loaderMessage: shortText,
  }),
  identity: z.object({
    associationName: shortText,
    city: shortText,
    team: z.array(teamMemberSchema).min(1).max(12),
    targetEvent: shortText,
    targetYear: z.string().trim().max(12),
    currentStatus: copyText,
    vehicleSearchNote: copyText,
    teamHeadingTemplate: copyText,
  }),
  media: z.object({
    homeHeroMediaId: z.string().trim().max(100).nullable(),
    trophyHeroMediaId: z.string().trim().max(100).nullable(),
  }),
  contact: z.object({
    email: z.string().trim().max(180),
    instagramUrl: z.string().trim().max(1_500),
    facebookUrl: z.string().trim().max(1_500),
    tiktokUrl: z.string().trim().max(1_500),
  }),
  seo: z.object({
    title: shortText,
    description: copyText,
  }),
  navigation: z.object({
    home: navigationText,
    association: navigationText,
    trophy: navigationText,
    events: navigationText,
    news: navigationText,
    gallery: navigationText,
    support: navigationText,
  }),
  home: z.object({
    heroEyebrow: shortText,
    heroTitle: copyText,
    heroLead: copyText,
    primaryAction: actionSchema,
    secondaryAction: actionSchema,
    explorationEyebrow: shortText,
    explorationTitle: copyText,
    categories: z.array(cardSchema).min(1).max(8),
    progressEyebrow: shortText,
    progressFallbackTitle: copyText,
    progressFallbackLead: copyText,
    progressAction: actionSchema,
    newsEyebrow: shortText,
    newsTitle: copyText,
    newsAction: actionSchema,
    supportEyebrow: shortText,
    supportTitle: copyText,
    supportLead: copyText,
    supportAction: actionSchema,
    supportEmptyTitle: copyText,
    supportEmptyLead: copyText,
    supportEmptyAction: actionSchema,
  }),
  association: z.object({
    eyebrow: shortText,
    title: copyText,
    lead: copyText,
    ideaEyebrow: shortText,
    ideaTitle: copyText,
    paragraphs: z.array(copyText).min(1).max(8),
    pillars: z.array(textCardSchema).min(1).max(8),
    progressEyebrow: shortText,
    progressTitleTemplate: copyText,
    progressLead: copyText,
    trophyAction: actionSchema,
    eventsAction: actionSchema,
  }),
  trophy: z.object({
    eyebrow: shortText,
    title: copyText,
    lead: copyText,
    preparationEyebrow: shortText,
    preparationTitle: copyText,
    preparationLead: copyText,
    supportAction: actionSchema,
    roadmapEyebrow: shortText,
    roadmapTitle: copyText,
    journalEyebrow: shortText,
    journalTitle: copyText,
    journalAction: actionSchema,
    journalEmpty: copyText,
  }),
  events: z.object({
    eyebrow: shortText,
    title: copyText,
    lead: copyText,
    formatsEyebrow: shortText,
    formatsTitle: copyText,
    formats: z.array(textCardSchema).min(1).max(8),
    scheduleEyebrow: shortText,
    scheduleTitle: copyText,
    scheduleAction: actionSchema,
    scheduleEmpty: copyText,
    articleActionLabel: shortText,
  }),
  news: z.object({
    eyebrow: shortText,
    title: copyText,
    lead: copyText,
    emptyCategory: copyText,
    articleActionLabel: shortText,
    allArticlesActionLabel: shortText,
    articleBackLabel: shortText,
    articleProjectAction: actionSchema,
    articleFallbackParagraph: copyText,
  }),
  gallery: z.object({
    eyebrow: shortText,
    title: copyText,
    lead: copyText,
    emptyEyebrow: shortText,
    emptyTitle: copyText,
    emptyLead: copyText,
  }),
  support: z.object({
    eyebrow: shortText,
    title: copyText,
    lead: copyText,
    participationEyebrow: shortText,
    participationTitle: copyText,
    participationLead: copyText,
    emptyState: copyText,
    waysEyebrow: shortText,
    waysTitle: copyText,
    ways: z.array(textCardSchema).min(1).max(8),
    newsAction: actionSchema,
    donation: z.object({
      buttonLabel: shortText,
      dialogTitle: shortText,
      dialogDescription: copyText,
      widgetUrl: helloAssoUrl,
      directUrl: helloAssoUrl,
      fallbackLabel: shortText,
    }),
  }),
  footer: z.object({
    copy: copyText,
    adminLabel: shortText,
  }),
});

export const defaultSiteSettings: SiteSettings = {
  branding: {
    mark: "4L",
    loaderMessage: "On prend la route",
  },
  identity: {
    associationName: "4L CHAPEAU",
    city: "Saint-Chamond",
    team: [
      { name: "Baptiste", role: "Équipier" },
      { name: "Maxence", role: "Équipier" },
    ],
    targetEvent: "4L Trophy",
    targetYear: "2028",
    currentStatus: "Recherche active de notre future 4L",
    vehicleSearchNote:
      "Notre prochaine grande étape : trouver notre nouveau bébé, une Renault 4L prête à porter l’aventure jusqu’au 4L Trophy 2028.",
    teamHeadingTemplate: "{team}, l’équipage de {city}.",
  },
  media: {
    homeHeroMediaId: null,
    trophyHeroMediaId: null,
  },
  contact: {
    email: "",
    instagramUrl: "",
    facebookUrl: "",
    tiktokUrl: "",
  },
  seo: {
    title: "4L CHAPEAU · 4L Trophy 2028",
    description:
      "4L CHAPEAU : Maxence et Baptiste préparent le 4L Trophy 2028 depuis Saint-Chamond et cherchent leur future Renault 4L.",
  },
  navigation: {
    home: "Accueil",
    association: "L’association",
    trophy: "4L Trophy",
    events: "Événements",
    news: "Actualités",
    gallery: "Galerie",
    support: "Soutenir",
  },
  home: {
    heroEyebrow: "Maxence & Baptiste · Saint-Chamond",
    heroTitle: "Cap sur le 4L Trophy 2028.",
    heroLead:
      "Nous sommes Maxence et Baptiste, deux amis de Saint-Chamond. Nous préparons notre équipage pour le 4L Trophy 2028 et cherchons activement la 4L qui deviendra notre nouveau bébé.",
    primaryAction: { label: "Découvrir le projet", href: "/4l-trophy" },
    secondaryAction: { label: "Soutenir l’aventure", href: "/soutenir" },
    explorationEyebrow: "Explorer l’association",
    explorationTitle: "Chaque sujet a sa page.",
    categories: [
      {
        title: "4L Trophy",
        text: "Le cap 2028, la recherche de notre 4L et les étapes de l’équipage.",
        href: "/4l-trophy",
        label: "Voir le projet",
      },
      {
        title: "Atelier",
        text: "La future mécanique, les essais et chaque détail qui fera avancer notre 4L.",
        href: "/actualites",
        label: "Voir les actualités",
      },
      {
        title: "Événements",
        text: "Les sorties, rassemblements et rendez-vous qui feront vivre 4L CHAPEAU.",
        href: "/evenements",
        label: "Voir les événements",
      },
      {
        title: "Actualités",
        text: "Les coulisses de notre recherche et de la préparation, classées au même endroit.",
        href: "/actualites",
        label: "Lire le journal",
      },
    ],
    progressEyebrow: "En ce moment",
    progressFallbackTitle: "Notre future 4L est encore à trouver.",
    progressFallbackLead:
      "Nous comparons, cherchons et échangeons pour trouver la bonne Renault 4L avant de lancer sa préparation.",
    progressAction: { label: "Voir la préparation", href: "/4l-trophy" },
    newsEyebrow: "Actualités",
    newsTitle: "Le journal de l’équipage.",
    newsAction: { label: "Toutes les actualités", href: "/actualites" },
    supportEyebrow: "Nous soutenir",
    supportTitle: "Les projets qui roulent ne se construisent jamais seuls.",
    supportLead:
      "Un don, un partenariat, une pièce ou un partage : chaque aide nous rapproche de notre future 4L et du départ de 2028.",
    supportAction: { label: "Voir les possibilités", href: "/soutenir" },
    supportEmptyTitle: "Vous souhaitez nous accompagner ?",
    supportEmptyLead:
      "Les liens de soutien seront publiés ici par l’équipage. En attendant, découvrez comment prendre contact.",
    supportEmptyAction: { label: "Contacter l’association", href: "/soutenir" },
  },
  association: {
    eyebrow: "L’association",
    title: "4L CHAPEAU, une aventure mécanique et humaine.",
    lead:
      "Depuis Saint-Chamond, Maxence et Baptiste préparent leur équipage pour le 4L Trophy 2028, entre recherche de leur future Renault 4L, rencontres et défis solidaires.",
    ideaEyebrow: "Notre idée",
    ideaTitle: "Une voiture simple, un projet qui rassemble.",
    paragraphs: [
      "Notre future 4L est notre point de départ. Elle nous pousse à apprendre, à nous organiser, à chercher des soutiens et à partager le chemin avec les personnes qui suivent le projet.",
      "Notre site présente l’association, suit notre recherche et donne une place claire à chaque rendez-vous de l’équipe.",
    ],
    pillars: [
      {
        title: "Trouver",
        text: "Dénicher une Renault 4L saine et attachante, notre futur bébé et la base de toute l’aventure.",
      },
      {
        title: "Préparer",
        text: "Apprendre à l’entretenir, la rendre fiable et construire un équipage prêt pour 2028.",
      },
      {
        title: "Partager",
        text: "Faire vivre les coulisses du projet, les rencontres et les progrès de Maxence et Baptiste.",
      },
    ],
    progressEyebrow: "Le projet avance",
    progressTitleTemplate: "{count} étapes déjà suivies.",
    progressLead:
      "La préparation est mise à jour depuis l’espace équipage, pour garder le site utile et fidèle à la réalité du projet.",
    trophyAction: { label: "Suivre le 4L Trophy", href: "/4l-trophy" },
    eventsAction: { label: "Voir les événements", href: "/evenements" },
  },
  trophy: {
    eyebrow: "4L Trophy 2028",
    title: "Un défi collectif, préparé avec méthode.",
    lead:
      "Le 4L Trophy 2028 est notre grand cap : trouver une 4L fiable, la préparer, réunir les soutiens et partir vivre une aventure solidaire ensemble.",
    preparationEyebrow: "Notre préparation",
    preparationTitle: "Le départ se prépare bien avant la ligne de départ.",
    preparationLead:
      "Avant les outils et les kilomètres, notre mission est de trouver la Renault 4L qui nous accompagnera. Puis viendront la mécanique, la sécurité, l’équipement et les soutiens.",
    supportAction: { label: "Accompagner l’équipage", href: "/soutenir" },
    roadmapEyebrow: "Feuille de route",
    roadmapTitle: "Les étapes de la préparation.",
    journalEyebrow: "Journal de préparation",
    journalTitle: "Les dernières nouvelles.",
    journalAction: { label: "Voir toutes les actualités", href: "/actualites" },
    journalEmpty: "Les prochaines nouvelles de préparation apparaîtront ici.",
  },
  events: {
    eyebrow: "Événements",
    title: "Faire vivre la 4L, sur la route et avec les autres.",
    lead:
      "À côté de notre préparation au 4L Trophy 2028, 4L CHAPEAU participe à des moments sportifs, mécaniques et solidaires. Les rendez-vous confirmés seront annoncés ici.",
    formatsEyebrow: "Nos formats",
    formatsTitle: "Des occasions de se retrouver.",
    formats: [
      {
        title: "Sorties & rassemblements",
        text: "Pour retrouver d’autres passionnés, partager la route et faire connaître notre projet.",
      },
      {
        title: "Rendez-vous sportifs",
        text: "Des étapes qui donnent du rythme à la préparation et permettent à l’équipe de se dépasser.",
      },
      {
        title: "Rencontres solidaires",
        text: "Des temps forts pour faire vivre l’entraide au cœur de l’aventure.",
      },
    ],
    scheduleEyebrow: "Rendez-vous annoncés",
    scheduleTitle: "Les prochaines dates.",
    scheduleAction: { label: "Toutes les actualités", href: "/actualites" },
    scheduleEmpty:
      "Les prochains rendez-vous seront annoncés ici par l’équipe. Revenez bientôt ou consultez les actualités.",
    articleActionLabel: "Voir le rendez-vous",
  },
  news: {
    eyebrow: "Actualités",
    title: "Le journal de bord de 4L CHAPEAU.",
    lead:
      "Suivez la recherche de notre future 4L, les nouvelles de l’association et la préparation de Maxence et Baptiste pour le 4L Trophy 2028.",
    emptyCategory: "Aucune publication dans cette catégorie pour le moment.",
    articleActionLabel: "Lire l’article",
    allArticlesActionLabel: "Toutes les actualités",
    articleBackLabel: "Revenir aux actualités",
    articleProjectAction: { label: "Suivre le projet 4L Trophy", href: "/4l-trophy" },
    articleFallbackParagraph:
      "Les prochaines étapes se construisent avec patience : on cherche, on échange et on prépare le terrain pour la 4L qui prendra bientôt la route avec nous.",
  },
  gallery: {
    eyebrow: "Galerie",
    title: "Les images de la route, de l’atelier et de l’équipe.",
    lead:
      "Cette galerie est alimentée directement depuis l’espace équipage. Les photos de notre recherche, de nos rencontres et de la préparation apparaissent ici sans modifier le site.",
    emptyEyebrow: "La galerie arrive",
    emptyTitle: "Les prochaines images seront publiées ici.",
    emptyLead:
      "Ajoutez vos photos depuis l’espace équipage : elles rejoindront automatiquement cette page.",
  },
  support: {
    eyebrow: "Nous soutenir",
    title: "Chaque coup de pouce fait avancer l’aventure.",
    lead:
      "Les contributions financières, les partenaires, les conseils et les relais permettent à 4L CHAPEAU de trouver sa future 4L et de préparer 2028 dans de bonnes conditions.",
    participationEyebrow: "Participer au projet",
    participationTitle: "Choisissez la manière qui vous ressemble.",
    participationLead:
      "Les liens officiels ajoutés par l’équipage apparaissent ici. Ils peuvent être activés ou masqués depuis l’administration.",
    emptyState:
      "Les boutons de soutien sont en préparation. Vous pouvez déjà suivre l’association et prendre contact via les prochaines actualités.",
    waysEyebrow: "Trois façons d’aider",
    waysTitle: "Une place pour chaque soutien.",
    ways: [
      {
        title: "Soutenir",
        text: "Participer au financement de la recherche, de la préparation, des kilomètres et du matériel.",
      },
      {
        title: "Devenir partenaire",
        text: "Associer votre entreprise ou votre projet à une aventure sportive et solidaire.",
      },
      {
        title: "Faire connaître",
        text: "Partager les actualités, venir aux rendez-vous et relayer l’association autour de vous.",
      },
    ],
    newsAction: { label: "Suivre les actualités", href: "/actualites" },
    donation: {
      buttonLabel: "Faire un don",
      dialogTitle: "Soutenir 4L CHAPEAU",
      dialogDescription:
        "Votre don est traité de manière sécurisée par HelloAsso. Merci de faire avancer l’aventure avec nous.",
      widgetUrl:
        "https://www.helloasso.com/associations/4l-chapeau/formulaires/1/widget?view=form",
      directUrl:
        "https://www.helloasso.com/associations/4l-chapeau/formulaires/1",
      fallbackLabel: "Ouvrir HelloAsso dans un nouvel onglet",
    },
  },
  footer: {
    copy:
      "Depuis Saint-Chamond, Maxence et Baptiste cherchent leur future 4L et préparent le 4L Trophy 2028, entre rencontres, mécanique et solidarité.",
    adminLabel: "Espace équipage",
  },
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeWithDefault<T>(defaults: T, incoming: unknown): T {
  if (!isRecord(defaults) || !isRecord(incoming)) {
    return incoming === undefined ? structuredClone(defaults) : (incoming as T);
  }

  const merged: UnknownRecord = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    merged[key] = mergeWithDefault(defaultValue, incoming[key]);
  }
  return merged as T;
}

/**
 * Validates a complete settings document or a partial patch. Missing values are
 * filled from the current defaults so later additions stay backwards compatible.
 */
export function parseSiteSettings(value: unknown): SiteSettings {
  return mergeSiteSettings(defaultSiteSettings, value);
}

/**
 * Applies a partial update to a known-good settings document. The route layer
 * uses this to preserve already saved fields when an admin changes one page.
 */
export function mergeSiteSettings(
  current: SiteSettings,
  patch: unknown,
): SiteSettings {
  return siteSettingsSchema.parse(mergeWithDefault(current, patch));
}

/**
 * Reads untrusted persisted JSON without allowing a malformed row to break the
 * public site. Write paths should use parseSiteSettings instead.
 */
export function readSiteSettings(value: unknown): SiteSettings {
  const parsed = siteSettingsSchema.safeParse(
    mergeWithDefault(defaultSiteSettings, value),
  );
  return parsed.success ? parsed.data : structuredClone(defaultSiteSettings);
}

export const starterArticles: Article[] = [
  {
    id: "starter-search",
    slug: "a-la-recherche-de-notre-future-4l",
    title: "À la recherche de notre future 4L",
    excerpt:
      "Notre première grande mission est lancée : trouver la Renault 4L qui deviendra notre nouveau bébé et le point de départ du 4L Trophy 2028.",
    content:
      "Nous cherchons une Renault 4L saine, avec une bonne base mécanique et beaucoup de caractère. Chaque annonce, chaque rencontre et chaque conseil nous rapproche de la voiture qui rejoindra l’aventure.",
    category: "4L Trophy",
    status: "published",
    coverMediaId: null,
    publishedAt: "2026-10-02T10:00:00.000Z",
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "starter-team",
    slug: "maxence-et-baptiste-cap-sur-2028",
    title: "Maxence et Baptiste, cap sur 2028",
    excerpt:
      "Deux équipiers, un rêve de 4L Trophy et une aventure à construire étape par étape, depuis Saint-Chamond.",
    content:
      "Nous sommes Maxence et Baptiste. Notre objectif est de préparer un équipage solide, de trouver notre future 4L et de partager toutes les étapes qui nous mèneront au 4L Trophy 2028.",
    category: "Vie de l’association",
    status: "published",
    coverMediaId: null,
    publishedAt: "2026-10-01T10:00:00.000Z",
    createdAt: "2026-10-01T10:00:00.000Z",
    updatedAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "starter-saint-chamond",
    slug: "l-aventure-commence-a-saint-chamond",
    title: "L’aventure commence à Saint-Chamond",
    excerpt:
      "4L CHAPEAU prend forme : un projet local, sportif et solidaire à faire grandir avec celles et ceux qui nous suivent.",
    content:
      "Depuis Saint-Chamond, nous lançons 4L CHAPEAU pour raconter notre recherche, préparer notre future voiture et participer aux rendez-vous qui feront vivre l’aventure avant 2028.",
    category: "Vie de l’association",
    status: "published",
    coverMediaId: null,
    publishedAt: "2026-09-28T10:00:00.000Z",
    createdAt: "2026-09-28T10:00:00.000Z",
    updatedAt: "2026-09-28T10:00:00.000Z",
  },
];

export const starterUpdates: ProjectUpdate[] = [
  {
    id: "starter-team-formed",
    period: "Septembre 2026",
    title: "L’équipage prend forme",
    summary:
      "Maxence et Baptiste donnent une identité à 4L CHAPEAU et posent les premières bases du projet 2028.",
    status: "complete",
    position: 10,
    imageMediaId: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "starter-car-search",
    period: "Aujourd’hui",
    title: "Recherche active de notre future 4L",
    summary:
      "Nous cherchons la Renault 4L qui deviendra notre nouveau bébé : une bonne base, de belles rencontres et beaucoup de patience.",
    status: "current",
    position: 20,
    imageMediaId: null,
    createdAt: "2026-10-02T10:00:00.000Z",
    updatedAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "starter-selection",
    period: "Prochaine étape",
    title: "Choisir la bonne base",
    summary:
      "Comparer les annonces, demander conseil et vérifier chaque piste avant de faire entrer notre future 4L dans l’équipe.",
    status: "upcoming",
    position: 30,
    imageMediaId: null,
    createdAt: "2026-10-03T10:00:00.000Z",
    updatedAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "starter-first-work",
    period: "Après l’achat",
    title: "Premiers travaux et prise en main",
    summary:
      "Quand la bonne 4L sera trouvée, nous dresserons son état des lieux et lancerons les premiers chantiers avec méthode.",
    status: "upcoming",
    position: 40,
    imageMediaId: null,
    createdAt: "2026-10-04T10:00:00.000Z",
    updatedAt: "2026-10-04T10:00:00.000Z",
  },
  {
    id: "starter-partners",
    period: "2027",
    title: "Construire l’aventure avec nos soutiens",
    summary:
      "Partenaires, proches et passionnés feront grandir l’équipage autour de la voiture, de l’équipement et des événements.",
    status: "upcoming",
    position: 50,
    imageMediaId: null,
    createdAt: "2027-01-01T10:00:00.000Z",
    updatedAt: "2027-01-01T10:00:00.000Z",
  },
  {
    id: "starter-trophy-2028",
    period: "2028",
    title: "Cap sur le 4L Trophy",
    summary:
      "Une fois la 4L prête et l’équipage préparé, notre objectif sera de prendre le départ du 4L Trophy 2028.",
    status: "upcoming",
    position: 60,
    imageMediaId: null,
    createdAt: "2028-01-01T10:00:00.000Z",
    updatedAt: "2028-01-01T10:00:00.000Z",
  },
];

export function formatDate(value: string | null): string {
  if (!value) return "À venir";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function updateStatusLabel(status: UpdateStatus): string {
  return {
    complete: "Terminé",
    current: "En cours",
    upcoming: "À venir",
  }[status];
}

export function normalizeArticleCategory(value: string): ArticleCategory {
  const category = value.trim().replace(/\s+/g, " ");
  const normalized = category.toLocaleLowerCase("fr-FR");

  if (!category) return "Vie de l’association";
  if (normalized.includes("trophy")) return "4L Trophy";
  if (normalized.includes("événement") || normalized.includes("evenement")) {
    return "Événements";
  }
  if (
    normalized.includes("atelier") ||
    normalized.includes("préparation") ||
    normalized.includes("preparation") ||
    normalized.includes("essai")
  ) {
    return "Atelier & préparation";
  }

  if (
    normalized === "vie de l’association" ||
    normalized === "vie de l'association" ||
    normalized.includes("association")
  ) {
    return "Vie de l’association";
  }

  return category;
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 68);
}

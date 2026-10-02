export type ArticleStatus = "draft" | "published";
export type UpdateStatus = "complete" | "current" | "upcoming";
export type SupportProvider = "helloasso" | "tipeee" | "other";

export const articleCategoryOptions = [
  "4L Trophy",
  "Atelier & préparation",
  "Événements",
  "Vie de l’association",
] as const;

export type ArticleCategory = (typeof articleCategoryOptions)[number];

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

export const starterArticles: Article[] = [
  {
    id: "starter-road",
    slug: "une-4l-de-retour-sur-la-route",
    title: "Une 4L de retour sur la route",
    excerpt:
      "Après plusieurs séances de vérification et de réglages, notre 4L a repris la route. Chaque kilomètre confirme que le projet avance dans la bonne direction.",
    content: "",
    category: "Essais & préparation",
    status: "published",
    coverMediaId: null,
    publishedAt: "2026-09-24T10:00:00.000Z",
    createdAt: "2026-09-24T10:00:00.000Z",
    updatedAt: "2026-09-24T10:00:00.000Z",
  },
  {
    id: "starter-checklist",
    slug: "notre-check-list-avant-les-essais",
    title: "Notre check-list avant les essais",
    excerpt:
      "Freinage, éclairage, pneus, fluides et outillage : avant de prendre le volant, on passe tout en revue.",
    content: "",
    category: "Atelier",
    status: "published",
    coverMediaId: null,
    publishedAt: "2026-08-13T10:00:00.000Z",
    createdAt: "2026-08-13T10:00:00.000Z",
    updatedAt: "2026-08-13T10:00:00.000Z",
  },
  {
    id: "starter-garage",
    slug: "un-premier-samedi-au-garage",
    title: "Un premier samedi au garage",
    excerpt:
      "Une journée, quelques outils, beaucoup de discussions et une 4L qui commence à révéler son caractère.",
    content: "",
    category: "Vie de l’association",
    status: "published",
    coverMediaId: null,
    publishedAt: "2026-06-18T10:00:00.000Z",
    createdAt: "2026-06-18T10:00:00.000Z",
    updatedAt: "2026-06-18T10:00:00.000Z",
  },
];

export const starterUpdates: ProjectUpdate[] = [
  {
    id: "starter-structure",
    period: "Mars 2026",
    title: "Le projet prend forme",
    summary:
      "L’association 4L CHAPEAU se structure, le budget se dessine et les premières priorités sont posées.",
    status: "complete",
    position: 10,
    imageMediaId: null,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "starter-car",
    period: "Avril 2026",
    title: "Notre 4L rejoint l’aventure",
    summary:
      "La voiture trouve son équipe. Premier inventaire, premières idées et déjà beaucoup d’enthousiasme.",
    status: "complete",
    position: 20,
    imageMediaId: null,
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-04-01T10:00:00.000Z",
  },
  {
    id: "starter-safety",
    period: "Juin 2026",
    title: "Sécurité et remise en route",
    summary:
      "Freinage, éclairage, pneus et niveaux : la base est revue avec méthode avant les premiers vrais essais.",
    status: "complete",
    position: 30,
    imageMediaId: null,
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "starter-roadtest",
    period: "Août 2026",
    title: "Les premiers kilomètres",
    summary:
      "La 4L reprend la route pour une série d’essais et de réglages en conditions réelles.",
    status: "complete",
    position: 40,
    imageMediaId: null,
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "starter-open",
    period: "Septembre 2026",
    title: "L’aventure s’ouvre",
    summary:
      "Le projet est présenté à nos premiers soutiens, partenaires et futurs compagnons de route.",
    status: "current",
    position: 50,
    imageMediaId: null,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
  {
    id: "starter-logistics",
    period: "Novembre 2026",
    title: "Préparer les prochaines étapes",
    summary:
      "Logistique, équipement et feuille de route : l’équipe affine la préparation pour les événements à venir.",
    status: "upcoming",
    position: 60,
    imageMediaId: null,
    createdAt: "2026-11-01T10:00:00.000Z",
    updatedAt: "2026-11-01T10:00:00.000Z",
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
  const normalized = value.trim().toLocaleLowerCase("fr-FR");
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
  return "Vie de l’association";
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

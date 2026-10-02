import { getD1 } from "@/db";
import type {
  Article,
  Media,
  ProjectUpdate,
  SiteSettings,
  SupportLink,
  SupportProvider,
} from "./content";
import {
  parseSiteSettings,
  readSiteSettings,
  starterArticles,
  starterUpdates,
} from "./content";

type QueryResult<T> = { results?: T[] };

function contentUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /no such table|D1 binding|base de données/i.test(message);
}

async function selectRows<T>(statement: D1PreparedStatement): Promise<T[]> {
  const result = (await statement.all<T>()) as QueryResult<T>;
  return result.results ?? [];
}

type SupportLinkRow = Omit<SupportLink, "isActive" | "provider"> & {
  isActive: number | boolean;
  provider: string;
};

function supportLinkFromRow(row: SupportLinkRow): SupportLink {
  const provider: SupportProvider =
    row.provider === "helloasso" || row.provider === "tipeee"
      ? row.provider
      : "other";
  return { ...row, provider, isActive: Boolean(row.isActive) };
}

export async function getPublishedArticles(limit = 3): Promise<Article[]> {
  try {
    return await selectRows<Article>(
      getD1()
        .prepare(
          `SELECT id, slug, title, excerpt, content, category, status,
            cover_media_id AS coverMediaId, published_at AS publishedAt,
            created_at AS createdAt, updated_at AS updatedAt
           FROM articles
           WHERE status = ?
           ORDER BY published_at DESC, created_at DESC
           LIMIT ?`,
        )
        .bind("published", limit),
    );
  } catch (error) {
    if (contentUnavailable(error)) return [];
    throw error;
  }
}

export async function getPublishedUpdates(): Promise<ProjectUpdate[]> {
  try {
    return await selectRows<ProjectUpdate>(
      getD1()
        .prepare(
          `SELECT id, period, title, summary, status, position,
            image_media_id AS imageMediaId, created_at AS createdAt,
            updated_at AS updatedAt
           FROM project_updates
           ORDER BY position ASC, created_at ASC`,
        ),
    );
  } catch (error) {
    if (contentUnavailable(error)) return [];
    throw error;
  }
}

export async function getPublicMedia(limit = 12): Promise<Media[]> {
  try {
    return await selectRows<Media>(
      getD1()
        .prepare(
          `SELECT id, object_key AS objectKey, file_name AS fileName,
            content_type AS contentType, alt_text AS altText, caption,
            created_at AS createdAt
           FROM media
           ORDER BY created_at DESC
           LIMIT ?`,
        )
        .bind(limit),
    );
  } catch (error) {
    if (contentUnavailable(error)) return [];
    throw error;
  }
}

/**
 * Looks up a gallery image selected as a public page hero. This keeps a stale
 * media id from turning a public page into an error when an image is deleted.
 */
export async function getPublicMediaById(id: string | null): Promise<Media | null> {
  if (!id || id.length > 100) return null;

  try {
    const media = await getD1()
      .prepare(
        `SELECT id, object_key AS objectKey, file_name AS fileName,
          content_type AS contentType, alt_text AS altText, caption,
          created_at AS createdAt
         FROM media
         WHERE id = ?
         LIMIT 1`,
      )
      .bind(id)
      .first<Media>();
    return media ?? null;
  } catch (error) {
    if (contentUnavailable(error)) return null;
    throw error;
  }
}

/**
 * Resolves a small collection of media records in one request. Article cards
 * and roadmap entries use this rather than issuing one D1 query per image.
 * Missing or deleted media ids are intentionally omitted from the result so
 * public pages can keep rendering their text content without an error.
 */
export async function getPublicMediaByIds(
  ids: ReadonlyArray<string | null | undefined>,
): Promise<Map<string, Media>> {
  const mediaIds = [...new Set(
    ids.filter((id): id is string => Boolean(id && id.length <= 100)),
  )].slice(0, 100);

  if (!mediaIds.length) return new Map();

  try {
    const placeholders = mediaIds.map(() => "?").join(", ");
    const rows = await selectRows<Media>(
      getD1()
        .prepare(
          `SELECT id, object_key AS objectKey, file_name AS fileName,
            content_type AS contentType, alt_text AS altText, caption,
            created_at AS createdAt
           FROM media
           WHERE id IN (${placeholders})`,
        )
        .bind(...mediaIds),
    );
    return new Map(rows.map((media) => [media.id, media]));
  } catch (error) {
    if (contentUnavailable(error)) return new Map();
    throw error;
  }
}

type SiteSettingsRow = {
  content: string;
};

function readStoredSettings(content: string): SiteSettings {
  try {
    return readSiteSettings(JSON.parse(content));
  } catch {
    return readSiteSettings(undefined);
  }
}

/**
 * Returns the saved settings document or safe, accurate defaults before the
 * first save (and while a local D1 database has not yet been migrated).
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await getD1()
      .prepare(
        `SELECT content FROM site_settings WHERE id = ? LIMIT 1`,
      )
      .bind(1)
      .first<SiteSettingsRow>();

    return row ? readStoredSettings(row.content) : readSiteSettings(undefined);
  } catch (error) {
    if (contentUnavailable(error)) return readSiteSettings(undefined);
    throw error;
  }
}

/**
 * Persists a fully validated singleton settings document. Callers that accept
 * partial form data should merge it with getSiteSettings() before this call.
 */
export async function upsertSiteSettings(
  value: SiteSettings,
  updatedBy = "",
): Promise<SiteSettings> {
  const settings = parseSiteSettings(value);
  const updatedAt = new Date().toISOString();
  const editor = updatedBy.trim().slice(0, 180);

  await getD1()
    .prepare(
      `INSERT INTO site_settings (id, content, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         content = excluded.content,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`,
    )
    .bind(1, JSON.stringify(settings), updatedAt, editor)
    .run();

  return settings;
}

async function getSupportLinks(activeOnly: boolean): Promise<SupportLink[]> {
  try {
    const statement = activeOnly
      ? getD1()
          .prepare(
            `SELECT id, provider, label, url, is_active AS isActive, position,
              created_at AS createdAt, updated_at AS updatedAt
             FROM support_links
             WHERE is_active = ?
             ORDER BY position ASC, created_at ASC`,
          )
          .bind(1)
      : getD1().prepare(
          `SELECT id, provider, label, url, is_active AS isActive, position,
            created_at AS createdAt, updated_at AS updatedAt
           FROM support_links
           ORDER BY position ASC, created_at ASC`,
        );
    const rows = await selectRows<SupportLinkRow>(statement);
    return rows.map(supportLinkFromRow);
  } catch (error) {
    if (contentUnavailable(error)) return [];
    throw error;
  }
}

export function getPublishedSupportLinks(): Promise<SupportLink[]> {
  return getSupportLinks(true);
}

export async function getPublishedArticleBySlug(
  slug: string,
): Promise<Article | null> {
  try {
    const articles = await selectRows<Article>(
      getD1()
        .prepare(
          `SELECT id, slug, title, excerpt, content, category, status,
            cover_media_id AS coverMediaId, published_at AS publishedAt,
            created_at AS createdAt, updated_at AS updatedAt
           FROM articles
           WHERE status = ? AND slug = ?
           LIMIT 1`,
        )
        .bind("published", slug),
    );
    return articles[0] ?? null;
  } catch (error) {
    if (contentUnavailable(error)) return null;
    throw error;
  }
}

/**
 * The first authenticated visit to the dashboard turns the polished starter
 * copy into ordinary CMS records. This makes every initially visible article
 * and roadmap item editable without reseeding after the crew later deletes
 * its own content.
 */
export async function ensureCmsStarterContent(): Promise<void> {
  try {
    const db = getD1();
    const [settingsRow, articleCountRow, updateCountRow] = await Promise.all([
      db.prepare("SELECT id FROM site_settings WHERE id = ? LIMIT 1").bind(1).first<{ id: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM articles").first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM project_updates").first<{ count: number }>(),
    ]);

    // A settings row is a durable marker that the initial import has already
    // happened. It also prevents re-adding content that the crew deleted.
    if (settingsRow) return;

    const statements: D1PreparedStatement[] = [];
    if (!articleCountRow?.count) {
      for (const article of starterArticles) {
        statements.push(
          db.prepare(
            `INSERT OR IGNORE INTO articles (
              id, slug, title, excerpt, content, category, status,
              cover_media_id, published_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).bind(
            article.id,
            article.slug,
            article.title,
            article.excerpt,
            article.content,
            article.category,
            article.status,
            article.coverMediaId,
            article.publishedAt,
            article.createdAt,
            article.updatedAt,
          ),
        );
      }
    }

    if (!updateCountRow?.count) {
      for (const update of starterUpdates) {
        statements.push(
          db.prepare(
            `INSERT OR IGNORE INTO project_updates (
              id, period, title, summary, status, position,
              image_media_id, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          ).bind(
            update.id,
            update.period,
            update.title,
            update.summary,
            update.status,
            update.position,
            update.imageMediaId,
            update.createdAt,
            update.updatedAt,
          ),
        );
      }
    }

    const now = new Date().toISOString();
    statements.push(
      db.prepare(
        `INSERT OR IGNORE INTO site_settings (id, content, updated_at, updated_by)
         VALUES (?, ?, ?, ?)`,
      ).bind(1, JSON.stringify(readSiteSettings(undefined)), now, "Initialisation CMS"),
    );

    await db.batch(statements);
  } catch (error) {
    // The public site remains readable before migrations are applied. The
    // dashboard will expose the regular storage error when it tries to save.
    if (contentUnavailable(error)) return;
    throw error;
  }
}

export async function getAdminContent(): Promise<{
  articles: Article[];
  updates: ProjectUpdate[];
  media: Media[];
  supportLinks: SupportLink[];
}> {
  try {
    const db = getD1();
    const [articles, updates, media, supportLinks] = await Promise.all([
      selectRows<Article>(
        db.prepare(
          `SELECT id, slug, title, excerpt, content, category, status,
            cover_media_id AS coverMediaId, published_at AS publishedAt,
            created_at AS createdAt, updated_at AS updatedAt
           FROM articles
           ORDER BY created_at DESC`,
        ),
      ),
      selectRows<ProjectUpdate>(
        db.prepare(
          `SELECT id, period, title, summary, status, position,
            image_media_id AS imageMediaId, created_at AS createdAt,
            updated_at AS updatedAt
           FROM project_updates
           ORDER BY position ASC, created_at ASC`,
        ),
      ),
      selectRows<Media>(
        db.prepare(
          `SELECT id, object_key AS objectKey, file_name AS fileName,
            content_type AS contentType, alt_text AS altText, caption,
            created_at AS createdAt
           FROM media
           ORDER BY created_at DESC`,
        ),
      ),
      getSupportLinks(false),
    ]);

    return { articles, updates, media, supportLinks };
  } catch (error) {
    if (contentUnavailable(error)) {
      return { articles: [], updates: [], media: [], supportLinks: [] };
    }
    throw error;
  }
}

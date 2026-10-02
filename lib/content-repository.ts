import { getD1 } from "@/db";
import type { Article, Media, ProjectUpdate } from "./content";

type QueryResult<T> = { results?: T[] };

function contentUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /no such table|D1 binding|base de données/i.test(message);
}

async function selectRows<T>(statement: D1PreparedStatement): Promise<T[]> {
  const result = (await statement.all<T>()) as QueryResult<T>;
  return result.results ?? [];
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

export async function getAdminContent(): Promise<{
  articles: Article[];
  updates: ProjectUpdate[];
  media: Media[];
}> {
  try {
    const db = getD1();
    const [articles, updates, media] = await Promise.all([
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
    ]);

    return { articles, updates, media };
  } catch (error) {
    if (contentUnavailable(error)) {
      return { articles: [], updates: [], media: [] };
    }
    throw error;
  }
}

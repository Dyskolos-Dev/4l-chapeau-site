import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import {
  normalizeArticleCategory,
  type Article,
  type ArticleStatus,
} from "@/lib/content";

type ArticleRow = Omit<Article, "category" | "status"> & {
  category: string;
  status: string;
};

const articleStatuses = new Set<ArticleStatus>(["draft", "published"]);

function hasOwn(payload: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(payload, key);
}

function optionalText(
  payload: Record<string, unknown>,
  key: string,
  limit: number,
): string | undefined | null {
  if (!hasOwn(payload, key)) return undefined;
  const value = payload[key];
  return typeof value === "string" ? value.trim().slice(0, limit) : null;
}

function mediaIdValue(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const id = value.trim();
  if (!id) return null;
  return id.length <= 100 ? id : undefined;
}

async function mediaExists(id: string): Promise<boolean> {
  const media = await getD1()
    .prepare("SELECT id FROM media WHERE id = ? LIMIT 1")
    .bind(id)
    .first<{ id: string }>();
  return Boolean(media);
}

function articleFromRow(row: ArticleRow): Article {
  return {
    ...row,
    category: normalizeArticleCategory(row.category),
    status: row.status === "published" ? "published" : "draft",
  };
}

async function readArticle(id: string): Promise<Article | null> {
  const row = await getD1()
    .prepare(
      `SELECT id, slug, title, excerpt, content, category, status,
        cover_media_id AS coverMediaId, published_at AS publishedAt,
        created_at AS createdAt, updated_at AS updatedAt
       FROM articles WHERE id = ? LIMIT 1`,
    )
    .bind(id)
    .first<ArticleRow>();
  return row ? articleFromRow(row) : null;
}

async function routeId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id.length <= 100 ? id : "";
}

function categoryValue(value: string): string {
  return normalizeArticleCategory(value);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const id = await routeId(context);
    const existing = id ? await readArticle(id) : null;
    if (!existing) {
      return Response.json({ error: "Article introuvable." }, { status: 404 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    if (hasOwn(payload, "status") && hasOwn(payload, "publish")) {
      return Response.json(
        { error: "Choisissez soit le statut, soit la publication." },
        { status: 400 },
      );
    }

    const title = optionalText(payload, "title", 140);
    const excerpt = optionalText(payload, "excerpt", 380);
    const content = optionalText(payload, "content", 12_000);
    const categoryInput = optionalText(payload, "category", 80);
    const requestedCoverMediaId = hasOwn(payload, "coverMediaId")
      ? mediaIdValue(payload.coverMediaId)
      : undefined;
    if (title === null || excerpt === null || content === null || categoryInput === null) {
      return Response.json({ error: "Format de contenu invalide." }, { status: 400 });
    }
    if (hasOwn(payload, "coverMediaId") && requestedCoverMediaId === undefined) {
      return Response.json(
        { error: "L’image de couverture sélectionnée est invalide." },
        { status: 400 },
      );
    }
    if (requestedCoverMediaId && !(await mediaExists(requestedCoverMediaId))) {
      return Response.json(
        { error: "L’image de couverture sélectionnée n’existe plus." },
        { status: 400 },
      );
    }
    if (
      title === undefined &&
      excerpt === undefined &&
      content === undefined &&
      categoryInput === undefined &&
      requestedCoverMediaId === undefined &&
      !hasOwn(payload, "status") &&
      !hasOwn(payload, "publish")
    ) {
      return Response.json(
        { error: "Aucune modification à enregistrer." },
        { status: 400 },
      );
    }

    let status: ArticleStatus = existing.status;
    if (hasOwn(payload, "status")) {
      const requestedStatus = payload.status;
      if (
        typeof requestedStatus !== "string" ||
        !articleStatuses.has(requestedStatus as ArticleStatus)
      ) {
        return Response.json({ error: "Statut d’article invalide." }, { status: 400 });
      }
      status = requestedStatus as ArticleStatus;
    } else if (hasOwn(payload, "publish")) {
      if (typeof payload.publish !== "boolean") {
        return Response.json({ error: "Valeur de publication invalide." }, { status: 400 });
      }
      status = payload.publish ? "published" : "draft";
    }

    const nextTitle = title ?? existing.title;
    if (!nextTitle) {
      return Response.json({ error: "Le titre est requis." }, { status: 400 });
    }
    const category = categoryInput === undefined
      ? existing.category
      : categoryValue(categoryInput);
    const now = new Date().toISOString();
    const publishedAt = status === "published" ? existing.publishedAt ?? now : null;
    const coverMediaId =
      requestedCoverMediaId === undefined
        ? existing.coverMediaId
        : requestedCoverMediaId;

    await getD1()
      .prepare(
        `UPDATE articles
         SET title = ?, excerpt = ?, content = ?, category = ?, status = ?,
           cover_media_id = ?, published_at = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        nextTitle,
        excerpt ?? existing.excerpt,
        content ?? existing.content,
        category,
        status,
        coverMediaId,
        publishedAt,
        now,
        id,
      )
      .run();

    return Response.json({
      article: {
        ...existing,
        title: nextTitle,
        excerpt: excerpt ?? existing.excerpt,
        content: content ?? existing.content,
        category,
        status,
        coverMediaId,
        publishedAt,
        updatedAt: now,
        author: user.displayName,
      },
    });
  } catch (error) {
    return jsonError(error, "Impossible de mettre à jour cet article.");
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const id = await routeId(context);
    const existing = id ? await readArticle(id) : null;
    if (!existing) {
      return Response.json({ error: "Article introuvable." }, { status: 404 });
    }

    await getD1().prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
    return Response.json({ ok: true, id, author: user.displayName });
  } catch (error) {
    return jsonError(error, "Impossible de supprimer cet article.");
  }
}

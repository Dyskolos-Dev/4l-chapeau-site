import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import {
  normalizeArticleCategory,
  slugify,
} from "@/lib/content";

function textValue(value: unknown, limit = 6000): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
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

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const title = textValue(payload.title, 140);
    const excerpt = textValue(payload.excerpt, 380);
    const content = textValue(payload.content, 12000);
    const requestedCategory = textValue(payload.category, 80);
    const category = normalizeArticleCategory(requestedCategory);
    const publish = payload.publish === true;
    const coverMediaId =
      payload.coverMediaId === undefined ? null : mediaIdValue(payload.coverMediaId);

    if (!title) {
      return Response.json({ error: "Le titre est requis." }, { status: 400 });
    }
    if (coverMediaId === undefined) {
      return Response.json(
        { error: "L’image de couverture sélectionnée est invalide." },
        { status: 400 },
      );
    }
    if (coverMediaId && !(await mediaExists(coverMediaId))) {
      return Response.json(
        { error: "L’image de couverture sélectionnée n’existe plus." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const slug = `${slugify(title) || "article"}-${id.slice(0, 8)}`;
    const status = publish ? "published" : "draft";

    await getD1()
      .prepare(
        `INSERT INTO articles (
          id, slug, title, excerpt, content, category, status,
          cover_media_id, published_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        slug,
        title,
        excerpt,
        content,
        category,
        status,
        coverMediaId,
        publish ? now : null,
        now,
        now,
      )
      .run();

    return Response.json(
      {
        article: {
          id,
          slug,
          title,
          excerpt,
          content,
          category,
          status,
          coverMediaId,
          publishedAt: publish ? now : null,
          createdAt: now,
          updatedAt: now,
          author: user.displayName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error, "Impossible d’enregistrer cet article.");
  }
}

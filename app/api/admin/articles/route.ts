import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import {
  articleCategoryOptions,
  normalizeArticleCategory,
  slugify,
} from "@/lib/content";

function textValue(value: unknown, limit = 6000): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
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
    const category = articleCategoryOptions.includes(
      requestedCategory as (typeof articleCategoryOptions)[number],
    )
      ? requestedCategory
      : normalizeArticleCategory(requestedCategory);
    const publish = payload.publish === true;

    if (!title) {
      return Response.json({ error: "Le titre est requis." }, { status: 400 });
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
      )
      .bind(
        id,
        slug,
        title,
        excerpt,
        content,
        category,
        status,
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
          coverMediaId: null,
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

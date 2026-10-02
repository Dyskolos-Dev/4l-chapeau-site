import { getBucket, getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import type { Media } from "@/lib/content";

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

async function readMedia(id: string): Promise<Media | null> {
  return getD1()
    .prepare(
      `SELECT id, object_key AS objectKey, file_name AS fileName,
        content_type AS contentType, alt_text AS altText, caption,
        created_at AS createdAt
       FROM media WHERE id = ? LIMIT 1`,
    )
    .bind(id)
    .first<Media>();
}

async function routeId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id.length <= 100 ? id : "";
}

async function restoreOriginalObject(
  media: Media,
  originalBytes: ArrayBuffer | null,
): Promise<void> {
  if (!originalBytes) return;
  await getBucket().put(media.objectKey, originalBytes, {
    httpMetadata: { contentType: media.contentType },
    customMetadata: { originalName: media.fileName },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const id = await routeId(context);
    const existing = id ? await readMedia(id) : null;
    if (!existing) {
      return Response.json({ error: "Image introuvable." }, { status: 404 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const altText = optionalText(payload, "altText", 220);
    const caption = optionalText(payload, "caption", 380);
    if (altText === null || caption === null) {
      return Response.json({ error: "Format de média invalide." }, { status: 400 });
    }
    if (altText === undefined && caption === undefined) {
      return Response.json({ error: "Aucune modification à enregistrer." }, { status: 400 });
    }

    const nextAltText = altText ?? existing.altText;
    if (!nextAltText) {
      return Response.json(
        { error: "Le texte alternatif est requis." },
        { status: 400 },
      );
    }
    const nextCaption = caption ?? existing.caption;
    await getD1()
      .prepare("UPDATE media SET alt_text = ?, caption = ? WHERE id = ?")
      .bind(nextAltText, nextCaption, id)
      .run();

    return Response.json({
      media: {
        ...existing,
        altText: nextAltText,
        caption: nextCaption,
        author: user.displayName,
      },
    });
  } catch (error) {
    return jsonError(error, "Impossible de mettre à jour cette image.");
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
    const existing = id ? await readMedia(id) : null;
    if (!existing) {
      return Response.json({ error: "Image introuvable." }, { status: 404 });
    }

    // Read the persisted key first, then keep a short-lived backup so a failed
    // D1 deletion does not leave an otherwise visible image permanently lost.
    const bucket = getBucket();
    const object = await bucket.get(existing.objectKey);
    const originalBytes = object ? await object.arrayBuffer() : null;
    await bucket.delete(existing.objectKey);
    let unlinkedArticles = 0;
    let unlinkedUpdates = 0;

    try {
      const [articleReferences, updateReferences, deletion] = await getD1().batch([
        getD1()
          .prepare("UPDATE articles SET cover_media_id = NULL WHERE cover_media_id = ?")
          .bind(id),
        getD1()
          .prepare(
            "UPDATE project_updates SET image_media_id = NULL WHERE image_media_id = ?",
          )
          .bind(id),
        getD1()
          .prepare("DELETE FROM media WHERE id = ? AND object_key = ?")
          .bind(id, existing.objectKey),
      ]);
      if (deletion.meta.changes !== 1) {
        await restoreOriginalObject(existing, originalBytes);
        return Response.json({ error: "Image introuvable." }, { status: 404 });
      }
      unlinkedArticles = articleReferences.meta.changes;
      unlinkedUpdates = updateReferences.meta.changes;
    } catch (error) {
      try {
        await restoreOriginalObject(existing, originalBytes);
      } catch (restoreError) {
        console.error("4L CHAPEAU media restore error", restoreError);
      }
      throw error;
    }

    return Response.json({
      ok: true,
      id,
      author: user.displayName,
      unlinked: {
        articles: unlinkedArticles,
        updates: unlinkedUpdates,
      },
    });
  } catch (error) {
    return jsonError(error, "Impossible de supprimer cette image.");
  }
}

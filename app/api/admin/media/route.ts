import { getBucket, getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function cleanText(value: FormDataEntryValue | null, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function extensionFor(contentType: string): string {
  return (
    {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    }[contentType] ?? "img"
  );
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const form = await request.formData();
    const file = form.get("file");
    const altText = cleanText(form.get("altText"), 220);
    const caption = cleanText(form.get("caption"), 380);

    if (!file || typeof file === "string" || !file.size) {
      return Response.json({ error: "Choisissez une image à importer." }, { status: 400 });
    }
    if (!allowedImageTypes.has(file.type)) {
      return Response.json(
        { error: "Utilisez une image JPG, PNG, WebP ou AVIF." },
        { status: 400 },
      );
    }
    if (file.size > 8 * 1024 * 1024) {
      return Response.json(
        { error: "L’image ne doit pas dépasser 8 Mo." },
        { status: 400 },
      );
    }
    if (!altText) {
      return Response.json(
        { error: "Ajoutez un texte alternatif avant l’import." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const objectKey = `gallery/${id}.${extensionFor(file.type)}`;
    const bucket = getBucket();

    await bucket.put(objectKey, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name.slice(0, 180) },
    });

    try {
      await getD1()
        .prepare(
          `INSERT INTO media (
            id, object_key, file_name, content_type, alt_text, caption, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          id,
          objectKey,
          file.name.slice(0, 180),
          file.type,
          altText,
          caption,
          now,
        )
        .run();
    } catch (error) {
      await bucket.delete(objectKey);
      throw error;
    }

    return Response.json(
      {
        media: {
          id,
          objectKey,
          fileName: file.name.slice(0, 180),
          contentType: file.type,
          altText,
          caption,
          createdAt: now,
          author: user.displayName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error, "Impossible d’importer cette image.");
  }
}

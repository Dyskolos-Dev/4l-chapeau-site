import { getBucket, getD1 } from "@/db";

type MediaLookup = {
  objectKey: string;
  contentType: string;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!id || id.length > 100) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const media = await getD1()
      .prepare(
        `SELECT object_key AS objectKey, content_type AS contentType
         FROM media WHERE id = ? LIMIT 1`,
      )
      .bind(id)
      .first<MediaLookup>();

    if (!media) return new Response("Not found", { status: 404 });

    const object = await getBucket().get(media.objectKey);
    if (!object) return new Response("Not found", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("content-type", media.contentType);
    headers.set("cache-control", "public, max-age=86400, s-maxage=604800");
    return new Response(object.body, { headers });
  } catch (error) {
    console.error("4L CHAPEAU media read error", error);
    return new Response("Image unavailable", { status: 503 });
  }
}

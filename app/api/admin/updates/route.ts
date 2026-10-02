import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";

function textValue(value: unknown, limit = 3000): string {
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

const allowedStatuses = new Set(["complete", "current", "upcoming"]);

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const period = textValue(payload.period, 50);
    const title = textValue(payload.title, 140);
    const summary = textValue(payload.summary, 650);
    const requestedStatus = textValue(payload.status, 20);
    const status = allowedStatuses.has(requestedStatus)
      ? requestedStatus
      : "upcoming";
    const requestedPosition = Number(payload.position);
    const imageMediaId =
      payload.imageMediaId === undefined ? null : mediaIdValue(payload.imageMediaId);

    if (!period || !title) {
      return Response.json(
        { error: "La période et le titre sont requis." },
        { status: 400 },
      );
    }
    if (imageMediaId === undefined) {
      return Response.json(
        { error: "L’image associée à cette avancée est invalide." },
        { status: 400 },
      );
    }
    if (imageMediaId && !(await mediaExists(imageMediaId))) {
      return Response.json(
        { error: "L’image associée à cette avancée n’existe plus." },
        { status: 400 },
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const position = Number.isFinite(requestedPosition)
      ? Math.max(0, Math.min(9999, Math.round(requestedPosition)))
      : 999;

    await getD1()
      .prepare(
        `INSERT INTO project_updates (
          id, period, title, summary, status, position,
          image_media_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, period, title, summary, status, position, imageMediaId, now, now)
      .run();

    return Response.json(
      {
        update: {
          id,
          period,
          title,
          summary,
          status,
          position,
          imageMediaId,
          createdAt: now,
          updatedAt: now,
          author: user.displayName,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error, "Impossible d’enregistrer cette avancée.");
  }
}

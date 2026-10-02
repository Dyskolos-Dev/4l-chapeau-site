import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";

function textValue(value: unknown, limit = 3000): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
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

    if (!period || !title) {
      return Response.json(
        { error: "La période et le titre sont requis." },
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
        ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      )
      .bind(id, period, title, summary, status, position, now, now)
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
          imageMediaId: null,
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

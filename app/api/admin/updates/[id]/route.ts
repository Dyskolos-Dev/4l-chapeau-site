import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import type { ProjectUpdate, UpdateStatus } from "@/lib/content";

type ProjectUpdateRow = Omit<ProjectUpdate, "status"> & { status: string };

const updateStatuses = new Set<UpdateStatus>(["complete", "current", "upcoming"]);

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

function updateFromRow(row: ProjectUpdateRow): ProjectUpdate {
  return {
    ...row,
    status: updateStatuses.has(row.status as UpdateStatus)
      ? (row.status as UpdateStatus)
      : "upcoming",
  };
}

async function readUpdate(id: string): Promise<ProjectUpdate | null> {
  const row = await getD1()
    .prepare(
      `SELECT id, period, title, summary, status, position,
        image_media_id AS imageMediaId, created_at AS createdAt,
        updated_at AS updatedAt
       FROM project_updates WHERE id = ? LIMIT 1`,
    )
    .bind(id)
    .first<ProjectUpdateRow>();
  return row ? updateFromRow(row) : null;
}

async function routeId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id.length <= 100 ? id : "";
}

function positionValue(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Math.min(9999, Math.round(parsed)));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const id = await routeId(context);
    const existing = id ? await readUpdate(id) : null;
    if (!existing) {
      return Response.json({ error: "Avancée introuvable." }, { status: 404 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const period = optionalText(payload, "period", 50);
    const title = optionalText(payload, "title", 140);
    const summary = optionalText(payload, "summary", 650);
    const requestedImageMediaId = hasOwn(payload, "imageMediaId")
      ? mediaIdValue(payload.imageMediaId)
      : undefined;
    if (period === null || title === null || summary === null) {
      return Response.json({ error: "Format de contenu invalide." }, { status: 400 });
    }
    if (hasOwn(payload, "imageMediaId") && requestedImageMediaId === undefined) {
      return Response.json(
        { error: "L’image associée à cette avancée est invalide." },
        { status: 400 },
      );
    }
    if (requestedImageMediaId && !(await mediaExists(requestedImageMediaId))) {
      return Response.json(
        { error: "L’image associée à cette avancée n’existe plus." },
        { status: 400 },
      );
    }
    if (
      period === undefined &&
      title === undefined &&
      summary === undefined &&
      requestedImageMediaId === undefined &&
      !hasOwn(payload, "status") &&
      !hasOwn(payload, "position")
    ) {
      return Response.json(
        { error: "Aucune modification à enregistrer." },
        { status: 400 },
      );
    }

    let status = existing.status;
    if (hasOwn(payload, "status")) {
      if (typeof payload.status !== "string" || !updateStatuses.has(payload.status as UpdateStatus)) {
        return Response.json({ error: "Statut d’avancée invalide." }, { status: 400 });
      }
      status = payload.status as UpdateStatus;
    }

    let position = existing.position;
    if (hasOwn(payload, "position")) {
      const nextPosition = positionValue(payload.position);
      if (nextPosition === null) {
        return Response.json({ error: "Position d’avancée invalide." }, { status: 400 });
      }
      position = nextPosition;
    }

    const nextPeriod = period ?? existing.period;
    const nextTitle = title ?? existing.title;
    if (!nextPeriod || !nextTitle) {
      return Response.json(
        { error: "La période et le titre sont requis." },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();
    const nextSummary = summary ?? existing.summary;
    const imageMediaId =
      requestedImageMediaId === undefined
        ? existing.imageMediaId
        : requestedImageMediaId;
    await getD1()
      .prepare(
        `UPDATE project_updates
         SET period = ?, title = ?, summary = ?, status = ?, position = ?,
           image_media_id = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        nextPeriod,
        nextTitle,
        nextSummary,
        status,
        position,
        imageMediaId,
        now,
        id,
      )
      .run();

    return Response.json({
      update: {
        ...existing,
        period: nextPeriod,
        title: nextTitle,
        summary: nextSummary,
        status,
        position,
        imageMediaId,
        updatedAt: now,
        author: user.displayName,
      },
    });
  } catch (error) {
    return jsonError(error, "Impossible de mettre à jour cette avancée.");
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
    const existing = id ? await readUpdate(id) : null;
    if (!existing) {
      return Response.json({ error: "Avancée introuvable." }, { status: 404 });
    }

    await getD1().prepare("DELETE FROM project_updates WHERE id = ?").bind(id).run();
    return Response.json({ ok: true, id, author: user.displayName });
  } catch (error) {
    return jsonError(error, "Impossible de supprimer cette avancée.");
  }
}

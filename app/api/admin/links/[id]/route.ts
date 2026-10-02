import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import type { SupportLink, SupportProvider } from "@/lib/content";
import { positionValue, providerValue, textValue, urlValue } from "../route";

type SupportLinkRow = Omit<SupportLink, "isActive" | "provider"> & {
  isActive: number | boolean;
  provider: string;
};

function fromRow(row: SupportLinkRow): SupportLink {
  const provider: SupportProvider =
    row.provider === "helloasso" || row.provider === "tipeee"
      ? row.provider
      : "other";
  return { ...row, provider, isActive: Boolean(row.isActive) };
}

async function readLink(id: string): Promise<SupportLink | null> {
  const result = await getD1()
    .prepare(
      `SELECT id, provider, label, url, is_active AS isActive, position,
        created_at AS createdAt, updated_at AS updatedAt
       FROM support_links WHERE id = ? LIMIT 1`,
    )
    .bind(id)
    .all<SupportLinkRow>();
  const row = result.results?.[0];
  return row ? fromRow(row) : null;
}

async function routeId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id.length <= 100 ? id : "";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const id = await routeId(context);
    const existing = id ? await readLink(id) : null;
    if (!existing) {
      return Response.json({ error: "Bouton introuvable." }, { status: 404 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const label =
      payload.label === undefined ? existing.label : textValue(payload.label, 100);
    const url = payload.url === undefined ? existing.url : urlValue(payload.url);
    if (!label || !url) {
      return Response.json(
        { error: "Ajoutez un libellé et une URL http(s) valide." },
        { status: 400 },
      );
    }

    const requestedProvider =
      payload.provider === undefined
        ? existing.provider
        : providerValue(payload.provider);
    if (!requestedProvider) {
      return Response.json({ error: "Choisissez une plateforme valide." }, { status: 400 });
    }
    const provider = requestedProvider;
    const position =
      payload.position === undefined
        ? existing.position
        : positionValue(payload.position);
    const isActive =
      payload.isActive === undefined ? existing.isActive : payload.isActive === true;
    const updatedAt = new Date().toISOString();

    await getD1()
      .prepare(
        `UPDATE support_links
         SET provider = ?, label = ?, url = ?, is_active = ?, position = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        provider,
        label,
        url,
        isActive ? 1 : 0,
        position,
        updatedAt,
        id,
      )
      .run();

    return Response.json({
      link: { ...existing, provider, label, url, isActive, position, updatedAt },
    });
  } catch (error) {
    return jsonError(error, "Impossible de mettre à jour ce bouton.");
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
    if (!id) {
      return Response.json({ error: "Bouton introuvable." }, { status: 404 });
    }
    await getD1().prepare("DELETE FROM support_links WHERE id = ?").bind(id).run();
    return Response.json({ ok: true });
  } catch (error) {
    return jsonError(error, "Impossible de supprimer ce bouton.");
  }
}

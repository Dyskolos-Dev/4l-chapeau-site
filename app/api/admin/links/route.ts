import { getD1 } from "@/db";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import type { SupportProvider } from "@/lib/content";

const allowedProviders = new Set<SupportProvider>([
  "helloasso",
  "tipeee",
  "other",
]);

export function textValue(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export function providerValue(value: unknown): SupportProvider | null {
  return typeof value === "string" && allowedProviders.has(value as SupportProvider)
    ? (value as SupportProvider)
    : null;
}

export function positionValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed)
    ? Math.max(0, Math.min(9999, Math.round(parsed)))
    : 100;
}

export function urlValue(value: unknown): string | null {
  const raw = textValue(value, 1500);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const label = textValue(payload.label, 100);
    const url = urlValue(payload.url);

    if (!label || !url) {
      return Response.json(
        { error: "Ajoutez un libellé et une URL http(s) valide." },
        { status: 400 },
      );
    }

    const provider = providerValue(payload.provider);
    if (!provider) {
      return Response.json({ error: "Choisissez une plateforme valide." }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const position = positionValue(payload.position);
    const isActive = payload.isActive !== false;

    await getD1()
      .prepare(
        `INSERT INTO support_links (
          id, provider, label, url, is_active, position, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, provider, label, url, isActive ? 1 : 0, position, now, now)
      .run();

    return Response.json(
      {
        link: {
          id,
          provider,
          label,
          url,
          isActive,
          position,
          createdAt: now,
          updatedAt: now,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return jsonError(error, "Impossible d’enregistrer ce bouton de soutien.");
  }
}

import { z } from "zod";
import { getAdminUser, jsonError } from "@/lib/admin-auth";
import {
  getSiteSettings,
  upsertSiteSettings,
} from "@/lib/content-repository";
import { mergeSiteSettings } from "@/lib/content";

function invalidSettingsResponse(): Response {
  return Response.json(
    {
      error:
        "Certains réglages sont incomplets ou dépassent la longueur autorisée.",
    },
    { status: 400 },
  );
}

export async function GET() {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  try {
    return Response.json({ settings: await getSiteSettings() });
  } catch (error) {
    return jsonError(error, "Impossible de charger les réglages du site.");
  }
}

export async function PATCH(request: Request) {
  const user = await getAdminUser();
  if (user instanceof Response) return user;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Le format de la requête est invalide." }, { status: 400 });
  }

  try {
    const patch =
      typeof payload === "object" && payload !== null && "settings" in payload
        ? (payload as { settings: unknown }).settings
        : payload;
    const current = await getSiteSettings();
    const settings = mergeSiteSettings(current, patch);
    const saved = await upsertSiteSettings(settings, user.displayName);
    return Response.json({ settings: saved });
  } catch (error) {
    if (error instanceof z.ZodError) return invalidSettingsResponse();
    return jsonError(error, "Impossible d’enregistrer les réglages du site.");
  }
}

import {
  authenticateAdmin,
  safeAdminReturnPath,
  sessionCookieFor,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Le formulaire est invalide." }, { status: 400 });
  }

  const user = await authenticateAdmin(payload.username, payload.password);
  if (!user) {
    return Response.json(
      { error: "Identifiant ou mot de passe incorrect." },
      { status: 401 },
    );
  }

  const sessionCookie = await sessionCookieFor(user, request.url);
  if (!sessionCookie) {
    return Response.json(
      { error: "La configuration sécurisée du portail est incomplète." },
      { status: 503 },
    );
  }

  return Response.json(
    { user: { username: user.username, displayName: user.displayName }, returnTo: safeAdminReturnPath(payload.returnTo) },
    { headers: { "Set-Cookie": sessionCookie } },
  );
}

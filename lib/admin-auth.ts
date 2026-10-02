import { getChatGPTUser, type ChatGPTUser } from "@/app/chatgpt-auth";

/**
 * The first delivery is published owner-private by the Sites platform.
 * Every write route still verifies a signed-in user here; when the site is
 * opened to a wider audience, add an explicit platform editor policy before
 * sharing the admin URL.
 */
export async function getAdminUser(): Promise<ChatGPTUser | Response> {
  const user = await getChatGPTUser();
  if (user) return user;

  return Response.json(
    { error: "Connexion administrateur requise." },
    { status: 401 },
  );
}

export function jsonError(error: unknown, fallback: string): Response {
  const message = error instanceof Error ? error.message : fallback;
  console.error("4L CHAPEAU admin error", error);
  return Response.json({ error: message }, { status: 500 });
}

import { expiredSessionCookie } from "@/lib/admin-auth";

export async function POST() {
  return new Response(null, {
    status: 303,
    headers: {
      Location: "/admin/connexion",
      "Set-Cookie": expiredSessionCookie(),
    },
  });
}

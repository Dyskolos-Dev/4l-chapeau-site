import { env } from "cloudflare:workers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminUser = {
  username: "baptiste" | "maxence";
  displayName: "Baptiste" | "Maxence";
};

const SESSION_COOKIE = "4l_chapeau_equipage";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const accounts: Record<AdminUser["username"], Omit<AdminUser, "username"> & {
  passwordVariable: "ADMIN_BAPTISTE_PASSWORD" | "ADMIN_MAXENCE_PASSWORD";
}> = {
  baptiste: {
    displayName: "Baptiste",
    passwordVariable: "ADMIN_BAPTISTE_PASSWORD",
  },
  maxence: {
    displayName: "Maxence",
    passwordVariable: "ADMIN_MAXENCE_PASSWORD",
  },
};

type SessionPayload = {
  username: AdminUser["username"];
  expiresAt: number;
};

function getRuntimeSecret(name: string): string | null {
  const workerValue = (env as unknown as Record<string, unknown>)[name];
  if (typeof workerValue === "string" && workerValue) return workerValue;

  const nodeValue =
    typeof process !== "undefined" ? process.env[name] : undefined;
  return typeof nodeValue === "string" && nodeValue ? nodeValue : null;
}

function normalizeUsername(value: unknown): AdminUser["username"] | null {
  if (typeof value !== "string") return null;
  const username = value.trim().toLocaleLowerCase("fr-FR");
  return username === "baptiste" || username === "maxence" ? username : null;
}

function constantTimeEqual(left: string, right: string): boolean {
  const maxLength = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;

  for (let index = 0; index < maxLength; index += 1) {
    difference |=
      (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }

  return difference === 0;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlDecode(value: string): Uint8Array | null {
  if (!/^[a-zA-Z0-9_-]+$/u.test(value)) return null;

  try {
    const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`
      .replaceAll("-", "+")
      .replaceAll("_", "/");
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function sessionKeyMaterial(): string | null {
  const baptistePassword = getRuntimeSecret("ADMIN_BAPTISTE_PASSWORD");
  const maxencePassword = getRuntimeSecret("ADMIN_MAXENCE_PASSWORD");
  if (!baptistePassword || !maxencePassword) return null;

  return `4l-chapeau-session-v1\u0000${baptistePassword}\u0000${maxencePassword}`;
}

async function sign(value: string): Promise<string | null> {
  const material = sessionKeyMaterial();
  if (!material) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(material),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createSessionToken(username: AdminUser["username"]): Promise<string | null> {
  const payload: SessionPayload = {
    username,
    expiresAt: Date.now() + SESSION_LIFETIME_SECONDS * 1_000,
  };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload);
  return signature ? `${encodedPayload}.${signature}` : null;
}

async function readSessionToken(token: string | undefined): Promise<AdminUser | null> {
  if (!token) return null;
  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra) return null;

  const expectedSignature = await sign(encodedPayload);
  if (!expectedSignature || !constantTimeEqual(signature, expectedSignature)) return null;

  const bytes = base64UrlDecode(encodedPayload);
  if (!bytes) return null;

  try {
    const payload = JSON.parse(decoder.decode(bytes)) as Partial<SessionPayload>;
    const username = normalizeUsername(payload.username);
    if (!username || typeof payload.expiresAt !== "number" || payload.expiresAt <= Date.now()) {
      return null;
    }

    return { username, displayName: accounts[username].displayName };
  } catch {
    return null;
  }
}

export async function authenticateAdmin(
  usernameValue: unknown,
  passwordValue: unknown,
): Promise<AdminUser | null> {
  const username = normalizeUsername(usernameValue);
  if (!username || typeof passwordValue !== "string") return null;

  const expectedPassword = getRuntimeSecret(accounts[username].passwordVariable);
  if (!expectedPassword || !constantTimeEqual(passwordValue, expectedPassword)) {
    return null;
  }

  return { username, displayName: accounts[username].displayName };
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function getAdminUser(): Promise<AdminUser | Response> {
  const user = await getCurrentAdminUser();
  if (user) return user;

  return Response.json(
    { error: "Connexion équipage requise." },
    { status: 401 },
  );
}

export async function requireAdminUser(returnTo = "/admin"): Promise<AdminUser> {
  const user = await getCurrentAdminUser();
  if (user) return user;

  const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/admin";
  redirect(`/admin/connexion?return_to=${encodeURIComponent(safeReturnTo)}`);
}

function isLoopbackHttpRequest(requestUrl: string | undefined): boolean {
  if (!requestUrl) return false;
  try {
    const url = new URL(requestUrl);
    return (
      url.protocol === "http:" &&
      (url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname === "[::1]")
    );
  } catch {
    return false;
  }
}

export async function sessionCookieFor(
  user: AdminUser,
  requestUrl?: string,
): Promise<string | null> {
  const token = await createSessionToken(user.username);
  if (!token) return null;

  // A Secure cookie is correct in production, but browsers deliberately omit
  // it on an http://localhost preview. Detect that one safe local case from
  // the request itself rather than relying on the parent Node process, which
  // may have NODE_ENV=production while running a local Docker/Wrangler test.
  const secure = !isLoopbackHttpRequest(requestUrl) && (
    getRuntimeSecret("NODE_ENV") === "production" ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "production")
  );

  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_LIFETIME_SECONDS}`,
    secure ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export function expiredSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function safeAdminReturnPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/admin";
  }
  try {
    const parsed = new URL(value, "https://4l-chapeau.local");
    return parsed.origin === "https://4l-chapeau.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : "/admin";
  } catch {
    return "/admin";
  }
}

export function jsonError(error: unknown, fallback: string): Response {
  const message = error instanceof Error ? error.message : fallback;
  console.error("4L CHAPEAU admin error", error);
  return Response.json({ error: message }, { status: 500 });
}

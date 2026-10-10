import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Session = { userId: string; name: string };

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 天

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s === "change-me") {
    throw new Error("請在 .env 設定 SESSION_SECRET（可參考 .env.example）");
  }
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof data.userId !== "string" || typeof data.name !== "string") return null;
    return { userId: data.userId, name: data.name };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  return decodeSession((await cookies()).get(COOKIE)?.value);
}

export async function setSessionCookie(session: Session): Promise<void> {
  (await cookies()).set(COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

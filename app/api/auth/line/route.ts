import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildAuthorizeUrl } from "@/lib/line";
import { getLineRedirectUri } from "@/lib/request-origin";

const OAUTH_COOKIE = "line_oauth";

// 開始 LINE 登入：產生 state 與 nonce 存進短效 HttpOnly cookie，導向 LINE 授權頁
export async function GET(req: Request) {
  const state = randomBytes(16).toString("hex");
  const nonce = randomBytes(16).toString("hex");
  const redirectUri = getLineRedirectUri(req);
  (await cookies()).set(OAUTH_COOKIE, JSON.stringify({ state, nonce }), {
    httpOnly: true,
    sameSite: "lax",
    secure: redirectUri.startsWith("https://"),
    path: "/",
    maxAge: 600,
  });
  return NextResponse.redirect(buildAuthorizeUrl({ redirectUri, state, nonce }));
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeCode, verifyIdToken } from "@/lib/line";
import { getLineRedirectUri, getRequestOrigin } from "@/lib/request-origin";
import { setSessionCookie } from "@/lib/session";
import { findOrCreateLineUser } from "@/lib/users";

const OAUTH_COOKIE = "line_oauth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const lineError = url.searchParams.get("error");
  if (lineError) {
    return NextResponse.json(
      { error: `LINE 登入被取消或失敗：${lineError}`, description: url.searchParams.get("error_description") },
      { status: 400 },
    );
  }

  const jar = await cookies();
  const raw = jar.get(OAUTH_COOKIE)?.value;
  jar.delete(OAUTH_COOKIE);
  const saved = raw ? (JSON.parse(raw) as { state: string; nonce: string }) : null;
  if (!code || !state || !saved || saved.state !== state) {
    return NextResponse.json({ error: "state 不符或已過期，請重新登入" }, { status: 400 });
  }

  try {
    // redirect_uri 由這次請求的來源重組，必須與授權請求時相同
    const { id_token } = await exchangeCode(code, getLineRedirectUri(req));
    const identity = await verifyIdToken(id_token, saved.nonce);
    const { user } = await findOrCreateLineUser(identity.sub, identity.name ?? "LINE 使用者");
    await setSessionCookie({ userId: user.id, name: user.name });
  } catch (e) {
    console.error("[line callback]", e);
    return NextResponse.json({ error: "LINE 登入失敗", detail: String(e).slice(0, 300) }, { status: 502 });
  }
  return NextResponse.redirect(`${getRequestOrigin(req)}/`);
}

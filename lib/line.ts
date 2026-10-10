// LINE Login（OAuth 2.0 / OpenID Connect）伺服器端流程。
// 文件：https://developers.line.biz/en/docs/line-login/integrate-line-login/
const AUTHORIZE_URL = "https://access.line.me/oauth2/v2.1/authorize";
const TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

function channelId(): string {
  const v = process.env.LINE_CHANNEL_ID;
  if (!v) throw new Error("請在 .env 設定 LINE_CHANNEL_ID");
  return v;
}

function channelSecret(): string {
  const v = process.env.LINE_CHANNEL_SECRET;
  if (!v) throw new Error("請在 .env 設定 LINE_CHANNEL_SECRET");
  return v;
}

export function buildAuthorizeUrl(params: { redirectUri: string; state: string; nonce: string }): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", channelId());
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.state);
  url.searchParams.set("scope", "profile openid");
  url.searchParams.set("nonce", params.nonce);
  return url.toString();
}

async function postForm<T>(url: string, form: Record<string, string>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) {
    // LINE 的錯誤 body 形如 {"error":"invalid_grant","error_description":"..."}；不含 secret
    throw new Error(`LINE API ${res.status}: ${text.slice(0, 300)}`);
  }
  return JSON.parse(text) as T;
}

// 用授權碼換 token。redirect_uri 必須與授權請求時完全一致。
export async function exchangeCode(code: string, redirectUri: string): Promise<{ id_token: string }> {
  return postForm(TOKEN_URL, {
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: channelId(),
    client_secret: channelSecret(),
  });
}

export type LineIdentity = { sub: string; name?: string; picture?: string };

// 由 LINE 驗證 id_token 的簽章、aud、過期與 nonce，回傳使用者資料。
export async function verifyIdToken(idToken: string, nonce: string): Promise<LineIdentity> {
  return postForm(VERIFY_URL, { id_token: idToken, client_id: channelId(), nonce });
}

// 還原瀏覽器實際看到的 origin（<scheme>://<host>）。
// 實測（2026-10-10）：Netlify dev 代理與 Next dev server 都會帶 X-Forwarded-Proto / X-Forwarded-Host，
// 經 ngrok 等反向代理時這兩個標頭才是對外網址；req.url 的 host 永遠是內部的 localhost:3000，不能用。
// 不寫死 hostname，也不讀環境變數。
export function getRequestOrigin(req: Request): string {
  const forwardedProto = req.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",")[0].trim();
  const proto = forwardedProto || new URL(req.url).protocol.replace(":", "");
  const host = forwardedHost || req.headers.get("host");
  if (!host) throw new Error("無法判斷請求的 host");
  return `${proto}://${host}`;
}

export const LINE_CALLBACK_PATH = "/api/auth/line/callback";

export function getLineRedirectUri(req: Request): string {
  return `${getRequestOrigin(req)}${LINE_CALLBACK_PATH}`;
}

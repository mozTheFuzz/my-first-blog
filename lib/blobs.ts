import { getStore } from "@netlify/blobs";

// 為什麼需要這個包裝：
// 在 Next.js（16.4，dev 模式）執行環境裡，對「空 body 的 404 回應」呼叫 res.body.cancel()
// 永遠不會 resolve；而 @netlify/blobs 收到 404 時正是用 body.cancel() 丟棄 body，
// 導致讀取任何不存在的 key（例如首次登入查會員）都會卡住。
// 這裡把非 200 回應的 body 先讀完，再重建一個 body 為 null 的 Response，
// 讓 Blobs client 不需要呼叫 cancel()。純 Node 環境沒有這個問題，包裝在那裡也無害。
const safeFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (res.status === 200) return res;
  const text = await res.text();
  return new Response(text.length ? text : null, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
};

// consistency: "strong"
// 線上的 Blobs 預設走 edge 快取，讀取是最終一致（README：drift up to 60 seconds），
// 導致登入或留言後立刻讀到舊資料、重新整理才看到。這個部落格每次寫入後都會馬上讀，
// 改走未快取的 origin 讀取。另可避免 listPosts 讀到空列表而重寫範例文章。
export function blobStore(name: string) {
  return getStore({ name, fetch: safeFetch, consistency: "strong" });
}

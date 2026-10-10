import { blobStore } from "@/lib/blobs";

export type User = {
  id: string;
  name: string;
  createdAt: string;
};

function store() {
  return blobStore("users");
}

// 以正規化後的暱稱當 key：去頭尾空白、小寫，避免「Moz」與「moz 」被建成兩位會員
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export function validateName(body: unknown): string | { error: string } {
  if (typeof body !== "object" || body === null) return { error: "格式錯誤" };
  const { name } = body as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim()) return { error: "暱稱不可空白" };
  if (name.trim().length > 30) return { error: "暱稱最多 30 字" };
  return name.trim();
}

export async function findOrCreateUser(name: string): Promise<{ user: User; created: boolean }> {
  const key = normalizeName(name);
  const existing = (await store().get(key, { type: "json" })) as User | null;
  if (existing) return { user: existing, created: false };
  const user: User = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
  await store().setJSON(key, user);
  return { user, created: true };
}

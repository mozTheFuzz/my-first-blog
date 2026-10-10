import { blobStore } from "@/lib/blobs";

export type User = {
  id: string;
  name: string;
  lineUserId: string;
  createdAt: string;
};

function store() {
  return blobStore("users");
}

// 以 LINE 使用者 id（id_token 的 sub）為 key：同一個 LINE 帳號永遠對應同一位會員
function lineKey(lineUserId: string): string {
  return `line:${lineUserId}`;
}

export async function findOrCreateLineUser(
  lineUserId: string,
  displayName: string,
): Promise<{ user: User; created: boolean }> {
  const key = lineKey(lineUserId);
  const existing = (await store().get(key, { type: "json" })) as User | null;
  if (existing) {
    if (existing.name !== displayName) {
      const updated = { ...existing, name: displayName };
      await store().setJSON(key, updated);
      return { user: updated, created: false };
    }
    return { user: existing, created: false };
  }
  const user: User = {
    id: crypto.randomUUID(),
    name: displayName,
    lineUserId,
    createdAt: new Date().toISOString(),
  };
  await store().setJSON(key, user);
  return { user, created: true };
}

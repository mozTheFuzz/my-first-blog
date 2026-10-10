import { getStore } from "@netlify/blobs";

export type Post = {
  id: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

const SEED_POSTS: Omit<Post, "createdAt" | "updatedAt">[] = [
  {
    id: "hello-world",
    title: "哈囉，世界",
    summary: "這是部落格的第一篇文章，介紹這個網站的目的。",
    content:
      "歡迎來到我的第一個部落格。\n\n這個網站用 Next.js 搭配 Netlify Blobs 建立，之後會加入留言與會員功能。",
  },
  {
    id: "why-netlify",
    title: "為什麼選 Netlify",
    summary: "不想串接額外服務時，Netlify 內建的 Blobs 是個簡單的選擇。",
    content:
      "Netlify Blobs 是內建的 key-value 儲存，不需要申請外部資料庫。\n\n本機開發時 netlify dev 會提供模擬儲存，線上與本機程式碼一致。",
  },
  {
    id: "next-steps",
    title: "接下來的計畫",
    summary: "編輯器、留言、會員登入，一步一步來。",
    content:
      "接下來會依序完成：\n\n1. 文章編輯器\n2. 留言功能\n3. 會員登入與權限控管",
  },
];

function store() {
  return getStore("posts");
}

async function seedIfEmpty(): Promise<void> {
  const { blobs } = await store().list();
  if (blobs.length > 0) return;
  const now = new Date().toISOString();
  for (const p of SEED_POSTS) {
    await store().setJSON(p.id, { ...p, createdAt: now, updatedAt: now });
  }
}

export async function listPosts(): Promise<Post[]> {
  await seedIfEmpty();
  const { blobs } = await store().list();
  const posts = await Promise.all(
    blobs.map((b) => store().get(b.key, { type: "json" }) as Promise<Post | null>),
  );
  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPost(id: string): Promise<Post | null> {
  await seedIfEmpty();
  return (await store().get(id, { type: "json" })) as Post | null;
}

export type PostInput = { title: string; summary: string; content: string };

export function validatePostInput(body: unknown): PostInput | string {
  if (typeof body !== "object" || body === null) return "格式錯誤";
  const { title, summary, content } = body as Record<string, unknown>;
  if (typeof title !== "string" || !title.trim()) return "標題不可空白";
  if (typeof summary !== "string" || !summary.trim()) return "摘要不可空白";
  if (typeof content !== "string" || !content.trim()) return "內文不可空白";
  return { title: title.trim(), summary: summary.trim(), content: content.trim() };
}

export async function updatePost(id: string, input: PostInput): Promise<Post | null> {
  const existing = await getPost(id);
  if (!existing) return null;
  const updated: Post = { ...existing, ...input, updatedAt: new Date().toISOString() };
  await store().setJSON(id, updated);
  return updated;
}

export async function createPost(input: PostInput): Promise<Post> {
  const now = new Date().toISOString();
  const post: Post = { id: crypto.randomUUID(), ...input, createdAt: now, updatedAt: now };
  await store().setJSON(post.id, post);
  return post;
}

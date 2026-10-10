import { blobStore } from "@/lib/blobs";

export type Comment = {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type CommentInput = { authorName: string; body: string };

function store() {
  return blobStore("comments");
}

// key 格式：{postId}/{commentId}，用前綴列出同一篇文章的留言
function key(postId: string, commentId: string) {
  return `${postId}/${commentId}`;
}

export function validateCommentInput(body: unknown): CommentInput | string {
  if (typeof body !== "object" || body === null) return "格式錯誤";
  const { authorName, body: text } = body as Record<string, unknown>;
  if (typeof authorName !== "string" || !authorName.trim()) return "暱稱不可空白";
  if (typeof text !== "string" || !text.trim()) return "留言不可空白";
  return { authorName: authorName.trim().slice(0, 50), body: text.trim().slice(0, 2000) };
}

export async function listComments(postId: string): Promise<Comment[]> {
  const { blobs } = await store().list({ prefix: `${postId}/` });
  const comments = await Promise.all(
    blobs.map((b) => store().get(b.key, { type: "json" }) as Promise<Comment | null>),
  );
  return comments
    .filter((c): c is Comment => c !== null)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createComment(postId: string, input: CommentInput): Promise<Comment> {
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId,
    ...input,
    createdAt: new Date().toISOString(),
  };
  await store().setJSON(key(postId, comment.id), comment);
  return comment;
}

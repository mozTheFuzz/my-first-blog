import { blobStore } from "@/lib/blobs";

export type Comment = {
  id: string;
  postId: string;
  authorId?: string; // 任務 3 期間建立的舊留言沒有這個欄位
  authorName: string;
  body: string;
  createdAt: string;
};

export type CommentAuthor = { id: string; name: string };
export type CommentInput = { body: string };

function store() {
  return blobStore("comments");
}

// key 格式：{postId}/{commentId}，用前綴列出同一篇文章的留言
function key(postId: string, commentId: string) {
  return `${postId}/${commentId}`;
}

export function validateCommentInput(body: unknown): CommentInput | string {
  if (typeof body !== "object" || body === null) return "格式錯誤";
  const { body: text } = body as Record<string, unknown>;
  if (typeof text !== "string" || !text.trim()) return "留言不可空白";
  return { body: text.trim().slice(0, 2000) };
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

export async function createComment(
  postId: string,
  author: CommentAuthor,
  input: CommentInput,
): Promise<Comment> {
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId,
    authorId: author.id,
    authorName: author.name,
    body: input.body,
    createdAt: new Date().toISOString(),
  };
  await store().setJSON(key(postId, comment.id), comment);
  return comment;
}

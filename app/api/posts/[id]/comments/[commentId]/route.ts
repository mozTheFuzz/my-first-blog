import { NextResponse } from "next/server";
import { deleteComment, getComment } from "@/lib/comments";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ id: string; commentId: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "請先登入" }, { status: 401 });
  const { id, commentId } = await params;
  const comment = await getComment(id, commentId);
  if (!comment) return NextResponse.json({ error: "找不到留言" }, { status: 404 });
  // 後端比對作者：只有留言本人能刪除（沒有 authorId 的舊留言任何人都不能刪）
  if (!comment.authorId || comment.authorId !== session.userId) {
    return NextResponse.json({ error: "只能刪除自己的留言" }, { status: 403 });
  }
  await deleteComment(id, commentId);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { createComment, listComments, validateCommentInput } from "@/lib/comments";
import { getPost } from "@/lib/posts";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return NextResponse.json(await listComments(id));
}

export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  if (!(await getPost(id))) return NextResponse.json({ error: "找不到文章" }, { status: 404 });
  const input = validateCommentInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const comment = await createComment(id, input);
  return NextResponse.json(comment, { status: 201 });
}

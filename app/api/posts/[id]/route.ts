import { NextResponse } from "next/server";
import { getPost, updatePost, validatePostInput } from "@/lib/posts";
import { getSession } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const post = await getPost((await params).id);
  if (!post) return NextResponse.json({ error: "找不到文章" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!(await getSession())) return NextResponse.json({ error: "請先登入" }, { status: 401 });
  const input = validatePostInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const post = await updatePost((await params).id, input);
  if (!post) return NextResponse.json({ error: "找不到文章" }, { status: 404 });
  return NextResponse.json(post);
}

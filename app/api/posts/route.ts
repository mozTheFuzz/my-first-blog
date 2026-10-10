import { NextResponse } from "next/server";
import { createPost, validatePostInput } from "@/lib/posts";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "請先登入" }, { status: 401 });
  const input = validatePostInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const post = await createPost(input);
  return NextResponse.json(post, { status: 201 });
}

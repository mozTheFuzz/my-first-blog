import { NextResponse } from "next/server";
import { createPost, validatePostInput } from "@/lib/posts";

export async function POST(req: Request) {
  const input = validatePostInput(await req.json().catch(() => null));
  if (typeof input === "string") return NextResponse.json({ error: input }, { status: 400 });
  const post = await createPost(input);
  return NextResponse.json(post, { status: 201 });
}

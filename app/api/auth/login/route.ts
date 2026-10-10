import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";
import { findOrCreateUser, validateName } from "@/lib/users";

export async function POST(req: Request) {
  const name = validateName(await req.json().catch(() => null));
  if (typeof name !== "string") return NextResponse.json(name, { status: 400 });
  const { user, created } = await findOrCreateUser(name);
  await setSessionCookie({ userId: user.id, name: user.name });
  return NextResponse.json({ user, created }, { status: created ? 201 : 200 });
}

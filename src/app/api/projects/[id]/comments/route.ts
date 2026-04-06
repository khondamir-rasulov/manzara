import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createComment, getComments } from "@/lib/data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const comments = await getComments(id);
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { body } = await req.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: "body is required" }, { status: 400 });
  }

  const comment = await createComment(id, session.user.id, body.trim());
  return NextResponse.json(comment, { status: 201 });
}

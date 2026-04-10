import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProjectNotes, setProjectNotes } from "@/lib/workspace-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  return NextResponse.json({ notes: getProjectNotes(id) });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as string;
  if (role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { notes } = await req.json();
  setProjectNotes(id, notes ?? "");
  return NextResponse.json({ ok: true });
}

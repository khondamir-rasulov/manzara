import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getWorkspaceDocs, createWorkspaceDoc } from "@/lib/workspace-data";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getWorkspaceDocs());
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role as string;
  if (role === "VIEWER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { folderId, title } = await req.json();
  if (!folderId || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const doc = createWorkspaceDoc(folderId, title);
  return NextResponse.json(doc, { status: 201 });
}

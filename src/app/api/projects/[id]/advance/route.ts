import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { advanceProjectStage } from "@/lib/data";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only ADMIN and MANAGER can advance stages
  const role = (session.user as any).role as string;
  if (role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const project = await advanceProjectStage(id);
  return NextResponse.json(project);
}

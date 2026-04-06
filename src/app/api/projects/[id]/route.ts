import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Priority, ProjectStatus } from "@/generated/prisma/client";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, description, sector, deadline, priority, status, legalBasis, executorOrgId } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description?.trim() || null;
  if (sector !== undefined) data.sector = sector || null;
  if (deadline !== undefined) data.deadline = deadline ? new Date(deadline) : null;
  if (priority !== undefined) data.priority = priority as Priority;
  if (status !== undefined) data.status = status as ProjectStatus;
  if (legalBasis !== undefined) data.legalBasis = legalBasis?.trim() || null;
  if (executorOrgId !== undefined) data.executorOrgId = executorOrgId || null;

  const project = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(project);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.project.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Priority } from "@/generated/prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, programId, executorOrgId, sector, deadline, priority, description, legalBasis } = body;

  if (!name?.trim() || !programId) {
    return NextResponse.json({ error: "name and programId are required" }, { status: 400 });
  }

  // Resolve first stage of the program to set as currentStage
  const firstStage = await prisma.stage.findFirst({
    where: { programId },
    orderBy: { order: "asc" },
  });

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      programId,
      executorOrgId: executorOrgId || null,
      sector: sector || null,
      deadline: deadline ? new Date(deadline) : null,
      priority: (priority as Priority) ?? "NORMAL",
      legalBasis: legalBasis?.trim() || null,
      status: "ACTIVE",
      currentStageId: firstStage?.id ?? null,
    },
  });

  // Create the initial IN_PROGRESS project stage
  if (firstStage) {
    await prisma.projectStage.create({
      data: {
        projectId: project.id,
        stageId: firstStage.id,
        status: "IN_PROGRESS",
        enteredAt: new Date(),
      },
    });
  }

  return NextResponse.json(project, { status: 201 });
}

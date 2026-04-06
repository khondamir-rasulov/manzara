import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const projects = await prisma.project.findMany({
    where: {
      status: "ACTIVE",
      deadline: { lt: now },
    },
    select: {
      id: true,
      name: true,
      deadline: true,
      executorOrg: { select: { shortName: true } },
    },
    orderBy: { deadline: "asc" },
  });

  return NextResponse.json({ count: projects.length, projects });
}

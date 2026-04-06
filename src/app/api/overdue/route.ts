import { NextResponse } from "next/server";
import { DEMO_PROJECTS } from "@/lib/demo-data";

export async function GET() {
  const now = new Date();
  const projects = DEMO_PROJECTS
    .filter((p) => p.status === "ACTIVE" && p.deadline && new Date(p.deadline) < now)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .map((p) => ({
      id: p.id,
      name: p.name,
      deadline: p.deadline,
      executorOrg: p.executorOrg ? { shortName: p.executorOrg.shortName } : null,
    }));

  return NextResponse.json({ count: projects.length, projects });
}

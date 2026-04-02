import { prisma } from "@/lib/prisma";
import { daysInStage } from "@/lib/utils";

export type ProjectWithStages = Awaited<ReturnType<typeof getProjects>>[number];
export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export async function getProjects(programId?: string) {
  return prisma.project.findMany({
    where: programId ? { programId } : undefined,
    include: {
      program: true,
      executorOrg: true,
      stages: {
        include: {
          stage: true,
          fieldValues: { include: { field: true } },
        },
        orderBy: { stage: { order: "asc" } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      program: {
        include: {
          stages: {
            include: { fields: { orderBy: { order: "asc" } } },
            orderBy: { order: "asc" },
          },
        },
      },
      executorOrg: true,
      stages: {
        include: {
          stage: true,
          fieldValues: { include: { field: true } },
        },
        orderBy: { stage: { order: "asc" } },
      },
    },
  });
}

export async function getPrograms() {
  return prisma.program.findMany({
    include: {
      org: true,
      stages: { orderBy: { order: "asc" } },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDashboardStats(programId?: string) {
  const projects = await getProjects(programId);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "ACTIVE").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const cancelled = projects.filter((p) => p.status === "CANCELLED").length;
  const onHold = projects.filter((p) => p.status === "ON_HOLD").length;

  // Stage distribution
  const stageMap: Record<string, { name: string; count: number; color: string; totalDays: number }> = {};
  for (const project of projects) {
    if (project.status !== "ACTIVE") continue;
    const currentStage = project.stages.find(
      (ps) => ps.stageId === project.currentStageId
    );
    if (!currentStage) continue;
    const key = currentStage.stageId;
    if (!stageMap[key]) {
      stageMap[key] = {
        name: currentStage.stage.name,
        count: 0,
        color: currentStage.stage.color,
        totalDays: 0,
      };
    }
    stageMap[key].count++;
    stageMap[key].totalDays += daysInStage(currentStage.enteredAt);
  }

  const stageDistribution = Object.values(stageMap).map((s) => ({
    ...s,
    avgDays: s.count > 0 ? Math.round(s.totalDays / s.count) : 0,
  }));

  // Sector distribution
  const sectorMap: Record<string, number> = {};
  for (const p of projects) {
    const s = p.sector ?? "Other";
    sectorMap[s] = (sectorMap[s] ?? 0) + 1;
  }
  const sectorDistribution = Object.entries(sectorMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Org distribution
  const orgMap: Record<string, { name: string; count: number }> = {};
  for (const p of projects) {
    if (!p.executorOrgId) continue;
    const name = p.executorOrg?.shortName ?? "Unknown";
    orgMap[p.executorOrgId] = orgMap[p.executorOrgId] ?? { name, count: 0 };
    orgMap[p.executorOrgId].count++;
  }
  const orgDistribution = Object.values(orgMap).sort((a, b) => b.count - a.count);

  // Deadline risk
  const now = new Date();
  const in30 = projects.filter((p) => {
    if (!p.deadline || p.status !== "ACTIVE") return false;
    const days = Math.ceil((new Date(p.deadline).getTime() - now.getTime()) / 86400000);
    return days >= 0 && days <= 30;
  }).length;
  const in60 = projects.filter((p) => {
    if (!p.deadline || p.status !== "ACTIVE") return false;
    const days = Math.ceil((new Date(p.deadline).getTime() - now.getTime()) / 86400000);
    return days > 30 && days <= 60;
  }).length;
  const overdue = projects.filter((p) => {
    if (!p.deadline || p.status !== "ACTIVE") return false;
    return new Date(p.deadline) < now;
  }).length;

  // Top stuck projects
  const stuckProjects = projects
    .filter((p) => p.status === "ACTIVE")
    .map((p) => {
      const currentStage = p.stages.find((ps) => ps.stageId === p.currentStageId);
      const days = daysInStage(currentStage?.enteredAt);
      return { id: p.id, name: p.name, stageName: currentStage?.stage.name ?? "—", days, slaDays: currentStage?.stage.slaDays ?? 30 };
    })
    .sort((a, b) => b.days - a.days)
    .slice(0, 10);

  return {
    total,
    active,
    completed,
    cancelled,
    onHold,
    stageDistribution,
    sectorDistribution,
    orgDistribution,
    deadlineRisk: { in30, in60, overdue },
    stuckProjects,
  };
}

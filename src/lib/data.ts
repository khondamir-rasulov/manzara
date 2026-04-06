import { prisma } from "@/lib/prisma";
import { daysInStage } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import type { Priority } from "@/generated/prisma/client";

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
      stages: {
        include: { fields: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
      _count: { select: { projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrgs() {
  return prisma.org.findMany({ orderBy: { name: "asc" } });
}

export type OrgOption = Awaited<ReturnType<typeof getOrgs>>[number];

export async function getComments(projectId: string) {
  return prisma.comment.findMany({
    where: { projectId },
    include: { author: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
}

export type ProjectComments = Awaited<ReturnType<typeof getComments>>;

export async function createComment(projectId: string, authorId: string, body: string) {
  return prisma.comment.create({
    data: { projectId, authorId, body },
    include: { author: { select: { id: true, name: true, email: true, image: true } } },
  });
}

export async function updateProjectPriority(id: string, priority: Priority) {
  return prisma.project.update({ where: { id }, data: { priority } });
}

export async function advanceProjectStage(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      program: { include: { stages: { orderBy: { order: "asc" } } } },
      stages: { include: { stage: true } },
    },
  });
  if (!project) throw new Error("Project not found");

  const orderedStages = project.program.stages;
  const currentIdx = orderedStages.findIndex((s) => s.id === project.currentStageId);
  if (currentIdx === -1) throw new Error("Current stage not found in program");

  const now = new Date();

  // Complete current stage
  const currentProjectStage = project.stages.find(
    (ps) => ps.stageId === project.currentStageId && ps.status === "IN_PROGRESS"
  );
  if (currentProjectStage) {
    await prisma.projectStage.update({
      where: { id: currentProjectStage.id },
      data: { status: "COMPLETED", completedAt: now },
    });
  }

  // Last stage — mark project COMPLETED
  if (currentIdx >= orderedStages.length - 1) {
    return prisma.project.update({
      where: { id },
      data: { status: "COMPLETED", currentStageId: null },
    });
  }

  // Advance to next stage
  const nextStage = orderedStages[currentIdx + 1];
  await prisma.projectStage.upsert({
    where: { projectId_stageId: { projectId: id, stageId: nextStage.id } },
    create: { projectId: id, stageId: nextStage.id, status: "IN_PROGRESS", enteredAt: now },
    update: { status: "IN_PROGRESS", enteredAt: now, completedAt: null },
  });

  return prisma.project.update({
    where: { id },
    data: { currentStageId: nextStage.id },
  });
}

export async function getDashboardStats(programId?: string) {
  const [projects, completedStageRows] = await Promise.all([
    getProjects(programId),
    prisma.projectStage.findMany({
      where: {
        status: "COMPLETED",
        enteredAt: { not: null },
        completedAt: { not: null },
      },
      select: {
        enteredAt: true,
        completedAt: true,
        stage: { select: { name: true, slaDays: true } },
      },
    }),
  ]);

  const total = projects.length;
  const active = projects.filter((p) => p.status === "ACTIVE").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const cancelled = projects.filter((p) => p.status === "CANCELLED").length;
  const onHold = projects.filter((p) => p.status === "ON_HOLD").length;

  // Stage distribution (includes stageId + slaDays for client-side filtering and traffic-light coloring)
  const stageMap: Record<string, { stageId: string; name: string; count: number; color: string; slaDays: number; totalDays: number }> = {};
  for (const project of projects) {
    if (project.status !== "ACTIVE") continue;
    const currentStage = project.stages.find((ps) => ps.stageId === project.currentStageId);
    if (!currentStage) continue;
    const key = currentStage.stageId;
    if (!stageMap[key]) {
      stageMap[key] = {
        stageId: key,
        name: currentStage.stage.name,
        count: 0,
        color: currentStage.stage.color,
        slaDays: currentStage.stage.slaDays,
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

  // Org distribution (kept for backward compat)
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

  // SLA compliance per stage (from completed ProjectStage rows)
  const slaMap: Record<string, { stageName: string; slaDays: number; total: number; compliant: number }> = {};
  for (const ps of completedStageRows) {
    if (!ps.enteredAt || !ps.completedAt) continue;
    const key = ps.stage.name;
    if (!slaMap[key]) slaMap[key] = { stageName: key, slaDays: ps.stage.slaDays, total: 0, compliant: 0 };
    const actualDays = differenceInDays(ps.completedAt, ps.enteredAt);
    slaMap[key].total++;
    if (actualDays <= ps.stage.slaDays) slaMap[key].compliant++;
  }
  const slaCompliance = Object.values(slaMap)
    .filter((s) => s.total > 0)
    .map(({ stageName, total, compliant }) => ({
      stageName,
      total,
      compliant,
      late: total - compliant,
      rate: Math.round((compliant / total) * 100),
    }));
  const totalSlaStages = slaCompliance.reduce((sum, s) => sum + s.total, 0);
  const totalSlaCompliant = slaCompliance.reduce((sum, s) => sum + s.compliant, 0);
  const overallSlaRate = totalSlaStages > 0 ? Math.round((totalSlaCompliant / totalSlaStages) * 100) : null;

  // Priority distribution
  const PRIORITY_ORDER = ["URGENT", "HIGH", "NORMAL", "LOW"] as const;
  const priorityCountMap: Record<string, number> = {};
  for (const p of projects) {
    priorityCountMap[p.priority] = (priorityCountMap[p.priority] ?? 0) + 1;
  }
  const priorityDistribution = PRIORITY_ORDER.map((priority) => ({
    priority,
    count: priorityCountMap[priority] ?? 0,
  }));

  // Executor performance
  const execMap: Record<string, {
    name: string; total: number; completed: number;
    totalStageDays: number; stageCount: number;
    completedStages: number; compliantStages: number;
  }> = {};
  for (const p of projects) {
    if (!p.executorOrgId) continue;
    const orgName = p.executorOrg?.shortName ?? p.executorOrg?.name ?? "Unknown";
    if (!execMap[p.executorOrgId]) {
      execMap[p.executorOrgId] = { name: orgName, total: 0, completed: 0, totalStageDays: 0, stageCount: 0, completedStages: 0, compliantStages: 0 };
    }
    const entry = execMap[p.executorOrgId];
    entry.total++;
    if (p.status === "COMPLETED") entry.completed++;
    if (p.status === "ACTIVE") {
      const currentStage = p.stages.find((ps) => ps.stageId === p.currentStageId);
      if (currentStage?.enteredAt) {
        entry.totalStageDays += daysInStage(currentStage.enteredAt);
        entry.stageCount++;
      }
    }
    for (const ps of p.stages) {
      if (ps.status === "COMPLETED" && ps.enteredAt && ps.completedAt) {
        const actualDays = differenceInDays(ps.completedAt, ps.enteredAt);
        entry.completedStages++;
        if (actualDays <= ps.stage.slaDays) entry.compliantStages++;
      }
    }
  }
  const executorPerformance = Object.values(execMap)
    .sort((a, b) => b.total - a.total)
    .map(({ name, total, completed, totalStageDays, stageCount, completedStages, compliantStages }) => ({
      name,
      total,
      completed,
      avgDays: stageCount > 0 ? Math.round(totalStageDays / stageCount) : null,
      slaRate: completedStages > 0 ? Math.round((compliantStages / completedStages) * 100) : null,
    }));

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
    slaCompliance,
    overallSlaRate,
    priorityDistribution,
    executorPerformance,
  };
}

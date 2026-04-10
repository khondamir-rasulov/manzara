import { daysInStage } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import {
  DEMO_PROJECTS,
  DEMO_STAGES,
  DEMO_COMPLETED_STAGES,
  DEMO_ORGS,
  DEMO_PROGRAM_FULL,
} from "@/lib/demo-data";

export type ProjectWithStages = (typeof DEMO_PROJECTS)[number];
export type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;

export async function getProjects(_programId?: string) {
  return DEMO_PROJECTS;
}

export async function getProject(id: string) {
  const project = DEMO_PROJECTS.find((p) => p.id === id);
  if (!project) return null;
  // Attach program with full stages+fields (needed by ProjectDetailClient)
  return {
    ...project,
    program: DEMO_PROGRAM_FULL,
  };
}

export async function getPrograms() {
  return [DEMO_PROGRAM_FULL];
}

export async function getOrgs() {
  return [...DEMO_ORGS];
}

export type OrgOption = (typeof DEMO_ORGS)[number];

export type CommentItem = {
  id: string;
  projectId: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: { id: string; name: string | null; email: string | null; image: string | null };
};

export async function getComments(_projectId: string): Promise<CommentItem[]> {
  return [];
}

export type ProjectComments = CommentItem[];

export async function createComment(
  projectId: string,
  authorId: string,
  body: string
): Promise<CommentItem> {
  return {
    id: `comment-${Date.now()}`,
    projectId,
    authorId,
    body,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: authorId,
      name: "Demo User",
      email: "admin@manzara.uz",
      image: null,
    },
  };
}

export async function updateProjectPriority(_id: string, _priority: string) {
  // Demo mode — no-op
}

export async function updateProjectStatus(id: string, status: "ACTIVE" | "COMPLETED" | "CANCELLED" | "ON_HOLD") {
  const project = DEMO_PROJECTS.find((p) => p.id === id);
  if (!project) return null;
  project.status = status;
  return project;
}

export async function deleteProject(id: string) {
  const idx = DEMO_PROJECTS.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  DEMO_PROJECTS.splice(idx, 1);
  return true;
}

export async function advanceProjectStage(id: string) {
  const project = DEMO_PROJECTS.find((p) => p.id === id);
  if (!project) return null;

  const currentIdx = DEMO_STAGES.findIndex((s) => s.id === project.currentStageId);
  if (currentIdx === -1 || currentIdx >= DEMO_STAGES.length - 1) return project; // already at last stage

  const nextStageDef = DEMO_STAGES[currentIdx + 1];
  const now = new Date();

  // Mark current project stage as completed
  const currentPS = project.stages.find((ps) => ps.stageId === project.currentStageId);
  if (currentPS) {
    currentPS.status = "COMPLETED";
    currentPS.completedAt = now;
  }

  // Add the next stage entry
  project.stages.push({
    id: `ps-${project.id}-${nextStageDef.id}-${Date.now()}`,
    projectId: project.id,
    stageId: nextStageDef.id,
    status: "IN_PROGRESS",
    enteredAt: now,
    completedAt: null,
    notes: null,
    stage: {
      id: nextStageDef.id,
      name: nextStageDef.name,
      order: nextStageDef.order,
      color: nextStageDef.color,
      slaDays: nextStageDef.slaDays,
      programId: nextStageDef.programId,
    },
    fieldValues: [],
  });

  project.currentStageId = nextStageDef.id;

  return project;
}

export async function getDashboardStats(_programId?: string) {
  // Cast to a mutable typed array so status comparisons across all values work
  const projects = DEMO_PROJECTS as Array<typeof DEMO_PROJECTS[number] & { status: string }>;

  const total = projects.length;
  const active = projects.filter((p) => p.status === "ACTIVE").length;
  const completed = projects.filter((p) => p.status === "COMPLETED").length;
  const cancelled = projects.filter((p) => p.status === "CANCELLED").length;
  const onHold = projects.filter((p) => p.status === "ON_HOLD").length;

  // Stage distribution
  const stageMap: Record<string, {
    stageId: string; name: string; count: number;
    color: string; slaDays: number; totalDays: number;
  }> = {};
  for (const project of projects) {
    if (project.status !== "ACTIVE") continue;
    const currentStage = project.stages.find(
      (ps) => ps.stageId === project.currentStageId
    );
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

  // Org distribution
  const orgMap: Record<string, { name: string; count: number }> = {};
  for (const p of projects) {
    if (!p.executorOrgId) continue;
    const name = p.executorOrg?.shortName ?? "Unknown";
    orgMap[p.executorOrgId] = orgMap[p.executorOrgId] ?? { name, count: 0 };
    orgMap[p.executorOrgId].count++;
  }
  const orgDistribution = Object.values(orgMap).sort(
    (a, b) => b.count - a.count
  );

  // Deadline risk
  const now = new Date();
  const in30 = projects.filter((p) => {
    if (!p.deadline || p.status !== "ACTIVE") return false;
    const days = Math.ceil(
      (new Date(p.deadline).getTime() - now.getTime()) / 86400000
    );
    return days >= 0 && days <= 30;
  }).length;
  const in60 = projects.filter((p) => {
    if (!p.deadline || p.status !== "ACTIVE") return false;
    const days = Math.ceil(
      (new Date(p.deadline).getTime() - now.getTime()) / 86400000
    );
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
      const currentStage = p.stages.find(
        (ps) => ps.stageId === p.currentStageId
      );
      const days = daysInStage(currentStage?.enteredAt);
      return {
        id: p.id,
        name: p.name,
        stageName: currentStage?.stage.name ?? "—",
        days,
        slaDays: currentStage?.stage.slaDays ?? 30,
      };
    })
    .sort((a, b) => b.days - a.days)
    .slice(0, 10);

  // SLA compliance
  const slaMap: Record<string, {
    stageName: string; slaDays: number; total: number; compliant: number;
  }> = {};
  for (const ps of DEMO_COMPLETED_STAGES) {
    const key = ps.stage.name;
    if (!slaMap[key]) {
      slaMap[key] = { stageName: key, slaDays: ps.stage.slaDays, total: 0, compliant: 0 };
    }
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
  const totalSlaCompliant = slaCompliance.reduce(
    (sum, s) => sum + s.compliant,
    0
  );
  const overallSlaRate =
    totalSlaStages > 0
      ? Math.round((totalSlaCompliant / totalSlaStages) * 100)
      : null;

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
    const orgName =
      p.executorOrg?.shortName ?? p.executorOrg?.name ?? "Unknown";
    if (!execMap[p.executorOrgId]) {
      execMap[p.executorOrgId] = {
        name: orgName,
        total: 0,
        completed: 0,
        totalStageDays: 0,
        stageCount: 0,
        completedStages: 0,
        compliantStages: 0,
      };
    }
    const entry = execMap[p.executorOrgId];
    entry.total++;
    if (p.status === "COMPLETED") entry.completed++;
    if (p.status === "ACTIVE") {
      const currentStage = p.stages.find(
        (ps) => ps.stageId === p.currentStageId
      );
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
    .map(
      ({
        name,
        total,
        completed,
        totalStageDays,
        stageCount,
        completedStages,
        compliantStages,
      }) => ({
        name,
        total,
        completed,
        avgDays:
          stageCount > 0 ? Math.round(totalStageDays / stageCount) : null,
        slaRate:
          completedStages > 0
            ? Math.round((compliantStages / completedStages) * 100)
            : null,
      })
    );

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

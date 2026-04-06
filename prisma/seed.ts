import "dotenv/config";
import { PrismaClient, ProjectStatus, ProjectStageStatus, FieldType, Priority } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/manzara" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  // ── Orgs ──────────────────────────────────────────────────────────────
  const aiCenter = await prisma.org.create({
    data: { name: "Center for AI and Digital Economy Development", shortName: "AI Center" },
  });

  const minRaqam = await prisma.org.create({
    data: { name: "Ministry of Digital Technologies", shortName: "MinRaqam" },
  });

  const executor1 = await prisma.org.create({
    data: { name: "Axborot texnologiyalari va kommunikatsiyalarini rivojlantirish markazi", shortName: "ATK Markazi" },
  });
  const executor2 = await prisma.org.create({
    data: { name: "Raqamli transformatsiya agentligi", shortName: "Raqamli agentlik" },
  });
  const executor3 = await prisma.org.create({
    data: { name: "InnoHub Uzbekistan innovatsion markazi", shortName: "InnoHub Uz" },
  });

  // ── Users ─────────────────────────────────────────────────────────────
  const password = await bcrypt.hash("demo1234", 10);

  await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@manzara.uz",
      password,
      role: "ADMIN",
      orgId: aiCenter.id,
    },
  });

  await prisma.user.create({
    data: {
      name: "Project Manager",
      email: "manager@manzara.uz",
      password,
      role: "MANAGER",
      orgId: aiCenter.id,
    },
  });

  // ── Program: ПКМ 425 pipeline ─────────────────────────────────────────
  const program = await prisma.program.create({
    data: {
      name: "ПКМ 425 — Sun'iy intellekt bo'yicha ustuvor loyihalar 2025–2026",
      description: "Vazirlar Mahkamasining sun'iy intellekt texnologiyalarini joriy etish bo'yicha ustuvor loyihalar to'g'risidagi qarori",
      orgId: aiCenter.id,
    },
  });

  // ── Stages ────────────────────────────────────────────────────────────
  const stagesData = [
    { name: "TZ Development", order: 1, color: "#6366f1", slaDays: 30 },
    { name: "Ministry Approvals", order: 2, color: "#8b5cf6", slaDays: 20 },
    { name: "ЦКБ Review", order: 3, color: "#a855f7", slaDays: 45 },
    { name: "НАПП Review", order: 4, color: "#ec4899", slaDays: 25 },
    { name: "Reestr.uz", order: 5, color: "#f43f5e", slaDays: 15 },
    { name: "Procurement", order: 6, color: "#f97316", slaDays: 60 },
    { name: "ЦКЭ Review", order: 7, color: "#eab308", slaDays: 60 },
  ];

  const stages = await Promise.all(
    stagesData.map((s) =>
      prisma.stage.create({ data: { ...s, programId: program.id } })
    )
  );

  // Add fields to Ministry Approvals stage
  await prisma.stageField.createMany({
    data: [
      { stageId: stages[1].id, name: "Letter № from MinRaqam", fieldType: FieldType.DOCNUMBER, isRequired: true, order: 1 },
      { stageId: stages[1].id, name: "Letter date", fieldType: FieldType.DATE, isRequired: true, order: 2 },
      { stageId: stages[1].id, name: "Re-approval needed?", fieldType: FieldType.CHECKBOX, isRequired: false, order: 3 },
      { stageId: stages[1].id, name: "Notes", fieldType: FieldType.TEXT, isRequired: false, order: 4 },
    ],
  });

  // Add fields to НАПП stage
  await prisma.stageField.createMany({
    data: [
      { stageId: stages[3].id, name: "Letter №", fieldType: FieldType.DOCNUMBER, isRequired: true, order: 1 },
      { stageId: stages[3].id, name: "Review result", fieldType: FieldType.DROPDOWN, isRequired: true, order: 2, options: JSON.stringify(["Approved", "Returned for rework", "Re-submitted"]) },
      { stageId: stages[3].id, name: "Re-review needed?", fieldType: FieldType.CHECKBOX, isRequired: false, order: 3 },
    ],
  });

  // Add fields to Reestr.uz
  await prisma.stageField.createMany({
    data: [
      { stageId: stages[4].id, name: "Registry ID", fieldType: FieldType.TEXT, isRequired: true, order: 1 },
      { stageId: stages[4].id, name: "Status", fieldType: FieldType.DROPDOWN, isRequired: true, order: 2, options: JSON.stringify(["Under review", "Conclusion received", "Returned for rework"]) },
    ],
  });

  // Add fields to Procurement
  await prisma.stageField.createMany({
    data: [
      { stageId: stages[5].id, name: "Proposals received", fieldType: FieldType.NUMBER, isRequired: false, order: 1 },
      { stageId: stages[5].id, name: "Lot №", fieldType: FieldType.TEXT, isRequired: false, order: 2 },
      { stageId: stages[5].id, name: "Executor", fieldType: FieldType.TEXT, isRequired: false, order: 3 },
      { stageId: stages[5].id, name: "Contract №", fieldType: FieldType.DOCNUMBER, isRequired: false, order: 4 },
      { stageId: stages[5].id, name: "Contract date", fieldType: FieldType.DATE, isRequired: false, order: 5 },
    ],
  });

  // ── Projects ──────────────────────────────────────────────────────────
  const projectsData = [
    // Healthcare — HIGH priority (critical public health)
    { name: "AI Drug Demand Forecasting System", sector: "Healthcare", executorOrgId: executor1.id, deadline: new Date("2025-10-01"), currentStageIdx: 1, priority: Priority.URGENT },
    { name: "Clinical Decision Support Assistant (Top-3 Diagnosis)", sector: "Healthcare", executorOrgId: executor1.id, deadline: new Date("2026-12-01"), currentStageIdx: 2, priority: Priority.HIGH },
    { name: "Voice-to-Text Assistant for Medical Records (SVAR)", sector: "Healthcare", executorOrgId: executor2.id, deadline: new Date("2026-03-01"), currentStageIdx: 3, priority: Priority.HIGH },
    { name: "CT/X-Ray AI for Lung Pathology Detection", sector: "Healthcare", executorOrgId: executor1.id, deadline: new Date("2026-10-01"), currentStageIdx: 4, priority: Priority.HIGH },
    { name: "AI Mammography for Early Breast Cancer Detection", sector: "Healthcare", executorOrgId: executor2.id, deadline: new Date("2026-12-01"), currentStageIdx: 1, priority: Priority.HIGH },
    // Aerospace monitoring
    { name: "Satellite AI Crop Yield Forecasting (Wheat & Cotton)", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-11-01"), currentStageIdx: 2, priority: Priority.NORMAL },
    { name: "Drone AI Land Encroachment Detection System", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-09-01"), currentStageIdx: 5, priority: Priority.NORMAL },
    { name: "Satellite Pasture Condition Monitoring", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-11-01"), currentStageIdx: 6, priority: Priority.LOW },
    { name: "Aerial AI Power Line Inspection System", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-08-01"), currentStageIdx: 3, priority: Priority.NORMAL },
    { name: "AI Optimal Solar Panel Placement System", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-10-01"), currentStageIdx: 0, priority: Priority.LOW },
    // Security — HIGH priority
    { name: "UzFace — Railway Station Face Recognition", sector: "Security", executorOrgId: executor1.id, deadline: new Date("2026-03-01"), currentStageIdx: 4, priority: Priority.HIGH },
    { name: "Computer Vision Traffic Violation Detection", sector: "Security", executorOrgId: executor2.id, deadline: new Date("2026-07-01"), currentStageIdx: 2, priority: Priority.HIGH },
    { name: "Driver Fatigue Detection for Public Transport", sector: "Security", executorOrgId: executor1.id, deadline: new Date("2026-04-01"), currentStageIdx: 1, priority: Priority.HIGH },
    // Economy
    { name: "AI Illegal Procurement Activity Detection", sector: "Economy", executorOrgId: executor2.id, deadline: new Date("2026-11-01"), currentStageIdx: 3, priority: Priority.NORMAL },
    { name: "Automated Bank Account Verification for Budget Orgs", sector: "Economy", executorOrgId: executor2.id, deadline: new Date("2026-12-01"), currentStageIdx: 5, priority: Priority.NORMAL },
    { name: "Banking Sector Fraud Detection System", sector: "Economy", executorOrgId: executor1.id, deadline: new Date("2026-11-01"), currentStageIdx: 6, priority: Priority.HIGH },
    { name: "AIStudy.uz — 1M Users AI Platform", sector: "Education", executorOrgId: executor1.id, deadline: new Date("2025-10-01"), currentStageIdx: 2, priority: Priority.URGENT },
    // Research
    { name: "Legal NLP — Normative Document Classification (Uzbek)", sector: "Research", executorOrgId: executor3.id, deadline: new Date("2026-10-01"), currentStageIdx: 0, priority: Priority.LOW },
    { name: "AI Assistant for Interdepartmental Document Management", sector: "E-Government", executorOrgId: executor2.id, deadline: new Date("2026-11-01"), currentStageIdx: 4, priority: Priority.NORMAL },
    { name: "OCR for Uzbek-Language Incoming Documents", sector: "E-Government", executorOrgId: executor2.id, deadline: new Date("2026-03-01"), currentStageIdx: 3, priority: Priority.NORMAL },
    { name: "Citizen Media Sentiment Monitoring Platform", sector: "Media", executorOrgId: executor1.id, deadline: new Date("2026-08-01"), currentStageIdx: 1, priority: Priority.NORMAL },
    { name: "AI Satellite Image Resolution Enhancement", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-03-01"), currentStageIdx: 2, priority: Priority.NORMAL },
    { name: "Uzbek Language Corpus for National LLM", sector: "Research", executorOrgId: executor2.id, deadline: new Date("2026-11-01"), currentStageIdx: 0, priority: Priority.LOW },
    { name: "Sign Language Translation Mobile App", sector: "Social", executorOrgId: executor1.id, deadline: new Date("2026-11-01"), currentStageIdx: 1, priority: Priority.NORMAL },
    { name: "Aerial AI Road Surface Condition Monitoring", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-06-01"), currentStageIdx: 3, priority: Priority.NORMAL },
    { name: "AI Weather Forecasting with Historical Models", sector: "Environment", executorOrgId: executor2.id, deadline: new Date("2025-09-01"), currentStageIdx: 5, priority: Priority.URGENT },
    { name: "Statistical Quality Control Using ML", sector: "Research", executorOrgId: executor3.id, deadline: new Date("2026-09-01"), currentStageIdx: 4, priority: Priority.LOW },
    { name: "Environmental ML — Atmosphere & Soil Monitoring", sector: "Environment", executorOrgId: executor3.id, deadline: new Date("2026-12-01"), currentStageIdx: 2, priority: Priority.LOW },
    { name: "Image Processing Web Platform", sector: "Research", executorOrgId: executor2.id, deadline: new Date("2026-03-01"), currentStageIdx: 1, priority: Priority.LOW },
    { name: "AI Lab Setup at TUIT and Inha University", sector: "Education", executorOrgId: executor1.id, deadline: new Date("2025-12-01"), currentStageIdx: 6, priority: Priority.URGENT },
  ];

  const now = new Date();

  for (const pd of projectsData) {
    const project = await prisma.project.create({
      data: {
        name: pd.name,
        sector: pd.sector,
        programId: program.id,
        executorOrgId: pd.executorOrgId,
        deadline: pd.deadline,
        legalBasis: "ПКМ 425, 10.07.2025",
        status: ProjectStatus.ACTIVE,
        priority: pd.priority,
        currentStageId: stages[pd.currentStageIdx].id,
      },
    });

    // Create project stages up to and including the current one
    for (let i = 0; i <= pd.currentStageIdx; i++) {
      const isCompleted = i < pd.currentStageIdx;
      const daysAgo = isCompleted
        ? (pd.currentStageIdx - i) * 18 + Math.floor(Math.random() * 10)
        : Math.floor(Math.random() * stages[i].slaDays * 1.2);

      const enteredAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const completedAt = isCompleted
        ? new Date(enteredAt.getTime() + 14 * 24 * 60 * 60 * 1000)
        : null;

      await prisma.projectStage.create({
        data: {
          projectId: project.id,
          stageId: stages[i].id,
          status: isCompleted ? ProjectStageStatus.COMPLETED : ProjectStageStatus.IN_PROGRESS,
          enteredAt,
          completedAt,
        },
      });
    }
  }

  console.log(`Seeded: ${projectsData.length} projects across 7 stages`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

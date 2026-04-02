import { PrismaClient, ProjectStatus, ProjectStageStatus, FieldType } from "../src/generated/prisma/client";
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
    data: { name: "Implementing Organization #1", shortName: "Org 1" },
  });
  const executor2 = await prisma.org.create({
    data: { name: "Implementing Organization #2", shortName: "Org 2" },
  });
  const executor3 = await prisma.org.create({
    data: { name: "Implementing Organization #3", shortName: "Org 3" },
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
      name: "ПКМ 425 — Priority AI Projects 2025–2026",
      description: "Cabinet of Ministers Resolution on implementation of priority AI projects",
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
    // Healthcare
    { name: "AI system for drug demand forecasting", sector: "Healthcare", executorOrgId: executor1.id, deadline: new Date("2025-10-01"), currentStageIdx: 1 },
    { name: "Clinical decision support assistant (Top-3 diagnosis)", sector: "Healthcare", executorOrgId: executor1.id, deadline: new Date("2026-12-01"), currentStageIdx: 2 },
    { name: "Voice assistant for DMED — speech-to-text for medical records", sector: "Healthcare", executorOrgId: executor2.id, deadline: new Date("2026-03-01"), currentStageIdx: 3 },
    { name: "CT/X-ray AI for lung pathology detection", sector: "Healthcare", executorOrgId: executor1.id, deadline: new Date("2026-10-01"), currentStageIdx: 4 },
    { name: "Mammography AI for early breast cancer detection", sector: "Healthcare", executorOrgId: executor2.id, deadline: new Date("2026-12-01"), currentStageIdx: 1 },
    // Aerospace
    { name: "Crop yield forecasting via satellite AI (wheat & cotton)", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-11-01"), currentStageIdx: 2 },
    { name: "Land encroachment detection via drone AI", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-09-01"), currentStageIdx: 5 },
    { name: "Pasture condition monitoring via satellite", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-11-01"), currentStageIdx: 6 },
    { name: "Power line inspection via aerial AI", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-08-01"), currentStageIdx: 3 },
    { name: "Solar panel optimal placement AI", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-10-01"), currentStageIdx: 0 },
    // Security
    { name: "UzFace — face recognition at railway stations", sector: "Security", executorOrgId: executor1.id, deadline: new Date("2026-03-01"), currentStageIdx: 4 },
    { name: "Traffic violation detection via computer vision", sector: "Security", executorOrgId: executor2.id, deadline: new Date("2026-07-01"), currentStageIdx: 2 },
    { name: "Driver fatigue detection for public transport", sector: "Security", executorOrgId: executor1.id, deadline: new Date("2026-04-01"), currentStageIdx: 1 },
    // Economy
    { name: "AI for detecting illegal procurement activities", sector: "Economy", executorOrgId: executor2.id, deadline: new Date("2026-11-01"), currentStageIdx: 3 },
    { name: "Bank account auto-verification for budget orgs", sector: "Economy", executorOrgId: executor2.id, deadline: new Date("2026-12-01"), currentStageIdx: 5 },
    { name: "Fraud detection system for banking sector", sector: "Economy", executorOrgId: executor1.id, deadline: new Date("2026-11-01"), currentStageIdx: 6 },
    { name: "AIStudy.uz — 1 million AI users platform", sector: "Education", executorOrgId: executor1.id, deadline: new Date("2025-10-01"), currentStageIdx: 2 },
    // Research
    { name: "Legal NLP — classification of normative legal texts (Uzbek)", sector: "Research", executorOrgId: executor3.id, deadline: new Date("2026-10-01"), currentStageIdx: 0 },
    { name: "Interdepartmental document management AI assistant", sector: "E-Government", executorOrgId: executor2.id, deadline: new Date("2026-11-01"), currentStageIdx: 4 },
    { name: "OCR for Uzbek-language incoming documents", sector: "E-Government", executorOrgId: executor2.id, deadline: new Date("2026-03-01"), currentStageIdx: 3 },
    { name: "Citizen media sentiment monitoring platform", sector: "Media", executorOrgId: executor1.id, deadline: new Date("2026-08-01"), currentStageIdx: 1 },
    { name: "Satellite image resolution enhancement AI", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-03-01"), currentStageIdx: 2 },
    { name: "Uzbek language corpus for national LLM", sector: "Research", executorOrgId: executor2.id, deadline: new Date("2026-11-01"), currentStageIdx: 0 },
    { name: "Sign language translation mobile app", sector: "Social", executorOrgId: executor1.id, deadline: new Date("2026-11-01"), currentStageIdx: 1 },
    { name: "Road surface condition monitoring via aerial AI", sector: "Aerospace monitoring", executorOrgId: executor3.id, deadline: new Date("2026-06-01"), currentStageIdx: 3 },
    { name: "Weather forecasting with historical AI models", sector: "Environment", executorOrgId: executor2.id, deadline: new Date("2025-09-01"), currentStageIdx: 5 },
    { name: "Statistical quality control using ML methods", sector: "Research", executorOrgId: executor3.id, deadline: new Date("2026-09-01"), currentStageIdx: 4 },
    { name: "Environmental ML — atmosphere and soil monitoring", sector: "Environment", executorOrgId: executor3.id, deadline: new Date("2026-12-01"), currentStageIdx: 2 },
    { name: "Image processing web platform", sector: "Research", executorOrgId: executor2.id, deadline: new Date("2026-03-01"), currentStageIdx: 1 },
    { name: "AI lab setup at TUIT and Inha University", sector: "Education", executorOrgId: executor1.id, deadline: new Date("2025-12-01"), currentStageIdx: 6 },
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

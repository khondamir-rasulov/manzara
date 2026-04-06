/**
 * Static demo dataset — no database required.
 * All data is computed once at module load from the same seed spec as prisma/seed.ts.
 */

// ─── Reference date (when the "seed" was run) ────────────────────────────────
const REF = new Date("2025-10-01T00:00:00Z");

function daysAgo(days: number): Date {
  return new Date(REF.getTime() - days * 86_400_000);
}
function daysFromDate(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 86_400_000);
}

// ─── Orgs ─────────────────────────────────────────────────────────────────────
export const DEMO_ORGS = [
  { id: "org-ai",    name: "Center for AI and Digital Economy Development",                    shortName: "AI Center",          createdAt: REF, updatedAt: REF },
  { id: "org-min",   name: "Ministry of Digital Technologies",                                shortName: "MinRaqam",           createdAt: REF, updatedAt: REF },
  { id: "org-atk",   name: "Axborot texnologiyalari va kommunikatsiyalarini rivojlantirish markazi", shortName: "ATK Markazi",   createdAt: REF, updatedAt: REF },
  { id: "org-raq",   name: "Raqamli transformatsiya agentligi",                               shortName: "Raqamli agentlik",   createdAt: REF, updatedAt: REF },
  { id: "org-inno",  name: "InnoHub Uzbekistan innovatsion markazi",                          shortName: "InnoHub Uz",         createdAt: REF, updatedAt: REF },
];

// ─── Program ──────────────────────────────────────────────────────────────────
export const DEMO_PROGRAM = {
  id: "program-1",
  name: "ПКМ 425 — Sun'iy intellekt bo'yicha ustuvor loyihalar 2025–2026",
  description: "Vazirlar Mahkamasining sun'iy intellekt texnologiyalarini joriy etish bo'yicha ustuvor loyihalar to'g'risidagi qarori",
  orgId: "org-ai",
  createdAt: REF,
  updatedAt: REF,
} as const;

// ─── Stage definitions ────────────────────────────────────────────────────────
const STAGE_DEFS = [
  { id: "stage-1", name: "TZ Development",    order: 1, color: "#6366f1", slaDays: 30 },
  { id: "stage-2", name: "Ministry Approvals",order: 2, color: "#8b5cf6", slaDays: 20 },
  { id: "stage-3", name: "ЦКБ Review",        order: 3, color: "#a855f7", slaDays: 45 },
  { id: "stage-4", name: "НАПП Review",       order: 4, color: "#ec4899", slaDays: 25 },
  { id: "stage-5", name: "Reestr.uz",         order: 5, color: "#f43f5e", slaDays: 15 },
  { id: "stage-6", name: "Procurement",       order: 6, color: "#f97316", slaDays: 60 },
  { id: "stage-7", name: "ЦКЭ Review",        order: 7, color: "#eab308", slaDays: 60 },
];

// ─── Stage fields ─────────────────────────────────────────────────────────────
const STAGE_FIELDS: Record<string, Array<{ id: string; stageId: string; name: string; fieldType: string; isRequired: boolean; order: number; options: string | null }>> = {
  "stage-2": [
    { id: "sf-2-1", stageId: "stage-2", name: "Letter № from MinRaqam", fieldType: "DOCNUMBER", isRequired: true,  order: 1, options: null },
    { id: "sf-2-2", stageId: "stage-2", name: "Letter date",             fieldType: "DATE",      isRequired: true,  order: 2, options: null },
    { id: "sf-2-3", stageId: "stage-2", name: "Re-approval needed?",     fieldType: "CHECKBOX",  isRequired: false, order: 3, options: null },
    { id: "sf-2-4", stageId: "stage-2", name: "Notes",                   fieldType: "TEXT",      isRequired: false, order: 4, options: null },
  ],
  "stage-4": [
    { id: "sf-4-1", stageId: "stage-4", name: "Letter №",      fieldType: "DOCNUMBER", isRequired: true,  order: 1, options: null },
    { id: "sf-4-2", stageId: "stage-4", name: "Review result", fieldType: "DROPDOWN",  isRequired: true,  order: 2, options: JSON.stringify(["Approved", "Returned for rework", "Re-submitted"]) },
    { id: "sf-4-3", stageId: "stage-4", name: "Re-review needed?", fieldType: "CHECKBOX", isRequired: false, order: 3, options: null },
  ],
  "stage-5": [
    { id: "sf-5-1", stageId: "stage-5", name: "Registry ID", fieldType: "TEXT",     isRequired: true, order: 1, options: null },
    { id: "sf-5-2", stageId: "stage-5", name: "Status",      fieldType: "DROPDOWN", isRequired: true, order: 2, options: JSON.stringify(["Under review", "Conclusion received", "Returned for rework"]) },
  ],
  "stage-6": [
    { id: "sf-6-1", stageId: "stage-6", name: "Proposals received", fieldType: "NUMBER",    isRequired: false, order: 1, options: null },
    { id: "sf-6-2", stageId: "stage-6", name: "Lot №",              fieldType: "TEXT",      isRequired: false, order: 2, options: null },
    { id: "sf-6-3", stageId: "stage-6", name: "Executor",           fieldType: "TEXT",      isRequired: false, order: 3, options: null },
    { id: "sf-6-4", stageId: "stage-6", name: "Contract №",         fieldType: "DOCNUMBER", isRequired: false, order: 4, options: null },
    { id: "sf-6-5", stageId: "stage-6", name: "Contract date",      fieldType: "DATE",      isRequired: false, order: 5, options: null },
  ],
};

export const DEMO_STAGES = STAGE_DEFS.map((s) => ({
  ...s,
  programId: DEMO_PROGRAM.id,
  createdAt: REF,
  updatedAt: REF,
  fields: STAGE_FIELDS[s.id] ?? [],
}));

// ─── Program with stages (for getProject) ─────────────────────────────────────
export const DEMO_PROGRAM_FULL = {
  ...DEMO_PROGRAM,
  stages: DEMO_STAGES,
  org: DEMO_ORGS[0],
  _count: { projects: 30 },
};

// ─── Hardcoded users ──────────────────────────────────────────────────────────
// password: demo1234  (bcrypt hash pre-computed)
export const DEMO_USERS = [
  {
    id: "user-admin",
    name: "Admin User",
    email: "admin@manzara.uz",
    // bcrypt hash of "demo1234"
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "ADMIN" as const,
    orgId: "org-ai",
  },
  {
    id: "user-manager",
    name: "Project Manager",
    email: "manager@manzara.uz",
    passwordHash: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    role: "MANAGER" as const,
    orgId: "org-ai",
  },
];

// ─── Project descriptors → full project objects ───────────────────────────────
type ProjDesc = {
  id: string;
  name: string;
  sector: string;
  executorOrgId: string;
  deadline: Date;
  currentStageIdx: number; // 0-based index into STAGE_DEFS
  priority: "URGENT" | "HIGH" | "NORMAL" | "LOW";
};

const PROJECT_DESCS: ProjDesc[] = [
  { id: "p-01",  name: "AI Drug Demand Forecasting System",                              sector: "Healthcare",          executorOrgId: "org-atk",  deadline: new Date("2025-10-01"), currentStageIdx: 1, priority: "URGENT" },
  { id: "p-02",  name: "Clinical Decision Support Assistant (Top-3 Diagnosis)",          sector: "Healthcare",          executorOrgId: "org-atk",  deadline: new Date("2026-12-01"), currentStageIdx: 2, priority: "HIGH"   },
  { id: "p-03",  name: "Voice-to-Text Assistant for Medical Records (SVAR)",             sector: "Healthcare",          executorOrgId: "org-raq",  deadline: new Date("2026-03-01"), currentStageIdx: 3, priority: "HIGH"   },
  { id: "p-04",  name: "CT/X-Ray AI for Lung Pathology Detection",                      sector: "Healthcare",          executorOrgId: "org-atk",  deadline: new Date("2026-10-01"), currentStageIdx: 4, priority: "HIGH"   },
  { id: "p-05",  name: "AI Mammography for Early Breast Cancer Detection",               sector: "Healthcare",          executorOrgId: "org-raq",  deadline: new Date("2026-12-01"), currentStageIdx: 1, priority: "HIGH"   },
  { id: "p-06",  name: "Satellite AI Crop Yield Forecasting (Wheat & Cotton)",           sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-11-01"), currentStageIdx: 2, priority: "NORMAL" },
  { id: "p-07",  name: "Drone AI Land Encroachment Detection System",                   sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-09-01"), currentStageIdx: 5, priority: "NORMAL" },
  { id: "p-08",  name: "Satellite Pasture Condition Monitoring",                         sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-11-01"), currentStageIdx: 6, priority: "LOW"    },
  { id: "p-09",  name: "Aerial AI Power Line Inspection System",                        sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-08-01"), currentStageIdx: 3, priority: "NORMAL" },
  { id: "p-10",  name: "AI Optimal Solar Panel Placement System",                       sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-10-01"), currentStageIdx: 0, priority: "LOW"    },
  { id: "p-11",  name: "UzFace — Railway Station Face Recognition",                     sector: "Security",            executorOrgId: "org-atk",  deadline: new Date("2026-03-01"), currentStageIdx: 4, priority: "HIGH"   },
  { id: "p-12",  name: "Computer Vision Traffic Violation Detection",                   sector: "Security",            executorOrgId: "org-raq",  deadline: new Date("2026-07-01"), currentStageIdx: 2, priority: "HIGH"   },
  { id: "p-13",  name: "Driver Fatigue Detection for Public Transport",                 sector: "Security",            executorOrgId: "org-atk",  deadline: new Date("2026-04-01"), currentStageIdx: 1, priority: "HIGH"   },
  { id: "p-14",  name: "AI Illegal Procurement Activity Detection",                     sector: "Economy",             executorOrgId: "org-raq",  deadline: new Date("2026-11-01"), currentStageIdx: 3, priority: "NORMAL" },
  { id: "p-15",  name: "Automated Bank Account Verification for Budget Orgs",           sector: "Economy",             executorOrgId: "org-raq",  deadline: new Date("2026-12-01"), currentStageIdx: 5, priority: "NORMAL" },
  { id: "p-16",  name: "Banking Sector Fraud Detection System",                         sector: "Economy",             executorOrgId: "org-atk",  deadline: new Date("2026-11-01"), currentStageIdx: 6, priority: "HIGH"   },
  { id: "p-17",  name: "AIStudy.uz — 1M Users AI Platform",                             sector: "Education",           executorOrgId: "org-atk",  deadline: new Date("2025-10-01"), currentStageIdx: 2, priority: "URGENT" },
  { id: "p-18",  name: "Legal NLP — Normative Document Classification (Uzbek)",         sector: "Research",            executorOrgId: "org-inno", deadline: new Date("2026-10-01"), currentStageIdx: 0, priority: "LOW"    },
  { id: "p-19",  name: "AI Assistant for Interdepartmental Document Management",        sector: "E-Government",        executorOrgId: "org-raq",  deadline: new Date("2026-11-01"), currentStageIdx: 4, priority: "NORMAL" },
  { id: "p-20",  name: "OCR for Uzbek-Language Incoming Documents",                    sector: "E-Government",        executorOrgId: "org-raq",  deadline: new Date("2026-03-01"), currentStageIdx: 3, priority: "NORMAL" },
  { id: "p-21",  name: "Citizen Media Sentiment Monitoring Platform",                   sector: "Media",               executorOrgId: "org-atk",  deadline: new Date("2026-08-01"), currentStageIdx: 1, priority: "NORMAL" },
  { id: "p-22",  name: "AI Satellite Image Resolution Enhancement",                     sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-03-01"), currentStageIdx: 2, priority: "NORMAL" },
  { id: "p-23",  name: "Uzbek Language Corpus for National LLM",                        sector: "Research",            executorOrgId: "org-raq",  deadline: new Date("2026-11-01"), currentStageIdx: 0, priority: "LOW"    },
  { id: "p-24",  name: "Sign Language Translation Mobile App",                          sector: "Social",              executorOrgId: "org-atk",  deadline: new Date("2026-11-01"), currentStageIdx: 1, priority: "NORMAL" },
  { id: "p-25",  name: "Aerial AI Road Surface Condition Monitoring",                   sector: "Aerospace monitoring",executorOrgId: "org-inno", deadline: new Date("2026-06-01"), currentStageIdx: 3, priority: "NORMAL" },
  { id: "p-26",  name: "AI Weather Forecasting with Historical Models",                 sector: "Environment",         executorOrgId: "org-raq",  deadline: new Date("2025-09-01"), currentStageIdx: 5, priority: "URGENT" },
  { id: "p-27",  name: "Statistical Quality Control Using ML",                          sector: "Research",            executorOrgId: "org-inno", deadline: new Date("2026-09-01"), currentStageIdx: 4, priority: "LOW"    },
  { id: "p-28",  name: "Environmental ML — Atmosphere & Soil Monitoring",               sector: "Environment",         executorOrgId: "org-inno", deadline: new Date("2026-12-01"), currentStageIdx: 2, priority: "LOW"    },
  { id: "p-29",  name: "Image Processing Web Platform",                                 sector: "Research",            executorOrgId: "org-raq",  deadline: new Date("2026-03-01"), currentStageIdx: 1, priority: "LOW"    },
  { id: "p-30",  name: "AI Lab Setup at TUIT and Inha University",                     sector: "Education",           executorOrgId: "org-atk",  deadline: new Date("2025-12-01"), currentStageIdx: 6, priority: "URGENT" },
];

function buildProject(pd: ProjDesc) {
  const executorOrg = DEMO_ORGS.find((o) => o.id === pd.executorOrgId) ?? null;
  const currentStage = STAGE_DEFS[pd.currentStageIdx];

  // Build ProjectStage entries for all stages up to currentStageIdx
  const stages = STAGE_DEFS.slice(0, pd.currentStageIdx + 1).map((stageDef, i) => {
    const isCompleted = i < pd.currentStageIdx;
    // Deterministic "random" based on project id + stage index
    const seed = (parseInt(pd.id.replace("p-", ""), 10) * 7 + i * 3) % 10;
    const daysOffset = isCompleted
      ? (pd.currentStageIdx - i) * 18 + seed
      : seed * 2;

    const enteredAt = daysAgo(daysOffset);
    const completedAt = isCompleted ? daysFromDate(enteredAt, 14) : null;

    return {
      id: `ps-${pd.id}-${stageDef.id}`,
      projectId: pd.id,
      stageId: stageDef.id,
      status: (isCompleted ? "COMPLETED" : "IN_PROGRESS") as "COMPLETED" | "IN_PROGRESS",
      enteredAt,
      completedAt,
      notes: null as string | null,
      stage: {
        id: stageDef.id,
        name: stageDef.name,
        order: stageDef.order,
        color: stageDef.color,
        slaDays: stageDef.slaDays,
        programId: DEMO_PROGRAM.id,
      },
      fieldValues: [] as Array<{
        id: string;
        projectStageId: string;
        fieldId: string;
        value: string | null;
        notes: string | null;
        field: {
          id: string;
          stageId: string;
          name: string;
          fieldType: string;
          isRequired: boolean;
          order: number;
          options: string | null;
        };
      }>,
    };
  });

  return {
    id: pd.id,
    name: pd.name,
    description: null as string | null,
    sector: pd.sector,
    deadline: pd.deadline,
    status: "ACTIVE" as "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED",
    priority: pd.priority as "URGENT" | "HIGH" | "NORMAL" | "LOW",
    legalBasis: "ПКМ 425, 10.07.2025" as string | null,
    programId: DEMO_PROGRAM.id,
    executorOrgId: pd.executorOrgId,
    currentStageId: currentStage.id,
    createdAt: daysAgo(pd.currentStageIdx * 20 + 10),
    updatedAt: REF,
    program: DEMO_PROGRAM,
    executorOrg,
    stages,
  };
}

export const DEMO_PROJECTS = PROJECT_DESCS.map(buildProject);

// Pre-computed completed stage rows (for SLA compliance)
export const DEMO_COMPLETED_STAGES = DEMO_PROJECTS.flatMap((p) =>
  p.stages
    .filter((ps) => ps.status === "COMPLETED" && ps.completedAt !== null)
    .map((ps) => ({
      enteredAt: ps.enteredAt,
      completedAt: ps.completedAt as Date,
      stage: { name: ps.stage.name, slaDays: ps.stage.slaDays },
    }))
);

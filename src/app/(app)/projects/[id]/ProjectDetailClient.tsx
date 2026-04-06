"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  FileText,
  Layers,
  MapPin,
  MessageSquare,
  Pencil,
  Send,
} from "lucide-react";
import {
  cn,
  daysInStage,
  formatDate,
  relativeDate,
  priorityBadgeClass,
  stageBadgeClass,
  statusColor,
  trafficLightClass,
} from "@/lib/utils";
import { useLanguage, td } from "@/lib/i18n";
import type { getProject, getComments, OrgOption } from "@/lib/data";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";

type Project = NonNullable<Awaited<ReturnType<typeof getProject>>>;
type Comments = Awaited<ReturnType<typeof getComments>>;

function deadlineClass(deadline: Date | null | undefined): string {
  if (!deadline) return "text-slate-500";
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return "text-red-600 font-semibold";
  if (days <= 30) return "text-amber-600 font-semibold";
  return "text-emerald-600";
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function FieldValueDisplay({ fieldType, value }: { fieldType: string; value: string | null | undefined }) {
  const { t } = useLanguage();
  if (!value) return <span className="text-slate-400 italic text-sm">{t.project.notFilled}</span>;
  if (fieldType === "DATE") return <span className="text-sm text-slate-700">{formatDate(value)}</span>;
  if (fieldType === "CHECKBOX") {
    return (
      <span className={cn("text-sm font-medium", value === "true" ? "text-emerald-600" : "text-slate-500")}>
        {value === "true" ? "✓" : "✗"}
      </span>
    );
  }
  return <span className="text-sm text-slate-700 break-words">{value}</span>;
}

function StageAccordionItem({ projectStage, index }: { projectStage: Project["stages"][number]; index: number }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const days = projectStage.completedAt && projectStage.enteredAt
    ? Math.ceil((new Date(projectStage.completedAt).getTime() - new Date(projectStage.enteredAt).getTime()) / 86400000)
    : 0;
  const filledValues = projectStage.fieldValues.filter((fv) => fv.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="border border-slate-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-slate-50 text-left cursor-pointer"
      >
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: projectStage.stage.color }} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-slate-800">{td(t.data.stages, projectStage.stage.name)}</span>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400">
              {formatDate(projectStage.enteredAt)} → {formatDate(projectStage.completedAt)}
            </span>
            {days > 0 && (
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", stageBadgeClass(days, projectStage.stage.slaDays))}>
                {days}{t.project.days}
              </span>
            )}
          </div>
        </div>
        {filledValues.length > 0 && (
          <span className="text-xs text-slate-400 flex-shrink-0">{filledValues.length} {t.project.fields}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
              {projectStage.notes && <p className="text-sm text-slate-600 mb-3 italic">{projectStage.notes}</p>}
              {filledValues.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {projectStage.fieldValues.map((fv) => (
                    <div key={fv.id} className="space-y-0.5">
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{fv.field.name}</div>
                      <FieldValueDisplay fieldType={fv.field.fieldType} value={fv.value} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">{t.project.noFields}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface Props {
  project: Project;
  initialComments: Comments;
  orgs: OrgOption[];
  defaultProgramId: string;
  userId: string;
  userRole: string;
  userName: string;
}

export function ProjectDetailClient({ project, initialComments, orgs, defaultProgramId, userId, userRole, userName }: Props) {
  const { t } = useLanguage();
  const router = useRouter();

  const allProgramStages = project.program.stages;
  const currentStage = project.stages.find((ps) => ps.stageId === project.currentStageId);
  const completedStages = project.stages.filter((ps) => ps.status === "COMPLETED");
  const inProgressStage = project.stages.find((ps) => ps.status === "IN_PROGRESS");

  const days = daysInStage(currentStage?.enteredAt);
  const slaDays = currentStage?.stage.slaDays ?? 30;
  const slaPct = Math.min((days / slaDays) * 100, 100);
  const deadlineColorClass = deadlineClass(project.deadline);

  // State
  const [showEditModal, setShowEditModal] = useState(false);
  const [advanceConfirm, setAdvanceConfirm] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [comments, setComments] = useState<Comments>(initialComments);
  const [commentBody, setCommentBody] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const canEdit = userRole !== "VIEWER";

  async function handleAdvance() {
    setAdvancing(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/advance`, { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } finally {
      setAdvancing(false);
      setAdvanceConfirm(false);
    }
  }

  async function handleComment() {
    const body = commentBody.trim();
    if (!body) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed");
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentBody("");
    } finally {
      setCommentLoading(false);
    }
  }

  const containerVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const itemVariants: Variants = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  return (
    <>
      {showEditModal && (
        <ProjectFormModal
          mode="edit"
          project={project}
          programId={defaultProgramId}
          orgs={orgs}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      <div className="p-6">
        {/* Back + Edit */}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between mb-5"
        >
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
            {t.project.backToProjects}
          </Link>
          {canEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              {t.project.editProject}
            </button>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-3 gap-5 items-start">

          {/* ── LEFT: main content (2/3) ── */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="col-span-2 space-y-5">

          {/* Header card — title + badges only */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl font-semibold text-slate-900 leading-tight">{td(t.data.projectNames, project.name)}</h1>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", statusColor(project.status))}>
                    {td(t.data.statusLabels, project.status)}
                  </span>
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full border", priorityBadgeClass(project.priority))}>
                    {td(t.data.priorityLabels, project.priority)}
                  </span>
                </div>
                {project.legalBasis && (
                  <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                    {project.legalBasis}
                  </p>
                )}
                {project.description && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{project.description}</p>
                )}
              </div>
            </div>

          </motion.div>

          {/* Advance Stage */}
          {canEdit && project.status === "ACTIVE" && inProgressStage && (
            <motion.div variants={itemVariants}>
              <AnimatePresence mode="wait">
                {!advanceConfirm ? (
                  <motion.button
                    key="btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setAdvanceConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-sm font-medium text-indigo-700 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    {t.project.advanceStage}
                  </motion.button>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-amber-900">{t.project.advanceConfirmTitle}</p>
                      <p className="text-xs text-amber-700 mt-0.5">{t.project.advanceConfirmBody}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setAdvanceConfirm(false)}
                        className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                      >
                        {t.project.cancel}
                      </button>
                      <button
                        onClick={handleAdvance}
                        disabled={advancing}
                        className="px-4 py-1.5 text-sm font-medium bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {advancing ? "…" : t.project.advanceConfirmTitle}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Stage Timeline */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-700 mb-5 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              {t.project.stageTimeline}
            </h2>
            <div className="overflow-x-auto pb-2">
              <div className="flex items-start gap-0 min-w-max">
                {allProgramStages.map((programStage, idx) => {
                  const projectStage = project.stages.find((ps) => ps.stageId === programStage.id);
                  const stageStatus = projectStage?.status ?? "NOT_STARTED";
                  const isCompleted = stageStatus === "COMPLETED";
                  const isInProgress = stageStatus === "IN_PROGRESS";
                  const stageDays = daysInStage(projectStage?.enteredAt);

                  return (
                    <div key={programStage.id} className="flex items-start">
                      <div className="flex flex-col items-center w-28">
                        <div className="relative flex items-center justify-center mb-2">
                          {isInProgress && (
                            <span className="absolute inline-flex h-8 w-8 rounded-full opacity-30 animate-ping" style={{ background: programStage.color }} />
                          )}
                          <div
                            className={cn("rounded-full flex items-center justify-center z-10", isCompleted ? "w-6 h-6" : isInProgress ? "w-8 h-8" : "w-5 h-5")}
                            style={{ background: isCompleted || isInProgress ? programStage.color : "#e2e8f0", border: isInProgress ? `3px solid ${programStage.color}` : "none" }}
                          >
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-white" />}
                            {isInProgress && <Circle className="w-3 h-3 text-white fill-white" />}
                          </div>
                        </div>
                        <span className={cn("text-xs text-center leading-tight px-1", isCompleted ? "text-slate-700 font-medium" : isInProgress ? "text-slate-900 font-semibold" : "text-slate-400")}>
                          {td(t.data.stages, programStage.name)}
                        </span>
                        <div className="mt-1.5 text-center">
                          {isCompleted && <span className="text-[10px] text-emerald-600 font-medium">{formatDate(projectStage?.completedAt)}</span>}
                          {isInProgress && (
                            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", stageBadgeClass(stageDays, programStage.slaDays))}>
                              {stageDays}{t.project.days} / {programStage.slaDays}{t.project.days}
                            </span>
                          )}
                          {stageStatus === "NOT_STARTED" && <span className="text-[10px] text-slate-400">{t.project.notStarted}</span>}
                        </div>
                        {(isCompleted || isInProgress) && projectStage?.enteredAt && (
                          <div className="mt-1 text-[10px] text-slate-400 text-center leading-tight px-1">
                            {formatDate(projectStage.enteredAt)}
                            {isInProgress ? " →" : ` → ${formatDate(projectStage.completedAt)}`}
                          </div>
                        )}
                      </div>
                      {idx < allProgramStages.length - 1 && (
                        <div className="flex-shrink-0 mt-3">
                          <div className="h-0.5 w-6" style={{ background: isCompleted ? programStage.color : "#e2e8f0" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Current Stage Card */}
          {project.status === "ACTIVE" && inProgressStage && (
            <motion.div variants={itemVariants}>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ borderLeft: `4px solid ${inProgressStage.stage.color}` }}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.project.currentStage}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900">{td(t.data.stages, inProgressStage.stage.name)}</h3>
                      {inProgressStage.enteredAt && (
                        <p className="text-sm text-slate-500 mt-0.5">{t.project.enteredOn}: {formatDate(inProgressStage.enteredAt)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-slate-900">{days}</div>
                      <div className="text-xs text-slate-500">{t.project.daysElapsed}</div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">{t.project.slaProgress}</span>
                      <span className={cn("font-semibold", days > slaDays ? "text-red-600" : days / slaDays > 0.5 ? "text-amber-600" : "text-emerald-600")}>
                        {days} {t.project.slaOf} {slaDays}{t.project.days} {days > slaDays && `(+${days - slaDays} ${t.project.overdueSuffix})`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${slaPct}%` }}
                        transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                        className={cn("h-full rounded-full", trafficLightClass(days, slaDays))}
                      />
                    </div>
                  </div>
                  {inProgressStage.fieldValues.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{t.project.stageFields}</p>
                      <div className="grid grid-cols-2 gap-4">
                        {inProgressStage.fieldValues.map((fv) => (
                          <div key={fv.id} className="space-y-0.5">
                            <div className="text-xs font-medium text-slate-400">{fv.field.name}</div>
                            <FieldValueDisplay fieldType={fv.field.fieldType} value={fv.value} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {inProgressStage.fieldValues.length === 0 && (() => {
                    const def = project.program.stages.find((s) => s.id === inProgressStage.stageId);
                    return def && def.fields.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 italic">{def.fields.length} {t.project.fields} {t.project.fieldsNotFilled}</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Stage History */}
          {completedStages.length > 0 && (
            <motion.div variants={itemVariants}>
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                {t.project.stageHistory}
                <span className="text-xs font-normal text-slate-400">({completedStages.length} {t.project.completed})</span>
              </h2>
              <div className="space-y-2">
                {completedStages.map((ps, idx) => (
                  <StageAccordionItem key={ps.id} projectStage={ps} index={idx} />
                ))}
              </div>
            </motion.div>
          )}

          </motion.div>{/* end left col */}

          {/* ── RIGHT: metadata sidebar (1/3) ── */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="col-span-1 space-y-4"
          >
            {/* Project metadata card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              {/* Program */}
              <div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t.settings.pipeline.projects}</div>
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 leading-snug">{project.program.name}</span>
                </div>
              </div>

              {/* Executor */}
              {project.executorOrg && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t.projects.executor}</div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{project.executorOrg.name}</span>
                  </div>
                </div>
              )}

              {/* Sector */}
              {project.sector && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t.projects.sector}</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{td(t.data.sectors, project.sector)}</span>
                  </div>
                </div>
              )}

              {/* Deadline */}
              {project.deadline && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t.project.deadline}</div>
                  <div className={cn("flex items-center gap-2", deadlineColorClass)}>
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{formatDate(project.deadline)}</span>
                  </div>
                </div>
              )}

              {/* Legal basis */}
              {project.legalBasis && (
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{t.project.legalBasis}</div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{project.legalBasis}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Current stage quick stats (if active) */}
            {project.status === "ACTIVE" && inProgressStage && (
              <div className="bg-white rounded-xl border border-slate-200 p-4" style={{ borderLeft: `4px solid ${inProgressStage.stage.color}` }}>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{t.project.currentStage}</div>
                <div className="text-sm font-medium text-slate-800 mb-3 leading-snug">{td(t.data.stages, inProgressStage.stage.name)}</div>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-2xl font-bold text-slate-900">{days}</span>
                  <span className="text-xs text-slate-500">/ {slaDays} {t.project.days}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", trafficLightClass(days, slaDays))}
                    style={{ width: `${slaPct}%` }}
                  />
                </div>
                {days > slaDays && (
                  <p className="text-[10px] text-red-600 font-medium mt-1.5">+{days - slaDays} {t.project.overdueSuffix}</p>
                )}
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                {t.project.comments}
                {comments.length > 0 && (
                  <span className="text-xs font-normal bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{comments.length}</span>
                )}
              </h2>

              {/* Comment list */}
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 italic mb-3">{t.project.noComments}</p>
              ) : (
                <div className="space-y-3 mb-3 max-h-72 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-semibold text-indigo-700 flex-shrink-0">
                        {initials(c.author.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-medium text-slate-800">{c.author.name ?? c.author.email}</span>
                          <span className="text-[10px] text-slate-400">{relativeDate(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{c.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment form */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-semibold text-indigo-700 flex-shrink-0">
                  {initials(userName)}
                </div>
                <div className="flex-1 flex gap-1.5">
                  <textarea
                    rows={2}
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleComment(); }}
                    placeholder={t.project.commentPlaceholder}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-slate-700"
                  />
                  <button
                    onClick={handleComment}
                    disabled={commentLoading || !commentBody.trim()}
                    className={cn(
                      "self-end p-2 rounded-lg transition-all cursor-pointer",
                      commentLoading || !commentBody.trim()
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                    aria-label={t.project.send}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>{/* end grid */}
      </div>
    </>
  );
}

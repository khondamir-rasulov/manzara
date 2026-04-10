"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, RotateCcw, GripVertical } from "lucide-react";
import { useLanguage, td } from "@/lib/i18n";
import { cn, priorityBadgeClass } from "@/lib/utils";
import type { DragEvent } from "react";

const DEFAULT_STAGES = [
  "TZ Development",
  "Ministry Approvals",
  "ЦКБ Review",
  "НАПП Review",
  "Reestr.uz",
  "Procurement",
  "ЦКЭ Review",
];

const PRIORITIES = ["URGENT", "HIGH", "NORMAL", "LOW"] as const;

interface ProjectFormModalProps {
  mode: "create" | "edit";
  project?: {
    id: string;
    name: string;
    description: string | null;
    sector: string | null;
    executorOrgId: string | null;
    deadline: Date | null;
    priority: string;
    legalBasis: string | null;
    programId: string;
  };
  programId: string;
  orgs?: unknown[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProjectFormModal({ mode, project, programId, onClose, onSuccess }: ProjectFormModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const stageInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    sector: project?.sector ?? "",
    executorOrg: project?.executorOrgId ?? "",
    deadline: project?.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
    priority: (project?.priority ?? "NORMAL") as typeof PRIORITIES[number],
    legalBasis: project?.legalBasis ?? "",
    stages: [...DEFAULT_STAGES],
  });

  const [stageInput, setStageInput] = useState("");
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);

  function onDragStart(i: number) {
    dragIdx.current = i;
  }
  function onDragOver(e: DragEvent, i: number) {
    e.preventDefault();
    setDragOverIdx(i);
  }
  function onDrop(e: DragEvent, i: number) {
    e.preventDefault();
    const from = dragIdx.current;
    if (from === null || from === i) { setDragOverIdx(null); return; }
    setForm((f) => {
      const next = [...f.stages];
      const [moved] = next.splice(from, 1);
      next.splice(i, 0, moved);
      return { ...f, stages: next };
    });
    dragIdx.current = null;
    setDragOverIdx(null);
  }
  function onDragEnd() {
    dragIdx.current = null;
    setDragOverIdx(null);
  }

  useEffect(() => { nameRef.current?.focus(); }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function addStage() {
    const name = stageInput.trim();
    if (!name) return;
    setForm((f) => ({ ...f, stages: [...f.stages, name] }));
    setStageInput("");
    stageInputRef.current?.focus();
  }

  function removeStage(i: number) {
    setForm((f) => ({ ...f, stages: f.stages.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        sector: form.sector || null,
        executorOrgId: form.executorOrg || null,
        deadline: form.deadline || null,
        priority: form.priority,
        legalBasis: form.legalBasis || null,
        stages: form.stages,
        programId,
      };

      const url = mode === "create" ? "/api/projects" : `/api/projects/${project!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {mode === "create" ? t.projects.newProject : t.project.editProject}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t.projects.name} *
              </label>
              <input
                ref={nameRef}
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                placeholder={t.projects.name}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t.project.description}
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t.project.descriptionPlaceholder}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                {t.project.priority}
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={cn(
                      "flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer",
                      form.priority === p
                        ? priorityBadgeClass(p)
                        : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    {td(t.data.priorityLabels, p)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sector + Executor — both free-text */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t.projects.sector}
                </label>
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  placeholder={t.project.sectorPlaceholder}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t.projects.executor}
                </label>
                <input
                  type="text"
                  value={form.executorOrg}
                  onChange={(e) => setForm({ ...form, executorOrg: e.target.value })}
                  placeholder={t.project.executorPlaceholder}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
              </div>
            </div>

            {/* Deadline + Legal Basis */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t.project.deadline}
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t.project.legalBasis}
                </label>
                <input
                  type="text"
                  value={form.legalBasis}
                  onChange={(e) => setForm({ ...form, legalBasis: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>
            </div>

            {/* Pipeline Stages */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {t.project.stagesSection}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{t.project.stagesHint}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, stages: [...DEFAULT_STAGES] }))}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.project.stageResetDefault}
                </button>
              </div>

              {/* Stage chips */}
              <div className="border border-slate-200 rounded-lg p-2 space-y-1 min-h-[44px] bg-slate-50">
                {form.stages.length === 0 ? (
                  <p className="text-xs text-slate-400 px-1 py-1">{t.project.stagePlaceholder}</p>
                ) : (
                  form.stages.map((stage, i) => (
                    <div
                      key={i}
                      draggable
                      onDragStart={() => onDragStart(i)}
                      onDragOver={(e) => onDragOver(e, i)}
                      onDrop={(e) => onDrop(e, i)}
                      onDragEnd={onDragEnd}
                      className={cn(
                        "flex items-center gap-2 bg-white border rounded-md px-2 py-1.5 group cursor-grab active:cursor-grabbing transition-colors",
                        dragOverIdx === i ? "border-indigo-400 bg-indigo-50" : "border-slate-200"
                      )}
                    >
                      <GripVertical className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      <span className="text-xs text-slate-400 w-4 flex-shrink-0">{i + 1}</span>
                      <span className="flex-1 text-sm text-slate-700">{td(t.data.stages, stage)}</span>
                      <button
                        type="button"
                        onClick={() => removeStage(i)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add stage input */}
              <div className="flex gap-2 mt-2">
                <input
                  ref={stageInputRef}
                  type="text"
                  value={stageInput}
                  onChange={(e) => setStageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStage(); } }}
                  placeholder={t.project.stagePlaceholder}
                  className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={addStage}
                  disabled={!stageInput.trim()}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all cursor-pointer",
                    stageInput.trim()
                      ? "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700"
                      : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.project.stageAdd}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {t.project.cancel}
              </button>
              <button
                type="submit"
                disabled={loading || !form.name.trim()}
                className={cn(
                  "px-5 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer",
                  loading || !form.name.trim()
                    ? "bg-indigo-300 text-white cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                )}
              >
                {loading
                  ? (mode === "create" ? t.project.creating : t.project.saving)
                  : (mode === "create" ? t.projects.newProject : t.project.save)}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

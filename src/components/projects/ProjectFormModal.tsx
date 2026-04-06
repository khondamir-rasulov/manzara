"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useLanguage, td } from "@/lib/i18n";
import { cn, priorityBadgeClass } from "@/lib/utils";
import type { OrgOption } from "@/lib/data";

const SECTORS = [
  "Aerospace monitoring", "Healthcare", "Research", "Economy", "Security",
  "Environment", "Education", "Media", "Social", "E-Government", "Other",
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
  orgs: OrgOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ProjectFormModal({ mode, project, programId, orgs, onClose, onSuccess }: ProjectFormModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    sector: project?.sector ?? "",
    executorOrgId: project?.executorOrgId ?? "",
    deadline: project?.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : "",
    priority: (project?.priority ?? "NORMAL") as typeof PRIORITIES[number],
    legalBasis: project?.legalBasis ?? "ПКМ 425, 10.07.2025",
  });

  // Focus name on open
  useEffect(() => { nameRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

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
        executorOrgId: form.executorOrgId || null,
        deadline: form.deadline || null,
        priority: form.priority,
        legalBasis: form.legalBasis || null,
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
                rows={3}
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

            {/* Sector + Executor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t.projects.sector}
                </label>
                <select
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                >
                  <option value="">{t.project.selectSector}</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s}>{td(t.data.sectors, s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  {t.projects.executor}
                </label>
                <select
                  value={form.executorOrgId}
                  onChange={(e) => setForm({ ...form, executorOrgId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                >
                  <option value="">{t.project.selectExecutor}</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>{o.shortName ?? o.name}</option>
                  ))}
                </select>
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

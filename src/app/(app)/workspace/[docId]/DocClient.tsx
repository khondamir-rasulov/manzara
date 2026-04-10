"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check, Save, Trash2, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { WorkspaceDoc } from "@/lib/workspace-data";

interface Props {
  doc: WorkspaceDoc;
  userRole: string;
}

export function DocClient({ doc, userRole }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const canEdit = userRole !== "VIEWER";

  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async (newContent: string, newTitle: string) => {
    setSaveState("saving");
    try {
      await fetch(`/api/workspace/docs/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newContent, title: newTitle }),
      });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("idle");
    }
  }, [doc.id]);

  function handleContentChange(val: string) {
    setContent(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(val, title), 1500);
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(content, val), 1500);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspace/docs/${doc.id}`, { method: "DELETE" });
      if (res.ok) router.push("/workspace");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4">
        <Link
          href="/workspace"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 group flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
          {t.workspace.backToWorkspace}
        </Link>

        <div className="flex items-center gap-3">
          {/* Save state indicator */}
          <AnimatePresence mode="wait">
            {saveState === "saving" && (
              <motion.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-slate-400"
              >
                {t.workspace.saving}
              </motion.span>
            )}
            {saveState === "saved" && (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-xs text-emerald-600 font-medium"
              >
                <Check className="w-3.5 h-3.5" />
                {t.workspace.saved}
              </motion.span>
            )}
          </AnimatePresence>

          {canEdit && saveState === "idle" && (
            <button
              onClick={() => save(content, title)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {t.workspace.save}
            </button>
          )}

          {canEdit && userRole === "ADMIN" && (
            !deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t.workspace.deleteDoc}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Haqiqatan ham oʻchirilsinmi?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {deleting ? "…" : t.workspace.confirmDelete}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Document body */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-8 py-8">
        {/* Title */}
        {canEdit ? (
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-3xl font-bold text-slate-900 mb-6 focus:outline-none placeholder:text-slate-300 bg-transparent"
            placeholder={t.workspace.untitled}
          />
        ) : (
          <h1 className="text-3xl font-bold text-slate-900 mb-6">{title}</h1>
        )}

        {/* Content */}
        {canEdit ? (
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full min-h-[60vh] text-sm text-slate-700 leading-relaxed focus:outline-none resize-none bg-transparent font-mono"
            placeholder="Yozishni boshlang…"
          />
        ) : (
          <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">{content}</pre>
        )}
      </div>
    </div>
  );
}

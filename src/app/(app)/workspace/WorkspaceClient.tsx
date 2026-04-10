"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  BookOpen,
  FileText,
  FolderOpen,
  Plus,
  Scale,
  Users,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import type { WorkspaceFolder, WorkspaceDoc } from "@/lib/workspace-data";

const FOLDER_ICONS: Record<string, React.FC<{ className?: string; style?: React.CSSProperties }>> = {
  templates: FileText,
  normatives: BookOpen,
  legal: Scale,
  contacts: Users,
};

interface Props {
  folders: WorkspaceFolder[];
  docs: WorkspaceDoc[];
  userRole: string;
}

export function WorkspaceClient({ folders, docs, userRole }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFolderId, setNewFolderId] = useState("");

  const canEdit = userRole !== "VIEWER";

  const visibleDocs = activeFolder
    ? docs.filter((d) => d.folderId === activeFolder)
    : docs;

  function getFolderLabel(key: string): string {
    return (t.workspace.folders as Record<string, string>)[key] ?? key;
  }

  async function handleCreate() {
    const title = newTitle.trim() || t.workspace.untitled;
    const folderId = newFolderId || folders[0].id;
    const res = await fetch("/api/workspace/docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folderId, title }),
    });
    if (res.ok) {
      const doc = await res.json();
      router.push(`/workspace/${doc.id}`);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.workspace.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.workspace.subtitle}</p>
        </div>
        {canEdit && !creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.workspace.newDoc}
          </button>
        )}
      </motion.div>

      {/* New doc form */}
      {creating && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        >
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
            placeholder={t.workspace.untitled}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
          <select
            value={newFolderId}
            onChange={(e) => setNewFolderId(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white cursor-pointer"
          >
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{getFolderLabel(f.key)}</option>
            ))}
          </select>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleCreate}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
            >
              {t.workspace.save}
            </button>
            <button
              onClick={() => { setCreating(false); setNewTitle(""); }}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {t.workspace.cancel}
            </button>
          </div>
        </motion.div>
      )}

      {/* Folder tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveFolder(null)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeFolder === null
              ? "bg-indigo-100 text-indigo-700"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <FolderOpen className="w-4 h-4" />
          Barchasi
        </button>
        {folders.map((folder) => {
          const Icon = FOLDER_ICONS[folder.key] ?? FileText;
          const count = docs.filter((d) => d.folderId === folder.id).length;
          return (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(activeFolder === folder.id ? null : folder.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeFolder === folder.id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
              style={activeFolder === folder.id ? { background: folder.color } : {}}
            >
              <Icon className="w-4 h-4" />
              {getFolderLabel(folder.key)}
              {count > 0 && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeFolder === folder.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Folder sections */}
      {activeFolder ? (
        <DocGrid
          docs={visibleDocs}
          onOpen={(id) => router.push(`/workspace/${id}`)}
          noDocsLabel={t.workspace.noDocuments}
        />
      ) : (
        <div className="space-y-8">
          {folders.map((folder) => {
            const folderDocs = docs.filter((d) => d.folderId === folder.id);
            if (folderDocs.length === 0) return null;
            const Icon = FOLDER_ICONS[folder.key] ?? FileText;
            return (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: folder.color + "20" }}>
                    <Icon className="w-4 h-4" style={{ color: folder.color }} />
                  </div>
                  <h2 className="text-sm font-semibold text-slate-700">{getFolderLabel(folder.key)}</h2>
                  <span className="text-xs text-slate-400">{folderDocs.length} {t.workspace.docs}</span>
                </div>
                <DocGrid
                  docs={folderDocs}
                  onOpen={(id) => router.push(`/workspace/${id}`)}
                  noDocsLabel={t.workspace.noDocuments}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DocGrid({
  docs,
  onOpen,
  noDocsLabel,
}: {
  docs: WorkspaceDoc[];
  onOpen: (id: string) => void;
  noDocsLabel: string;
}) {
  if (docs.length === 0) {
    return <p className="text-sm text-slate-400 italic py-4">{noDocsLabel}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {docs.map((doc) => (
        <button
          key={doc.id}
          onClick={() => onOpen(doc.id)}
          className="group text-left bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-md rounded-xl p-4 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
            <FileText className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug mb-2">{doc.title}</p>
          <p className="text-[10px] text-slate-400">
            {new Date(doc.updatedAt).toLocaleDateString()}
          </p>
        </button>
      ))}
    </div>
  );
}

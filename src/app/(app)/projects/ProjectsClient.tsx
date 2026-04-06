"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { Search } from "lucide-react";
import { daysInStage, stageBadgeClass, formatDate, statusColor, priorityBadgeClass, cn } from "@/lib/utils";
import { useLanguage, td } from "@/lib/i18n";
import type { ProjectWithStages, OrgOption } from "@/lib/data";
import { ProjectFormModal } from "@/components/projects/ProjectFormModal";

const STATUS_OPTIONS = ["ALL", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"];
const PRIORITY_OPTIONS = ["ALL", "URGENT", "HIGH", "NORMAL", "LOW"];

const rowVars: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.025 } } };
const rowItemVars: Variants = { hidden: { opacity: 0 }, show: { opacity: 1 } };

interface Props {
  projects: ProjectWithStages[];
  orgs: OrgOption[];
  defaultProgramId: string;
  userRole: string;
}

export function ProjectsClient({ projects, orgs, defaultProgramId, userRole }: Props) {
  const { t } = useLanguage();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

  const sectors = useMemo(() => {
    const s = new Set(projects.map((p) => p.sector ?? "Other"));
    return ["ALL", ...Array.from(s).sort()];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const translatedName = td(t.data.projectNames, p.name);
      const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || translatedName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchSector = sectorFilter === "ALL" || (p.sector ?? "Other") === sectorFilter;
      const matchPriority = priorityFilter === "ALL" || p.priority === priorityFilter;
      return matchSearch && matchStatus && matchSector && matchPriority;
    });
  }, [projects, search, statusFilter, sectorFilter, priorityFilter, t]);

  return (
    <>
      {showModal && (
        <ProjectFormModal
          mode="create"
          programId={defaultProgramId}
          orgs={orgs}
          onClose={() => setShowModal(false)}
          onSuccess={() => router.refresh()}
        />
      )}

      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{t.projects.title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{filtered.length} / {projects.length}</p>
          </div>
          {userRole !== "VIEWER" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
            >
              + {t.projects.newProject}
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.projects.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                  statusFilter === s ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {s === "ALL" ? t.projects.allStatus : td(t.data.statusLabels, s)}
              </button>
            ))}
          </div>

          {/* Sector dropdown */}
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 cursor-pointer"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>{s === "ALL" ? t.projects.allSectors : td(t.data.sectors, s)}</option>
            ))}
          </select>

          {/* Priority filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {PRIORITY_OPTIONS.map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                  priorityFilter === p
                    ? p === "ALL" ? "bg-indigo-600 text-white" : cn(priorityBadgeClass(p))
                    : "text-slate-500 hover:bg-slate-100"
                )}
              >
                {p === "ALL" ? t.projects.allPriorities : td(t.data.priorityLabels, p)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.name}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.priority}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.sector}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.stage}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.daysVsNorm}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.executor}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.status}</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.projects.deadline}</th>
              </tr>
            </thead>
            <motion.tbody variants={rowVars} initial="hidden" animate="show">
              {filtered.map((p) => {
                const currentStage = p.stages.find((ps) => ps.stageId === p.currentStageId);
                const days = daysInStage(currentStage?.enteredAt);
                const slaDays = currentStage?.stage.slaDays ?? 30;

                return (
                  <motion.tr key={p.id} variants={rowItemVars} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <a
                        href={`/projects/${p.id}`}
                        className="font-medium text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 max-w-xs block"
                      >
                        {td(t.data.projectNames, p.name)}
                      </a>
                      {p.legalBasis && (
                        <div className="text-xs text-slate-400 mt-0.5">{p.legalBasis}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", priorityBadgeClass(p.priority))}>
                        {td(t.data.priorityLabels, p.priority)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.sector ? td(t.data.sectors, p.sector) : "—"}</td>
                    <td className="px-4 py-3.5">
                      {currentStage ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: currentStage.stage.color }} />
                          <span className="text-slate-700 whitespace-nowrap">{td(t.data.stages, currentStage.stage.name)}</span>
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {currentStage ? (
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap", stageBadgeClass(days, slaDays))}>
                          {days} / {slaDays}{t.dashboard.days}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.executorOrg?.shortName ?? "—"}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", statusColor(p.status))}>
                        {td(t.data.statusLabels, p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{formatDate(p.deadline)}</td>
                  </motion.tr>
                );
              })}
            </motion.tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">{t.projects.noProjects}</div>
          )}
        </div>
      </motion.div>
    </>
  );
}

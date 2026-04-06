"use client";

import { useMemo, useState } from "react";
import { motion, type Variants } from "motion/react";
import { daysInStage, trafficLightClass, priorityBadgeClass, cn } from "@/lib/utils";
import { useLanguage, td } from "@/lib/i18n";
import type { ProjectWithStages, OrgOption } from "@/lib/data";

type Program = {
  id: string;
  name: string;
  stages: { id: string; name: string; order: number; color: string; slaDays: number }[];
};

const PRIORITIES = ["ALL", "URGENT", "HIGH", "NORMAL", "LOW"] as const;

const colVars: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const colItemVars: Variants = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const cardVars: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const cardItemVars: Variants = { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } };

export function BoardClient({
  projects,
  programs,
  orgs,
}: {
  projects: ProjectWithStages[];
  programs: Program[];
  orgs: OrgOption[];
}) {
  const { t } = useLanguage();
  const program = programs[0];
  const now = new Date();

  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");
  const [orgFilter, setOrgFilter] = useState("ALL");

  const sectors = useMemo(() => {
    const s = new Set(projects.map((p) => p.sector ?? "Other"));
    return ["ALL", ...Array.from(s).sort()];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchPriority = priorityFilter === "ALL" || p.priority === priorityFilter;
      const matchSector = sectorFilter === "ALL" || (p.sector ?? "Other") === sectorFilter;
      const matchOrg = orgFilter === "ALL" || p.executorOrgId === orgFilter;
      return matchPriority && matchSector && matchOrg;
    });
  }, [projects, priorityFilter, sectorFilter, orgFilter]);

  const stageColumns = useMemo(() => {
    if (!program) return [];
    return program.stages.map((stage) => {
      const stageProjects = filteredProjects.filter(
        (p) => p.status === "ACTIVE" && p.currentStageId === stage.id
      );
      return { stage, projects: stageProjects };
    });
  }, [program, filteredProjects]);

  const hasFilters = priorityFilter !== "ALL" || sectorFilter !== "ALL" || orgFilter !== "ALL";

  if (!program) {
    return <div className="p-6 text-slate-500">{t.board.noPrograms}</div>;
  }

  return (
    <motion.div
      className="p-6 flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.board.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{program.name}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t.board.slaLegend.green}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {t.board.slaLegend.yellow}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {t.board.slaLegend.red}
          </span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority chips */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                priorityFilter === p
                  ? p === "ALL" ? "bg-indigo-600 text-white" : cn(priorityBadgeClass(p))
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {p === "ALL" ? t.board.allPriorities : td(t.data.priorityLabels, p)}
            </button>
          ))}
        </div>

        {/* Sector dropdown */}
        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 cursor-pointer"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? t.board.allSectors : td(t.data.sectors, s)}
            </option>
          ))}
        </select>

        {/* Org dropdown */}
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600 cursor-pointer"
        >
          <option value="ALL">{t.board.allOrgs}</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>{o.shortName ?? o.name}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button
            onClick={() => { setPriorityFilter("ALL"); setSectorFilter("ALL"); setOrgFilter("ALL"); }}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer transition-colors"
          >
            {t.dashboard.clearFilter}
          </button>
        )}
      </div>

      {/* Board columns */}
      <motion.div className="flex gap-4 overflow-x-auto pb-4" variants={colVars} initial="hidden" animate="show">
        {stageColumns.map(({ stage, projects: stageProjects }) => (
          <motion.div key={stage.id} variants={colItemVars} className="flex-shrink-0 w-64">
            {/* Column header */}
            <div
              className="px-3 py-2.5 rounded-t-lg mb-2 flex items-start justify-between gap-2"
              style={{ background: stage.color + "20", borderBottom: `3px solid ${stage.color}` }}
            >
              <span
                className="text-xs font-semibold text-slate-700 leading-tight line-clamp-2"
                title={td(t.data.stages, stage.name)}
              >
                {td(t.data.stages, stage.name)}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                style={{ background: stage.color }}
              >
                {stageProjects.length}
              </span>
            </div>

            {/* Cards */}
            <motion.div className="space-y-2" variants={cardVars} initial="hidden" animate="show">
              {stageProjects.map((p) => {
                const ps = p.stages.find((s) => s.stageId === stage.id);
                const days = daysInStage(ps?.enteredAt);
                const tlClass = trafficLightClass(days, stage.slaDays);
                const isOverdue = p.deadline && new Date(p.deadline) < now;

                return (
                  <motion.a
                    key={p.id}
                    href={`/projects/${p.id}`}
                    variants={cardItemVars}
                    whileHover={{ y: -2, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    className="block bg-white rounded-lg border border-slate-200 p-3.5 hover:border-indigo-300 group cursor-pointer"
                  >
                    {/* Traffic light + name row */}
                    <div className="flex items-start gap-2 mb-2">
                      <div className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0", tlClass)} />
                      <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-3">
                        {td(t.data.projectNames, p.name)}
                      </p>
                    </div>

                    {/* Priority + overdue badges */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {p.priority !== "NORMAL" && (
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", priorityBadgeClass(p.priority))}>
                          {td(t.data.priorityLabels, p.priority)}
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border bg-red-100 text-red-700 border-red-200">
                          {t.board.overdueBadge}
                        </span>
                      )}
                    </div>

                    {/* Footer: org + days counter */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-400 truncate">{p.executorOrg?.shortName ?? "—"}</span>
                      <span className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded",
                        tlClass === "bg-emerald-500" && "text-emerald-700 bg-emerald-50",
                        tlClass === "bg-amber-400"   && "text-amber-700 bg-amber-50",
                        tlClass === "bg-red-500"     && "text-red-700 bg-red-50",
                      )}>
                        {days}{t.project.days}
                      </span>
                    </div>

                    {p.sector && (
                      <div className="mt-1.5 text-xs text-slate-400">{td(t.data.sectors, p.sector)}</div>
                    )}
                  </motion.a>
                );
              })}

              {stageProjects.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
                  {t.board.noProjects}
                </div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { daysInStage, stageBadgeClass, formatDate, statusLabel, statusColor, cn } from "@/lib/utils";
import type { ProjectWithStages } from "@/lib/data";
import { Search, SlidersHorizontal } from "lucide-react";

const STATUS_OPTIONS = ["ALL", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"];

export function ProjectsClient({ projects }: { projects: ProjectWithStages[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sectorFilter, setSectorFilter] = useState("ALL");

  const sectors = useMemo(() => {
    const s = new Set(projects.map((p) => p.sector ?? "Other"));
    return ["ALL", ...Array.from(s).sort()];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      const matchSector = sectorFilter === "ALL" || (p.sector ?? "Other") === sectorFilter;
      return matchSearch && matchStatus && matchSector;
    });
  }, [projects, search, statusFilter, sectorFilter]);

  return (
    <div className="p-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} of {projects.length} shown</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                statusFilter === s ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
              )}
            >
              {s === "ALL" ? "All" : statusLabel(s)}
            </button>
          ))}
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>{s === "ALL" ? "All sectors" : s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sector</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Current stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time in stage</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Executor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const currentStage = p.stages.find((ps) => ps.stageId === p.currentStageId);
              const days = daysInStage(currentStage?.enteredAt);
              const slaDays = currentStage?.stage.slaDays ?? 30;

              return (
                <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <a
                      href={`/projects/${p.id}`}
                      className="font-medium text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 max-w-sm"
                    >
                      {p.name}
                    </a>
                    {p.legalBasis && (
                      <div className="text-xs text-slate-400 mt-0.5">{p.legalBasis}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{p.sector ?? "—"}</td>
                  <td className="px-4 py-3.5">
                    {currentStage ? (
                      <span className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: currentStage.stage.color }}
                        />
                        <span className="text-slate-700 whitespace-nowrap">{currentStage.stage.name}</span>
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    {currentStage ? (
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full border", stageBadgeClass(days, slaDays))}>
                        {days}d / {slaDays}d SLA
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {p.executorOrg?.shortName ?? "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", statusColor(p.status))}>
                      {statusLabel(p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(p.deadline)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">No projects match your filters</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { daysInStage, stageBadgeClass, formatDate, cn } from "@/lib/utils";
import type { DashboardStats, ProjectWithStages } from "@/lib/data";

const SECTOR_COLORS = [
  "#6366f1","#8b5cf6","#a855f7","#ec4899","#f43f5e",
  "#f97316","#eab308","#22c55e","#06b6d4","#3b82f6",
];

type FilterState = {
  status: string | null;
  stageId: string | null;
  sector: string | null;
  orgName: string | null;
};

export function DashboardClient({
  stats,
  projects,
}: {
  stats: DashboardStats;
  projects: ProjectWithStages[];
}) {
  const [filter, setFilter] = useState<FilterState>({
    status: null,
    stageId: null,
    sector: null,
    orgName: null,
  });
  const [drillTitle, setDrillTitle] = useState<string | null>(null);

  function setStatusFilter(status: string) {
    setFilter({ status, stageId: null, sector: null, orgName: null });
    setDrillTitle(`Status: ${status}`);
  }

  function setStageFilter(stageId: string, stageName: string) {
    setFilter({ status: null, stageId, sector: null, orgName: null });
    setDrillTitle(`Stage: ${stageName}`);
  }

  function setSectorFilter(sector: string) {
    setFilter({ status: null, stageId: null, sector, orgName: null });
    setDrillTitle(`Sector: ${sector}`);
  }

  function setOrgFilter(orgName: string) {
    setFilter({ status: null, stageId: null, sector: null, orgName });
    setDrillTitle(`Org: ${orgName}`);
  }

  function clearFilter() {
    setFilter({ status: null, stageId: null, sector: null, orgName: null });
    setDrillTitle(null);
  }

  const filteredProjects = projects.filter((p) => {
    if (filter.status) return p.status === filter.status;
    if (filter.stageId) return p.currentStageId === filter.stageId;
    if (filter.sector) return p.sector === filter.sector;
    if (filter.orgName) return p.executorOrg?.shortName === filter.orgName || p.executorOrg?.name === filter.orgName;
    return false;
  });

  const showDrill = Object.values(filter).some(Boolean);

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Click any metric to drill down</p>
        </div>
        <div className="text-sm text-slate-400">{stats.total} projects total</div>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active", value: stats.active, status: "ACTIVE", color: "border-l-indigo-500", bg: "hover:bg-indigo-50" },
          { label: "Completed", value: stats.completed, status: "COMPLETED", color: "border-l-emerald-500", bg: "hover:bg-emerald-50" },
          { label: "On Hold", value: stats.onHold, status: "ON_HOLD", color: "border-l-amber-500", bg: "hover:bg-amber-50" },
          { label: "Cancelled", value: stats.cancelled, status: "CANCELLED", color: "border-l-slate-400", bg: "hover:bg-slate-50" },
        ].map((kpi) => (
          <button
            key={kpi.status}
            onClick={() => setStatusFilter(kpi.status)}
            className={cn(
              "bg-white rounded-xl border border-slate-200 border-l-4 p-5 text-left transition-all",
              kpi.color, kpi.bg,
              filter.status === kpi.status && "ring-2 ring-indigo-400 ring-offset-1"
            )}
          >
            <div className="text-3xl font-bold text-slate-900">{kpi.value}</div>
            <div className="text-sm text-slate-500 mt-1">{kpi.label}</div>
          </button>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pipeline Funnel */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Pipeline Funnel — click a stage</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.stageDistribution} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} width={130} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(v, _, props) => [`${v} projects · avg ${(props as any).payload?.avgDays}d`, ""] as [string, string]}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data: any) => {
                  // find stage id from distribution
                  const match = stats.stageDistribution.find((s) => s.name === data.name);
                  // we need stage id — find from projects
                  const proj = projects.find((p) => {
                    const ps = p.stages.find((ps) => ps.stage.name === data.name);
                    return ps && p.currentStageId === ps.stageId;
                  });
                  if (proj) {
                    const ps = proj.stages.find((ps) => ps.stage.name === data.name);
                    if (ps) setStageFilter(ps.stageId, data.name);
                  }
                }}
              >
                {stats.stageDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sector pie */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Sector Distribution</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={stats.sectorDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                cursor="pointer"
                onClick={(data: any) => setSectorFilter(data.name)}
              >
                {stats.sectorDistribution.map((_, i) => (
                  <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {stats.sectorDistribution.slice(0, 5).map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSectorFilter(s.name)}
                className={cn("w-full flex items-center gap-2 text-xs hover:bg-slate-50 rounded px-1 py-0.5 transition-colors", filter.sector === s.name && "bg-indigo-50")}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />
                <span className="flex-1 text-left text-slate-600 truncate">{s.name}</span>
                <span className="text-slate-400 font-medium">{s.value}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Deadline risk + Stuck projects row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Deadline risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Deadline Risk</h2>
          <div className="space-y-3">
            {[
              { label: "Overdue", value: stats.deadlineRisk.overdue, color: "bg-red-500", textColor: "text-red-700", bg: "bg-red-50" },
              { label: "Due in 30 days", value: stats.deadlineRisk.in30, color: "bg-amber-400", textColor: "text-amber-700", bg: "bg-amber-50" },
              { label: "Due in 31–60 days", value: stats.deadlineRisk.in60, color: "bg-blue-400", textColor: "text-blue-700", bg: "bg-blue-50" },
            ].map((r) => (
              <div key={r.label} className={cn("flex items-center gap-3 p-3 rounded-lg", r.bg)}>
                <div className={cn("w-2 h-2 rounded-full", r.color)} />
                <span className="flex-1 text-sm text-slate-600">{r.label}</span>
                <span className={cn("text-lg font-bold", r.textColor)}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Org performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">Executor Performance — click to filter</h2>
          <div className="space-y-2">
            {stats.orgDistribution.map((org) => (
              <button
                key={org.name}
                onClick={() => setOrgFilter(org.name)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left",
                  filter.orgName === org.name && "bg-indigo-50 ring-1 ring-indigo-200"
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 flex-shrink-0">
                  {org.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700 truncate">{org.name}</div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                    <div
                      className="h-1.5 bg-indigo-500 rounded-full"
                      style={{ width: `${(org.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700">{org.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stage Clock — top stuck */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">
          Stage Clock — Longest stuck projects
        </h2>
        <div className="space-y-2">
          {stats.stuckProjects.map((p, i) => {
            const pct = Math.min((p.days / p.slaDays) * 100, 100);
            const over = p.days > p.slaDays;
            return (
              <div key={p.id} className="flex items-center gap-3 py-1.5">
                <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 truncate max-w-xs">{p.name}</span>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{p.stageName}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div
                      className={cn("h-1.5 rounded-full transition-all", over ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className={cn("text-sm font-semibold w-14 text-right", over ? "text-red-600" : pct > 50 ? "text-amber-600" : "text-emerald-600")}>
                  {p.days}d
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drill-down */}
      {showDrill && (
        <div className="bg-white rounded-xl border border-indigo-200 ring-1 ring-indigo-100 p-5 page-enter">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700">
              Drill-down: <span className="text-indigo-600">{drillTitle}</span>
              <span className="ml-2 text-slate-400 font-normal">({filteredProjects.length} projects)</span>
            </h2>
            <button onClick={clearFilter} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              Clear filter ✕
            </button>
          </div>
          <DrillTable projects={filteredProjects} />
        </div>
      )}
    </div>
  );
}

function DrillTable({ projects }: { projects: ProjectWithStages[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Project</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Stage</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Sector</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Executor</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Days in stage</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const currentStage = p.stages.find((ps) => ps.stageId === p.currentStageId);
            const days = daysInStage(currentStage?.enteredAt);
            const slaDays = currentStage?.stage.slaDays ?? 30;
            return (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-slate-800 max-w-xs">
                  <a href={`/projects/${p.id}`} className="hover:text-indigo-600 transition-colors">{p.name}</a>
                </td>
                <td className="py-3 pr-4 text-slate-600">{currentStage?.stage.name ?? "—"}</td>
                <td className="py-3 pr-4 text-slate-500">{p.sector ?? "—"}</td>
                <td className="py-3 pr-4 text-slate-500">{p.executorOrg?.shortName ?? "—"}</td>
                <td className="py-3 pr-4">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", stageBadgeClass(days, slaDays))}>
                    {days}d
                  </span>
                </td>
                <td className="py-3 text-slate-500">{formatDate(p.deadline)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

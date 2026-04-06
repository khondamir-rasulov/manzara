"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, LabelList,
} from "recharts";
import { daysInStage, stageBadgeClass, formatDate, stageTrafficLight, priorityBadgeClass, cn } from "@/lib/utils";
import { useLanguage, td } from "@/lib/i18n";
import type { DashboardStats, ProjectWithStages } from "@/lib/data";

// ─── Constants ─────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "#ef4444",
  HIGH: "#f97316",
  NORMAL: "#94a3b8",
  LOW: "#3b82f6",
};

const SLA_FILL: Record<string, string> = {
  green: "#22c55e",
  yellow: "#f59e0b",
  red: "#ef4444",
};

// ─── Y-axis tick that wraps long names over 2 lines ────────────────────────
function WrapTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const text = payload?.value ?? "";
  const maxLen = 20;
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxLen) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word.length > maxLen ? word.slice(0, maxLen - 1) + "…" : word;
    }
    if (lines.length === 1 && current.length > maxLen) {
      current = current.slice(0, maxLen - 1) + "…";
      break;
    }
  }
  if (current && lines.length < 2) lines.push(current);
  const lh = 13;
  const offset = lines.length === 2 ? -lh / 2 : 0;
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text key={i} x={-6} y={offset + i * lh} textAnchor="end" fill="#64748b" fontSize={10} dominantBaseline="middle">
          {line}
        </text>
      ))}
    </g>
  );
}

// ─── Types ─────────────────────────────────────────────────────────────────
type FilterState = {
  status: string | null;
  stageId: string | null;
  sector: string | null;
  orgName: string | null;
};

const kpiVars: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const kpiCardVars: Variants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stuckVars: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const stuckRowVars: Variants = { hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } };

// ─── Main component ─────────────────────────────────────────────────────────
export function DashboardClient({
  stats,
  projects,
}: {
  stats: DashboardStats;
  projects: ProjectWithStages[];
}) {
  const { t } = useLanguage();

  // Translated chart data
  const translatedStageDistribution = stats.stageDistribution.map((s) => ({
    ...s,
    displayName: td(t.data.stagesShort, s.name),
    fullName: td(t.data.stages, s.name),
  }));
  const translatedSlaCompliance = stats.slaCompliance.map((s) => ({
    ...s,
    stageName: td(t.data.stagesShort, s.stageName),
  }));

  // Filter state
  const [filter, setFilter] = useState<FilterState>({ status: null, stageId: null, sector: null, orgName: null });
  const [drillTitle, setDrillTitle] = useState<string | null>(null);

  function setStatusFilter(status: string) {
    setFilter({ status, stageId: null, sector: null, orgName: null });
    setDrillTitle(td(t.data.statusLabels, status));
  }
  function setStageFilter(stageId: string, stageName: string) {
    setFilter({ status: null, stageId, sector: null, orgName: null });
    setDrillTitle(stageName);
  }
  function setSectorFilter(sector: string) {
    setFilter({ status: null, stageId: null, sector, orgName: null });
    setDrillTitle(td(t.data.sectors, sector));
  }
  function setOrgFilter(orgName: string) {
    setFilter({ status: null, stageId: null, sector: null, orgName });
    setDrillTitle(orgName);
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

  const urgentCount = stats.priorityDistribution.find((p) => p.priority === "URGENT")?.count ?? 0;

  return (
    <motion.div
      className="p-6 space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.dashboard.title}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t.dashboard.clickToFilter}</p>
        </div>
        <div className="text-sm text-slate-400">{stats.total} {t.dashboard.projects}</div>
      </div>

      {/* ── Row 1: 6 KPI cards ── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        variants={kpiVars}
        initial="hidden"
        animate="show"
      >
        {/* Clickable status cards */}
        {[
          { label: t.dashboard.active,    value: stats.active,    status: "ACTIVE",    color: "border-l-indigo-500",  bg: "hover:bg-indigo-50" },
          { label: t.dashboard.completed, value: stats.completed, status: "COMPLETED", color: "border-l-emerald-500", bg: "hover:bg-emerald-50" },
          { label: t.dashboard.onHold,    value: stats.onHold,    status: "ON_HOLD",   color: "border-l-amber-500",   bg: "hover:bg-amber-50" },
          { label: t.dashboard.cancelled, value: stats.cancelled, status: "CANCELLED", color: "border-l-slate-400",   bg: "hover:bg-slate-50" },
        ].map((kpi) => (
          <motion.button
            key={kpi.status}
            variants={kpiCardVars}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setStatusFilter(kpi.status)}
            className={cn(
              "bg-white rounded-xl border border-slate-200 border-l-4 p-4 text-left cursor-pointer transition-colors",
              kpi.color, kpi.bg,
              filter.status === kpi.status && "ring-2 ring-indigo-400 ring-offset-1"
            )}
          >
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </motion.button>
        ))}

        {/* SLA Rate — display only */}
        <motion.div
          variants={kpiCardVars}
          className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-violet-500 p-4"
        >
          <div className="text-2xl font-bold text-slate-900">
            {stats.overallSlaRate !== null ? `${stats.overallSlaRate}%` : "—"}
          </div>
          <div className="text-xs text-slate-500 mt-1">{t.dashboard.slaRate}</div>
        </motion.div>

        {/* Overdue — display only */}
        <motion.div
          variants={kpiCardVars}
          className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-red-500 p-4"
        >
          <div className="text-2xl font-bold text-red-600">{urgentCount}</div>
          <div className="text-xs text-slate-500 mt-1">{t.dashboard.urgentCount}</div>
        </motion.div>
      </motion.div>

      {/* ── Row 2: Pipeline funnel + Priority donut ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pipeline funnel (2/3) */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.dashboard.pipelineFunnel}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={translatedStageDistribution} layout="vertical" margin={{ left: 4, right: 40, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="displayName" tick={<WrapTick />} width={110} axisLine={false} tickLine={false} interval={0} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                formatter={(v, _, props) => {
                  const pl = (props as any).payload;
                  return [`${v} ${t.dashboard.projects} · ${t.dashboard.avgDaysInStage}: ${pl?.avgDays}${t.dashboard.days}`, pl?.fullName ?? ""];
                }}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(data: any) => setStageFilter(data.stageId, data.fullName ?? data.displayName)}
              >
                {translatedStageDistribution.map((entry, i) => (
                  <Cell key={i} fill={SLA_FILL[stageTrafficLight(entry.avgDays, entry.slaDays)]} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority donut (1/3) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">{t.dashboard.priorityBreakdown}</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={stats.priorityDistribution.filter((d) => d.count > 0)}
                dataKey="count"
                nameKey="priority"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={68}
                paddingAngle={2}
              >
                {stats.priorityDistribution
                  .filter((d) => d.count > 0)
                  .map((entry) => (
                    <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority]} />
                  ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v: any, name: any) => [v, td(t.data.priorityLabels, name)]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {stats.priorityDistribution.map((p) => (
              <div key={p.priority} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PRIORITY_COLORS[p.priority] }} />
                <span className="flex-1 text-slate-600">{td(t.data.priorityLabels, p.priority)}</span>
                <span className="font-semibold text-slate-700">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: SLA Compliance per Stage ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-700">{t.dashboard.slaCompliance}</h2>
          {stats.overallSlaRate !== null && (
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full border",
              stats.overallSlaRate >= 80 ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : stats.overallSlaRate >= 50 ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-red-100 text-red-700 border-red-200"
            )}>
              {stats.overallSlaRate}%
            </span>
          )}
        </div>

        {translatedSlaCompliance.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">{t.dashboard.slaNoData}</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(180, translatedSlaCompliance.length * 44)}>
            <BarChart data={translatedSlaCompliance} layout="vertical" margin={{ left: 8, right: 56, top: 4, bottom: 4 }}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="stageName" width={120} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={0} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                formatter={(v: any, name: any) => [
                  v,
                  name === "compliant" ? t.dashboard.slaCompliant : t.dashboard.slaLate,
                ]}
              />
              <Bar dataKey="compliant" stackId="sla" fill="#22c55e" name="compliant" />
              <Bar dataKey="late" stackId="sla" fill="#f87171" radius={[0, 4, 4, 0]} name="late">
                <LabelList
                  dataKey="rate"
                  position="right"
                  style={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  formatter={(v: any) => `${v}%`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Row 4: Deadline risk + Top-5 stuck ── */}
      <div className="grid grid-cols-2 gap-4">
        {/* Deadline risk — 3 metric cards */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.dashboard.deadlineRisk}</h2>
          <div className="space-y-3">
            {[
              { label: t.dashboard.overdue, value: stats.deadlineRisk.overdue, bar: "bg-red-500",   text: "text-red-700",   bg: "bg-red-50",   ring: "border-red-200" },
              { label: t.dashboard.due30,   value: stats.deadlineRisk.in30,    bar: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", ring: "border-amber-200" },
              { label: t.dashboard.due60,   value: stats.deadlineRisk.in60,    bar: "bg-blue-400",  text: "text-blue-700",  bg: "bg-blue-50",  ring: "border-blue-200" },
            ].map((r) => (
              <div key={r.label} className={cn("p-3.5 rounded-xl border", r.bg, r.ring)}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={cn("text-3xl font-bold", r.text)}>{r.value}</span>
                  <span className="text-sm text-slate-500">{r.label}</span>
                </div>
                <div className="w-full h-1.5 bg-white/60 rounded-full">
                  <div
                    className={cn("h-1.5 rounded-full", r.bar)}
                    style={{ width: `${stats.active > 0 ? Math.min((r.value / stats.active) * 100, 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top-5 stuck projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.dashboard.bottleneckHeatmap}</h2>
          <div className="space-y-2">
            {stats.stuckProjects.slice(0, 5).map((p, i) => {
              const pct = Math.min((p.days / p.slaDays) * 100, 100);
              const over = p.days > p.slaDays;
              return (
                <div key={p.id} className="flex items-center gap-3 py-1">
                  <span className="text-xs text-slate-400 w-4 text-right flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <a href={`/projects/${p.id}`} className="text-xs font-medium text-slate-700 hover:text-indigo-600 transition-colors truncate max-w-[140px]">
                        {td(t.data.projectNames, p.name)}
                      </a>
                      <span className="text-[10px] text-slate-400 ml-1 flex-shrink-0">{td(t.data.stagesShort, p.stageName)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div className={cn("h-1.5 rounded-full", over ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className={cn("text-xs font-bold w-10 text-right flex-shrink-0", over ? "text-red-600" : pct > 50 ? "text-amber-600" : "text-emerald-600")}>
                    {p.days}{t.dashboard.days}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 5: Stage Clock top-10 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.dashboard.stageClock}</h2>
        <motion.div className="space-y-2" variants={stuckVars} initial="hidden" animate="show">
          {stats.stuckProjects.map((p, i) => {
            const pct = Math.min((p.days / p.slaDays) * 100, 100);
            const over = p.days > p.slaDays;
            return (
              <motion.div key={p.id} variants={stuckRowVars} className="flex items-center gap-3 py-1.5">
                <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 truncate max-w-xs">{td(t.data.projectNames, p.name)}</span>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">{td(t.data.stages, p.stageName)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full">
                    <div className={cn("h-1.5 rounded-full", over ? "bg-red-500" : pct > 50 ? "bg-amber-400" : "bg-emerald-500")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className={cn("text-sm font-semibold w-14 text-right", over ? "text-red-600" : pct > 50 ? "text-amber-600" : "text-emerald-600")}>
                  {p.days}{t.dashboard.days}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ── Row 6: Executor Performance table ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">{t.dashboard.executorPerformance}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide w-6">#</th>
                <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.executor}</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.execActive}</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.execCompleted}</th>
                <th className="text-center pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.execSlaRate}</th>
                <th className="pb-2 w-36" />
              </tr>
            </thead>
            <tbody>
              {stats.executorPerformance.map((org, i) => (
                <tr
                  key={org.name}
                  onClick={() => setOrgFilter(org.name)}
                  className={cn(
                    "border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer",
                    filter.orgName === org.name && "bg-indigo-50"
                  )}
                >
                  <td className="py-2.5 text-xs text-slate-400">{i + 1}</td>
                  <td className="py-2.5 font-medium text-slate-800">{org.name}</td>
                  <td className="py-2.5 text-center text-slate-600">{org.total - org.completed}</td>
                  <td className="py-2.5 text-center text-emerald-600 font-medium">{org.completed}</td>
                  <td className="py-2.5 text-center">
                    {org.slaRate !== null ? (
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full border",
                        org.slaRate >= 80 ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : org.slaRate >= 50 ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-red-100 text-red-700 border-red-200"
                      )}>
                        {org.slaRate}%
                      </span>
                    ) : (
                      <span className="text-slate-300">{t.dashboard.execNoData}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-2">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                      <div
                        className="h-1.5 rounded-full bg-violet-500"
                        style={{ width: `${org.slaRate ?? 0}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 7: Drill-down table (conditional) ── */}
      <AnimatePresence>
        {showDrill && (
          <motion.div
            key="drill"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-white rounded-xl border border-indigo-200 ring-1 ring-indigo-100 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-700">
                <span className="text-indigo-600">{drillTitle}</span>
                <span className="ml-2 text-slate-400 font-normal">({filteredProjects.length} {t.dashboard.projects})</span>
              </h2>
              <button onClick={clearFilter} className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                {t.dashboard.clearFilter} ✕
              </button>
            </div>
            <DrillTable projects={filteredProjects} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Drill-down table ───────────────────────────────────────────────────────
function DrillTable({ projects }: { projects: ProjectWithStages[] }) {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.name}</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.projects.priority}</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.stage}</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.sector}</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.executor}</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.daysInStage}</th>
            <th className="text-left pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">{t.dashboard.deadline}</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const currentStage = p.stages.find((ps) => ps.stageId === p.currentStageId);
            const days = daysInStage(currentStage?.enteredAt);
            const slaDays = currentStage?.stage.slaDays ?? 30;
            return (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-slate-800 max-w-[200px]">
                  <a href={`/projects/${p.id}`} className="hover:text-indigo-600 transition-colors line-clamp-2">{td(t.data.projectNames, p.name)}</a>
                </td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", priorityBadgeClass(p.priority))}>
                    {td(t.data.priorityLabels, p.priority)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-600 whitespace-nowrap">{currentStage ? td(t.data.stages, currentStage.stage.name) : "—"}</td>
                <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{p.sector ? td(t.data.sectors, p.sector) : "—"}</td>
                <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">{p.executorOrg?.shortName ?? "—"}</td>
                <td className="py-3 pr-4 whitespace-nowrap">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", stageBadgeClass(days, slaDays))}>
                    {days}{t.dashboard.days}
                  </span>
                </td>
                <td className="py-3 text-slate-500 whitespace-nowrap">{formatDate(p.deadline)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useLanguage, td } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ProjectWithStages } from "@/lib/data";

// ─── Layout constants ──────────────────────────────────────────────────────
const LEFT_COL = 240;   // px — fixed project name column
const MONTH_W  = 110;   // px — width per month (wide enough for full month names)
const ROW_H    = 36;    // px — row height
const HDR_H    = 48;    // px — header height

// ─── Helpers ──────────────────────────────────────────────────────────────
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** How many months (fractional) from chartStart to date */
function monthOffset(date: Date, chartStart: Date): number {
  const diffMs = date.getTime() - chartStart.getTime();
  const daysInMs = 1000 * 60 * 60 * 24;
  const diffDays = diffMs / daysInMs;
  // approx 30.44 days/month
  return diffDays / 30.4375;
}

function barColor(deadline: Date | null): string {
  if (!deadline) return "bg-slate-300";
  const now = new Date();
  const msLeft = deadline.getTime() - now.getTime();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  if (daysLeft < 0)  return "bg-red-500";
  if (daysLeft < 30) return "bg-amber-400";
  return "bg-emerald-500";
}

function barBorder(deadline: Date | null): string {
  if (!deadline) return "border-slate-400";
  const now = new Date();
  const msLeft = deadline.getTime() - now.getTime();
  const daysLeft = msLeft / (1000 * 60 * 60 * 24);
  if (daysLeft < 0)  return "border-red-600";
  if (daysLeft < 30) return "border-amber-500";
  return "border-emerald-600";
}

function formatMonthYear(date: Date, locale: string): string {
  return date.toLocaleDateString(locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US", {
    month: "long",
    year: "2-digit",
  });
}

// ─── Types ─────────────────────────────────────────────────────────────────
interface Props {
  projects: ProjectWithStages[];
}

// ─── Component ─────────────────────────────────────────────────────────────
export function GanttClient({ projects }: Props) {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // collapsed sector groups
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleSector(sector: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(sector)) next.delete(sector);
      else next.add(sector);
      return next;
    });
  }

  // ── Chart date range ────────────────────────────────────────────────────
  const { chartStart, totalMonths } = useMemo(() => {
    const dates: Date[] = [];
    projects.forEach((p) => {
      const first = p.stages[0]?.enteredAt;
      if (first) dates.push(new Date(first));
      if (p.deadline) dates.push(new Date(p.deadline));
    });
    if (dates.length === 0) {
      const now = new Date();
      return { chartStart: startOfMonth(now), totalMonths: 18 };
    }
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    const start = startOfMonth(minDate);
    const endMonth = startOfMonth(addMonths(maxDate, 2));
    const months = Math.max(
      12,
      Math.round(monthOffset(endMonth, start)) + 1
    );
    return { chartStart: start, totalMonths: months };
  }, [projects]);

  const chartWidth = totalMonths * MONTH_W;

  // ── Month header labels ─────────────────────────────────────────────────
  const monthLabels = useMemo(() => {
    return Array.from({ length: totalMonths }, (_, i) => addMonths(chartStart, i));
  }, [chartStart, totalMonths]);

  // ── Today line position ─────────────────────────────────────────────────
  const todayX = useMemo(() => {
    const off = monthOffset(new Date(), chartStart);
    return Math.max(0, Math.min(off * MONTH_W, chartWidth));
  }, [chartStart, chartWidth]);

  // ── Group projects by sector ────────────────────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<string, ProjectWithStages[]>();
    projects.forEach((p) => {
      const sector = p.sector ?? "Other";
      if (!map.has(sector)) map.set(sector, []);
      map.get(sector)!.push(p);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [projects]);

  // ── Bar geometry ────────────────────────────────────────────────────────
  function barGeometry(p: ProjectWithStages) {
    const startDate = p.stages[0]?.enteredAt
      ? new Date(p.stages[0].enteredAt)
      : new Date();
    const endDate = p.deadline ? new Date(p.deadline) : addMonths(startDate, 3);

    const x = Math.max(0, monthOffset(startDate, chartStart) * MONTH_W);
    const x2 = Math.max(x + 6, monthOffset(endDate, chartStart) * MONTH_W);
    return { x, width: x2 - x };
  }

  return (
    <motion.div
      className="flex flex-col h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t.nav.gantt}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{projects.length} {t.dashboard.projects}</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            {t.board.slaLegend.green}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />
            {t.board.slaLegend.yellow}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
            {t.board.slaLegend.red}
          </span>
        </div>
      </div>

      {/* Chart area — scrolls horizontally on right side */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: sticky name column */}
        <div
          className="flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto"
          style={{ width: LEFT_COL }}
        >
          {/* Header spacer */}
          <div
            className="border-b border-slate-200 bg-slate-50 flex items-end px-3 pb-2"
            style={{ height: HDR_H }}
          >
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t.projects.name}
            </span>
          </div>

          {/* Rows */}
          {grouped.map(([sector, sectorProjects]) => {
            const isCollapsed = collapsed.has(sector);
            return (
              <div key={sector}>
                {/* Sector header row */}
                <button
                  onClick={() => toggleSector(sector)}
                  className="w-full flex items-center gap-1.5 px-3 bg-slate-50 border-b border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                  style={{ height: ROW_H }}
                >
                  {isCollapsed
                    ? <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    : <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  }
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {td(t.data.sectors, sector)}
                  </span>
                  <span className="ml-auto text-xs text-slate-400 flex-shrink-0">
                    {sectorProjects.length}
                  </span>
                </button>

                {/* Project rows */}
                {!isCollapsed && sectorProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => router.push(`/projects/${p.id}`)}
                    className="flex items-center px-3 border-b border-slate-100 hover:bg-indigo-50 cursor-pointer transition-colors"
                    style={{ height: ROW_H }}
                  >
                    <span className="text-xs text-slate-700 truncate leading-snug">
                      {td(t.data.projectNames, p.name)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* RIGHT: scrollable chart */}
        <div ref={scrollRef} className="flex-1 overflow-auto">
          <div style={{ width: chartWidth, minWidth: "100%" }}>
            {/* Month header */}
            <div
              className="sticky top-0 z-10 flex border-b border-slate-200 bg-slate-50"
              style={{ height: HDR_H }}
            >
              {monthLabels.map((month, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 border-r border-slate-200 flex items-end px-2 pb-2"
                  style={{ width: MONTH_W }}
                >
                  <span className="text-xs font-medium text-slate-500">
                    {formatMonthYear(month, lang)}
                  </span>
                </div>
              ))}
            </div>

            {/* Chart body — relative container for today line + bars */}
            <div className="relative">
              {/* Today vertical line */}
              <div
                className="absolute top-0 bottom-0 w-px bg-indigo-400 z-20 pointer-events-none"
                style={{ left: todayX }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              </div>

              {/* Rows */}
              {grouped.map(([sector, sectorProjects]) => {
                const isCollapsed = collapsed.has(sector);
                return (
                  <div key={sector}>
                    {/* Sector header — shaded, no bar */}
                    <div
                      className="border-b border-slate-200 bg-slate-50 relative"
                      style={{ height: ROW_H }}
                    >
                      {/* Grid lines */}
                      {monthLabels.map((_, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 border-r border-slate-100"
                          style={{ left: (i + 1) * MONTH_W }}
                        />
                      ))}
                    </div>

                    {/* Project bars */}
                    {!isCollapsed && sectorProjects.map((p) => {
                      const { x, width } = barGeometry(p);
                      const color = barColor(p.deadline ? new Date(p.deadline) : null);
                      const border = barBorder(p.deadline ? new Date(p.deadline) : null);
                      return (
                        <div
                          key={p.id}
                          onClick={() => router.push(`/projects/${p.id}`)}
                          className="relative border-b border-slate-100 hover:bg-indigo-50/40 cursor-pointer transition-colors"
                          style={{ height: ROW_H }}
                        >
                          {/* Grid lines */}
                          {monthLabels.map((_, i) => (
                            <div
                              key={i}
                              className="absolute top-0 bottom-0 border-r border-slate-100"
                              style={{ left: (i + 1) * MONTH_W }}
                            />
                          ))}

                          {/* Bar */}
                          <motion.div
                            initial={{ scaleX: 0, originX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 rounded-md border opacity-90 hover:opacity-100 transition-opacity",
                              color, border
                            )}
                            style={{
                              left: x,
                              width: Math.max(width, 8),
                              height: 20,
                            }}
                            title={td(t.data.projectNames, p.name)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

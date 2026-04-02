"use client";

import { useMemo } from "react";
import { daysInStage, trafficLightClass, cn } from "@/lib/utils";
import type { ProjectWithStages } from "@/lib/data";

type Program = {
  id: string;
  name: string;
  stages: { id: string; name: string; order: number; color: string; slaDays: number }[];
};

export function BoardClient({
  projects,
  programs,
}: {
  projects: ProjectWithStages[];
  programs: Program[];
}) {
  const program = programs[0];

  const stageColumns = useMemo(() => {
    if (!program) return [];
    return program.stages.map((stage) => {
      const stageProjects = projects.filter(
        (p) => p.status === "ACTIVE" && p.currentStageId === stage.id
      );
      return { stage, projects: stageProjects };
    });
  }, [program, projects]);

  if (!program) {
    return <div className="p-6 text-slate-500">No programs found.</div>;
  }

  return (
    <div className="p-6 page-enter">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pipeline Board</h1>
          <p className="text-sm text-slate-500 mt-0.5">{program.name}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"/>&lt;50% SLA</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"/>50–100% SLA</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"/>&gt;SLA</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stageColumns.map(({ stage, projects: stageProjects }) => (
          <div key={stage.id} className="flex-shrink-0 w-64">
            {/* Column header */}
            <div
              className="px-3 py-2.5 rounded-t-lg mb-2 flex items-center justify-between"
              style={{ background: stage.color + "20", borderBottom: `3px solid ${stage.color}` }}
            >
              <span className="text-sm font-semibold text-slate-700">{stage.name}</span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: stage.color }}
              >
                {stageProjects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {stageProjects.map((p) => {
                const ps = p.stages.find((s) => s.stageId === stage.id);
                const days = daysInStage(ps?.enteredAt);
                const tlClass = trafficLightClass(days, stage.slaDays);

                return (
                  <a
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="block bg-white rounded-lg border border-slate-200 p-3.5 hover:border-indigo-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <div className={cn("w-2 h-2 rounded-full mt-1 flex-shrink-0", tlClass)} />
                      <p className="text-sm font-medium text-slate-800 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-3">
                        {p.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400 truncate">{p.executorOrg?.shortName ?? "—"}</span>
                      <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded", tlClass.replace("bg-", "text-").replace("-500", "-700").replace("-400", "-700"), "bg-opacity-10")}>
                        {days}d
                      </span>
                    </div>
                    {p.sector && (
                      <div className="mt-1.5 text-xs text-slate-400">{p.sector}</div>
                    )}
                  </a>
                );
              })}

              {stageProjects.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-300 border-2 border-dashed border-slate-100 rounded-lg">
                  No projects
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

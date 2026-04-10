"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  GanttChartSquare,
  BookOpen,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  X,
} from "lucide-react";

type OverdueProject = {
  id: string;
  name: string;
  deadline: string;
  executorOrg: { shortName: string | null } | null;
};

function ManzaraIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="9" height="9" rx="2" fill="white" opacity="0.95" />
      <rect x="12" y="1.5" width="6.5" height="4" rx="1.5" fill="white" opacity="0.55" />
      <rect x="12" y="7" width="6.5" height="3.5" rx="1.5" fill="white" opacity="0.35" />
      <rect x="1.5" y="12" width="7.5" height="6.5" rx="1.5" fill="white" opacity="0.45" />
      <rect x="10.5" y="12" width="8" height="6.5" rx="1.5" fill="white" opacity="0.25" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const [overdueProjects, setOverdueProjects] = useState<OverdueProject[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch overdue count on mount
  useEffect(() => {
    fetch("/api/overdue")
      .then((r) => r.json())
      .then((data) => setOverdueProjects(data.projects ?? []))
      .catch(() => {});
  }, []);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    }
    if (showPanel) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPanel]);

  const overdueCount = overdueProjects.length;

  const nav = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/projects", label: t.nav.projects, icon: FolderKanban },
    { href: "/board", label: t.nav.board, icon: Kanban },
    { href: "/gantt", label: t.nav.gantt, icon: GanttChartSquare },
    { href: "/workspace", label: t.nav.workspace, icon: BookOpen },
  ];

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-full relative"
      style={{ background: "var(--sidebar)" }}
    >
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#312e81]">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-900/40">
            <ManzaraIcon size={20} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-semibold text-[15px] tracking-tight">
              Manzara
            </span>
            <span className="text-indigo-300 text-[10px] font-medium tracking-wide mt-0.5">
              AI Center
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium group",
                active ? "text-white" : "text-indigo-200 hover:text-white"
              )}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[#312e81] rounded-lg"
                  style={{ zIndex: 0 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              {!active && (
                <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-[#2d2b70] transition-opacity" />
              )}
              <span className="relative z-10 flex items-center gap-2.5 w-full">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <motion.span
                  className="flex-1"
                  whileHover={{ x: 2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {label}
                </motion.span>
                {active && <ChevronRight className="w-3 h-3 opacity-50" />}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-[#312e81] space-y-0.5">
        {/* Notification bell */}
        <div ref={panelRef} className="relative">
          <button
            onClick={() => setShowPanel((v) => !v)}
            className="w-full relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-300 hover:text-white group cursor-pointer"
          >
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-[#2d2b70] transition-opacity" />
            <span className="relative z-10 flex items-center gap-2.5 w-full">
              <span className="relative flex-shrink-0">
                <Bell className="w-4 h-4" />
                {overdueCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                    {overdueCount > 99 ? "99+" : overdueCount}
                  </span>
                )}
              </span>
              <motion.span
                className="flex-1 text-left"
                whileHover={{ x: 2 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                {t.board.overdueProjects}
              </motion.span>
            </span>
          </button>

          {/* Overdue panel — pops above the bell button */}
          <AnimatePresence>
            {showPanel && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
                style={{ maxHeight: 320 }}
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-700">{t.board.overdueProjects}</span>
                  <div className="flex items-center gap-2">
                    {overdueCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        {overdueCount}
                      </span>
                    )}
                    <button
                      onClick={() => setShowPanel(false)}
                      className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Project list */}
                <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                  {overdueCount === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">{t.board.noOverdue}</p>
                  ) : (
                    overdueProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { setShowPanel(false); router.push(`/projects/${p.id}`); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors cursor-pointer"
                      >
                        <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug">{p.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-red-500 font-medium">
                            {new Date(p.deadline).toLocaleDateString()}
                          </span>
                          {p.executorOrg?.shortName && (
                            <span className="text-[10px] text-slate-400">· {p.executorOrg.shortName}</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium group",
            pathname === "/settings" ? "text-white" : "text-indigo-300 hover:text-white"
          )}
        >
          {pathname === "/settings" && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-[#312e81] rounded-lg"
              style={{ zIndex: 0 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          {pathname !== "/settings" && (
            <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-[#2d2b70] transition-opacity" />
          )}
          <span className="relative z-10 flex items-center gap-2.5 w-full">
            <Settings className="w-4 h-4 flex-shrink-0" />
            <motion.span
              className="flex-1"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {t.nav.settings}
            </motion.span>
          </span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-300 hover:text-white group cursor-pointer"
        >
          <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-[#2d2b70] transition-opacity" />
          <span className="relative z-10 flex items-center gap-2.5 w-full">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <motion.span
              className="flex-1 text-left"
              whileHover={{ x: 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              {t.nav.signOut}
            </motion.span>
          </span>
        </button>
      </div>
    </aside>
  );
}

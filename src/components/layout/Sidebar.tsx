"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/board", label: "Pipeline Board", icon: Kanban },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full" style={{ background: "var(--sidebar)" }}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#312e81]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="1.5" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.9"/>
              <rect x="10" y="1.5" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="1.5" y="10" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="10" y="10" width="6.5" height="6.5" rx="1.5" fill="white" opacity="0.3"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">Manzara</span>
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
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? "bg-[#312e81] text-white"
                  : "text-indigo-200 hover:bg-[#2d2b70] hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-[#312e81] space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-300 hover:bg-[#2d2b70] hover:text-white transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-300 hover:bg-[#2d2b70] hover:text-white transition-all">
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function daysInStage(enteredAt: Date | null | undefined): number {
  if (!enteredAt) return 0;
  return differenceInDays(new Date(), new Date(enteredAt));
}

export function stageTrafficLight(days: number, slaDays: number): "green" | "yellow" | "red" {
  const ratio = days / slaDays;
  if (ratio < 0.5) return "green";
  if (ratio < 1) return "yellow";
  return "red";
}

export function trafficLightClass(days: number, slaDays: number) {
  const c = stageTrafficLight(days, slaDays);
  return {
    green: "bg-emerald-500",
    yellow: "bg-amber-400",
    red: "bg-red-500",
  }[c];
}

export function stageBadgeClass(days: number, slaDays: number) {
  const c = stageTrafficLight(days, slaDays);
  return {
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    yellow: "bg-amber-100 text-amber-800 border-amber-200",
    red: "bg-red-100 text-red-800 border-red-200",
  }[c];
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function relativeDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    ON_HOLD: "On Hold",
    NOT_STARTED: "Not started",
    IN_PROGRESS: "In progress",
    RETURNED: "Returned for rework",
    SKIPPED: "Skipped",
  };
  return map[status] ?? status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "text-blue-600 bg-blue-50 border-blue-200",
    COMPLETED: "text-emerald-600 bg-emerald-50 border-emerald-200",
    CANCELLED: "text-slate-500 bg-slate-50 border-slate-200",
    ON_HOLD: "text-amber-600 bg-amber-50 border-amber-200",
    IN_PROGRESS: "text-indigo-600 bg-indigo-50 border-indigo-200",
    RETURNED: "text-red-600 bg-red-50 border-red-200",
    SKIPPED: "text-slate-400 bg-slate-50 border-slate-100",
  };
  return map[status] ?? "text-slate-600 bg-slate-50 border-slate-200";
}

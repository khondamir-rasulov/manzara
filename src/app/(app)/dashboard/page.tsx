import { getDashboardStats, getProjects } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, projects] = await Promise.all([
    getDashboardStats(),
    getProjects(),
  ]);

  return <DashboardClient stats={stats} projects={projects} />;
}

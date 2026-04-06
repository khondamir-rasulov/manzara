import { getProjects } from "@/lib/data";
import { GanttClient } from "./GanttClient";

export const dynamic = "force-dynamic";

export default async function GanttPage() {
  const projects = await getProjects();
  return <GanttClient projects={projects} />;
}

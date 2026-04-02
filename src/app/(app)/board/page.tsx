import { getProjects, getPrograms } from "@/lib/data";
import { BoardClient } from "./BoardClient";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [projects, programs] = await Promise.all([getProjects(), getPrograms()]);
  return <BoardClient projects={projects} programs={programs} />;
}

import { getProjects, getPrograms, getOrgs } from "@/lib/data";
import { BoardClient } from "./BoardClient";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [projects, programs, orgs] = await Promise.all([getProjects(), getPrograms(), getOrgs()]);
  return <BoardClient projects={projects} programs={programs} orgs={orgs} />;
}

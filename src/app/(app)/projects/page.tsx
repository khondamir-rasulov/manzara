import { getProjects, getOrgs, getPrograms } from "@/lib/data";
import { auth } from "@/lib/auth";
import { ProjectsClient } from "./ProjectsClient";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, orgs, programs, session] = await Promise.all([
    getProjects(),
    getOrgs(),
    getPrograms(),
    auth(),
  ]);

  const userRole = (session?.user as any)?.role ?? "VIEWER";
  const defaultProgramId = programs[0]?.id ?? "";

  return (
    <ProjectsClient
      projects={projects}
      orgs={orgs}
      defaultProgramId={defaultProgramId}
      userRole={userRole}
    />
  );
}

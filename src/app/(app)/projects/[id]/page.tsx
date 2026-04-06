import { notFound } from "next/navigation";
import { getProject, getComments, getOrgs, getPrograms } from "@/lib/data";
import { auth } from "@/lib/auth";
import { ProjectDetailClient } from "./ProjectDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;

  const [project, comments, orgs, programs, session] = await Promise.all([
    getProject(id),
    getComments(id),
    getOrgs(),
    getPrograms(),
    auth(),
  ]);

  if (!project) notFound();

  const userRole = (session?.user as any)?.role ?? "VIEWER";
  const userId = session?.user?.id ?? "";
  const userName = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <ProjectDetailClient
      project={project}
      initialComments={comments}
      orgs={orgs}
      defaultProgramId={project.programId}
      userId={userId}
      userRole={userRole}
      userName={userName}
    />
  );
}

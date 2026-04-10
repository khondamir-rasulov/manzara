import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaceDocs, WORKSPACE_FOLDERS } from "@/lib/workspace-data";
import { WorkspaceClient } from "./WorkspaceClient";

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const docs = getWorkspaceDocs();
  const userRole = (session.user as any).role as string;

  return (
    <WorkspaceClient
      folders={WORKSPACE_FOLDERS}
      docs={docs}
      userRole={userRole}
    />
  );
}

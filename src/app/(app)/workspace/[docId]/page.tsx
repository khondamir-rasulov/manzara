import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getWorkspaceDoc } from "@/lib/workspace-data";
import { DocClient } from "./DocClient";

export default async function DocPage({ params }: { params: Promise<{ docId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { docId } = await params;
  const doc = getWorkspaceDoc(docId);
  if (!doc) notFound();

  const userRole = (session.user as any).role as string;

  return <DocClient doc={doc} userRole={userRole} />;
}

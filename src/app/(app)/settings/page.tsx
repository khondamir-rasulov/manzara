import { auth } from "@/lib/auth";
import { getPrograms } from "@/lib/data";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [session, programs] = await Promise.all([auth(), getPrograms()]);
  return <SettingsClient session={session} programs={programs} />;
}

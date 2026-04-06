import { NextResponse } from "next/server";

// Demo mode — project creation is disabled
export async function POST() {
  return NextResponse.json(
    { error: "Demo mode: project creation is disabled" },
    { status: 403 }
  );
}

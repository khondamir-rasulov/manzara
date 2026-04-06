import { NextResponse } from "next/server";

// Demo mode — project mutations are disabled
export async function PATCH() {
  return NextResponse.json(
    { error: "Demo mode: editing is disabled" },
    { status: 403 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Demo mode: deletion is disabled" },
    { status: 403 }
  );
}

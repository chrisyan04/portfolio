import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/admin-auth";

export function GET() {
  return NextResponse.json({ authenticated: hasValidSession() });
}

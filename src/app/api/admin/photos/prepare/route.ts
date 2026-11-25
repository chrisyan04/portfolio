import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/admin-auth";
import { prepareStagedPhoto } from "@/lib/portfolio-photo-staging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  let details: { name?: unknown; type?: unknown; size?: unknown };
  try { details = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid upload request." }, { status: 400 }); }
  if (typeof details.name !== "string" || typeof details.type !== "string" || typeof details.size !== "number") {
    return NextResponse.json({ error: "Invalid photo details." }, { status: 400 });
  }
  try {
    const prepared = await prepareStagedPhoto(details.name, details.type, details.size);
    return NextResponse.json(prepared, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not prepare photo upload", error);
    return NextResponse.json({ error: error instanceof Error && /^(Choose|Invalid)/.test(error.message) ? error.message : "Could not prepare photo upload." }, { status: 400 });
  }
}

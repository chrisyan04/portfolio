import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/admin-auth";

export function POST() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookie.name, "", { httpOnly: true, expires: new Date(0), path: "/" });
  return response;
}

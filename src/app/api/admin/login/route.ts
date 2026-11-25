import { NextResponse } from "next/server";
import { adminCookie, createSession, isValidPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (typeof password !== "string" || !isValidPassword(password)) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(adminCookie.name, createSession(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: adminCookie.maxAge, path: "/" });
  return response;
}

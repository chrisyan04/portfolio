import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "chris-admin-session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function password() {
  const value = process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD is not configured");
  return value;
}

function signature(payload: string) {
  return createHmac("sha256", password()).update(payload).digest("base64url");
}

export function isValidPassword(candidate: string) {
  const expected = Buffer.from(password());
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSession() {
  const payload = `${Date.now()}:${Date.now() + SESSION_TTL_SECONDS * 1000}`;
  return `${Buffer.from(payload).toString("base64url")}.${signature(payload)}`;
}

export function hasValidSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return false;
  const [encodedPayload, tokenSignature] = token.split(".");
  if (!encodedPayload || !tokenSignature) return false;
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
  const [, expiresAt] = payload.split(":");
  if (!expiresAt || Number(expiresAt) < Date.now()) return false;
  const expected = Buffer.from(signature(payload));
  const actual = Buffer.from(tokenSignature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const adminCookie = { name: COOKIE_NAME, maxAge: SESSION_TTL_SECONDS };

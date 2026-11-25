import { randomUUID } from "node:crypto";
import { MAX_SOURCE_BYTES, photoFormat } from "@/lib/portfolio-photo-format";

const STAGING_BUCKET = "portfolio-photo-staging";
const STAGED_PATH = /^[a-f0-9-]{36}\.(?:heic|heif|jpg|jpeg|png|webp)$/;

function config() {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) throw new Error("Shared storage is not configured");
  return { base, headers: { apikey: key, Authorization: `Bearer ${key}` } };
}

async function ensureStagingBucket() {
  const { base, headers } = config();
  const existing = await fetch(`${base}/storage/v1/bucket/${STAGING_BUCKET}`, { headers, cache: "no-store" });
  if (existing.ok) return;
  const error = await existing.json().catch(() => ({}));
  if (error.code !== "NoSuchBucket") throw new Error(`Staging bucket lookup failed: ${existing.status}`);
  const created = await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ id: STAGING_BUCKET, name: STAGING_BUCKET, public: false, file_size_limit: MAX_SOURCE_BYTES }),
  });
  if (!created.ok && created.status !== 409) throw new Error(`Staging bucket creation failed: ${created.status}`);
}

export async function prepareStagedPhoto(name: string, type: string, size: number) {
  const { extension, contentType } = photoFormat(name, type, size);
  await ensureStagingBucket();
  const path = `${randomUUID()}.${extension}`;
  const { base, headers } = config();
  const response = await fetch(`${base}/storage/v1/object/upload/sign/${STAGING_BUCKET}/${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`Could not prepare photo upload: ${response.status}`);
  const signed = await response.json();
  if (typeof signed.token !== "string") throw new Error("Storage did not return an upload token");
  const uploadUrl = `${base}/storage/v1/object/upload/sign/${STAGING_BUCKET}/${path}?token=${encodeURIComponent(signed.token)}`;
  return { path, uploadUrl, contentType };
}

export async function readStagedPhoto(path: string) {
  if (!STAGED_PATH.test(path)) throw new Error("Invalid photo upload path");
  const { base, headers } = config();
  const response = await fetch(`${base}/storage/v1/object/authenticated/${STAGING_BUCKET}/${path}`, { headers, cache: "no-store" });
  if (!response.ok) throw new Error(`Could not read uploaded photo: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = photoFormat(path, "", bytes.length).contentType;
  return new File([bytes], path, { type: contentType });
}

export async function deleteStagedPhoto(path: string) {
  if (!STAGED_PATH.test(path)) return;
  const { base, headers } = config();
  const response = await fetch(`${base}/storage/v1/object/${STAGING_BUCKET}/${path}`, { method: "DELETE", headers });
  if (!response.ok && response.status !== 404) throw new Error(`Could not clean up staged photo: ${response.status}`);
}

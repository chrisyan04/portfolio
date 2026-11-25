import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { PHOTO_BUCKET, managedPhotoPath, photoPublicUrl } from "@/lib/portfolio-photo-urls";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_STORED_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function storageConfig() {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!base || !key) throw new Error("Shared storage is not configured");
  return { base, headers: { apikey: key, Authorization: `Bearer ${key}` } };
}

async function ensurePhotoBucket() {
  const { base, headers } = storageConfig();
  const existing = await fetch(`${base}/storage/v1/bucket/${PHOTO_BUCKET}`, { headers, cache: "no-store" });
  if (existing.ok) return;
  const lookupError = await existing.json().catch(() => ({}));
  if (lookupError.code !== "NoSuchBucket") throw new Error(`Bucket lookup failed: ${existing.status}`);

  const created = await fetch(`${base}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ id: PHOTO_BUCKET, name: PHOTO_BUCKET, public: true, allowed_mime_types: ["image/webp"], file_size_limit: MAX_STORED_BYTES }),
  });
  if (!created.ok) throw new Error(`Bucket creation failed: ${created.status}`);
}

export async function uploadPortfolioPhoto(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error("Choose a JPG, PNG, or WebP image.");
  if (!file.size || file.size > MAX_SOURCE_BYTES) throw new Error("Choose an image under 10 MB.");

  let image: Buffer;
  try {
    image = await sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();
  } catch {
    throw new Error("The image could not be processed.");
  }
  if (image.length > MAX_STORED_BYTES) throw new Error("The processed image is too large.");

  await ensurePhotoBucket();
  const path = `${randomUUID()}.webp`;
  const { base, headers } = storageConfig();
  const response = await fetch(`${base}/storage/v1/object/${PHOTO_BUCKET}/${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "image/webp", "Cache-Control": "31536000" },
    body: new Uint8Array(image),
  });
  if (!response.ok) throw new Error(`Photo upload failed: ${response.status}`);
  return photoPublicUrl(path);
}

export async function deletePortfolioPhoto(src: string) {
  const path = managedPhotoPath(src);
  if (!path) return;
  const { base, headers } = storageConfig();
  const response = await fetch(`${base}/storage/v1/object/${PHOTO_BUCKET}/${path}`, { method: "DELETE", headers });
  if (!response.ok && response.status !== 404) throw new Error(`Photo deletion failed: ${response.status}`);
}

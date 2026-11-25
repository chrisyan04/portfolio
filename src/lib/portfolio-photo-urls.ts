export const PHOTO_BUCKET = "portfolio-photos";

export function managedPhotoPath(src: string) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const prefix = `${base}/storage/v1/object/public/${PHOTO_BUCKET}/`;
  if (!src.startsWith(prefix)) return null;
  const path = src.slice(prefix.length);
  return /^[a-f0-9-]{36}\.webp$/.test(path) ? path : null;
}

export function photoPublicUrl(path: string) {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!base) throw new Error("Supabase is not configured");
  return `${base}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

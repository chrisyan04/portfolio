export const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

const PHOTO_TYPES: Record<string, string> = {
  heic: "image/heic",
  heif: "image/heif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const HEIC_TYPES = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence", "image/x-heic", "image/x-heif"]);

export function photoFormat(name: string, type: string, size: number) {
  const extension = name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = PHOTO_TYPES[extension];
  const reportedType = type.toLowerCase();
  const compatible = !reportedType || reportedType === "application/octet-stream" || reportedType === contentType ||
    (contentType === "image/heic" || contentType === "image/heif" ? HEIC_TYPES.has(reportedType) : reportedType === "image/jpg" && contentType === "image/jpeg");
  if (!contentType || !compatible) throw new Error("Choose a HEIC, JPG, PNG, or WebP image.");
  if (!Number.isFinite(size) || size <= 0 || size > MAX_SOURCE_BYTES) throw new Error("Choose an image under 10 MB.");
  return { extension, contentType, heic: extension === "heic" || extension === "heif" };
}

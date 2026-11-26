import { CountryShape } from "@/lib/world-countries";

const viewBoxes = new Map<string, string>();

export function placeViewBox([code, , , , path]: CountryShape) {
  const cached = viewBoxes.get(code);
  if (cached) return cached;

  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let index = 0; index < values.length; index += 2) {
    minX = Math.min(minX, values[index]);
    maxX = Math.max(maxX, values[index]);
    minY = Math.min(minY, values[index + 1]);
    maxY = Math.max(maxY, values[index + 1]);
  }
  const width = Math.max(1, maxX - minX);
  const height = Math.max(1, maxY - minY);
  const padding = Math.max(width, height) * 0.12;
  const viewBox = `${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`;
  viewBoxes.set(code, viewBox);
  return viewBox;
}

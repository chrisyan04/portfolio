import { PortfolioData } from "@/lib/portfolio";

const isText = (value: unknown): value is string => typeof value === "string" && value.length <= 10000;
const isShortText = (value: unknown): value is string => isText(value) && value.length <= 500;
const isTags = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 20 && value.every(isShortText);

export function isPortfolioData(value: unknown): value is PortfolioData {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  if (!["name", "role", "location", "email", "availability"].every((key) => isShortText(data[key])) || !isText(data.bio)) return false;
  if (!Array.isArray(data.stats) || data.stats.length > 30 || !data.stats.every((item) => item && isShortText(item.value) && isShortText(item.label))) return false;
  if (!Array.isArray(data.experience) || data.experience.length > 100 || !data.experience.every((item) => item && isShortText(item.period) && isShortText(item.title) && isShortText(item.company) && isText(item.description) && isTags(item.tags))) return false;
  if (!Array.isArray(data.projects) || data.projects.length > 100 || !data.projects.every((item) => item && isShortText(item.title) && isText(item.description) && isTags(item.tags) && isShortText(item.url) && (!item.url || item.url === "#" || /^https?:\/\//i.test(item.url)))) return false;
  return true;
}

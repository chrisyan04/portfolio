import type { Language, PortfolioData } from "@/lib/portfolio";

type Experience = PortfolioData["experience"][number];

function parsePeriod(period: string) {
  const years = period.match(/\b(?:19|20)\d{2}\b/g)?.map(Number) ?? [];
  const ongoing = /\b(now|present|current|ongoing)\b|présent|actuel|至今|现在/i.test(period);
  return { start: years[0] ?? 0, end: ongoing ? Infinity : years[1] ?? years[0] ?? 0, ongoing, hasRange: years.length > 1 || ongoing };
}

export function sortExperience(items: Experience[]) {
  return [...items].sort((a, b) => {
    const first = parsePeriod(a.period);
    const second = parsePeriod(b.period);
    return Number(second.ongoing) - Number(first.ongoing) || second.end - first.end || second.start - first.start;
  });
}

export function formatExperiencePeriod(period: string, language: Language) {
  const { start, end, ongoing, hasRange } = parsePeriod(period);
  if (!start || !hasRange) return period;
  const now = { en: "now", fr: "présent", zh: "至今" }[language];
  return `${start} — ${ongoing ? now : end}`;
}

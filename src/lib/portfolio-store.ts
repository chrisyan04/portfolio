import { defaultPortfolio } from "@/lib/portfolio";
import { isPortfolioData } from "@/lib/portfolio-validation";

export function portfolioDatabase() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return { url: `${url.replace(/\/$/, "")}/rest/v1/portfolio_content`, publishableKey };
}

export async function readPublishedPortfolio() {
  const database = portfolioDatabase();
  if (!database) return { data: defaultPortfolio, configured: false };
  const response = await fetch(`${database.url}?id=eq.main&select=content`, {
    headers: { apikey: database.publishableKey },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Database read failed: ${response.status}`);
  const rows = await response.json();
  const content = rows[0]?.content;
  return { data: isPortfolioData(content) ? content : defaultPortfolio, configured: true };
}

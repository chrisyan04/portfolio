import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/admin-auth";
import { isPortfolioData } from "@/lib/portfolio-validation";
import { portfolioDatabase, readPublishedPortfolio, writePublishedPortfolio } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readPublishedPortfolio(), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load portfolio content", error);
    return NextResponse.json({ error: "Portfolio content is temporarily unavailable." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  const database = portfolioDatabase();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!database || !secretKey) return NextResponse.json({ error: "Shared storage is not configured." }, { status: 503 });

  let data: unknown;
  try { data = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!isPortfolioData(data)) return NextResponse.json({ error: "Some portfolio fields are invalid or too long." }, { status: 400 });

  try {
    const current = await readPublishedPortfolio();
    const published = { ...data, photos: data.photos ?? current.data.photos };
    await writePublishedPortfolio(published);
    return NextResponse.json({ data: published });
  } catch (error) {
    console.error("Could not save portfolio content", error);
    return NextResponse.json({ error: "Could not publish changes. Please try again." }, { status: 503 });
  }
}

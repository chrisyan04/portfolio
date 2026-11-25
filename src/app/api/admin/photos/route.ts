import { NextResponse } from "next/server";
import { hasValidSession } from "@/lib/admin-auth";
import { getPortfolioPhotos } from "@/lib/portfolio";
import { readPublishedPortfolio, writePublishedPortfolio } from "@/lib/portfolio-store";
import { deletePortfolioPhoto, uploadPortfolioPhoto } from "@/lib/portfolio-photo-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  let file: FormDataEntryValue | null;
  try { file = (await request.formData()).get("file"); }
  catch { return NextResponse.json({ error: "Invalid upload." }, { status: 400 }); }
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });

  let src: string | null = null;
  try {
    const current = await readPublishedPortfolio();
    const photos = getPortfolioPhotos(current.data);
    if (photos.length >= 30) return NextResponse.json({ error: "The gallery can hold up to 30 photos." }, { status: 400 });
    src = await uploadPortfolioPhoto(file);
    const data = { ...current.data, photos: [...photos, src] };
    await writePublishedPortfolio(data);
    return NextResponse.json({ data, src }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (src) await deletePortfolioPhoto(src).catch((cleanupError) => console.error("Could not clean up photo", cleanupError));
    console.error("Could not upload portfolio photo", error);
    return NextResponse.json({ error: error instanceof Error && !/failed|configured/i.test(error.message) ? error.message : "Could not upload photo. Please try again." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!hasValidSession()) return NextResponse.json({ error: "Admin access required." }, { status: 401 });
  let index: unknown;
  try { ({ index } = await request.json()); }
  catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  try {
    const current = await readPublishedPortfolio();
    const photos = getPortfolioPhotos(current.data);
    if (!Number.isInteger(index) || (index as number) < 0 || (index as number) >= photos.length) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
    const removed = photos[index as number];
    const nextPhotos = photos.filter((_, position) => position !== index);
    const data = { ...current.data, photos: nextPhotos };
    await writePublishedPortfolio(data);
    if (!nextPhotos.includes(removed)) await deletePortfolioPhoto(removed).catch((error) => console.error("Could not delete photo file", error));
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not remove portfolio photo", error);
    return NextResponse.json({ error: "Could not remove photo. Please try again." }, { status: 503 });
  }
}

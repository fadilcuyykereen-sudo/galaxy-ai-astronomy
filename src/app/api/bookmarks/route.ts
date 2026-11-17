import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = (await req.json()) as { slug?: string };
    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json({ error: "Slug wajib diisi." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(bookmarks)
      .where(eq(bookmarks.celestialSlug, slug));

    let bookmarked = false;
    if (existing.length > 0) {
      await db.delete(bookmarks).where(eq(bookmarks.celestialSlug, slug));
      bookmarked = false;
    } else {
      await db.insert(bookmarks).values({ celestialSlug: slug });
      bookmarked = true;
    }

    const all = await db.select().from(bookmarks);
    return NextResponse.json({
      bookmarked,
      bookmarkedSlugs: all.map((b) => b.celestialSlug),
    });
  } catch (error) {
    console.error("POST /api/bookmarks error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui bookmark." },
      { status: 500 }
    );
  }
}

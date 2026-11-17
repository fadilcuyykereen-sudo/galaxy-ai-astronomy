import { NextResponse } from "next/server";
import { db } from "@/db";
import { celestialBodies, bookmarks } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { asc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const bodies = category
      ? await db
          .select()
          .from(celestialBodies)
          .where(eq(celestialBodies.category, category))
          .orderBy(asc(celestialBodies.sortOrder))
      : await db
          .select()
          .from(celestialBodies)
          .orderBy(asc(celestialBodies.sortOrder));

    const saved = await db.select().from(bookmarks);
    const bookmarkedSlugs = saved.map((b) => b.celestialSlug);

    return NextResponse.json({ bodies, bookmarkedSlugs });
  } catch (error) {
    console.error("GET /api/celestial error:", error);
    return NextResponse.json(
      { error: "Gagal memuat katalog benda langit." },
      { status: 500 }
    );
  }
}

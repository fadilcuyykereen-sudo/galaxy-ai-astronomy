import { NextResponse } from "next/server";
import { db } from "@/db";
import { generatedImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unlink } from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), ".data", "generated");

export async function PATCH(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const imageId = Number(id);
    if (!Number.isInteger(imageId) || imageId <= 0) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, imageId));

    if (existing.length === 0) {
      return NextResponse.json({ error: "Gambar tidak ditemukan." }, { status: 404 });
    }

    const [updated] = await db
      .update(generatedImages)
      .set({ isFavorite: !existing[0].isFavorite })
      .where(eq(generatedImages.id, imageId))
      .returning();

    return NextResponse.json({ image: updated });
  } catch (error) {
    console.error("PATCH /api/images/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui favorit." }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const imageId = Number(id);
    if (!Number.isInteger(imageId) || imageId <= 0) {
      return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, imageId));

    if (existing.length > 0) {
      const url = existing[0].imageUrl;
      const prefix = "/api/images/file/";
      if (url.startsWith(prefix)) {
        const safeName = path.basename(url.slice(prefix.length));
        await unlink(path.join(STORAGE_DIR, safeName)).catch(() => {});
      }
      await db.delete(generatedImages).where(eq(generatedImages.id, imageId));
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/images/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus gambar." }, { status: 500 });
  }
}

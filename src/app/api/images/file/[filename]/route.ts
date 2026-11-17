import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), ".data", "generated");

export async function GET(
  _req: Request,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeName = path.basename(filename);
    if (!/^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp)$/.test(safeName)) {
      return new NextResponse("Nama file tidak valid", { status: 400 });
    }

    const buffer = await readFile(path.join(STORAGE_DIR, safeName));
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Gambar tidak ditemukan", { status: 404 });
  }
}

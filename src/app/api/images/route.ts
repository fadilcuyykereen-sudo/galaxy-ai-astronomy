import { NextResponse } from "next/server";
import { db } from "@/db";
import { generatedImages } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc, eq } from "drizzle-orm";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

const STORAGE_DIR = path.join(process.cwd(), ".data", "generated");

export async function GET(req: Request) {
  try {
    await ensureSeeded();
    const { searchParams } = new URL(req.url);
    const onlyFav = searchParams.get("favorites") === "true";

    const items = onlyFav
      ? await db
          .select()
          .from(generatedImages)
          .where(eq(generatedImages.isFavorite, true))
          .orderBy(desc(generatedImages.id))
      : await db
          .select()
          .from(generatedImages)
          .orderBy(desc(generatedImages.id));

    return NextResponse.json({
      images: items,
      totalCount: items.length,
      unlimited: true,
    });
  } catch (error) {
    console.error("GET /api/images error:", error);
    return NextResponse.json(
      { error: "Gagal memuat galeri gambar." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = (await req.json()) as {
      prompt?: string;
      enhancedPrompt?: string;
      style?: string;
      aspectRatio?: string;
      seed?: number;
      imageDataUrl?: string;
    };

    const prompt = body.prompt?.trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Deskripsi gambar tidak boleh kosong." },
        { status: 400 }
      );
    }

    const style = body.style?.trim() || "Fotorealistik JWST";
    const aspectRatio = body.aspectRatio?.trim() || "1:1";
    const seed =
      typeof body.seed === "number" && Number.isFinite(body.seed)
        ? Math.floor(Math.abs(body.seed)) % 9999999
        : Math.floor(100000 + Math.random() * 899999);
    const enhancedPrompt = body.enhancedPrompt?.trim() || prompt;

    await mkdir(STORAGE_DIR, { recursive: true });
    const filename = `galaxy-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.png`;
    const filePath = path.join(STORAGE_DIR, filename);

    let savedFromApi = false;

    // Optional automatic upgrade if OPENAI_API_KEY is configured in environment
    if (process.env.OPENAI_API_KEY) {
      try {
        const size =
          aspectRatio === "16:9"
            ? "1792x1024"
            : aspectRatio === "9:16"
            ? "1024x1792"
            : "1024x1024";
        const aiRes = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size,
            response_format: "b64_json",
          }),
        });
        if (aiRes.ok) {
          const json = (await aiRes.json()) as {
            data?: Array<{ b64_json?: string }>;
          };
          const b64 = json.data?.[0]?.b64_json;
          if (b64) {
            await writeFile(filePath, Buffer.from(b64, "base64"));
            savedFromApi = true;
          }
        }
      } catch {
        // Fallback smoothly to uploaded high-res synthesized PNG
      }
    }

    if (!savedFromApi) {
      const dataUrl = body.imageDataUrl || "";
      const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);
      if (!match) {
        return NextResponse.json(
          { error: "Data gambar tidak valid." },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(match[2], "base64");
      await writeFile(filePath, buffer);
    }

    const imageUrl = `/api/images/file/${filename}`;

    const [created] = await db
      .insert(generatedImages)
      .values({
        prompt,
        enhancedPrompt,
        style,
        aspectRatio,
        seed,
        imageUrl,
        isFavorite: false,
      })
      .returning();

    return NextResponse.json({ image: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/images error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan gambar hasil generate." },
      { status: 500 }
    );
  }
}

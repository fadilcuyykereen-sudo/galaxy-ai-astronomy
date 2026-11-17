import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    await ensureSeeded();
    const sessions = await db
      .select()
      .from(chatSessions)
      .orderBy(desc(chatSessions.updatedAt));
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("GET /api/chat/sessions error:", error);
    return NextResponse.json(
      { error: "Gagal memuat daftar percakapan." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = (await req.json().catch(() => ({}))) as { title?: string };
    const title = body.title?.trim() || "Percakapan Astronomi Baru";

    const [session] = await db
      .insert(chatSessions)
      .values({ title })
      .returning();

    if (session) {
      await db.insert(chatMessages).values({
        sessionId: session.id,
        role: "assistant",
        topic: "Galaxy AI",
        content:
          "Sesi observasi baru siap! Tanyakan apa saja tentang **astronomi, planet, rotasi Bumi, lubang hitam, bintang, eksoplanet,** atau **galaksi** tanpa batas.",
        suggestions: [
          "Bagaimana cara Bumi berotasi dan mengapa ada zona waktu?",
          "Bandingkan Bima Sakti dan Galaksi Andromeda",
          "Berapa berat badan 65 kg di Mars dan Jupiter?",
          "Jelaskan proses terbentuknya lubang hitam",
        ],
      });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/chat/sessions error:", error);
    return NextResponse.json(
      { error: "Gagal membuat percakapan baru." },
      { status: 500 }
    );
  }
}

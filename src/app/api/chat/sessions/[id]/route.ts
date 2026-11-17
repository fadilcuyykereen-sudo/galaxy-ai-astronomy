import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { asc, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSeeded();
    const { id } = await context.params;
    const sessionId = Number(id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json({ error: "ID sesi tidak valid." }, { status: 400 });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.id));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("GET /api/chat/sessions/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memuat pesan percakapan." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sessionId = Number(id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return NextResponse.json({ error: "ID sesi tidak valid." }, { status: 400 });
    }

    await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/chat/sessions/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus percakapan." },
      { status: 500 }
    );
  }
}

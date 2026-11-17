import { NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { generateAstronomyReply } from "@/lib/galaxyAiEngine";
import { asc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    await ensureSeeded();
    const body = (await req.json()) as {
      sessionId?: number;
      message?: string;
    };

    const content = body.message?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "Pertanyaan tidak boleh kosong." },
        { status: 400 }
      );
    }

    let sessionId = body.sessionId;
    const shortTitle =
      content.length > 44 ? `${content.slice(0, 44).trim()}…` : content;

    if (!sessionId) {
      const [created] = await db
        .insert(chatSessions)
        .values({ title: shortTitle })
        .returning();
      sessionId = created.id;
    } else {
      // Verify session exists
      const existing = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.id, sessionId));
      if (existing.length === 0) {
        const [created] = await db
          .insert(chatSessions)
          .values({ title: shortTitle })
          .returning();
        sessionId = created.id;
      } else if (
        existing[0].title === "Percakapan Astronomi Baru" ||
        existing[0].title === "Eksplorasi Awal Alam Semesta"
      ) {
        await db
          .update(chatSessions)
          .set({ title: shortTitle, updatedAt: new Date() })
          .where(eq(chatSessions.id, sessionId));
      } else {
        await db
          .update(chatSessions)
          .set({ updatedAt: new Date() })
          .where(eq(chatSessions.id, sessionId));
      }
    }

    // Load recent conversation history for context awareness
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.id));

    const [userMsg] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role: "user",
        content,
      })
      .returning();

    const reply = await generateAstronomyReply(content, history);

    const [assistantMsg] = await db
      .insert(chatMessages)
      .values({
        sessionId,
        role: "assistant",
        content: reply.content,
        topic: reply.topic,
        suggestions: reply.suggestions,
      })
      .returning();

    return NextResponse.json({
      sessionId,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json(
      { error: "Terjadi kendala saat memproses pertanyaan AI." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { userPreferences } from "@/db/schema";
import { ensureSeeded } from "@/db/seed";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    await ensureSeeded();
    const prefs = await db.select().from(userPreferences).limit(1);
    return NextResponse.json({ preferences: prefs[0] ?? null });
  } catch (error) {
    console.error("GET /api/preferences error:", error);
    return NextResponse.json(
      { error: "Gagal memuat preferensi." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureSeeded();
    const body = (await req.json()) as {
      soundEnabled?: boolean;
      ambientEnabled?: boolean;
      defaultOrbitSpeed?: string;
      missionScore?: number;
    };

    const existing = await db.select().from(userPreferences).limit(1);
    if (existing.length === 0) {
      const [created] = await db
        .insert(userPreferences)
        .values({
          soundEnabled: body.soundEnabled ?? true,
          ambientEnabled: body.ambientEnabled ?? false,
          defaultOrbitSpeed: body.defaultOrbitSpeed ?? "1",
          missionScore: body.missionScore ?? 0,
        })
        .returning();
      return NextResponse.json({ preferences: created });
    }

    const current = existing[0];
    const [updated] = await db
      .update(userPreferences)
      .set({
        soundEnabled:
          typeof body.soundEnabled === "boolean"
            ? body.soundEnabled
            : current.soundEnabled,
        ambientEnabled:
          typeof body.ambientEnabled === "boolean"
            ? body.ambientEnabled
            : current.ambientEnabled,
        defaultOrbitSpeed:
          typeof body.defaultOrbitSpeed === "string"
            ? body.defaultOrbitSpeed
            : current.defaultOrbitSpeed,
        missionScore:
          typeof body.missionScore === "number"
            ? Math.max(0, Math.floor(body.missionScore))
            : current.missionScore,
        updatedAt: new Date(),
      })
      .where(eq(userPreferences.id, current.id))
      .returning();

    return NextResponse.json({ preferences: updated });
  } catch (error) {
    console.error("PATCH /api/preferences error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan preferensi." },
      { status: 500 }
    );
  }
}

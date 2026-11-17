import { db } from "./index";
import {
  celestialBodies,
  generatedImages,
  userPreferences,
  chatSessions,
  chatMessages,
} from "./schema";
import { CELESTIAL_SEED_DATA, SEEDED_GALLERY_ITEMS } from "@/lib/astronomyData";
import { count } from "drizzle-orm";

let seedPromise: Promise<void> | null = null;
let hasSeeded = false;

export async function ensureSeeded(): Promise<void> {
  if (hasSeeded) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      // 1. Seed celestial bodies (Solar System + 7 Galaxies)
      const [{ value: bodyCount }] = await db
        .select({ value: count() })
        .from(celestialBodies);

      if (bodyCount === 0) {
        await db
          .insert(celestialBodies)
          .values(CELESTIAL_SEED_DATA)
          .onConflictDoNothing();
      }

      // 2. Seed showcase cosmic gallery
      const [{ value: imgCount }] = await db
        .select({ value: count() })
        .from(generatedImages);

      if (imgCount === 0) {
        await db.insert(generatedImages).values(SEEDED_GALLERY_ITEMS);
      }

      // 3. Seed default user preferences
      const [{ value: prefCount }] = await db
        .select({ value: count() })
        .from(userPreferences);

      if (prefCount === 0) {
        await db.insert(userPreferences).values({
          soundEnabled: true,
          ambientEnabled: false,
          defaultOrbitSpeed: "1",
          missionScore: 0,
        });
      }

      // 4. Seed one welcome astronomy chat session so sidebar looks crisp and ready
      const [{ value: sessionCount }] = await db
        .select({ value: count() })
        .from(chatSessions);

      if (sessionCount === 0) {
        const [session] = await db
          .insert(chatSessions)
          .values({
            title: "Eksplorasi Awal Alam Semesta",
          })
          .returning();

        if (session) {
          await db.insert(chatMessages).values({
            sessionId: session.id,
            role: "assistant",
            topic: "Observatorium Galaxy AI",
            content:
              "Selamat datang di **Galaxy AI** — asisten astrofisika & observatorium kosmik interaktif Anda.\n\nAnda dapat bertanya **tanpa batas** seputar planet, rotasi Bumi, lubang hitam, evolusi bintang, eksoplanet, kosmologi Big Bang, hingga perbandingan galaksi seperti **Bima Sakti** dan **Andromeda**. Saya juga dapat menghitung berat Anda di planet lain atau mengonversi jarak tahun cahaya!\n\nSilakan pilih topik di bawah atau ketik pertanyaan astronomi apa pun.",
            suggestions: [
              "Bagaimana cara Bumi berotasi dan mengapa kita tidak merasakannya?",
              "Apa yang terjadi saat Bima Sakti dan Andromeda bertabrakan?",
              "Jelaskan lubang hitam supermasif dan dilatasi waktu",
              "Urutkan massa seluruh planet di Tata Surya dari yang terberat",
            ],
          });
        }
      }

      hasSeeded = true;
    } catch (err) {
      seedPromise = null;
      throw err;
    }
  })();

  return seedPromise;
}

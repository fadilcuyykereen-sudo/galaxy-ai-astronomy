"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareText,
  ImagePlus,
  Orbit,
  Disc3,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { StarfieldBackdrop } from "./StarfieldBackdrop";
import { AiChatWorkspace } from "./AiChatWorkspace";
import { ImageStudioWorkspace } from "./ImageStudioWorkspace";
import { soundEngine } from "@/lib/soundEngine";
import { CELESTIAL_SEED_DATA } from "@/lib/astronomyData";
import type { CelestialBody } from "@/db/schema";

const SolarSystem3D = dynamic(
  () => import("./SolarSystem3D").then((m) => m.SolarSystem3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-3 bg-[#05070E]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#7C8CFF]/25 border-t-[#F3C969]" />
        <p className="font-mono text-xs text-[#9AA4BF]">
          Menyiapkan Simulasi 3D Tata Surya [ALPHA]…
        </p>
      </div>
    ),
  }
);

const GalaxyAtlas3D = dynamic(
  () => import("./GalaxyAtlas3D").then((m) => m.GalaxyAtlas3D),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-3 bg-[#04060D]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#7C8CFF]/25 border-t-[#38BDF8]" />
        <p className="font-mono text-xs text-[#9AA4BF]">
          Merakit Model 3D Bima Sakti &amp; Andromeda…
        </p>
      </div>
    ),
  }
);

export type AppMode = "chat" | "image" | "game3d" | "galaxies";

// Instant fallback objects mapped from seed data while API hydrates
const FALLBACK_BODIES: CelestialBody[] = CELESTIAL_SEED_DATA.map((item, idx) => ({
  id: idx + 1,
  slug: item.slug,
  name: item.name,
  englishName: item.englishName,
  catalogCode: item.catalogCode,
  category: item.category,
  classification: item.classification,
  mass: item.mass,
  massKg: item.massKg,
  massComparison: item.massComparison,
  diameter: item.diameter,
  distance: item.distance,
  gravity: item.gravity ?? null,
  rotationPeriod: item.rotationPeriod ?? null,
  rotationDirection: item.rotationDirection ?? null,
  rotationSpeed: item.rotationSpeed ?? null,
  orbitalPeriod: item.orbitalPeriod ?? null,
  orbitalSpeed: item.orbitalSpeed ?? null,
  axialTilt: item.axialTilt ?? null,
  temperature: item.temperature ?? null,
  moonsCount: item.moonsCount ?? null,
  atmosphere: item.atmosphere ?? null,
  starCount: item.starCount ?? null,
  age: item.age ?? null,
  constellation: item.constellation ?? null,
  centralBlackHole: item.centralBlackHole ?? null,
  radialVelocity: item.radialVelocity ?? null,
  colorHex: item.colorHex,
  summary: item.summary,
  rotationInsight: item.rotationInsight ?? null,
  facts: item.facts,
  sortOrder: item.sortOrder,
}));

export function GalaxyAiApp() {
  const [mode, setMode] = useState<AppMode>("chat");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [orbitSpeed, setOrbitSpeed] = useState(1);
  const [missionScore, setMissionScore] = useState(0);
  const [bodies, setBodies] = useState<CelestialBody[]>(FALLBACK_BODIES);
  const [bookmarkedSlugs, setBookmarkedSlugs] = useState<string[]>([]);
  const [queuedPrompt, setQueuedPrompt] = useState<string | null>(null);

  // Hydrate catalog, bookmarks, and preferences from PostgreSQL
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [celRes, prefRes] = await Promise.all([
          fetch("/api/celestial"),
          fetch("/api/preferences"),
        ]);

        if (active && celRes.ok) {
          const celData = (await celRes.json()) as {
            bodies: CelestialBody[];
            bookmarkedSlugs: string[];
          };
          if (celData.bodies?.length > 0) setBodies(celData.bodies);
          setBookmarkedSlugs(celData.bookmarkedSlugs ?? []);
        }

        if (active && prefRes.ok) {
          const prefData = (await prefRes.json()) as {
            preferences?: {
              soundEnabled: boolean;
              ambientEnabled: boolean;
              defaultOrbitSpeed: string;
              missionScore: number;
            };
          };
          const p = prefData.preferences;
          if (p) {
            setSoundEnabled(p.soundEnabled);
            soundEngine.setEnabled(p.soundEnabled);
            setAmbientEnabled(false); // Start ambient only when explicitly clicked for clean UX
            const parsedSpeed = parseFloat(p.defaultOrbitSpeed);
            if (Number.isFinite(parsedSpeed) && parsedSpeed >= 0) {
              setOrbitSpeed(parsedSpeed);
            }
            setMissionScore(p.missionScore ?? 0);
          }
        }
      } catch {}
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistPrefs = useCallback(
    async (patch: {
      soundEnabled?: boolean;
      ambientEnabled?: boolean;
      defaultOrbitSpeed?: string;
      missionScore?: number;
    }) => {
      if (typeof patch.missionScore === "number") {
        setMissionScore(patch.missionScore);
      }
      if (typeof patch.defaultOrbitSpeed === "string") {
        const v = parseFloat(patch.defaultOrbitSpeed);
        if (Number.isFinite(v)) setOrbitSpeed(v);
      }
      try {
        await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
      } catch {}
    },
    []
  );

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.setEnabled(next);
    if (!next && ambientEnabled) {
      setAmbientEnabled(false);
    }
    persistPrefs({ soundEnabled: next });
  };

  const handleToggleAmbient = () => {
    if (!soundEnabled) {
      setSoundEnabled(true);
      soundEngine.setEnabled(true);
    }
    const next = !ambientEnabled;
    setAmbientEnabled(next);
    soundEngine.setAmbient(next);
    soundEngine.playClick();
    persistPrefs({ soundEnabled: true, ambientEnabled: next });
  };

  const handleToggleBookmark = useCallback(async (slug: string) => {
    // Optimistic update
    setBookmarkedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        const data = (await res.json()) as { bookmarkedSlugs: string[] };
        setBookmarkedSlugs(data.bookmarkedSlugs);
      }
    } catch {}
  }, []);

  const handleSwitchMode = (nextMode: AppMode) => {
    if (nextMode === mode) return;
    soundEngine.playTabSwitch();
    setMode(nextMode);
  };

  const handleAskAiFrom3D = useCallback((prompt: string) => {
    soundEngine.playTabSwitch();
    setQueuedPrompt(prompt);
    setMode("chat");
  }, []);

  const navItems: Array<{
    id: AppMode;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      id: "chat",
      label: "Tanya AI",
      shortLabel: "AI",
      icon: MessageSquareText,
    },
    {
      id: "image",
      label: "Generate Gambar",
      shortLabel: "Gambar",
      icon: ImagePlus,
    },
    {
      id: "game3d",
      label: "3D Game",
      shortLabel: "3D Game",
      icon: Orbit,
      badge: "ALPHA",
    },
    {
      id: "galaxies",
      label: "Galaksi 3D",
      shortLabel: "Galaksi",
      icon: Disc3,
    },
  ];

  const is2DMode = mode === "chat" || mode === "image";

  return (
    <div className="relative flex min-h-screen flex-col bg-[#07090F] text-[#F4F6FB]">
      {/* Whisper-quiet twinkling starfield behind 2D workspaces */}
      <StarfieldBackdrop active={is2DMode} />

      {/* Top Precision Observatory Navigation Bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-white/[0.07] bg-[#07090F]/82 px-3 sm:px-6 backdrop-blur-2xl">
        {/* Brand Identity */}
        <button
          type="button"
          onClick={() => handleSwitchMode("chat")}
          onMouseEnter={() => soundEngine.playHover()}
          className="group flex items-center gap-2.5 text-left"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-gradient-to-br from-[#161E38] to-[#0B0F1E] shadow-[0_0_20px_rgba(124,140,255,0.25)]">
            <svg
              viewBox="0 0 32 32"
              className="h-5 w-5 transition-transform duration-700 group-hover:rotate-90"
              fill="none"
            >
              <ellipse
                cx="16"
                cy="16"
                rx="12"
                ry="5.5"
                transform="rotate(-28 16 16)"
                stroke="#7C8CFF"
                strokeWidth="1.6"
              />
              <ellipse
                cx="16"
                cy="16"
                rx="12"
                ry="5.5"
                transform="rotate(32 16 16)"
                stroke="#38BDF8"
                strokeOpacity="0.65"
                strokeWidth="1.4"
              />
              <circle cx="16" cy="16" r="3.2" fill="#F3C969" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-base font-bold tracking-tight text-[#F4F6FB]">
              Galaxy <span className="text-[#9BA8FF]">AI</span>
            </span>
          </div>
        </button>

        {/* Center Segmented Mode Tabs */}
        <nav
          aria-label="Navigasi utama Galaxy AI"
          className="flex items-center gap-0.5 sm:gap-1 rounded-2xl border border-white/[0.08] bg-[#0D1222]/85 p-1"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = mode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchMode(item.id)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`relative flex items-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-[13px] font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "text-[#9AA4BF] hover:text-[#E8ECF8]"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="galaxyNavActivePill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl border border-[#7C8CFF]/45 bg-gradient-to-r from-[#7C8CFF]/26 to-[#38BDF8]/16 shadow-[0_0_20px_rgba(124,140,255,0.22)]"
                  />
                )}
                <Icon
                  className={`relative z-10 h-3.5 w-3.5 shrink-0 ${
                    active ? "text-[#9BA8FF]" : "text-[#64708F]"
                  }`}
                />
                <span className="relative z-10 hidden md:inline whitespace-nowrap">
                  {item.label}
                </span>
                <span className="relative z-10 md:hidden whitespace-nowrap">
                  {item.shortLabel}
                </span>
                {item.badge && (
                  <span className="relative z-10 rounded-md border border-[#F3C969]/40 bg-[#F3C969]/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold leading-none tracking-wider text-[#F3C969]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Audio HUD (Tech SFX + Deep-Space Ambient Pad) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleAmbient}
            onMouseEnter={() => soundEngine.playHover()}
            title={
              ambientEnabled
                ? "Matikan ambien ruang angkasa"
                : "Nyalakan ambien ruang angkasa"
            }
            className={`hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              ambientEnabled
                ? "border-[#38BDF8]/45 bg-[#38BDF8]/15 text-[#38BDF8]"
                : "border-white/[0.07] bg-white/[0.025] text-[#64708F] hover:text-[#C8D1E8]"
            }`}
          >
            <Waves className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            title={
              soundEnabled
                ? "Efek suara teknologi aktif (klik untuk bisukan)"
                : "Efek suara dibisukan (klik untuk aktifkan)"
            }
            className={`inline-flex h-9 items-center gap-2 rounded-xl border px-2.5 sm:px-3 text-xs font-medium transition ${
              soundEnabled
                ? "border-[#7C8CFF]/35 bg-[#7C8CFF]/12 text-[#E2E8F8] hover:border-[#7C8CFF]/60"
                : "border-white/[0.07] bg-white/[0.025] text-[#64708F] hover:text-[#C8D1E8]"
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#9BA8FF]" />
                <span className="hidden lg:flex h-3 items-end gap-[2px]">
                  <span className="eq-bar-1 h-full w-[2px] origin-bottom rounded-full bg-[#7C8CFF]" />
                  <span className="eq-bar-2 h-full w-[2px] origin-bottom rounded-full bg-[#38BDF8]" />
                  <span className="eq-bar-3 h-full w-[2px] origin-bottom rounded-full bg-[#F3C969]" />
                </span>
                <span className="hidden xl:inline font-mono text-[11px]">SFX</span>
              </>
            ) : (
              <>
                <VolumeX className="h-3.5 w-3.5" />
                <span className="hidden xl:inline font-mono text-[11px]">OFF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Active Workspace Viewport */}
      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "chat" && (
            <motion.div
              key="view-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AiChatWorkspace
                queuedPrompt={queuedPrompt}
                onConsumeQueuedPrompt={() => setQueuedPrompt(null)}
                onNavigateMode={(m) => handleSwitchMode(m)}
              />
            </motion.div>
          )}

          {mode === "image" && (
            <motion.div
              key="view-image"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ImageStudioWorkspace />
            </motion.div>
          )}

          {mode === "game3d" && (
            <motion.div
              key="view-game3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <SolarSystem3D
                bodies={bodies}
                bookmarkedSlugs={bookmarkedSlugs}
                onToggleBookmark={handleToggleBookmark}
                onAskAi={handleAskAiFrom3D}
                onSwitchToGalaxies={() => setMode("galaxies")}
                initialSpeed={orbitSpeed}
                missionScore={missionScore}
                onUpdatePrefs={persistPrefs}
              />
            </motion.div>
          )}

          {mode === "galaxies" && (
            <motion.div
              key="view-galaxies"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <GalaxyAtlas3D
                bodies={bodies}
                bookmarkedSlugs={bookmarkedSlugs}
                onToggleBookmark={handleToggleBookmark}
                onAskAi={handleAskAiFrom3D}
                onSwitchToSolar={() => setMode("game3d")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

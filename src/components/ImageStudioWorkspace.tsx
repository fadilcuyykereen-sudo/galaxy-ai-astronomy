"use client";

import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Download,
  Heart,
  Trash2,
  RefreshCw,
  Maximize2,
  X,
  Infinity as InfinityIcon,
  Shuffle,
} from "lucide-react";
import {
  renderCosmicImageDataUrl,
  enhanceAstronomyPrompt,
  type CosmicStyle,
  type AspectRatioOption,
} from "@/lib/cosmicImageGenerator";
import { soundEngine } from "@/lib/soundEngine";

interface GalleryImage {
  id: number;
  prompt: string;
  enhancedPrompt: string;
  style: string;
  aspectRatio: string;
  seed: number;
  imageUrl: string;
  isFavorite: boolean;
  createdAt: string;
}

const STYLES: CosmicStyle[] = [
  "Fotorealistik JWST",
  "Sinematik Sci-Fi",
  "Nebula Inframerah",
  "Seni Konsep Kosmik",
  "Observatorium Deep-Field",
  "Cyberpunk Orbital",
];

const RATIOS: Array<{ id: AspectRatioOption; label: string }> = [
  { id: "1:1", label: "1:1 Persegi" },
  { id: "16:9", label: "16:9 Lanskap" },
  { id: "9:16", label: "9:16 Potret" },
];

const PROMPT_IDEAS = [
  "Astronot berdiri di tebing planet es melihat lubang hitam emas raksasa dan aurora hijau",
  "Galaksi Bima Sakti dan Andromeda bertabrakan di atas samudra kristal dengan pantulan bintang",
  "Planet Saturnus bercincin emas bersinar di tengah nebula ungu dan komet biru",
  "Ledakan supernova sian dan emas dengan semburan jet pulsar relativistik",
  "Planet Bumi dilihat dari orbit malam dengan lampu kota berkilau dan aurora borealis",
  "Nebula merah muda dan safir tempat lahirnya gugus bintang muda bergaya teleskop JWST",
  "Komet berekor biru melintasi galaksi spiral raksasa di atas pegunungan Mars",
  "Lubang hitam supermasif biru safir dikelilingi planet bercincin dan badai plasma",
];

export function ImageStudioWorkspace() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<CosmicStyle>("Fotorealistik JWST");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("1:1");
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filterFav, setFilterFav] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [latestCreated, setLatestCreated] = useState<GalleryImage | null>(null);
  const [lightboxImg, setLightboxImg] = useState<GalleryImage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadImages = useCallback(async (onlyFav = false) => {
    try {
      const url = onlyFav ? "/api/images?favorites=true" : "/api/images";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = (await res.json()) as { images: GalleryImage[] };
      setImages(data.images);
    } catch {}
  }, []);

  useEffect(() => {
    loadImages(filterFav);
  }, [filterFav, loadImages]);

  const handleGenerate = async (overridePrompt?: string, overrideStyle?: CosmicStyle) => {
    const activePrompt = (overridePrompt ?? prompt).trim();
    const activeStyle = overrideStyle ?? style;
    if (!activePrompt || isGenerating) return;

    setErrorMsg(null);
    setIsGenerating(true);
    setProgressStage("Memetakan spektrum kosmik & nebula…");
    soundEngine.playGenerateStart();

    try {
      const seed = Math.floor(100000 + Math.random() * 899999);
      const enhancedPrompt = enhanceAstronomyPrompt(activePrompt, activeStyle);

      // Give UI frame to show silky scanline animation before high-res render
      await new Promise((r) => setTimeout(r, 260));
      setProgressStage("Merender cahaya bintang & optik resolusi tinggi…");

      const imageDataUrl = await renderCosmicImageDataUrl({
        prompt: activePrompt,
        style: activeStyle,
        aspectRatio,
        seed,
      });

      setProgressStage("Menyimpan ke galeri observatorium…");
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: activePrompt,
          enhancedPrompt,
          style: activeStyle,
          aspectRatio,
          seed,
          imageDataUrl,
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan gambar");
      const data = (await res.json()) as { image: GalleryImage };

      setLatestCreated(data.image);
      setFilterFav(false);
      setImages((prev) => [data.image, ...prev]);
      soundEngine.playGenerateComplete();
    } catch {
      setErrorMsg("Gagal memproses gambar. Silakan coba kembali.");
    } finally {
      setIsGenerating(false);
      setProgressStage("");
    }
  };

  const handleRandomIdea = () => {
    soundEngine.playClick();
    const others = PROMPT_IDEAS.filter((p) => p !== prompt);
    const chosen = others[Math.floor(Math.random() * others.length)];
    setPrompt(chosen);
  };

  const handleToggleFavorite = async (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundEngine.playClick();
    try {
      const res = await fetch(`/api/images/${img.id}`, { method: "PATCH" });
      if (!res.ok) return;
      const data = (await res.json()) as { image: GalleryImage };
      setImages((prev) => {
        const next = prev.map((it) => (it.id === img.id ? data.image : it));
        return filterFav ? next.filter((it) => it.isFavorite) : next;
      });
      if (lightboxImg?.id === img.id) setLightboxImg(data.image);
      if (latestCreated?.id === img.id) setLatestCreated(data.image);
    } catch {}
  };

  const handleDelete = async (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundEngine.playClick();
    try {
      await fetch(`/api/images/${img.id}`, { method: "DELETE" });
      setImages((prev) => prev.filter((it) => it.id !== img.id));
      if (lightboxImg?.id === img.id) setLightboxImg(null);
      if (latestCreated?.id === img.id) setLatestCreated(null);
    } catch {}
  };

  const handleDownload = (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    soundEngine.playClick();
    const a = document.createElement("a");
    a.href = img.imageUrl;
    a.download = `galaxy-ai-${img.seed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleRemix = (img: GalleryImage, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const matchedStyle = STYLES.includes(img.style as CosmicStyle)
      ? (img.style as CosmicStyle)
      : "Fotorealistik JWST";
    setPrompt(img.prompt);
    setStyle(matchedStyle);
    setLightboxImg(null);
    handleGenerate(img.prompt, matchedStyle);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-y-auto px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8 pb-12">
        {/* Studio Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-[#F4F6FB]">
              Studio Gambar Kosmik
            </h1>
            <p className="mt-1 text-sm text-[#9AA4BF]">
              Wujudkan visual galaksi, lubang hitam, planet, nebula, hingga astronot sesuai
              permintaan Anda.
            </p>
          </div>
          <div className="inline-flex self-start sm:self-auto items-center gap-2 rounded-full border border-[#F3C969]/30 bg-[#F3C969]/10 px-3.5 py-1.5 text-xs font-medium text-[#F3C969]">
            <InfinityIcon className="h-4 w-4" />
            <span>Generate Tanpa Limit</span>
            <span className="text-white/25">•</span>
            <span className="font-mono text-[#F4F6FB] tabular-nums">
              {images.length} karya
            </span>
          </div>
        </motion.div>

        {/* Prompt Control Panel */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="galaxy-glass-strong rounded-3xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] space-y-4"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Deskripsikan gambar… misal: Lubang hitam emas dengan cincin Saturnus dan astronot di planet es"
                className="w-full rounded-2xl border border-white/[0.08] bg-[#070A14]/90 px-4 py-3.5 pr-12 text-[14.5px] text-[#F4F6FB] placeholder-[#64708F] transition focus:border-[#7C8CFF]/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleRandomIdea}
                onMouseEnter={() => soundEngine.playHover()}
                title="Ide prompt acak"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#9AA4BF] transition hover:bg-white/[0.07] hover:text-[#F3C969]"
              >
                <Shuffle className="h-4 w-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              onMouseEnter={() => soundEngine.playHover()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C8CFF] via-[#6374FF] to-[#4F9CF9] px-6 py-3.5 font-display text-sm font-semibold text-white shadow-[0_0_28px_rgba(124,140,255,0.42)] transition hover:brightness-110 disabled:opacity-40 disabled:shadow-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Membuat…</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Generate Gambar</span>
                </>
              )}
            </button>
          </form>

          {/* Style & Aspect Ratio Controls */}
          <div className="flex flex-col gap-3 pt-1 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              {STYLES.map((st) => {
                const active = style === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setStyle(st);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      active
                        ? "bg-[#7C8CFF]/22 text-white border border-[#7C8CFF]/60 shadow-[0_0_14px_rgba(124,140,255,0.25)]"
                        : "border border-white/[0.07] bg-white/[0.025] text-[#9AA4BF] hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 self-start lg:self-auto">
              {RATIOS.map((r) => {
                const active = aspectRatio === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setAspectRatio(r.id);
                    }}
                    className={`rounded-xl px-2.5 py-1.5 font-mono text-[11px] transition ${
                      active
                        ? "bg-white/[0.12] text-[#F4F6FB] border border-white/20"
                        : "border border-white/[0.06] text-[#64708F] hover:text-[#C8D1E8]"
                    }`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-400">{errorMsg}</p>
          )}
        </motion.div>

        {/* Active Synthesis / Newly Created Spotlight */}
        <AnimatePresence mode="wait">
          {isGenerating && (
            <motion.div
              key="generating-card"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative overflow-hidden rounded-3xl border border-[#7C8CFF]/35 bg-[#0B1022]/90 p-8 text-center"
            >
              <div className="cosmic-scanline pointer-events-none absolute inset-x-0 h-28 bg-gradient-to-b from-transparent via-[#7C8CFF]/20 to-transparent" />
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7C8CFF]/15 border border-[#7C8CFF]/40">
                <Sparkles className="h-6 w-6 animate-pulse text-[#F3C969]" />
              </div>
              <p className="font-display text-base font-semibold text-[#F4F6FB]">
                Mensintesis Karya Kosmik Resolusi Tinggi
              </p>
              <p className="mt-1 font-mono text-xs text-[#9AA4BF]">
                {progressStage}
              </p>
            </motion.div>
          )}

          {!isGenerating && latestCreated && (
            <motion.div
              key={`latest-${latestCreated.id}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="galaxy-glass overflow-hidden rounded-3xl p-4 sm:p-5"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div
                  onClick={() => setLightboxImg(latestCreated)}
                  className="group relative mx-auto w-full max-w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#05070E]"
                >
                  <img
                    src={latestCreated.imageUrl}
                    alt={latestCreated.prompt}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/12 border border-emerald-400/25 px-3 py-1 text-[11px] font-medium text-emerald-300">
                    <Sparkles className="h-3 w-3" />
                    Baru Saja Dibuat • Seed #{latestCreated.seed}
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[#F4F6FB]">
                    {latestCreated.prompt}
                  </h2>
                  <p className="text-xs text-[#9AA4BF]">
                    Gaya: <span className="text-[#D5DCF0]">{latestCreated.style}</span> •
                    Rasio:{" "}
                    <span className="font-mono text-[#D5DCF0]">
                      {latestCreated.aspectRatio}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={(e) => handleDownload(latestCreated, e)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.1] px-3.5 py-2 text-xs font-medium text-white transition hover:bg-white/[0.18]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh PNG HD
                    </button>
                    <button
                      onClick={(e) => handleRemix(latestCreated, e)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#7C8CFF]/40 bg-[#7C8CFF]/15 px-3.5 py-2 text-xs font-medium text-[#C5CDFF] transition hover:bg-[#7C8CFF]/25 hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Buat Variasi Lagi
                    </button>
                    <button
                      onClick={() => setLightboxImg(latestCreated)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3.5 py-2 text-xs text-[#9AA4BF] transition hover:text-white"
                    >
                      <Maximize2 className="h-3.5 w-3.5" />
                      Layar Penuh
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setFilterFav(false);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  !filterFav
                    ? "bg-white/[0.1] text-[#F4F6FB]"
                    : "text-[#64708F] hover:text-[#C8D1E8]"
                }`}
              >
                Semua Galeri
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setFilterFav(true);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
                  filterFav
                    ? "bg-rose-500/15 text-rose-300 border border-rose-400/25"
                    : "text-[#64708F] hover:text-[#C8D1E8]"
                }`}
              >
                <Heart className="h-3.5 w-3.5" />
                Favorit
              </button>
            </div>
            <span className="text-xs text-[#64708F]">
              Klik gambar untuk memperbesar atau unduh
            </span>
          </div>

          {images.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.06] bg-[#0B0F1D]/60 py-16 text-center text-sm text-[#64708F]">
              {filterFav
                ? "Belum ada gambar yang ditandai favorit."
                : "Belum ada gambar. Ketik prompt di atas untuk mulai membuat tanpa batas!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {images.map((img, idx) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.3) }}
                  onClick={() => {
                    soundEngine.playClick();
                    setLightboxImg(img);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E1B] shadow-lg transition hover:-translate-y-1 hover:border-[#7C8CFF]/45 hover:shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
                >
                  <div className="aspect-square w-full overflow-hidden bg-[#05070E]">
                    <img
                      src={img.imageUrl}
                      alt={img.prompt}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Top right favorite button */}
                  <button
                    onClick={(e) => handleToggleFavorite(img, e)}
                    aria-label="Favorit"
                    className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition ${
                      img.isFavorite
                        ? "bg-rose-500/85 text-white"
                        : "bg-black/45 text-white/75 opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:text-white"
                    }`}
                  >
                    <Heart
                      className={`h-3.5 w-3.5 ${img.isFavorite ? "fill-current" : ""}`}
                    />
                  </button>

                  {/* Hover info & actions overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05070F] via-[#05070F]/88 to-transparent p-3.5 pt-10">
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-[#F4F6FB]">
                      {img.prompt}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded-md bg-white/[0.08] px-2 py-0.5 text-[10px] text-[#B8C2DC]">
                        {img.style}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleRemix(img, e)}
                          title="Remix / Variasi baru"
                          className="rounded-lg p-1.5 text-[#9AA4BF] transition hover:bg-white/15 hover:text-white"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDownload(img, e)}
                          title="Unduh gambar"
                          className="rounded-lg p-1.5 text-[#9AA4BF] transition hover:bg-white/15 hover:text-white"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(img, e)}
                          title="Hapus"
                          className="rounded-lg p-1.5 text-[#9AA4BF] transition hover:bg-red-500/20 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* High-Res Lightbox Modal */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxImg(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="galaxy-glass-strong relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl md:flex-row"
            >
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white/80 transition hover:bg-black hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-1 items-center justify-center bg-[#04060C] p-3">
                <img
                  src={lightboxImg.imageUrl}
                  alt={lightboxImg.prompt}
                  className="max-h-[68vh] w-auto rounded-2xl object-contain"
                />
              </div>

              <div className="flex w-full flex-col justify-between border-t border-white/[0.08] p-6 md:w-80 md:border-t-0 md:border-l">
                <div className="space-y-4">
                  <span className="inline-block rounded-full border border-[#7C8CFF]/35 bg-[#7C8CFF]/12 px-2.5 py-1 text-[11px] font-medium text-[#B8C2FF]">
                    {lightboxImg.style}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-[#F4F6FB]">
                    {lightboxImg.prompt}
                  </p>
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase text-[#64708F]">
                        Rasio
                      </span>
                      <span className="font-mono text-[#E2E8F8]">
                        {lightboxImg.aspectRatio}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-[#64708F]">
                        Seed
                      </span>
                      <span className="font-mono text-[#E2E8F8]">
                        #{lightboxImg.seed}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <button
                    onClick={(e) => handleDownload(lightboxImg, e)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C8CFF] to-[#4F9CF9] py-2.5 text-xs font-semibold text-white transition hover:brightness-110"
                  >
                    <Download className="h-4 w-4" />
                    Unduh Gambar PNG
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleRemix(lightboxImg, e)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] py-2 text-xs font-medium text-[#E2E8F8] transition hover:bg-white/[0.1]"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Variasi Baru
                    </button>
                    <button
                      onClick={(e) => handleToggleFavorite(lightboxImg, e)}
                      className={`flex items-center justify-center rounded-xl border px-3 py-2 text-xs transition ${
                        lightboxImg.isFavorite
                          ? "border-rose-400/40 bg-rose-500/20 text-rose-300"
                          : "border-white/10 bg-white/[0.05] text-[#9AA4BF] hover:text-white"
                      }`}
                    >
                      <Heart
                        className={`h-4 w-4 ${lightboxImg.isFavorite ? "fill-current" : ""}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

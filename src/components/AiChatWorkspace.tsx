"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  PanelLeft,
  Check,
  Copy,
  Compass,
  Orbit,
  ImagePlus,
  Infinity as InfinityIcon,
} from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { soundEngine } from "@/lib/soundEngine";

interface SessionItem {
  id: number;
  title: string;
  updatedAt: string;
}

interface MessageItem {
  id: number;
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  topic?: string | null;
  suggestions?: string[] | null;
  createdAt: string;
}

interface AiChatWorkspaceProps {
  queuedPrompt: string | null;
  onConsumeQueuedPrompt: () => void;
  onNavigateMode: (mode: "image" | "game3d" | "galaxies") => void;
}

const STARTER_CARDS = [
  {
    title: "Rotasi & Iklim Bumi",
    prompt: "Bagaimana cara Bumi berotasi dan mengapa kita tidak merasakannya?",
    tag: "Planetologi",
  },
  {
    title: "Bima Sakti vs Andromeda",
    prompt: "Bandingkan Bima Sakti dan Galaksi Andromeda beserta massanya",
    tag: "Kosmologi",
  },
  {
    title: "Lubang Hitam & Waktu",
    prompt: "Jelaskan lubang hitam supermasif dan fenomena dilatasi waktu",
    tag: "Relativitas",
  },
  {
    title: "Massa 8 Planet",
    prompt: "Urutkan massa seluruh planet di Tata Surya dari yang terberat",
    tag: "Tata Surya",
  },
];

export function AiChatWorkspace({
  queuedPrompt,
  onConsumeQueuedPrompt,
  onNavigateMode,
}: AiChatWorkspaceProps) {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [streamingMsgId, setStreamingMsgId] = useState<number | null>(null);
  const [streamedText, setStreamedText] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const streamTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (!res.ok) return;
      const data = (await res.json()) as { sessions: SessionItem[] };
      setSessions(data.sessions);
      return data.sessions;
    } catch {
      return [];
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: number) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (!res.ok) return;
      const data = (await res.json()) as { messages: MessageItem[] };
      setMessages(data.messages);
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const list = await loadSessions();
      if (mounted && list && list.length > 0) {
        setActiveSessionId(list[0].id);
        await loadMessages(list[0].id);
      }
    })();
    return () => {
      mounted = false;
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [loadSessions, loadMessages]);

  const animateStream = useCallback((msg: MessageItem) => {
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setStreamingMsgId(msg.id);
    setStreamedText("");
    const full = msg.content;
    let cursor = 0;
    const step = Math.max(14, Math.ceil(full.length / 55));

    streamTimerRef.current = setInterval(() => {
      cursor += step;
      if (cursor >= full.length) {
        setStreamedText(full);
        setStreamingMsgId(null);
        if (streamTimerRef.current) clearInterval(streamTimerRef.current);
      } else {
        setStreamedText(full.slice(0, cursor));
      }
    }, 18);
  }, []);

  const sendPrompt = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isThinking) return;

      soundEngine.playSend();
      setInput("");
      setIsThinking(true);

      const optimisticUser: MessageItem = {
        id: -Date.now(),
        sessionId: activeSessionId ?? 0,
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticUser]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: activeSessionId ?? undefined,
            message: trimmed,
          }),
        });

        if (!res.ok) throw new Error("Gagal");
        const data = (await res.json()) as {
          sessionId: number;
          userMessage: MessageItem;
          assistantMessage: MessageItem;
        };

        setActiveSessionId(data.sessionId);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticUser.id),
          data.userMessage,
          data.assistantMessage,
        ]);

        soundEngine.playReceive();
        animateStream(data.assistantMessage);
        loadSessions();
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: -Date.now() - 1,
            sessionId: activeSessionId ?? 0,
            role: "assistant",
            content:
              "Maaf, sinyal telemetri sempat terputus. Silakan kirim ulang pertanyaan astronomi Anda.",
            createdAt: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [activeSessionId, isThinking, animateStream, loadSessions]
  );

  // Consume prompts forwarded from 3D Solar System or 3D Galaxy Atlas
  useEffect(() => {
    if (queuedPrompt && !isThinking) {
      const q = queuedPrompt;
      onConsumeQueuedPrompt();
      sendPrompt(q);
    }
  }, [queuedPrompt, isThinking, onConsumeQueuedPrompt, sendPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking, streamedText]);

  const handleNewSession = async () => {
    soundEngine.playClick();
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Percakapan Astronomi Baru" }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { session: SessionItem };
      setActiveSessionId(data.session.id);
      await loadSessions();
      await loadMessages(data.session.id);
      setSidebarOpen(false);
      textareaRef.current?.focus();
    } catch {}
  };

  const handleSelectSession = async (id: number) => {
    soundEngine.playClick();
    if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    setStreamingMsgId(null);
    setActiveSessionId(id);
    await loadMessages(id);
    setSidebarOpen(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    soundEngine.playClick();
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      const updated = (await loadSessions()) ?? [];
      if (activeSessionId === id) {
        if (updated.length > 0) {
          setActiveSessionId(updated[0].id);
          await loadMessages(updated[0].id);
        } else {
          setActiveSessionId(null);
          setMessages([]);
        }
      }
    } catch {}
  };

  const handleCopy = (msg: MessageItem) => {
    soundEngine.playClick();
    navigator.clipboard.writeText(msg.content).catch(() => {});
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <div className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden">
      {/* Collapsible Left Thread Sidebar Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 top-16 z-20 bg-black/50 backdrop-blur-xs lg:hidden"
            />
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
              className="fixed lg:relative top-16 lg:top-0 bottom-0 left-0 z-30 flex w-72 shrink-0 flex-col border-r border-white/[0.07] bg-[#090D18]/95 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#9AA4BF]">
                  Riwayat Observasi
                </span>
                <button
                  onClick={handleNewSession}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#7C8CFF]/15 px-2.5 py-1.5 text-xs font-medium text-[#B8C2FF] transition hover:bg-[#7C8CFF]/25 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Baru
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                {sessions.map((s) => {
                  const active = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectSession(s.id)}
                      onMouseEnter={() => soundEngine.playHover()}
                      className={`group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13.5px] transition ${
                        active
                          ? "bg-white/[0.08] text-[#F4F6FB] font-medium"
                          : "text-[#9AA4BF] hover:bg-white/[0.04] hover:text-[#E2E8F8]"
                      }`}
                    >
                      <span className="truncate pr-2">{s.title}</span>
                      <button
                        onClick={(e) => handleDeleteSession(e, s.id)}
                        title="Hapus percakapan"
                        className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-[#64708F] transition hover:bg-red-500/15 hover:text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-white/[0.06] p-3.5 space-y-1.5">
                <button
                  onClick={() => {
                    soundEngine.playTabSwitch();
                    onNavigateMode("game3d");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-[#C8D1E8] transition hover:border-[#7C8CFF]/40 hover:bg-[#7C8CFF]/10"
                >
                  <span className="flex items-center gap-2">
                    <Orbit className="h-3.5 w-3.5 text-[#38BDF8]" />
                    Buka Tata Surya 3D
                  </span>
                  <span className="rounded bg-[#F3C969]/15 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#F3C969]">
                    ALPHA
                  </span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playTabSwitch();
                    onNavigateMode("image");
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-xs text-[#C8D1E8] transition hover:border-[#7C8CFF]/40 hover:bg-[#7C8CFF]/10"
                >
                  <span className="flex items-center gap-2">
                    <ImagePlus className="h-3.5 w-3.5 text-[#7C8CFF]" />
                    Studio Gambar Kosmik
                  </span>
                  <InfinityIcon className="h-3.5 w-3.5 text-[#9AA4BF]" />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Conversational Observatory Column */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Subtle Floating Session Toolbar */}
        <div className="pointer-events-none absolute top-3 left-4 right-4 z-10 flex items-center justify-between">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setSidebarOpen((v) => !v);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="galaxy-glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#C8D1E8] transition hover:border-white/20 hover:text-white"
            >
              <PanelLeft className="h-3.5 w-3.5 text-[#7C8CFF]" />
              <span className="hidden sm:inline">Riwayat</span>
              <span className="font-mono text-[11px] text-[#64708F]">
                {sessions.length}
              </span>
            </button>

            <button
              onClick={handleNewSession}
              onMouseEnter={() => soundEngine.playHover()}
              className="galaxy-glass inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-[#C8D1E8] transition hover:border-white/20 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5 text-[#F3C969]" />
              <span className="hidden sm:inline">Chat Baru</span>
            </button>
          </div>

          <div className="pointer-events-auto galaxy-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-[#9AA4BF]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>Akses Tanpa Limit</span>
          </div>
        </div>

        {/* Scrollable Chat Stream */}
        <div className="flex-1 overflow-y-auto px-4 pt-16 pb-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Hero Observatory Header shown when session is fresh */}
            {!hasUserMessages && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="pt-4 pb-2 text-center"
              >
                {/* Luminous Animated Orbital Emblem */}
                <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-[#7C8CFF]/35 border-t-[#F3C969]"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border border-[#38BDF8]/30 border-b-[#7C8CFF]"
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C8CFF] via-[#5A6BFF] to-[#38BDF8] shadow-[0_0_28px_rgba(124,140,255,0.55)]">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>

                <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#F4F6FB]">
                  Jelajahi Alam Semesta dengan{" "}
                  <span className="bg-gradient-to-r from-[#9BA8FF] via-[#F4F6FB] to-[#F3C969] bg-clip-text text-transparent">
                    Galaxy AI
                  </span>
                </h1>
                <p className="mx-auto mt-2.5 max-w-xl text-sm sm:text-[15px] leading-relaxed text-[#9AA4BF]">
                  Tanyakan astrofisika, massa planet, rotasi Bumi, lubang hitam, hingga
                  galaksi Bima Sakti &amp; Andromeda — gratis dan tanpa batas.
                </p>

                {/* 4 Sleek Starter Suggestion Pills */}
                <div className="mt-7 grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
                  {STARTER_CARDS.map((card, idx) => (
                    <motion.button
                      key={card.title}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * idx, duration: 0.35 }}
                      onClick={() => sendPrompt(card.prompt)}
                      onMouseEnter={() => soundEngine.playHover()}
                      className="group rounded-2xl border border-white/[0.07] bg-[#0C1120]/75 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#7C8CFF]/40 hover:bg-[#11182E]/90 hover:shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-semibold text-[#F4F6FB] group-hover:text-white">
                          {card.title}
                        </span>
                        <span className="rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[10px] text-[#9AA4BF]">
                          {card.tag}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#8A95B2]">
                        {card.prompt}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Message History (show user + assistant turns cleanly) */}
            {messages
              .filter((m, idx) => hasUserMessages || idx > 0)
              .map((msg, idx, arr) => {
                const isUser = msg.role === "user";
                const isLastAssistant = !isUser && idx === arr.length - 1;
                const displayContent =
                  streamingMsgId === msg.id ? streamedText : msg.content;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {isUser ? (
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm border border-[#7C8CFF]/30 bg-gradient-to-br from-[#7C8CFF]/22 to-[#4C5BE8]/15 px-4 py-3 text-[14.5px] leading-relaxed text-[#F4F6FB] shadow-lg">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="w-full rounded-2xl border border-white/[0.07] bg-[#0C101E]/80 p-5 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.28)]">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#7C8CFF] to-[#38BDF8]">
                              <Sparkles className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="font-display text-xs font-semibold tracking-wide text-[#F4F6FB]">
                              Galaxy AI
                            </span>
                            {msg.topic && (
                              <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-[#9AA4BF]">
                                {msg.topic}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleCopy(msg)}
                            title="Salin jawaban"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-[#64708F] transition hover:bg-white/[0.06] hover:text-[#E2E8F8]"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Disalin</span>
                              </>
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        <MarkdownRenderer content={displayContent} />

                        {/* Follow-up Suggestion Chips on latest AI response */}
                        {isLastAssistant &&
                          streamingMsgId !== msg.id &&
                          msg.suggestions &&
                          msg.suggestions.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3.5">
                              {msg.suggestions.map((sug) => (
                                <button
                                  key={sug}
                                  onClick={() => sendPrompt(sug)}
                                  onMouseEnter={() => soundEngine.playHover()}
                                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-[#AEB8D4] transition hover:border-[#7C8CFF]/45 hover:bg-[#7C8CFF]/12 hover:text-white"
                                >
                                  <Compass className="h-3 w-3 shrink-0 text-[#7C8CFF]" />
                                  <span>{sug}</span>
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    )}
                  </motion.div>
                );
              })}

            {/* Thinking Telemetry Pulse */}
            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-[#0C101E]/75 px-4 py-3.5 text-xs text-[#9AA4BF]"
              >
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#7C8CFF] [animation-delay:-0.25s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#38BDF8] [animation-delay:-0.12s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-[#F3C969]" />
                </div>
                <span className="font-mono">
                  Menganalisis data astrofisika &amp; telemetri kosmik…
                </span>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Floating Premium Prompt Composer */}
        <div className="shrink-0 px-4 pb-5 pt-2 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendPrompt(input);
              }}
              className="galaxy-glass-strong relative flex items-end gap-2 rounded-2xl p-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.55)] transition focus-within:border-[#7C8CFF]/50 focus-within:shadow-[0_0_0_1px_rgba(124,140,255,0.28),0_16px_50px_rgba(0,0,0,0.6)]"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendPrompt(input);
                  }
                }}
                placeholder="Tanyakan apa saja tentang astronomi, rotasi Bumi, planet, lubang hitam, atau galaksi…"
                className="max-h-36 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2 text-[14.5px] text-[#F4F6FB] placeholder-[#64708F] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                onMouseEnter={() => soundEngine.playHover()}
                aria-label="Kirim pertanyaan"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C8CFF] to-[#5668F5] text-white shadow-[0_0_20px_rgba(124,140,255,0.4)] transition hover:brightness-110 disabled:opacity-35 disabled:shadow-none"
              >
                <ArrowUp className="h-4.5 w-4.5 stroke-[2.2]" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-[#64708F]">
              Galaxy AI Astrofisika • Tanya jawab tanpa batas • Coba ketik{" "}
              <button
                type="button"
                onClick={() => sendPrompt("Berapa berat badan 60 kg di Mars dan Jupiter?")}
                className="text-[#9AA4BF] underline decoration-white/20 underline-offset-2 transition hover:text-white"
              >
                &ldquo;Berat 60 kg di Mars&rdquo;
              </button>{" "}
              atau{" "}
              <button
                type="button"
                onClick={() => sendPrompt("Konversi 10 tahun cahaya ke kilometer")}
                className="text-[#9AA4BF] underline decoration-white/20 underline-offset-2 transition hover:text-white"
              >
                &ldquo;10 tahun cahaya ke km&rdquo;
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

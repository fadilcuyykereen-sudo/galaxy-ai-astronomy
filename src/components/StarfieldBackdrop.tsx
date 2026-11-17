"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  drift: number;
  color: string;
}

export function StarfieldBackdrop({ active = true }: { active?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const palette = [
      "244,246,251",
      "195,212,255",
      "243,201,105",
      "147,215,255",
    ];

    const stars: Star[] = [];
    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars.length = 0;
      const count = Math.min(180, Math.floor((width * height) / 9500));
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() < 0.88 ? Math.random() * 1.1 + 0.35 : Math.random() * 1.8 + 0.8,
          baseAlpha: Math.random() * 0.55 + 0.15,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.015 + 0.004,
          drift: Math.random() * 0.08 + 0.015,
          color: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    init();
    window.addEventListener("resize", init);

    let tick = 0;
    const render = () => {
      tick += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.y -= s.drift;
        if (s.y < -4) {
          s.y = height + 4;
          s.x = Math.random() * width;
        }
        const twinkle =
          s.baseAlpha * (0.65 + 0.35 * Math.sin(tick * s.speed + s.phase));
        ctx.fillStyle = `rgba(${s.color},${twinkle.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", init);
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Subtle deep-space ambient radial glows */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[520px] w-[920px] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(124,140,255,0.28) 0%, rgba(56,189,248,0.10) 45%, transparent 75%)",
        }}
      />
      <div
        className="absolute bottom-[-180px] right-[-120px] h-[440px] w-[540px] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(243,201,105,0.24) 0%, transparent 70%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-85" />
    </div>
  );
}

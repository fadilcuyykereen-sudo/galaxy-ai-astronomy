"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  Tag,
  Bookmark,
  Sparkles,
  Scale,
  Compass,
  Move3d,
  ChevronRight,
  ChevronLeft,
  Orbit,
} from "lucide-react";
import { GALAXY_3D_CONFIGS, type Galaxy3DConfig } from "@/lib/astronomyData";
import { createGlowSpriteTexture } from "@/lib/threeTextures";
import { soundEngine } from "@/lib/soundEngine";
import type { CelestialBody } from "@/db/schema";

interface GalaxyAtlas3DProps {
  bodies: CelestialBody[];
  bookmarkedSlugs: string[];
  onToggleBookmark: (slug: string) => void;
  onAskAi: (prompt: string) => void;
  onSwitchToSolar: () => void;
}

interface ScreenPin {
  label: string;
  detail: string;
  color: string;
  x: number;
  y: number;
  visible: boolean;
}

function buildGalaxyGroup(
  cfg: Galaxy3DConfig,
  starTex: THREE.Texture,
  nebulaTex: THREE.Texture,
  disposables: Array<{ dispose: () => void }>
): THREE.Group {
  const group = new THREE.Group();

  const coreCol = new THREE.Color(cfg.coreColor);
  const midCol = new THREE.Color(cfg.midColor);
  const outerCol = new THREE.Color(cfg.outerColor);
  const nebCol = new THREE.Color(cfg.nebulaColor);
  const tempCol = new THREE.Color();

  const count = 24000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const randGauss = () =>
    (Math.random() + Math.random() + Math.random() + Math.random() - 2) * 0.5;

  for (let i = 0; i < count; i++) {
    let x = 0;
    let y = 0;
    let z = 0;
    let radialNorm = 0;
    let isNebulaKnot = false;

    if (cfg.type === "elliptical-jet") {
      // M87: Giant 3D golden elliptical galaxy + globular cluster halo
      const u = Math.pow(Math.random(), 1.65);
      const r = u * cfg.diskRadius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.cos(phi) * 0.78;
      z = r * Math.sin(phi) * Math.sin(theta) * 0.92;
      radialNorm = u;
    } else if (cfg.type === "sombrero") {
      // M104 Sombrero: Huge glowing spherical bulge + crisp outer dust/star ring
      if (i < count * 0.52) {
        const u = Math.pow(Math.random(), 1.9);
        const r = u * cfg.coreSize * 1.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi) * 0.68;
        z = r * Math.sin(phi) * Math.sin(theta);
        radialNorm = u * 0.45;
      } else if (i < count * 0.88) {
        // Luminous outer ring (9.2 to 13.0)
        const r = 8.8 + Math.random() * 4.2 + randGauss() * 0.4;
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * 0.22;
        radialNorm = 0.75 + ((r - 8.8) / 4.2) * 0.25;
        isNebulaKnot = Math.random() < 0.14;
      } else {
        // Inner subtle disk
        const r = Math.random() * 8.4;
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * 0.28;
        radialNorm = r / cfg.diskRadius;
      }
    } else if (cfg.type === "ring") {
      // Cartwheel: Inner bright ring + 8 curving spokes + blazing sapphire outer starburst ring
      if (i < count * 0.24) {
        // Inner core & inner ring
        const isRing = Math.random() > 0.45;
        const r = isRing ? 2.8 + randGauss() * 0.45 : Math.pow(Math.random(), 1.5) * 2.5;
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * 0.4;
        radialNorm = 0.15;
      } else if (i < count * 0.72) {
        // Blazing outer collision starburst ring
        const r = cfg.diskRadius * (0.86 + Math.random() * 0.14) + randGauss() * 0.35;
        const a = Math.random() * Math.PI * 2;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * 0.32;
        radialNorm = 0.92;
        isNebulaKnot = Math.random() < 0.22;
      } else {
        // Radial spiral spokes connecting inner and outer ring
        const spoke = (i % cfg.arms) * ((Math.PI * 2) / cfg.arms);
        const t = Math.random();
        const r = 2.8 + t * (cfg.diskRadius * 0.86 - 2.8);
        const a = spoke + t * 0.95 + randGauss() * 0.16;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * 0.25;
        radialNorm = 0.48;
      }
    } else if (cfg.type === "barred-spiral") {
      // Bima Sakti (Milky Way): Central golden bar + 4 logarithmic spiral arms + halo
      if (i < count * 0.18) {
        // Elongated central galactic bar along X axis
        const bx = (Math.random() * 2 - 1) * cfg.barLength;
        const bz = randGauss() * 0.85 * (1 - Math.abs(bx) / (cfg.barLength * 1.35));
        const by = randGauss() * 0.75 * (1 - Math.abs(bx) / (cfg.barLength * 1.4));
        x = bx;
        y = by;
        z = bz;
        radialNorm = (Math.abs(bx) / cfg.diskRadius) * 0.6;
      } else if (i < count * 0.92) {
        // 4 Spiral arms starting smoothly from bar tips
        const armIdx = i % cfg.arms;
        const baseAngle =
          armIdx < 2
            ? armIdx * Math.PI
            : (armIdx - 2) * Math.PI + 0.52;
        const t = Math.pow(Math.random(), 0.82);
        const r = cfg.barLength * 0.72 + t * (cfg.diskRadius - cfg.barLength * 0.65);
        const spin = (r - cfg.barLength * 0.7) * cfg.armTightness;
        const scatter = randGauss() * (0.28 + t * 0.42);
        const a = baseAngle + spin + scatter;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * cfg.diskThickness * (1.15 - t * 0.65);
        radialNorm = r / cfg.diskRadius;
        isNebulaKnot = t > 0.18 && Math.random() < 0.085 && Math.abs(scatter) < 0.14;
      } else {
        // Faint ancient globular cluster halo
        const r = Math.pow(Math.random(), 1.3) * cfg.diskRadius * 0.9;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi) * 0.55;
        z = r * Math.sin(phi) * Math.sin(theta);
        radialNorm = 0.25;
      }
    } else {
      // Spiral & Grand-Design Spiral (Andromeda, Whirlpool, Triangulum)
      if (i < count * 0.16) {
        // Dense central bulge
        const u = Math.pow(Math.random(), 1.7);
        const r = u * cfg.coreSize * 1.35;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.cos(phi) * 0.58;
        z = r * Math.sin(phi) * Math.sin(theta);
        radialNorm = u * 0.25;
      } else {
        const armIdx = i % cfg.arms;
        const armAngle = (armIdx / cfg.arms) * Math.PI * 2;
        const t = Math.pow(Math.random(), 0.78);
        const r = 0.6 + t * cfg.diskRadius;
        const spin = r * cfg.armTightness;
        const tightnessSpread = cfg.type === "grand-spiral" ? 0.24 : 0.36;
        const scatter = randGauss() * (tightnessSpread + t * 0.32);
        const a = armAngle + spin + scatter;
        x = Math.cos(a) * r;
        z = Math.sin(a) * r;
        y = randGauss() * cfg.diskThickness * (1.2 - t * 0.68);
        radialNorm = r / cfg.diskRadius;
        isNebulaKnot = t > 0.15 && Math.random() < 0.1 && Math.abs(scatter) < 0.13;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    if (isNebulaKnot) {
      tempCol.copy(nebCol);
    } else if (radialNorm < 0.32) {
      tempCol.copy(coreCol).lerp(midCol, radialNorm / 0.32);
    } else {
      tempCol
        .copy(midCol)
        .lerp(outerCol, Math.min(1, (radialNorm - 0.32) / 0.68));
    }

    const lum = 0.68 + Math.random() * 0.45;
    colors[i * 3] = Math.min(1, tempCol.r * lum);
    colors[i * 3 + 1] = Math.min(1, tempCol.g * lum);
    colors[i * 3 + 2] = Math.min(1, tempCol.b * lum);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.24,
    map: starTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  disposables.push(geo, mat);
  group.add(new THREE.Points(geo, mat));

  // Soft volumetric nebula glow layer (350 large soft clouds for true deep-space beauty)
  const nebCount = 320;
  const nebPos = new Float32Array(nebCount * 3);
  const nebColors = new Float32Array(nebCount * 3);
  for (let i = 0; i < nebCount; i++) {
    const srcIdx = Math.floor(Math.random() * count) * 3;
    nebPos[i * 3] = positions[srcIdx];
    nebPos[i * 3 + 1] = positions[srcIdx + 1] * 0.7;
    nebPos[i * 3 + 2] = positions[srcIdx + 2];
    const useNeb = i % 3 === 0;
    const c = useNeb ? nebCol : midCol;
    nebColors[i * 3] = c.r;
    nebColors[i * 3 + 1] = c.g;
    nebColors[i * 3 + 2] = c.b;
  }
  const nGeo = new THREE.BufferGeometry();
  nGeo.setAttribute("position", new THREE.BufferAttribute(nebPos, 3));
  nGeo.setAttribute("color", new THREE.BufferAttribute(nebColors, 3));
  const nMat = new THREE.PointsMaterial({
    size: 2.3,
    map: nebulaTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.11,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  disposables.push(nGeo, nMat);
  group.add(new THREE.Points(nGeo, nMat));

  // Luminous Central Galactic Core Glow Sprite
  const coreSpriteMat = new THREE.SpriteMaterial({
    map: nebulaTex,
    color: cfg.coreColor,
    transparent: true,
    opacity: cfg.type === "sombrero" || cfg.type === "elliptical-jet" ? 0.95 : 0.82,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  disposables.push(coreSpriteMat);
  const coreSprite = new THREE.Sprite(coreSpriteMat);
  const coreScale = cfg.coreSize * 3.2;
  coreSprite.scale.set(coreScale, coreScale, 1);
  group.add(coreSprite);

  // Special Feature A: Bima Sakti "Posisi Tata Surya & Bumi" 3D Pulsing Beacon
  if (cfg.showSolarSystemMarker) {
    const markerPos = new THREE.Vector3(6.4, 0.25, 3.2);
    const ringGeo = new THREE.RingGeometry(0.32, 0.44, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const dotGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    disposables.push(ringGeo, ringMat, dotGeo, dotMat);

    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(markerPos);
    ring.rotation.x = Math.PI / 2;
    const dot = new THREE.Mesh(dotGeo, dotMat);
    dot.position.copy(markerPos);
    group.add(ring, dot);
  }

  // Special Feature B: Andromeda Satellite Galaxies M32 & M110
  if (cfg.hasSatellites) {
    const sats: Array<[number, number, number, number, string]> = [
      [9.5, 2.2, -5.5, 1.8, "#FFE6A8"],
      [-11.5, -2.5, 6.2, 2.5, "#C7D8FF"],
    ];
    sats.forEach(([sx, sy, sz, sr, col]) => {
      const sc = 900;
      const sp = new Float32Array(sc * 3);
      for (let i = 0; i < sc; i++) {
        const r = Math.pow(Math.random(), 1.8) * sr;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        sp[i * 3] = sx + r * Math.sin(ph) * Math.cos(th);
        sp[i * 3 + 1] = sy + r * Math.cos(ph) * 0.65;
        sp[i * 3 + 2] = sz + r * Math.sin(ph) * Math.sin(th);
      }
      const sg = new THREE.BufferGeometry();
      sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
      const sm = new THREE.PointsMaterial({
        size: 0.2,
        map: starTex,
        color: col,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const glowM = new THREE.SpriteMaterial({
        map: nebulaTex,
        color: col,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glowS = new THREE.Sprite(glowM);
      glowS.position.set(sx, sy, sz);
      glowS.scale.set(sr * 2.2, sr * 2.2, 1);
      disposables.push(sg, sm, glowM);
      group.add(new THREE.Points(sg, sm), glowS);
    });
  }

  // Special Feature C: Whirlpool M51 Companion Galaxy NGC 5195 + Tidal Star Bridge
  if (cfg.hasCompanion) {
    const cx = 13.5;
    const cy = 0.8;
    const cz = 4.8;
    const cc = 1800;
    const cp = new Float32Array(cc * 3);
    for (let i = 0; i < cc; i++) {
      if (i < 1200) {
        const r = Math.pow(Math.random(), 1.7) * 2.8;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        cp[i * 3] = cx + r * Math.sin(ph) * Math.cos(th);
        cp[i * 3 + 1] = cy + r * Math.cos(ph) * 0.5;
        cp[i * 3 + 2] = cz + r * Math.sin(ph) * Math.sin(th);
      } else {
        // Tidal bridge connecting M51 spiral tip to NGC 5195
        const t = Math.random();
        cp[i * 3] = 7.5 + t * (cx - 7.5) + randGauss() * 0.6;
        cp[i * 3 + 1] = t * cy + randGauss() * 0.3;
        cp[i * 3 + 2] = 6.8 + t * (cz - 6.8) + Math.sin(t * Math.PI) * 1.4 + randGauss() * 0.6;
      }
    }
    const cg = new THREE.BufferGeometry();
    cg.setAttribute("position", new THREE.BufferAttribute(cp, 3));
    const cm = new THREE.PointsMaterial({
      size: 0.22,
      map: starTex,
      color: 0xffe4a3,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const csM = new THREE.SpriteMaterial({
      map: nebulaTex,
      color: 0xffe4a3,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cs = new THREE.Sprite(csM);
    cs.position.set(cx, cy, cz);
    cs.scale.set(5.5, 5.5, 1);
    disposables.push(cg, cm, csM);
    group.add(new THREE.Points(cg, cm), cs);
  }

  // Special Feature D: Messier 87 Relativistic 5,000-ly Blue Plasma Jet from M87*
  if (cfg.hasJet) {
    const jetDir = new THREE.Vector3(8.8, 5.8, 2.2).normalize();
    const jetCount = 2200;
    const jp = new Float32Array(jetCount * 3);
    const jc = new Float32Array(jetCount * 3);
    for (let i = 0; i < jetCount; i++) {
      const dist = Math.pow(Math.random(), 0.75) * 15.5;
      const spread = 0.06 + dist * 0.032;
      jp[i * 3] = jetDir.x * dist + randGauss() * spread;
      jp[i * 3 + 1] = jetDir.y * dist + randGauss() * spread;
      jp[i * 3 + 2] = jetDir.z * dist + randGauss() * spread;
      const coreHot = dist < 4;
      jc[i * 3] = coreHot ? 0.9 : 0.25;
      jc[i * 3 + 1] = coreHot ? 0.96 : 0.78;
      jc[i * 3 + 2] = 1.0;
    }
    const jg = new THREE.BufferGeometry();
    jg.setAttribute("position", new THREE.BufferAttribute(jp, 3));
    jg.setAttribute("color", new THREE.BufferAttribute(jc, 3));
    const jm = new THREE.PointsMaterial({
      size: 0.32,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(jg, jm);
    group.add(new THREE.Points(jg, jm));
  }

  return group;
}

export function GalaxyAtlas3D({
  bodies,
  bookmarkedSlugs,
  onToggleBookmark,
  onAskAi,
  onSwitchToSolar,
}: GalaxyAtlas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [activeSlug, setActiveSlug] = useState<string>("bima-sakti");
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [panelOpen, setPanelOpen] = useState(true);
  const [cameraPreset, setCameraPreset] = useState<"perspective" | "top" | "edge">(
    "perspective"
  );
  const [screenPins, setScreenPins] = useState<ScreenPin[]>([]);
  const [activePinLabel, setActivePinLabel] = useState<string | null>(null);

  const autoRotateRef = useRef(autoRotate);
  const showLabelsRef = useRef(showLabels);
  const cameraGoalRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);
  useEffect(() => {
    showLabelsRef.current = showLabels;
  }, [showLabels]);

  const activeConfig = useMemo(
    () =>
      GALAXY_3D_CONFIGS.find((g) => g.slug === activeSlug) ?? GALAXY_3D_CONFIGS[0],
    [activeSlug]
  );

  const activeBody = useMemo(
    () => bodies.find((b) => b.slug === activeSlug) ?? null,
    [bodies, activeSlug]
  );

  const handleSelectGalaxy = (slug: string) => {
    if (slug === activeSlug) return;
    soundEngine.playGalaxySelect();
    setActiveSlug(slug);
    setActivePinLabel(null);
    setCameraPreset("perspective");
  };

  const handleCameraPreset = (preset: "perspective" | "top" | "edge") => {
    soundEngine.playClick();
    setCameraPreset(preset);
    if (preset === "top") {
      cameraGoalRef.current = new THREE.Vector3(0, 31, 0.5);
    } else if (preset === "edge") {
      cameraGoalRef.current = new THREE.Vector3(0, 1.8, 28);
    } else {
      cameraGoalRef.current = new THREE.Vector3(0, 15, 25);
    }
  };

  // Build & animate Three.js 3D Galaxy Viewer
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#04060D");

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 600);
    // Sombrero looks iconic from low-angle tilt initially; spirals look stunning at 32° tilt
    if (activeConfig.slug === "sombrero") {
      camera.position.set(0, 4.8, 26);
    } else if (activeConfig.slug === "andromeda") {
      camera.position.set(0, 16, 29);
    } else {
      camera.position.set(0, 15, 25);
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 5.5;
    controls.maxDistance = 68;
    renderer.domElement.style.cursor = "grab";

    const onStart = () => {
      renderer.domElement.style.cursor = "grabbing";
      cameraGoalRef.current = null;
    };
    const onEnd = () => {
      renderer.domElement.style.cursor = "grab";
    };
    controls.addEventListener("start", onStart);
    controls.addEventListener("end", onEnd);

    const disposables: Array<{ dispose: () => void }> = [];

    const starTex = createGlowSpriteTexture(
      "rgba(255,255,255,1)",
      "rgba(215,228,255,0.5)",
      64
    );
    const nebulaTex = createGlowSpriteTexture(
      "rgba(255,250,235,0.9)",
      "rgba(243,201,105,0.28)",
      128
    );
    disposables.push(starTex, nebulaTex);

    // Distant deep-field background stars
    const bgCount = 2600;
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      const r = 110 + Math.random() * 180;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      bgPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      bgPos[i * 3 + 1] = r * Math.cos(ph);
      bgPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({
      size: 0.9,
      map: starTex,
      color: 0xcbd5f5,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    disposables.push(bgGeo, bgMat);
    scene.add(new THREE.Points(bgGeo, bgMat));

    // Main 3D Galaxy Model
    const galaxyGroup = buildGalaxyGroup(
      activeConfig,
      starTex,
      nebulaTex,
      disposables
    );
    scene.add(galaxyGroup);

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let animId = 0;
    let last = performance.now();
    let pinTick = 0;
    const projVec = new THREE.Vector3();

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (autoRotateRef.current) {
        galaxyGroup.rotation.y += dt * 0.13;
      }

      if (cameraGoalRef.current) {
        camera.position.lerp(cameraGoalRef.current, 0.09);
        if (camera.position.distanceTo(cameraGoalRef.current) < 0.15) {
          cameraGoalRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);

      // Project 3D structural annotations cleanly to 2D overlay
      pinTick += dt;
      if (pinTick > 0.05) {
        pinTick = 0;
        if (!showLabelsRef.current) {
          setScreenPins([]);
        } else {
          const w = container.clientWidth;
          const h = container.clientHeight;
          const nextPins: ScreenPin[] = activeConfig.annotations.map((ann) => {
            projVec
              .set(ann.position[0], ann.position[1], ann.position[2])
              .applyMatrix4(galaxyGroup.matrixWorld)
              .project(camera);
            const x = (projVec.x * 0.5 + 0.5) * w;
            const y = (-projVec.y * 0.5 + 0.5) * h;
            const visible =
              projVec.z < 1 && x > 40 && x < w - 40 && y > 70 && y < h - 90;
            return {
              label: ann.label,
              detail: ann.detail,
              color: ann.color,
              x,
              y,
              visible,
            };
          });
          setScreenPins(nextPins);
        }
      }
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.removeEventListener("start", onStart);
      controls.removeEventListener("end", onEnd);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeConfig]);

  const isBookmarked = activeBody
    ? bookmarkedSlugs.includes(activeBody.slug)
    : false;

  // Relative scale bar compared to Milky Way (105,700 ly)
  const diameterRatio = Math.min(100, Math.round((activeConfig.diameterLy / 220000) * 100));
  const milkyWayBar = Math.round((105700 / 220000) * 100);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#04060D] select-none">
      {/* Interactive 360° Rotatable 3D Galaxy WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Projected 3D Interactive Structural Annotation Pins */}
      {showLabels &&
        screenPins.map(
          (pin) =>
            pin.visible && (
              <div
                key={pin.label}
                style={{
                  transform: `translate(${pin.x}px, ${pin.y}px)`,
                }}
                className="absolute top-0 left-0 z-10 -translate-x-1/2 -translate-y-1/2"
              >
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setActivePinLabel((prev) =>
                      prev === pin.label ? null : pin.label
                    );
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#070A16]/80 px-2.5 py-1 backdrop-blur-md shadow-lg transition hover:border-white/35 hover:bg-[#0D1328]"
                >
                  <span
                    className="h-2 w-2 rounded-full shadow-sm"
                    style={{
                      backgroundColor: pin.color,
                      boxShadow: `0 0 8px ${pin.color}`,
                    }}
                  />
                  <span className="whitespace-nowrap font-mono text-[10.5px] font-medium text-[#F4F6FB]">
                    {pin.label}
                  </span>
                </button>
                {activePinLabel === pin.label && (
                  <div className="mt-1.5 w-56 rounded-xl border border-white/15 bg-[#080C1A]/95 p-2.5 text-[11px] leading-relaxed text-[#D4DCF2] shadow-2xl backdrop-blur-xl">
                    {pin.detail}
                  </div>
                )}
              </div>
            )
        )}

      {/* Top Floating Controls: Switch to Solar System + Camera Angles + Drag Hint */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playPlanetSelect();
              onSwitchToSolar();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="galaxy-glass inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-medium text-[#C8D1E8] transition hover:border-[#F3C969]/45 hover:text-white"
          >
            <Orbit className="h-3.5 w-3.5 text-[#F3C969]" />
            <span>← Tata Surya 3D</span>
          </button>

          {/* Camera Perspective Presets */}
          <div className="galaxy-glass flex items-center gap-1 rounded-2xl p-1">
            {(
              [
                ["perspective", "3D Miring"],
                ["top", "Atas"],
                ["edge", "Samping"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => handleCameraPreset(id)}
                className={`rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                  cameraPreset === id
                    ? "bg-[#7C8CFF]/25 text-white border border-[#7C8CFF]/45"
                    : "text-[#9AA4BF] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setAutoRotate((v) => !v);
            }}
            className={`galaxy-glass inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium transition ${
              autoRotate ? "text-[#38BDF8] border-[#38BDF8]/35" : "text-[#9AA4BF]"
            }`}
          >
            <RotateCw className={`h-3.5 w-3.5 ${autoRotate ? "animate-spin [animation-duration:6s]" : ""}`} />
            <span className="hidden sm:inline">Putar Otomatis</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShowLabels((v) => !v);
            }}
            className={`galaxy-glass inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium transition ${
              showLabels ? "text-[#F3C969] border-[#F3C969]/35" : "text-[#9AA4BF]"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Label Struktur</span>
          </button>
        </div>

        {/* Toggle Data Drawer Button when collapsed */}
        {!panelOpen && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setPanelOpen(true);
            }}
            className="pointer-events-auto galaxy-glass-strong inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-semibold text-white transition hover:border-[#7C8CFF]/50"
          >
            <ChevronLeft className="h-4 w-4 text-[#7C8CFF]" />
            <span>Data {activeConfig.name}</span>
          </button>
        )}
      </div>

      {/* Subtle 360° Interactive Hint Badge (bottom-left above selector) */}
      <div className="pointer-events-none absolute bottom-20 left-4 z-10 hidden md:flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#070A14]/70 px-3 py-1.5 text-[11px] text-[#9AA4BF] backdrop-blur-md">
        <Move3d className="h-3.5 w-3.5 text-[#7C8CFF]" />
        <span>Geser untuk memutar 360° • Scroll untuk zoom</span>
      </div>

      {/* Right Glassmorphic Scientific Data Inspector */}
      <AnimatePresence>
        {panelOpen && activeBody && (
          <motion.aside
            key={activeBody.slug}
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="galaxy-glass-strong absolute top-20 lg:top-4 right-4 bottom-20 z-20 flex w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.75)]"
          >
            <div className="flex items-start justify-between border-b border-white/[0.07] p-5 pb-4">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-[#7C8CFF]">
                  {activeBody.catalogCode}
                </span>
                <h2 className="mt-0.5 font-display text-2xl font-semibold tracking-tight text-[#F4F6FB]">
                  {activeBody.name}
                </h2>
                <p className="text-xs text-[#9AA4BF]">
                  {activeBody.classification}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onToggleBookmark(activeBody.slug);
                  }}
                  title="Bookmark galaksi"
                  className={`rounded-xl p-2 transition ${
                    isBookmarked
                      ? "bg-[#F3C969]/20 text-[#F3C969]"
                      : "text-[#9AA4BF] hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setPanelOpen(false);
                  }}
                  title="Sembunyikan panel untuk layar penuh"
                  className="rounded-xl p-2 text-[#9AA4BF] transition hover:bg-white/[0.07] hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Highlighted Galaxy Mass Card */}
              <div className="rounded-2xl border border-[#F3C969]/30 bg-gradient-to-br from-[#F3C969]/12 to-transparent p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#F3C969]">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Massa Total Galaksi</span>
                </div>
                <p className="mt-1 font-mono text-[16px] font-semibold text-[#F4F6FB] tabular-nums">
                  {activeBody.mass}
                </p>
                <p className="mt-0.5 font-mono text-[11px] text-[#C8D1E8]">
                  ≈ {activeBody.massKg}
                </p>
              </div>

              {/* Key Astrophysical Data Grid */}
              <div className="grid grid-cols-2 gap-2.5 tabular-nums">
                {[
                  { label: "Diameter", val: activeBody.diameter },
                  { label: "Jarak dari Bumi", val: activeBody.distance },
                  { label: "Populasi Bintang", val: activeBody.starCount },
                  { label: "Estimasi Usia", val: activeBody.age },
                  { label: "Rasi Bintang", val: activeBody.constellation },
                  { label: "Kecepatan Radial", val: activeBody.radialVelocity },
                ].map(
                  (row) =>
                    row.val && (
                      <div
                        key={row.label}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
                      >
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-[#64708F]">
                          {row.label}
                        </span>
                        <span className="mt-1 block font-mono text-[11.5px] leading-snug text-[#E8ECF8]">
                          {row.val}
                        </span>
                      </div>
                    )
                )}
              </div>

              {/* Central Supermassive Black Hole */}
              {activeBody.centralBlackHole && (
                <div className="rounded-xl border border-[#7C8CFF]/28 bg-[#7C8CFF]/[0.08] p-3.5">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9BA8FF]">
                    Lubang Hitam Supermasif Pusat
                  </span>
                  <p className="mt-1 font-mono text-xs text-[#F4F6FB]">
                    {activeBody.centralBlackHole}
                  </p>
                </div>
              )}

              {/* Scale Comparison Bar vs Bima Sakti */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2 tabular-nums">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9AA4BF]">
                  Perbandingan Diameter vs Bima Sakti
                </span>
                <div>
                  <div className="flex justify-between text-[11px] text-[#E2E8F8]">
                    <span>{activeConfig.name}</span>
                    <span className="font-mono">
                      {activeConfig.diameterLy.toLocaleString("id-ID")} ly
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7C8CFF] to-[#38BDF8] transition-all duration-500"
                      style={{ width: `${diameterRatio}%` }}
                    />
                  </div>
                </div>
                {activeConfig.slug !== "bima-sakti" && (
                  <div>
                    <div className="flex justify-between text-[11px] text-[#9AA4BF]">
                      <span>Bima Sakti (Acuan)</span>
                      <span className="font-mono">105.700 ly</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-[#F3C969]/75"
                        style={{ width: `${milkyWayBar}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <p className="text-xs leading-relaxed text-[#C2CCE4]">
                {activeBody.summary}
              </p>

              {/* Scientific Facts */}
              {activeBody.facts && activeBody.facts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#9AA4BF]">
                    Fakta Ilmiah Terverifikasi
                  </span>
                  {activeBody.facts.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[#B8C2DC]"
                    >
                      <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F3C969]" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.07] p-4">
              <button
                onClick={() =>
                  onAskAi(
                    activeBody.slug === "bima-sakti"
                      ? "Bandingkan Bima Sakti dan Galaksi Andromeda beserta massa dan takdir tabrakannya"
                      : `Jelaskan data lengkap, struktur, dan lubang hitam dari ${activeBody.name} serta bandingkan dengan Bima Sakti`
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C8CFF] to-[#4F9CF9] py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(124,140,255,0.35)] transition hover:brightness-110"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tanya AI tentang {activeConfig.name}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Bottom Floating Galaxy Selector Dock (Bima Sakti, Andromeda, + 5 Known Galaxies) */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex justify-center">
        <div className="pointer-events-auto galaxy-glass-strong flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl p-1.5 shadow-2xl">
          {GALAXY_3D_CONFIGS.map((gal) => {
            const active = gal.slug === activeSlug;
            return (
              <button
                key={gal.slug}
                type="button"
                onClick={() => handleSelectGalaxy(gal.slug)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-gradient-to-r from-[#7C8CFF]/30 to-[#38BDF8]/20 text-white border border-[#7C8CFF]/55 shadow-[0_0_16px_rgba(124,140,255,0.28)]"
                    : "text-[#9AA4BF] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: gal.nebulaColor,
                    boxShadow: active ? `0 0 8px ${gal.nebulaColor}` : "none",
                  }}
                />
                <span className="whitespace-nowrap">{gal.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

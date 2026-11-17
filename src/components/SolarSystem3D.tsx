"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Globe2,
  Bookmark,
  Sparkles,
  X,
  Trophy,
  Eye,
  Compass,
  Scale,
  Orbit as OrbitIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  SOLAR_3D_CONFIGS,
  SOLAR_MISSIONS,
  EARTH_ROTATION_LESSONS,
  type Planet3DConfig,
} from "@/lib/astronomyData";
import {
  createPlanetTexture,
  createRingTexture,
  createGlowSpriteTexture,
  createEarthCloudsTexture,
  createEarthNightTexture,
} from "@/lib/threeTextures";
import { soundEngine } from "@/lib/soundEngine";
import type { CelestialBody } from "@/db/schema";

interface SolarSystem3DProps {
  bodies: CelestialBody[];
  bookmarkedSlugs: string[];
  onToggleBookmark: (slug: string) => void;
  onAskAi: (prompt: string) => void;
  onSwitchToGalaxies: () => void;
  initialSpeed: number;
  missionScore: number;
  onUpdatePrefs: (patch: { defaultOrbitSpeed?: string; missionScore?: number }) => void;
}

const SPEED_PRESETS = [
  { label: "0.25×", value: 0.25 },
  { label: "1×", value: 1 },
  { label: "5×", value: 5 },
  { label: "15×", value: 15 },
  { label: "40×", value: 40 },
];

export function SolarSystem3D({
  bodies,
  bookmarkedSlugs,
  onToggleBookmark,
  onAskAi,
  onSwitchToGalaxies,
  initialSpeed,
  missionScore,
  onUpdatePrefs,
}: SolarSystem3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [speed, setSpeed] = useState<number>(initialSpeed || 1);
  const [isPaused, setIsPaused] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [earthLabOpen, setEarthLabOpen] = useState(false);
  const [earthLessonIdx, setEarthLessonIdx] = useState(0);
  const [earthDegree, setEarthDegree] = useState(0);
  const [simDays, setSimDays] = useState(0);
  const [planetLabels, setPlanetLabels] = useState<
    Array<{ slug: string; name: string; color: string; x: number; y: number; visible: boolean }>
  >([]);

  // 3D Alpha Mission mini-game state
  const [missionOpen, setMissionOpen] = useState(false);
  const [missionIdx, setMissionIdx] = useState(0);
  const [missionFeedback, setMissionFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // Refs synced into Three.js animation loop without re-creating scene
  const speedRef = useRef(speed);
  const pausedRef = useRef(isPaused);
  const selectedRef = useRef<string | null>(selectedSlug);
  const earthLabRef = useRef(earthLabOpen);
  const showOrbitsRef = useRef(showOrbits);
  const needsCameraSnapRef = useRef(false);
  const resetCameraRef = useRef(false);
  const onPlanetClickedRef = useRef<(slug: string) => void>(() => {});

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);
  useEffect(() => {
    selectedRef.current = selectedSlug;
  }, [selectedSlug]);
  useEffect(() => {
    earthLabRef.current = earthLabOpen;
  }, [earthLabOpen]);
  useEffect(() => {
    showOrbitsRef.current = showOrbits;
  }, [showOrbits]);

  const solarBodies = useMemo(
    () => bodies.filter((b) => b.category === "star" || b.category === "planet"),
    [bodies]
  );

  const selectedBody = useMemo(
    () => solarBodies.find((b) => b.slug === selectedSlug) ?? null,
    [solarBodies, selectedSlug]
  );

  const currentMission = SOLAR_MISSIONS[missionIdx % SOLAR_MISSIONS.length];

  const handleSelectPlanet = (slug: string) => {
    soundEngine.playPlanetSelect();
    setSelectedSlug(slug);
    if (slug !== "bumi") {
      setEarthLabOpen(false);
    }
    needsCameraSnapRef.current = true;

    // Evaluate active 3D Alpha mission if open
    if (missionOpen) {
      if (slug === currentMission.targetSlug) {
        soundEngine.playMissionSuccess();
        const nextScore = missionScore + currentMission.points;
        onUpdatePrefs({ missionScore: nextScore });
        setMissionFeedback({
          ok: true,
          text: `+${currentMission.points} Poin! ${currentMission.explanation}`,
        });
      } else {
        soundEngine.playMissionWrong();
        const picked = SOLAR_3D_CONFIGS.find((c) => c.slug === slug)?.name ?? slug;
        setMissionFeedback({
          ok: false,
          text: `Itu adalah ${picked}. Perhatikan petunjuk massa & rotasinya lalu klik planet lain!`,
        });
      }
    }
  };

  onPlanetClickedRef.current = handleSelectPlanet;

  const handleOpenEarthLab = () => {
    soundEngine.playPlanetSelect();
    const next = !earthLabOpen;
    setEarthLabOpen(next);
    if (next) {
      setSelectedSlug("bumi");
      setIsPaused(false);
      if (speed > 4 || speed === 0) setSpeed(1);
      needsCameraSnapRef.current = true;
    }
  };

  const handleResetOverview = () => {
    soundEngine.playClick();
    setSelectedSlug(null);
    setEarthLabOpen(false);
    resetCameraRef.current = true;
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (newSpeed > 0 && isPaused) setIsPaused(false);
    soundEngine.playSpeedTick(newSpeed / 50);
    onUpdatePrefs({ defaultOrbitSpeed: String(newSpeed) });
  };

  // Build Three.js 3D Solar System Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05070E");

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 900);
    camera.position.set(0, 38, 76);

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2.4;
    controls.maxDistance = 210;
    controls.maxPolarAngle = Math.PI * 0.92;

    // Lighting: Brilliant sunlight from origin + gentle galactic ambient so night sides stay readable
    const sunLight = new THREE.PointLight(0xfff4dc, 3.2, 0, 0);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x283558, 0.72);
    scene.add(ambientLight);

    const disposables: Array<{ dispose: () => void }> = [];

    // 1. Multicolor 3D Starfield Skybox (5,000 pinpoint glowing stars)
    const starTex = createGlowSpriteTexture(
      "rgba(255,255,255,1)",
      "rgba(180,205,255,0.45)",
      64
    );
    disposables.push(starTex);

    const starCount = 5000;
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const starPalette = [
      new THREE.Color("#FFFFFF"),
      new THREE.Color("#C7D7FF"),
      new THREE.Color("#FFE5A8"),
      new THREE.Color("#A5F3FC"),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 180 + Math.random() * 260;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      const c = starPalette[i % starPalette.length];
      const bright = 0.45 + Math.random() * 0.55;
      starCol[i * 3] = c.r * bright;
      starCol[i * 3 + 1] = c.g * bright;
      starCol[i * 3 + 2] = c.b * bright;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      map: starTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    disposables.push(starGeo, starMat);
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 2. Instanced 3D Asteroid Belt between Mars (20.8) and Jupiter (29.5)
    const asteroidCount = 650;
    const astGeo = new THREE.DodecahedronGeometry(0.11, 0);
    const astMat = new THREE.MeshStandardMaterial({
      color: 0x8d8882,
      roughness: 0.9,
      metalness: 0.1,
    });
    disposables.push(astGeo, astMat);
    const asteroidBelt = new THREE.InstancedMesh(astGeo, astMat, asteroidCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < asteroidCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 23.6 + Math.random() * 3.1;
      const y = (Math.random() - 0.5) * 1.1;
      dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      const s = 0.55 + Math.random() * 1.45;
      dummy.scale.set(s, s * 0.75, s);
      dummy.updateMatrix();
      asteroidBelt.setMatrixAt(i, dummy.matrix);
    }
    scene.add(asteroidBelt);

    // 3. Build Sun & All 8 Planets + Rings + Moon + Earth Rotation Gizmos
    interface PlanetNode {
      config: Planet3DConfig;
      angle: number;
      pivotGroup: THREE.Group;
      tiltGroup: THREE.Group;
      mesh: THREE.Mesh;
      hitMesh: THREE.Mesh;
      clouds?: THREE.Mesh;
      moonPivot?: THREE.Group;
      selectRing: THREE.Mesh;
    }

    const planetNodes: PlanetNode[] = [];
    const hitMeshes: THREE.Mesh[] = [];
    const orbitLines: THREE.Line[] = [];
    const earthLabGizmo = new THREE.Group();
    earthLabGizmo.visible = false;

    const coronaTex = createGlowSpriteTexture(
      "rgba(255,244,200,0.95)",
      "rgba(255,165,35,0.42)",
      256
    );
    disposables.push(coronaTex);

    SOLAR_3D_CONFIGS.forEach((cfg, idx) => {
      const incRad = THREE.MathUtils.degToRad(cfg.orbitInclinationDeg);

      // Orbit path ring
      if (cfg.orbitRadius > 0) {
        const segs = 160;
        const pts: THREE.Vector3[] = [];
        for (let s = 0; s <= segs; s++) {
          const a = (s / segs) * Math.PI * 2;
          const x = Math.cos(a) * cfg.orbitRadius;
          const z = Math.sin(a) * cfg.orbitRadius;
          const y = Math.sin(a) * Math.sin(incRad) * cfg.orbitRadius * 0.4;
          pts.push(new THREE.Vector3(x, y, z));
        }
        const oGeo = new THREE.BufferGeometry().setFromPoints(pts);
        const oMat = new THREE.LineBasicMaterial({
          color: cfg.slug === "bumi" ? 0x38bdf8 : 0x5c6b94,
          transparent: true,
          opacity: cfg.slug === "bumi" ? 0.36 : 0.2,
        });
        disposables.push(oGeo, oMat);
        const oLine = new THREE.Line(oGeo, oMat);
        scene.add(oLine);
        orbitLines.push(oLine);
      }

      const pivotGroup = new THREE.Group();
      scene.add(pivotGroup);

      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.z = THREE.MathUtils.degToRad(cfg.axialTiltDeg);
      pivotGroup.add(tiltGroup);

      const tex = createPlanetTexture(cfg.slug);
      disposables.push(tex);

      const geo = new THREE.SphereGeometry(cfg.radius, 48, 48);
      let mat: THREE.Material;

      if (cfg.slug === "matahari") {
        mat = new THREE.MeshBasicMaterial({ map: tex });
        // Layered solar corona sprites
        const spMat1 = new THREE.SpriteMaterial({
          map: coronaTex,
          color: 0xffb732,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sp1 = new THREE.Sprite(spMat1);
        sp1.scale.set(cfg.radius * 4.4, cfg.radius * 4.4, 1);
        pivotGroup.add(sp1);
        disposables.push(spMat1);
      } else if (cfg.slug === "bumi") {
        const nightTex = createEarthNightTexture();
        disposables.push(nightTex);
        mat = new THREE.MeshStandardMaterial({
          map: tex,
          emissive: new THREE.Color(0xffb84d),
          emissiveMap: nightTex,
          emissiveIntensity: 0.72,
          roughness: 0.58,
          metalness: 0.08,
        });
      } else {
        mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.75,
          metalness: 0.05,
        });
      }

      disposables.push(geo, mat);
      const mesh = new THREE.Mesh(geo, mat);
      tiltGroup.add(mesh);

      // Subtle Rayleigh atmosphere halo shell
      if (cfg.hasAtmosphere && cfg.atmosphereColor) {
        const atmoGeo = new THREE.SphereGeometry(cfg.radius * 1.045, 32, 32);
        const atmoMat = new THREE.MeshBasicMaterial({
          color: cfg.atmosphereColor,
          transparent: true,
          opacity: cfg.slug === "bumi" ? 0.16 : 0.09,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        disposables.push(atmoGeo, atmoMat);
        tiltGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
      }

      // Earth swirling clouds + Earth Rotation 3D Educational Gizmo (23.44° axis + equator + spin ring)
      let clouds: THREE.Mesh | undefined;
      let moonPivot: THREE.Group | undefined;

      if (cfg.slug === "bumi") {
        const cloudTex = createEarthCloudsTexture();
        const cloudGeo = new THREE.SphereGeometry(cfg.radius * 1.018, 40, 40);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.72,
          depthWrite: false,
        });
        disposables.push(cloudTex, cloudGeo, cloudMat);
        clouds = new THREE.Mesh(cloudGeo, cloudMat);
        tiltGroup.add(clouds);

        // Orbiting Moon (Luna)
        moonPivot = new THREE.Group();
        moonPivot.rotation.z = 0.09;
        pivotGroup.add(moonPivot);
        const moonTex = createPlanetTexture("bulan");
        const moonGeo = new THREE.SphereGeometry(0.28, 24, 24);
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.9,
        });
        disposables.push(moonTex, moonGeo, moonMat);
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.position.set(2.35, 0, 0);
        moonPivot.add(moonMesh);

        // Earth 23.44° Spin Axis Rod (Starlight Gold)
        const axisLen = cfg.radius * 3.4;
        const axisGeo = new THREE.CylinderGeometry(0.025, 0.025, axisLen, 12);
        const axisMat = new THREE.MeshBasicMaterial({ color: 0xf3c969 });
        const axisMesh = new THREE.Mesh(axisGeo, axisMat);
        earthLabGizmo.add(axisMesh);

        // North & South Pole glowing caps
        const poleGeo = new THREE.SphereGeometry(0.075, 16, 16);
        const northPole = new THREE.Mesh(
          poleGeo,
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        northPole.position.y = axisLen / 2;
        const southPole = new THREE.Mesh(
          poleGeo,
          new THREE.MeshBasicMaterial({ color: 0xf3c969 })
        );
        southPole.position.y = -axisLen / 2;
        earthLabGizmo.add(northPole, southPole);

        // Equatorial ring (Pulsar Cyan)
        const eqGeo = new THREE.TorusGeometry(cfg.radius * 1.18, 0.018, 12, 96);
        const eqMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.88,
        });
        const eqMesh = new THREE.Mesh(eqGeo, eqMat);
        eqMesh.rotation.x = Math.PI / 2;
        earthLabGizmo.add(eqMesh);

        // Outer prograde direction arc + cone tip
        const arcGeo = new THREE.TorusGeometry(cfg.radius * 1.48, 0.014, 8, 64, Math.PI * 1.35);
        const arcMat = new THREE.MeshBasicMaterial({
          color: 0xf3c969,
          transparent: true,
          opacity: 0.78,
        });
        const arcMesh = new THREE.Mesh(arcGeo, arcMat);
        arcMesh.rotation.x = Math.PI / 2;
        earthLabGizmo.add(arcMesh);

        disposables.push(axisGeo, axisMat, poleGeo, eqGeo, eqMat, arcGeo, arcMat);
        tiltGroup.add(earthLabGizmo);

        // Vertical ecliptic normal reference dashed line for comparing the 23.44° tilt
        const refGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, -axisLen * 0.52, 0),
          new THREE.Vector3(0, axisLen * 0.52, 0),
        ]);
        const refMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.25,
        });
        disposables.push(refGeo, refMat);
        const refLine = new THREE.Line(refGeo, refMat);
        refLine.name = "earthVerticalRef";
        refLine.visible = false;
        pivotGroup.add(refLine);
      }

      // Planetary Rings (Saturn & Uranus) with radial UVs
      if (cfg.hasRings && cfg.ringInner && cfg.ringOuter) {
        const ringGeo = new THREE.RingGeometry(cfg.ringInner, cfg.ringOuter, 96, 1);
        const pos = ringGeo.attributes.position;
        const uv = ringGeo.attributes.uv;
        const v3 = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v3.fromBufferAttribute(pos, i);
          const u = (v3.length() - cfg.ringInner) / (cfg.ringOuter - cfg.ringInner);
          uv.setXY(i, u, 0.5);
        }
        const ringTex = createRingTexture(cfg.slug === "saturnus");
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
        });
        disposables.push(ringGeo, ringTex, ringMat);
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        tiltGroup.add(ringMesh);
      }

      // Holographic selection/hover indicator ring
      const selGeo = new THREE.RingGeometry(cfg.radius * 1.32, cfg.radius * 1.4, 64);
      const selMat = new THREE.MeshBasicMaterial({
        color: 0x7c8cff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      disposables.push(selGeo, selMat);
      const selectRing = new THREE.Mesh(selGeo, selMat);
      selectRing.rotation.x = Math.PI / 2;
      pivotGroup.add(selectRing);

      // Generous invisible raycast hit sphere for effortless clicking
      const hitRadius = Math.max(cfg.radius * 1.65, 1.45);
      const hitGeo = new THREE.SphereGeometry(hitRadius, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      disposables.push(hitGeo, hitMat);
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { slug: cfg.slug, name: cfg.name };
      pivotGroup.add(hitMesh);
      hitMeshes.push(hitMesh);

      // Well-spread initial orbital angles so every planet is visible immediately
      const startAngles = [0, 0.7, 2.1, 0.95, 3.8, 5.4, 0.45, 2.75, 4.55];
      const angle = startAngles[idx] ?? idx * 0.9;
      if (cfg.orbitRadius > 0) {
        pivotGroup.position.set(
          Math.cos(angle) * cfg.orbitRadius,
          Math.sin(angle) * Math.sin(incRad) * cfg.orbitRadius * 0.4,
          Math.sin(angle) * cfg.orbitRadius
        );
      }

      planetNodes.push({
        config: cfg,
        angle,
        pivotGroup,
        tiltGroup,
        mesh,
        hitMesh,
        clouds,
        moonPivot,
        selectRing,
      });
    });

    // Raycasting for mouse hover & planet click (distinguish click vs camera drag)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let hoveredSlug: string | null = null;

    const getHit = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      return hits[0]?.object?.userData as { slug: string; name: string } | undefined;
    };

    const onPointerDown = (e: PointerEvent) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      const hit = getHit(e.clientX, e.clientY);
      if (hit) {
        if (hoveredSlug !== hit.slug) {
          hoveredSlug = hit.slug;
          setHoveredName(hit.name);
          soundEngine.playHover();
        }
        renderer.domElement.style.cursor = "pointer";
      } else if (hoveredSlug) {
        hoveredSlug = null;
        setHoveredName(null);
        renderer.domElement.style.cursor = "grab";
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist > 6) return; // was an orbit drag
      const hit = getHit(e.clientX, e.clientY);
      if (hit) {
        onPlanetClickedRef.current(hit.slug);
      }
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

    // Responsive ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    // Animation & Smooth Camera Planet-Tracking Loop
    let animId = 0;
    let lastTime = performance.now();
    let uiTimer = 0;
    let accumDays = 0;
    const prevTargetPos = new THREE.Vector3();
    let hasPrevTarget = false;
    const desiredCamOffset = new THREE.Vector3();
    let lerpFrames = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const activeSpeed = pausedRef.current ? 0 : speedRef.current;
      const isEarthLab = earthLabRef.current;

      // Toggle orbit visibility
      orbitLines.forEach((l) => {
        l.visible = showOrbitsRef.current;
      });

      // Toggle Earth 23.44° rotation lab gizmo
      earthLabGizmo.visible = isEarthLab;
      const earthNode = planetNodes.find((n) => n.config.slug === "bumi");
      const refLine = earthNode?.pivotGroup.getObjectByName("earthVerticalRef");
      if (refLine) refLine.visible = isEarthLab;

      // Rotate asteroid belt slowly
      asteroidBelt.rotation.y += dt * 0.025 * activeSpeed;
      starField.rotation.y += dt * 0.002;

      // Update planets orbit + axial spin
      planetNodes.forEach((node) => {
        const { config } = node;
        if (config.orbitRadius > 0) {
          // In Earth Rotation Lab, slow orbital translation slightly so day/night spin is super easy to study
          const orbitFactor = isEarthLab ? 0.12 : 0.35;
          node.angle += dt * config.orbitSpeedRad * orbitFactor * activeSpeed;
          const incRad = THREE.MathUtils.degToRad(config.orbitInclinationDeg);
          node.pivotGroup.position.set(
            Math.cos(node.angle) * config.orbitRadius,
            Math.sin(node.angle) * Math.sin(incRad) * config.orbitRadius * 0.4,
            Math.sin(node.angle) * config.orbitRadius
          );
        }

        node.mesh.rotation.y += dt * config.rotationSpeedRad * 0.65 * activeSpeed;
        if (node.clouds) {
          node.clouds.rotation.y += dt * config.rotationSpeedRad * 0.82 * activeSpeed;
        }
        if (node.moonPivot) {
          node.moonPivot.rotation.y += dt * 1.15 * activeSpeed;
        }

        // Selection / Hover ring glow
        const ringMat = node.selectRing.material as THREE.MeshBasicMaterial;
        const isSel = selectedRef.current === config.slug;
        const isHov = hoveredSlug === config.slug;
        ringMat.opacity = isSel ? 0.72 : isHov ? 0.42 : 0;
        ringMat.color.setHex(isSel ? 0xf3c969 : 0x7c8cff);
      });

      // Update simulated Earth days, Earth rotation angle & 3D planet labels
      accumDays += dt * activeSpeed * 8.5;
      uiTimer += dt;
      if (uiTimer > 0.06) {
        uiTimer = 0;
        setSimDays(Math.floor(accumDays));
        if (earthNode) {
          const deg =
            ((THREE.MathUtils.radToDeg(earthNode.mesh.rotation.y) % 360) + 360) %
            360;
          setEarthDegree(Math.round(deg));
        }

        if (showOrbitsRef.current && !selectedRef.current) {
          const cw = container.clientWidth;
          const ch = container.clientHeight;
          const proj = new THREE.Vector3();
          const nextLabels = planetNodes.map((n) => {
            proj
              .copy(n.pivotGroup.position)
              .add(new THREE.Vector3(0, n.config.radius + 1.15, 0))
              .project(camera);
            const lx = (proj.x * 0.5 + 0.5) * cw;
            const ly = (-proj.y * 0.5 + 0.5) * ch;
            const vis =
              proj.z < 1 && lx > 36 && lx < cw - 36 && ly > 72 && ly < ch - 115;
            return {
              slug: n.config.slug,
              name: n.config.name,
              color: n.config.colorHex,
              x: lx,
              y: ly,
              visible: vis,
            };
          });
          setPlanetLabels(nextLabels);
        } else {
          setPlanetLabels([]);
        }
      }

      // Camera Reset to Solar System overview
      if (resetCameraRef.current) {
        resetCameraRef.current = false;
        hasPrevTarget = false;
        lerpFrames = 38;
        desiredCamOffset.set(0, 38, 76);
      }

      const activeSlug = selectedRef.current;
      if (activeSlug) {
        const targetNode = planetNodes.find((n) => n.config.slug === activeSlug);
        if (targetNode) {
          const pos = targetNode.pivotGroup.position;

          if (needsCameraSnapRef.current) {
            needsCameraSnapRef.current = false;
            const r = targetNode.config.radius;
            const dist = isEarthLab
              ? r * 3.8
              : targetNode.config.hasRings
              ? r * 4.8
              : Math.max(r * 4.2, 4.2);

            // Position camera perpendicular to sunlight so day/night terminator is clearly visible!
            const toSun = pos.length() > 0.1
              ? pos.clone().normalize()
              : new THREE.Vector3(0, 0, 1);
            const side = new THREE.Vector3(-toSun.z, 0, toSun.x).normalize();
            desiredCamOffset
              .copy(side)
              .multiplyScalar(dist * 0.92)
              .add(toSun.clone().multiplyScalar(dist * 0.25))
              .add(new THREE.Vector3(0, dist * 0.34, 0));
            lerpFrames = 36;
            prevTargetPos.copy(pos);
            hasPrevTarget = true;
          } else if (hasPrevTarget) {
            // Move camera along with the orbiting planet seamlessly
            const delta = pos.clone().sub(prevTargetPos);
            camera.position.add(delta);
            prevTargetPos.copy(pos);
          }

          controls.target.lerp(pos, 0.16);
          if (lerpFrames > 0) {
            lerpFrames--;
            const goal = pos.clone().add(desiredCamOffset);
            camera.position.lerp(goal, 0.12);
          }
        }
      } else if (lerpFrames > 0) {
        lerpFrames--;
        controls.target.lerp(new THREE.Vector3(0, 0, 0), 0.12);
        camera.position.lerp(desiredCamOffset, 0.1);
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const isBookmarked = selectedBody
    ? bookmarkedSlugs.includes(selectedBody.slug)
    : false;

  // Simulated WIB clock from Earth's live 3D rotation angle
  const wibTotalMinutes = Math.floor((earthDegree / 360) * 24 * 60);
  const wibHour = String(Math.floor(wibTotalMinutes / 60)).padStart(2, "0");
  const wibMin = String(wibTotalMinutes % 60).padStart(2, "0");
  const isJakartaDay = Number(wibHour) >= 6 && Number(wibHour) < 18;

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#05070E] select-none">
      {/* Full-Viewport 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Crisp Floating 3D Planet Telemetry Labels (visible in overview) */}
      {showOrbits &&
        !selectedSlug &&
        planetLabels.map(
          (lbl) =>
            lbl.visible && (
              <button
                key={lbl.slug}
                type="button"
                onClick={() => handleSelectPlanet(lbl.slug)}
                style={{ transform: `translate(${lbl.x}px, ${lbl.y}px)` }}
                className="absolute top-0 left-0 z-10 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full border border-white/10 bg-[#060914]/70 px-2 py-0.5 font-mono text-[10px] text-[#DCE3F5] backdrop-blur-xs transition hover:border-[#F3C969]/55 hover:bg-[#0D1328] hover:text-white"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: lbl.color }}
                />
                <span>{lbl.name}</span>
              </button>
            )
        )}

      {/* Top-Left Floating HUD: 3D Game [ALPHA] Mode Chooser & Tools */}
      <div className="pointer-events-none absolute top-4 left-4 right-4 z-20 flex flex-wrap items-start justify-between gap-3">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          {/* 3D Game Alpha Mode Switcher */}
          <div className="galaxy-glass-strong flex items-center gap-1 rounded-2xl p-1.5 shadow-xl">
            <span className="ml-1.5 mr-1 inline-flex items-center gap-1 rounded-lg bg-[#F3C969]/18 border border-[#F3C969]/35 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[#F3C969]">
              ALPHA 3D
            </span>
            <button
              type="button"
              className="rounded-xl bg-[#7C8CFF]/25 border border-[#7C8CFF]/50 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Tata Surya
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playGalaxySelect();
                onSwitchToGalaxies();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-[#9AA4BF] transition hover:bg-white/[0.06] hover:text-white"
            >
              Galaksi 3D
            </button>
          </div>

          {/* Dedicated Earth Rotation Learning Trigger */}
          <button
            type="button"
            onClick={handleOpenEarthLab}
            onMouseEnter={() => soundEngine.playHover()}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold shadow-lg transition ${
              earthLabOpen
                ? "bg-[#38BDF8] text-[#05070E] shadow-[0_0_24px_rgba(56,189,248,0.55)]"
                : "galaxy-glass text-[#E2E8F8] hover:border-[#38BDF8]/50 hover:text-white"
            }`}
          >
            <Globe2 className="h-4 w-4" />
            <span>Pelajari Rotasi Bumi</span>
          </button>

          {/* Gamified 3D Mission Quiz Toggle */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setMissionOpen((v) => !v);
              setMissionFeedback(null);
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className={`inline-flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold shadow-lg transition ${
              missionOpen
                ? "bg-[#F3C969] text-[#05070E] shadow-[0_0_24px_rgba(243,201,105,0.45)]"
                : "galaxy-glass text-[#E2E8F8] hover:border-[#F3C969]/50 hover:text-white"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Misi Kuis</span>
            <span className="font-mono text-[11px] opacity-85 tabular-nums">
              {missionScore}
            </span>
          </button>

          {(selectedSlug || earthLabOpen) && (
            <button
              type="button"
              onClick={handleResetOverview}
              onMouseEnter={() => soundEngine.playHover()}
              className="galaxy-glass inline-flex items-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-medium text-[#C8D1E8] transition hover:border-white/25 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Lihat Semua</span>
            </button>
          )}
        </div>

        {/* Hovered Planet Telemetry Pill */}
        <AnimatePresence>
          {hoveredName && !selectedBody && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="galaxy-glass rounded-full px-3.5 py-1.5 text-xs font-medium text-[#F4F6FB]"
            >
              Klik <span className="font-semibold text-[#F3C969]">{hoveredName}</span>{" "}
              untuk melihat data &amp; massa
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gamified 3D Mission Card (Bottom-Left / Top-Left below bar) */}
      <AnimatePresence>
        {missionOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="galaxy-glass-strong absolute top-20 left-4 z-20 w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#F3C969]">
                {currentMission.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[#9AA4BF] tabular-nums">
                  Skor: {missionScore}
                </span>
                <button
                  onClick={() => setMissionOpen(false)}
                  className="rounded-lg p-1 text-[#64708F] hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#E2E8F8]">
              {currentMission.clue}
            </p>

            {missionFeedback && (
              <div
                className={`mt-3 flex items-start gap-2 rounded-xl p-2.5 text-xs leading-relaxed ${
                  missionFeedback.ok
                    ? "border border-emerald-400/30 bg-emerald-500/12 text-emerald-200"
                    : "border border-amber-400/30 bg-amber-500/12 text-amber-200"
                }`}
              >
                {missionFeedback.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                )}
                <span>{missionFeedback.text}</span>
              </div>
            )}

            {missionFeedback?.ok && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setMissionFeedback(null);
                  setMissionIdx((i) => (i + 1) % SOLAR_MISSIONS.length);
                }}
                className="mt-3 w-full rounded-xl bg-[#F3C969] py-2 text-xs font-semibold text-[#05070E] transition hover:brightness-105"
              >
                Lanjut Misi Berikutnya →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Earth Rotation Interactive Lab Card (Left Panel when active) */}
      <AnimatePresence>
        {earthLabOpen && !missionOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="galaxy-glass-strong absolute top-20 left-4 z-20 max-h-[calc(100vh-14.5rem)] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-3xl p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#38BDF8]">
                  Laboratorium 3D Interaktif
                </span>
                <h2 className="mt-0.5 font-display text-lg font-semibold text-[#F4F6FB]">
                  Simulasi Rotasi Bumi
                </h2>
              </div>
              <button
                onClick={() => setEarthLabOpen(false)}
                className="rounded-lg p-1 text-[#64708F] transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Live Rotation & WIB Telemetry Strip */}
            <div className="mt-3.5 grid grid-cols-3 gap-2 rounded-2xl border border-white/[0.08] bg-[#060913]/80 p-3 text-center tabular-nums">
              <div>
                <span className="block text-[10px] text-[#64708F]">Sudut Poros</span>
                <span className="font-mono text-sm font-semibold text-[#F3C969]">
                  {earthDegree}°
                </span>
              </div>
              <div className="border-x border-white/[0.06]">
                <span className="block text-[10px] text-[#64708F]">Simulasi WIB</span>
                <span className="font-mono text-sm font-semibold text-[#F4F6FB]">
                  {wibHour}:{wibMin}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#64708F]">Fase</span>
                <span
                  className={`font-mono text-xs font-semibold ${
                    isJakartaDay ? "text-[#F3C969]" : "text-[#7C8CFF]"
                  }`}
                >
                  {isJakartaDay ? "☀ Siang" : "☾ Malam"}
                </span>
              </div>
            </div>

            {/* Legend for 3D Gizmos on Earth */}
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#9AA4BF]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#F3C969]" />
                Sumbu Miring 23,44°
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
                Garis Khatulistiwa
              </span>
            </div>

            {/* Lesson Tabs */}
            <div className="mt-3.5 grid grid-cols-2 gap-1.5">
              {EARTH_ROTATION_LESSONS.map((les, i) => (
                <button
                  key={les.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setEarthLessonIdx(i);
                  }}
                  className={`rounded-xl px-2.5 py-2 text-left text-[11px] font-medium transition ${
                    earthLessonIdx === i
                      ? "bg-[#38BDF8]/20 text-white border border-[#38BDF8]/50"
                      : "border border-white/[0.06] bg-white/[0.02] text-[#9AA4BF] hover:text-white"
                  }`}
                >
                  {les.title}
                </button>
              ))}
            </div>

            <div className="mt-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-base font-semibold text-[#38BDF8]">
                  {EARTH_ROTATION_LESSONS[earthLessonIdx].metric}
                </span>
                <span className="text-[11px] text-[#9AA4BF]">
                  {EARTH_ROTATION_LESSONS[earthLessonIdx].subtitle}
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#C8D1E8]">
                {EARTH_ROTATION_LESSONS[earthLessonIdx].body}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-In Right Telemetry Drawer for Clicked Planet / Sun */}
      <AnimatePresence>
        {selectedBody && (
          <motion.aside
            key={selectedBody.slug}
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="galaxy-glass-strong absolute top-20 sm:top-4 right-4 bottom-28 sm:bottom-24 z-20 flex w-[calc(100vw-2rem)] max-w-[370px] flex-col overflow-hidden rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.7)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.07] p-5 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: selectedBody.colorHex }}
                  />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#9AA4BF]">
                    {selectedBody.catalogCode}
                  </span>
                </div>
                <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-[#F4F6FB]">
                  {selectedBody.name}
                </h2>
                <p className="text-xs text-[#9AA4BF]">
                  {selectedBody.classification}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onToggleBookmark(selectedBody.slug);
                  }}
                  title="Simpan bookmark"
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
                    setSelectedSlug(null);
                    setEarthLabOpen(false);
                  }}
                  className="rounded-xl p-2 text-[#9AA4BF] transition hover:bg-white/[0.07] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Scientific Data Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Highlighted MASSA Hero Card */}
              <div className="rounded-2xl border border-[#F3C969]/30 bg-gradient-to-br from-[#F3C969]/12 to-transparent p-4">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#F3C969]">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Massa {selectedBody.name}</span>
                </div>
                <p className="mt-1 font-mono text-xl font-semibold text-[#F4F6FB] tabular-nums">
                  {selectedBody.mass}
                </p>
                <p className="mt-0.5 text-xs text-[#C8D1E8]">
                  {selectedBody.massComparison}
                </p>
              </div>

              {/* Key Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2.5 tabular-nums">
                {[
                  { label: "Diameter", val: selectedBody.diameter },
                  { label: "Gravitasi", val: selectedBody.gravity },
                  { label: "Rotasi (1 Hari)", val: selectedBody.rotationPeriod },
                  { label: "Kemiringan Sumbu", val: selectedBody.axialTilt },
                  { label: "Kecepatan Rotasi", val: selectedBody.rotationSpeed },
                  { label: "Revolusi (1 Tahun)", val: selectedBody.orbitalPeriod },
                  { label: "Kecepatan Orbit", val: selectedBody.orbitalSpeed },
                  { label: "Jarak Matahari", val: selectedBody.distance },
                  { label: "Suhu Rata-Rata", val: selectedBody.temperature },
                  { label: "Satelit Alami", val: selectedBody.moonsCount },
                ].map(
                  (item) =>
                    item.val && (
                      <div
                        key={item.label}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3"
                      >
                        <span className="block text-[10px] font-medium uppercase tracking-wider text-[#64708F]">
                          {item.label}
                        </span>
                        <span className="mt-1 block font-mono text-[11.5px] leading-snug text-[#E8ECF8]">
                          {item.val}
                        </span>
                      </div>
                    )
                )}
              </div>

              {/* Atmosphere */}
              {selectedBody.atmosphere && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-[#64708F]">
                    Komposisi Atmosfer
                  </span>
                  <p className="mt-1 text-xs leading-relaxed text-[#D0D8EC]">
                    {selectedBody.atmosphere}
                  </p>
                </div>
              )}

              {/* Summary */}
              <p className="text-xs leading-relaxed text-[#C2CCE4]">
                {selectedBody.summary}
              </p>

              {/* Rotation Insight */}
              {selectedBody.rotationInsight && (
                <div className="rounded-2xl border border-[#38BDF8]/25 bg-[#38BDF8]/[0.07] p-3.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#38BDF8]">
                    <OrbitIcon className="h-3.5 w-3.5" />
                    <span>Dinamika Rotasi ({selectedBody.rotationDirection})</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#D4E4F7]">
                    {selectedBody.rotationInsight}
                  </p>
                </div>
              )}

              {/* Scientific Facts */}
              {selectedBody.facts && selectedBody.facts.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#9AA4BF]">
                    Fakta Observatorium
                  </span>
                  {selectedBody.facts.map((fact, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs leading-relaxed text-[#B8C2DC]"
                    >
                      <Compass className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7C8CFF]" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Action: Ask Galaxy AI */}
            <div className="border-t border-white/[0.07] p-4">
              <button
                onClick={() =>
                  onAskAi(
                    `Jelaskan secara mendalam tentang ${selectedBody.name}, termasuk massa, rotasi, dan fakta uniknya`
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7C8CFF] to-[#4F9CF9] py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(124,140,255,0.35)] transition hover:brightness-110"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tanya Galaxy AI tentang {selectedBody.name}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Bottom Floating HUD: Planet Quick-Selector + Orbital Speed Controller */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex flex-col items-center gap-2">
        {/* Quick Clickable Planet Selector Pills */}
        <div className="pointer-events-auto galaxy-glass flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl px-2 py-1.5 shadow-xl">
          {SOLAR_3D_CONFIGS.map((cfg) => {
            const active = selectedSlug === cfg.slug;
            return (
              <button
                key={cfg.slug}
                type="button"
                onClick={() => handleSelectPlanet(cfg.slug)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-white/[0.14] text-white border border-white/25"
                    : "text-[#9AA4BF] hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: cfg.colorHex }}
                />
                <span>{cfg.name}</span>
              </button>
            );
          })}
        </div>

        {/* Speed Slider & Orbit Controls Bar */}
        <div className="pointer-events-auto galaxy-glass-strong flex max-w-full flex-wrap items-center justify-center gap-3 rounded-2xl px-4 py-2.5 shadow-2xl">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setIsPaused((p) => !p);
            }}
            aria-label={isPaused ? "Putar simulasi" : "Jeda simulasi"}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7C8CFF]/22 text-white transition hover:bg-[#7C8CFF]/35"
          >
            {isPaused ? (
              <Play className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Pause className="h-3.5 w-3.5 fill-current" />
            )}
          </button>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-[#9AA4BF]">
              Kecepatan
            </span>
            <input
              type="range"
              min={0}
              max={50}
              step={0.25}
              value={isPaused ? 0 : speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="cosmic-slider w-24 sm:w-32"
              aria-label="Pengatur kecepatan orbit tata surya"
            />
            <span className="w-12 font-mono text-xs font-semibold text-[#F3C969] tabular-nums">
              {isPaused ? "0×" : `${speed}×`}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 border-l border-white/[0.08] pl-3">
            {SPEED_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleSpeedChange(p.value)}
                className={`rounded-lg px-2 py-1 font-mono text-[11px] transition ${
                  !isPaused && speed === p.value
                    ? "bg-[#7C8CFF]/25 text-white"
                    : "text-[#64708F] hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowOrbits((v) => !v);
              }}
              title="Tampilkan/sembunyikan garis orbit"
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition ${
                showOrbits ? "text-[#C8D1E8]" : "text-[#64708F]"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Orbit</span>
            </button>
            <span className="hidden lg:inline font-mono text-[11px] text-[#64708F] tabular-nums">
              Hari +{simDays.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

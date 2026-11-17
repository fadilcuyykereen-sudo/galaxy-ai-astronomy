"use client";

import * as THREE from "three";

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createGlowSpriteTexture(
  innerRgba = "rgba(255,255,255,1)",
  midRgba = "rgba(255,220,150,0.45)",
  size = 128
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const half = size / 2;
  const g = ctx.createRadialGradient(half, half, 0, half, half, half);
  g.addColorStop(0, innerRgba);
  g.addColorStop(0.22, midRgba);
  g.addColorStop(0.6, "rgba(124,140,255,0.08)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createRingTexture(isSaturn: boolean): THREE.CanvasTexture {
  const w = 512;
  const h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const rng = seededRandom(isSaturn ? 777 : 888);

  for (let x = 0; x < w; x++) {
    const t = x / w;
    if (isSaturn) {
      // Cassini division & Encke gap
      let alpha = 0.78;
      if (t < 0.14) alpha = t * 2.2;
      else if (t > 0.58 && t < 0.65) alpha = 0.05; // Cassini Division
      else if (t > 0.86 && t < 0.885) alpha = 0.12; // Encke gap
      else if (t > 0.94) alpha = (1 - t) * 8;
      else alpha = 0.45 + 0.42 * Math.abs(Math.sin(t * 38)) * (0.75 + rng() * 0.25);

      const shade = 195 + Math.floor(Math.sin(t * 55) * 32 + rng() * 18);
      const r = Math.min(255, shade + 18);
      const g = Math.min(245, shade);
      const b = Math.min(220, shade - 34);
      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(0.92, Math.max(0, alpha))})`;
    } else {
      // Delicate icy cyan rings of Uranus
      const band = Math.sin(t * 42) > 0.3 ? 0.38 : 0.08;
      ctx.fillStyle = `rgba(165,243,252,${band})`;
    }
    ctx.fillRect(x, 0, 1, h);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createEarthCloudsTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const rng = seededRandom(3031);

  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < 240; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const rx = 14 + rng() * 52;
    const ry = 4 + rng() * 12;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rx);
    g.addColorStop(0, `rgba(255,255,255,${0.25 + rng() * 0.35})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function createEarthNightTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const rng = seededRandom(9090);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  // City light clusters near continental coordinates
  const hubs: Array<[number, number, number]> = [
    [0.53, 0.32, 34], // Europe
    [0.72, 0.38, 38], // East/South Asia
    [0.79, 0.53, 24], // Indonesia / Nusantara!
    [0.24, 0.35, 34], // North America
    [0.34, 0.62, 18], // South America
    [0.56, 0.48, 16], // Africa / Nile
    [0.85, 0.68, 14], // Australia
  ];

  hubs.forEach(([ux, uy, count]) => {
    for (let i = 0; i < count; i++) {
      const x = ux * w + (rng() - 0.5) * 48;
      const y = uy * h + (rng() - 0.5) * 26;
      ctx.fillStyle = `rgba(255,205,110,${0.45 + rng() * 0.55})`;
      ctx.beginPath();
      ctx.arc(x, y, 0.9 + rng() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createPlanetTexture(slug: string): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const rng = seededRandom(
    slug.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17)
  );

  if (slug === "matahari") {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#FF9E1B");
    g.addColorStop(0.5, "#FFD24C");
    g.addColorStop(1, "#FF8C1A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 650; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const r = 3 + rng() * 18;
      ctx.fillStyle =
        rng() > 0.35
          ? `rgba(255,246,190,${0.12 + rng() * 0.22})`
          : `rgba(235,95,12,${0.12 + rng() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (slug === "bumi") {
    // Deep sapphire oceans
    const ocean = ctx.createLinearGradient(0, 0, 0, h);
    ocean.addColorStop(0, "#164B8A");
    ocean.addColorStop(0.5, "#0E4C92");
    ocean.addColorStop(1, "#123D73");
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, w, h);

    // Continental landmasses (stylized equirectangular Earth including Indonesia!)
    const drawMass = (
      ux: number,
      uy: number,
      rx: number,
      ry: number,
      col: string,
      blobs = 14
    ) => {
      for (let i = 0; i < blobs; i++) {
        const bx = ux * w + (rng() - 0.5) * rx * 1.4;
        const by = uy * h + (rng() - 0.5) * ry * 1.4;
        const brx = rx * (0.28 + rng() * 0.45);
        const bry = ry * (0.28 + rng() * 0.45);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.ellipse(bx, by, brx, bry, rng() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // North & South America
    drawMass(0.22, 0.31, 48, 34, "#2D7D52", 18);
    drawMass(0.2, 0.35, 26, 18, "#8C7D53", 6);
    drawMass(0.32, 0.63, 30, 44, "#25754A", 16);
    // Europe & Africa
    drawMass(0.53, 0.28, 34, 22, "#358558", 14);
    drawMass(0.55, 0.52, 42, 46, "#3A824E", 16);
    drawMass(0.55, 0.42, 38, 18, "#C2A36B", 10); // Sahara
    // Eurasia & India
    drawMass(0.7, 0.3, 76, 36, "#2F7D50", 24);
    drawMass(0.68, 0.38, 38, 18, "#9E8A5E", 8);
    // Nusantara / Indonesia archipelago along equator!
    drawMass(0.79, 0.52, 34, 9, "#229A58", 12);
    // Australia
    drawMass(0.85, 0.68, 28, 20, "#B87D4B", 10);

    // Polar ice caps
    ctx.fillStyle = "rgba(240,248,255,0.92)";
    ctx.fillRect(0, 0, w, 15);
    ctx.fillRect(0, h - 20, w, 20);

    // Prime Meridian & Equator subtle shine in shallow seas
    ctx.fillStyle = "rgba(56,189,248,0.12)";
    ctx.fillRect(w * 0.74, h * 0.48, 52, 16);
  } else if (slug === "merkurius" || slug === "bulan") {
    ctx.fillStyle = slug === "merkurius" ? "#8C8680" : "#9E9EA4";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const r = 2 + rng() * 18;
      ctx.fillStyle =
        rng() > 0.5 ? "rgba(65,62,60,0.35)" : "rgba(195,190,185,0.22)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(220,215,210,0.2)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  } else if (slug === "venus") {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#D4A359");
    g.addColorStop(0.5, "#ECC77E");
    g.addColorStop(1, "#C99346");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) {
      const y = rng() * h;
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,238,195,0.18)" : "rgba(176,118,45,0.18)";
      ctx.fillRect(0, y, w, 4 + rng() * 14);
    }
  } else if (slug === "mars") {
    ctx.fillStyle = "#C45B33";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) {
      const x = rng() * w;
      const y = rng() * h;
      const r = 6 + rng() * 32;
      ctx.fillStyle =
        rng() > 0.45 ? "rgba(128,46,24,0.28)" : "rgba(228,132,84,0.24)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Polar CO2 & water ice caps
    ctx.fillStyle = "rgba(248,245,242,0.88)";
    ctx.fillRect(0, 0, w, 10);
    ctx.fillRect(0, h - 10, w, 10);
  } else if (slug === "jupiter") {
    const bands = [
      "#9C7E63",
      "#E5D2B5",
      "#C47E4F",
      "#F0E2CA",
      "#B86B3E",
      "#EBD8BC",
      "#D19A6A",
      "#F2E5CE",
      "#B56E45",
      "#DEC7A8",
      "#8F755E",
    ];
    const bh = h / bands.length;
    bands.forEach((col, i) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, i * bh, w, bh + 2);
    });
    // Turbulent eddies
    for (let i = 0; i < 120; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,245,228,0.18)" : "rgba(165,82,42,0.18)";
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 14 + rng() * 36, 2 + rng() * 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Great Red Spot
    ctx.fillStyle = "#C84B28";
    ctx.beginPath();
    ctx.ellipse(w * 0.58, h * 0.64, 32, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(252,220,190,0.6)";
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (slug === "saturnus") {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#A9956B");
    g.addColorStop(0.25, "#E8D39E");
    g.addColorStop(0.5, "#F5E6BE");
    g.addColorStop(0.75, "#DFC488");
    g.addColorStop(1, "#9E8B64");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 48; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,248,220,0.14)" : "rgba(168,138,82,0.14)";
      ctx.fillRect(0, (i / 48) * h, w, h / 48 + 1);
    }
  } else if (slug === "uranus") {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#A5F3FC");
    g.addColorStop(0.5, "#5EEAD4");
    g.addColorStop(1, "#38BDF8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = "rgba(224,242,254,0.1)";
      ctx.fillRect(0, (i / 24) * h, w, 6);
    }
  } else {
    // Neptunus
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1E3A8A");
    g.addColorStop(0.5, "#2563EB");
    g.addColorStop(1, "#1D4ED8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 36; i++) {
      ctx.fillStyle =
        i % 3 === 0 ? "rgba(191,219,254,0.22)" : "rgba(30,58,138,0.25)";
      ctx.beginPath();
      ctx.ellipse(rng() * w, rng() * h, 22 + rng() * 48, 2 + rng() * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Great Dark Spot
    ctx.fillStyle = "rgba(15,28,84,0.65)";
    ctx.beginPath();
    ctx.ellipse(w * 0.42, h * 0.58, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

"use client";

export type CosmicStyle =
  | "Fotorealistik JWST"
  | "Sinematik Sci-Fi"
  | "Nebula Inframerah"
  | "Seni Konsep Kosmik"
  | "Observatorium Deep-Field"
  | "Cyberpunk Orbital";

export type AspectRatioOption = "1:1" | "16:9" | "9:16";

export interface Palette {
  bg1: [number, number, number];
  bg2: [number, number, number];
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  warm: [number, number, number];
}

const STYLE_PALETTES: Record<CosmicStyle, Palette> = {
  "Fotorealistik JWST": {
    bg1: [4, 6, 14],
    bg2: [12, 18, 38],
    primary: [243, 182, 92],
    secondary: [72, 152, 238],
    accent: [255, 229, 168],
    warm: [228, 118, 62],
  },
  "Sinematik Sci-Fi": {
    bg1: [5, 7, 15],
    bg2: [14, 22, 42],
    primary: [124, 140, 255],
    secondary: [56, 189, 248],
    accent: [243, 201, 105],
    warm: [245, 158, 11],
  },
  "Nebula Inframerah": {
    bg1: [8, 4, 14],
    bg2: [28, 10, 32],
    primary: [244, 114, 182],
    secondary: [251, 146, 60],
    accent: [103, 232, 249],
    warm: [239, 68, 68],
  },
  "Seni Konsep Kosmik": {
    bg1: [6, 8, 18],
    bg2: [18, 20, 48],
    primary: [167, 139, 250],
    secondary: [52, 211, 153],
    accent: [253, 224, 71],
    warm: [244, 114, 182],
  },
  "Observatorium Deep-Field": {
    bg1: [3, 4, 10],
    bg2: [9, 13, 26],
    primary: [147, 197, 253],
    secondary: [243, 201, 105],
    accent: [224, 242, 254],
    warm: [217, 155, 82],
  },
  "Cyberpunk Orbital": {
    bg1: [6, 4, 18],
    bg2: [20, 10, 44],
    primary: [34, 211, 238],
    secondary: [232, 121, 249],
    accent: [129, 140, 248],
    warm: [251, 113, 133],
  },
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createNoise2D(rng: () => number) {
  const size = 128;
  const grid = new Float32Array(size * size);
  for (let i = 0; i < grid.length; i++) grid[i] = rng();

  const sample = (x: number, y: number) => {
    const xi = ((Math.floor(x) % size) + size) % size;
    const yi = ((Math.floor(y) % size) + size) % size;
    const x1 = (xi + 1) % size;
    const y1 = (yi + 1) % size;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const aa = grid[yi * size + xi];
    const ba = grid[yi * size + x1];
    const ab = grid[y1 * size + xi];
    const bb = grid[y1 * size + x1];
    const top = aa + (ba - aa) * u;
    const bot = ab + (bb - ab) * u;
    return top + (bot - top) * v;
  };

  return (x: number, y: number, octaves = 5) => {
    let val = 0;
    let amp = 0.5;
    let freq = 1;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      val += sample(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2.04;
    }
    return val / norm;
  };
}

function rgba(c: [number, number, number], a: number): string {
  return `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${a})`;
}

function applyColorOverrides(base: Palette, q: string): Palette {
  const p: Palette = {
    bg1: [...base.bg1],
    bg2: [...base.bg2],
    primary: [...base.primary],
    secondary: [...base.secondary],
    accent: [...base.accent],
    warm: [...base.warm],
  };

  if (/merah|crimson|ruby|darah|lava|magma|mars/.test(q)) {
    p.primary = [239, 83, 64];
    p.warm = [251, 146, 60];
  }
  if (/emas|gold|kuning|amber|surya/.test(q)) {
    p.primary = [245, 196, 92];
    p.accent = [255, 240, 185];
  }
  if (/biru|blue|safir|sapphire|neptunus/.test(q)) {
    p.secondary = [59, 130, 246];
    p.primary = [96, 165, 250];
  }
  if (/hijau|zamrud|emerald|green/.test(q)) {
    p.secondary = [52, 211, 153];
    p.accent = [167, 243, 208];
  }
  if (/ungu|violet|purple|lavender/.test(q)) {
    p.primary = [168, 85, 247];
    p.secondary = [129, 140, 248];
  }
  if (/pink|merah muda|mawar|magenta|rose/.test(q)) {
    p.primary = [244, 114, 182];
    p.warm = [232, 121, 249];
  }
  if (/sian|cyan|toska|turquoise|uranus|es|beku|ice/.test(q)) {
    p.primary = [56, 189, 248];
    p.secondary = [103, 232, 249];
    p.accent = [224, 242, 254];
  }
  return p;
}

export function enhanceAstronomyPrompt(prompt: string, style: CosmicStyle): string {
  const styleDesc: Record<CosmicStyle, string> = {
    "Fotorealistik JWST":
      "James Webb Space Telescope NIRCam ultra-deep infrared astrophotography, 6-point diffraction spikes, volumetric ionized dust, 8K clarity",
    "Sinematik Sci-Fi":
      "IMAX 70mm cinematic space photography, physically accurate relativistic lighting, subtle anamorphic glow, museum-grade contrast",
    "Nebula Inframerah":
      "Hubble & Spitzer false-color emission spectroscopy, glowing H-alpha and O-III plasma filaments, intricate dark Bok globules",
    "Seni Konsep Kosmik":
      "Luminous fine-art astronomical concept illustration, dramatic scale, atmospheric scattering, rich celestial harmony",
    "Observatorium Deep-Field":
      "Long-exposure deep-field telescope plate, thousands of distant background galaxies, pinpoint star clusters, obsidian sky",
    "Cyberpunk Orbital":
      "High-tech futuristic orbital telemetry aesthetic, neon cyan & violet ionized plasma, crisp specular reflections",
  };
  return `${prompt.trim()} — ${styleDesc[style]}`;
}

function drawDiffractionStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: [number, number, number],
  sixPoint: boolean
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";

  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 7);
  glow.addColorStop(0, "rgba(255,255,255,0.98)");
  glow.addColorStop(0.16, rgba(color, 0.8));
  glow.addColorStop(0.45, rgba(color, 0.2));
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 7, 0, Math.PI * 2);
  ctx.fill();

  const angles = sixPoint
    ? [0, Math.PI / 3, (2 * Math.PI) / 3]
    : [0, Math.PI / 2];
  const spikeLen = radius * 16;

  angles.forEach((ang) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const lg = ctx.createLinearGradient(-spikeLen, 0, spikeLen, 0);
    lg.addColorStop(0, "rgba(0,0,0,0)");
    lg.addColorStop(0.42, rgba(color, 0.35));
    lg.addColorStop(0.5, "rgba(255,255,255,0.95)");
    lg.addColorStop(0.58, rgba(color, 0.35));
    lg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = lg;
    ctx.lineWidth = Math.max(1, radius * 0.42);
    ctx.beginPath();
    ctx.moveTo(-spikeLen, 0);
    ctx.lineTo(spikeLen, 0);
    ctx.stroke();
    ctx.restore();
  });

  ctx.restore();
}

function drawBlackHole(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  palette: Palette,
  tilt: number,
  rng: () => number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // Ambient gravitational glow
  ctx.globalCompositeOperation = "lighter";
  const outerGlow = ctx.createRadialGradient(0, 0, scale * 0.4, 0, 0, scale * 3.1);
  outerGlow.addColorStop(0, rgba(palette.accent, 0.45));
  outerGlow.addColorStop(0.35, rgba(palette.primary, 0.25));
  outerGlow.addColorStop(0.7, rgba(palette.secondary, 0.08));
  outerGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, scale * 3.1, 0, Math.PI * 2);
  ctx.fill();

  // Upper & lower gravitationally lensed halo rings
  for (let i = 0; i < 28; i++) {
    const r = scale * (1.02 + i * 0.022);
    const alpha = Math.max(0.012, 0.16 * Math.exp(-i * 0.12));
    ctx.strokeStyle = i < 6 ? rgba(palette.accent, alpha * 1.5) : rgba(palette.primary, alpha);
    ctx.lineWidth = scale * 0.035;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.08, r * 0.98, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Back accretion disk swirl
  for (let i = 0; i < 70; i++) {
    const rx = scale * (1.25 + i * 0.028);
    const ry = rx * 0.23;
    const a = 0.085 * Math.sin((i / 70) * Math.PI) * (0.7 + rng() * 0.6);
    ctx.strokeStyle = i % 3 === 0 ? rgba(palette.accent, a) : rgba(palette.warm, a);
    ctx.lineWidth = scale * (0.02 + rng() * 0.025);
    ctx.beginPath();
    ctx.ellipse(0, -scale * 0.04, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }

  // Event horizon shadow (pure obsidian sphere)
  ctx.globalCompositeOperation = "source-over";
  const shadow = ctx.createRadialGradient(0, 0, scale * 0.72, 0, 0, scale * 1.03);
  shadow.addColorStop(0, "rgba(0,0,0,1)");
  shadow.addColorStop(0.86, "rgba(2,2,6,1)");
  shadow.addColorStop(0.95, rgba(palette.accent, 0.9));
  shadow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(0, 0, scale * 1.03, 0, Math.PI * 2);
  ctx.fill();

  // Crisp photon ring
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,250,235,0.92)";
  ctx.lineWidth = Math.max(2, scale * 0.024);
  ctx.beginPath();
  ctx.arc(0, 0, scale * 0.96, 0, Math.PI * 2);
  ctx.stroke();

  // Front accretion disk crossing right in front of the black hole with Doppler beaming
  for (let i = 0; i < 95; i++) {
    const t = i / 95;
    const rx = scale * (1.18 + t * 2.15);
    const ry = rx * 0.2;
    const intensity = Math.sin(t * Math.PI) * 0.16;
    const grad = ctx.createLinearGradient(-rx, 0, rx, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.22, rgba([255, 250, 230], intensity * 1.7)); // Doppler boosted side
    grad.addColorStop(0.5, rgba(palette.primary, intensity * 1.25));
    grad.addColorStop(0.8, rgba(palette.warm, intensity * 0.8));
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.strokeStyle = grad;
    ctx.lineWidth = scale * (0.018 + rng() * 0.03);
    ctx.beginPath();
    ctx.ellipse(0, scale * 0.05, rx, ry, 0, -0.12, Math.PI + 0.12);
    ctx.stroke();
  }

  ctx.restore();
}

function drawGalaxy(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  palette: Palette,
  tiltAngle: number,
  flatness: number,
  rng: () => number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltAngle);
  ctx.scale(1, flatness);
  ctx.globalCompositeOperation = "lighter";

  // Soft spiral arm clouds
  const arms = rng() > 0.45 ? 2 : 4;
  for (let i = 0; i < 420; i++) {
    const r = Math.pow(rng(), 0.72) * radius;
    const arm = (i % arms) * ((Math.PI * 2) / arms);
    const spin = (r / radius) * 4.4;
    const spread = (rng() - 0.5) * 0.65;
    const angle = arm + spin + spread;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    const size = radius * (0.04 + (1 - r / radius) * 0.09) * (0.5 + rng() * 0.8);

    const col =
      r < radius * 0.28
        ? palette.accent
        : rng() > 0.78
        ? palette.warm
        : rng() > 0.4
        ? palette.secondary
        : palette.primary;

    const g = ctx.createRadialGradient(x, y, 0, x, y, size);
    g.addColorStop(0, rgba(col, 0.09));
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp spiral star clusters (3,800 stars)
  for (let i = 0; i < 3800; i++) {
    const r = Math.pow(rng(), 0.85) * radius * 1.08;
    const arm = (i % arms) * ((Math.PI * 2) / arms);
    const spin = (r / radius) * 4.4;
    const gauss = (rng() + rng() + rng() - 1.5) * (0.35 + (r / radius) * 0.35);
    const a = arm + spin + gauss;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const t = r / radius;
    const col =
      t < 0.22
        ? [255, 244, 214]
        : rng() > 0.88
        ? palette.warm
        : t < 0.6
        ? palette.primary
        : palette.secondary;
    ctx.fillStyle = rgba(col as [number, number, number], 0.25 + rng() * 0.65);
    const s = rng() > 0.96 ? 2.2 : 1.15;
    ctx.fillRect(x, y, s, s);
  }

  // Dark cosmic dust lanes for photorealistic depth
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 120; i++) {
    const r = (0.15 + rng() * 0.72) * radius;
    const arm = (i % arms) * ((Math.PI * 2) / arms);
    const a = arm + (r / radius) * 4.4 - 0.18 + (rng() - 0.5) * 0.15;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const sz = radius * (0.03 + rng() * 0.05);
    const dg = ctx.createRadialGradient(x, y, 0, x, y, sz);
    dg.addColorStop(0, "rgba(6,5,12,0.34)");
    dg.addColorStop(1, "rgba(6,5,12,0)");
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.arc(x, y, sz, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blazing galactic core bulge
  ctx.globalCompositeOperation = "lighter";
  const core = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.48);
  core.addColorStop(0, "rgba(255,253,242,1)");
  core.addColorStop(0.14, rgba(palette.accent, 0.9));
  core.addColorStop(0.4, rgba(palette.primary, 0.35));
  core.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.48, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  palette: Palette,
  hasRings: boolean,
  isEarthLike: boolean,
  rng: () => number,
  noise: (x: number, y: number, oct?: number) => number
) {
  ctx.save();
  const ringTilt = -0.28 + (rng() - 0.5) * 0.25;

  // Back half of rings
  if (hasRings) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ringTilt);
    for (let i = 0; i < 65; i++) {
      const t = i / 65;
      // Cassini gap
      if (t > 0.56 && t < 0.63) continue;
      const rx = radius * (1.35 + t * 1.15);
      const ry = rx * 0.26;
      const alpha = (0.14 + 0.35 * Math.sin(t * Math.PI * 3) ** 2) * (1 - t * 0.35);
      ctx.strokeStyle = i % 2 === 0 ? rgba(palette.accent, alpha) : rgba(palette.primary, alpha * 0.85);
      ctx.lineWidth = Math.max(1.2, radius * 0.02);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Atmospheric outer limb glow
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const atmoColor: [number, number, number] = isEarthLike
    ? [72, 178, 255]
    : palette.secondary;
  const atmo = ctx.createRadialGradient(
    cx - radius * 0.22,
    cy - radius * 0.2,
    radius * 0.82,
    cx,
    cy,
    radius * 1.24
  );
  atmo.addColorStop(0, "rgba(0,0,0,0)");
  atmo.addColorStop(0.62, rgba(atmoColor, 0.45));
  atmo.addColorStop(0.82, rgba(atmoColor, 0.16));
  atmo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = atmo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Planet sphere clipped
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // Base planet color
  const baseGrad = ctx.createRadialGradient(
    cx - radius * 0.4,
    cy - radius * 0.35,
    radius * 0.05,
    cx,
    cy,
    radius * 1.25
  );
  if (isEarthLike) {
    baseGrad.addColorStop(0, "#56CCF2");
    baseGrad.addColorStop(0.45, "#1B5E9E");
    baseGrad.addColorStop(1, "#07152B");
  } else {
    baseGrad.addColorStop(0, rgba(palette.accent, 1));
    baseGrad.addColorStop(0.45, rgba(palette.primary, 1));
    baseGrad.addColorStop(0.85, rgba(palette.secondary, 0.95));
    baseGrad.addColorStop(1, rgba(palette.bg1, 1));
  }
  ctx.fillStyle = baseGrad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Surface texture (continents + clouds for Earth, atmospheric bands for gas giant)
  if (isEarthLike) {
    const step = Math.max(3, Math.floor(radius / 45));
    for (let py = -radius; py < radius; py += step) {
      for (let px = -radius; px < radius; px += step) {
        if (px * px + py * py > radius * radius) continue;
        const n = noise((px / radius) * 3.2 + 4, (py / radius) * 3.2 + 7, 4);
        if (n > 0.53) {
          ctx.fillStyle =
            Math.abs(py) > radius * 0.78
              ? "rgba(235,245,255,0.85)"
              : n > 0.64
              ? "rgba(166,142,92,0.75)"
              : "rgba(42,138,84,0.78)";
          ctx.fillRect(cx + px, cy + py, step + 1, step + 1);
        }
        const cloud = noise((px / radius) * 5.2 + 19, (py / radius) * 4.4 + 2, 4);
        if (cloud > 0.6) {
          ctx.fillStyle = `rgba(255,255,255,${(cloud - 0.58) * 1.7})`;
          ctx.fillRect(cx + px, cy + py, step + 1, step + 1);
        }
      }
    }
  } else {
    // Gas bands & swirling storms
    for (let i = 0; i < 42; i++) {
      const y = cy - radius + (i / 42) * radius * 2;
      const h = (radius * 2) / 36;
      const n = noise(i * 0.45, 2.3, 3);
      ctx.fillStyle =
        n > 0.55
          ? rgba(palette.accent, 0.2)
          : n < 0.42
          ? rgba(palette.bg2, 0.34)
          : rgba(palette.warm, 0.18);
      ctx.fillRect(cx - radius, y, radius * 2, h);
    }
    // Great anticyclonic oval storm
    ctx.fillStyle = rgba(palette.warm, 0.36);
    ctx.beginPath();
    ctx.ellipse(
      cx - radius * 0.18,
      cy + radius * 0.22,
      radius * 0.22,
      radius * 0.11,
      -0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Realistic day-night terminator shadow
  const shadow = ctx.createRadialGradient(
    cx - radius * 0.55,
    cy - radius * 0.48,
    radius * 0.35,
    cx - radius * 0.2,
    cy - radius * 0.18,
    radius * 1.48
  );
  shadow.addColorStop(0, "rgba(255,255,255,0.12)");
  shadow.addColorStop(0.45, "rgba(0,0,0,0)");
  shadow.addColorStop(0.75, "rgba(3,5,12,0.78)");
  shadow.addColorStop(1, "rgba(2,3,8,0.97)");
  ctx.fillStyle = shadow;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Glowing golden city lights on night side of Earth/civilization planet
  if (isEarthLike) {
    for (let i = 0; i < 160; i++) {
      const px = (rng() * 1.1 - 0.1) * radius;
      const py = (rng() * 1.4 - 0.7) * radius;
      if (px * px + py * py < radius * radius * 0.85 && px + py * 0.6 > radius * 0.18) {
        ctx.fillStyle = `rgba(255,204,112,${0.35 + rng() * 0.55})`;
        ctx.fillRect(cx + px, cy + py, 1.8, 1.8);
      }
    }
  }

  // Fresnel rim highlight on sunlit crescent
  ctx.strokeStyle = rgba(atmoColor, 0.65);
  ctx.lineWidth = Math.max(2, radius * 0.03);
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 1, Math.PI * 0.75, Math.PI * 1.75);
  ctx.stroke();

  ctx.restore();

  // Front half of rings crossing over planet
  if (hasRings) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(ringTilt);
    for (let i = 0; i < 65; i++) {
      const t = i / 65;
      if (t > 0.56 && t < 0.63) continue;
      const rx = radius * (1.35 + t * 1.15);
      const ry = rx * 0.26;
      const alpha = (0.18 + 0.4 * Math.sin(t * Math.PI * 3) ** 2) * (1 - t * 0.3);
      ctx.strokeStyle = i % 2 === 0 ? rgba(palette.accent, alpha) : rgba(palette.primary, alpha * 0.85);
      ctx.lineWidth = Math.max(1.3, radius * 0.022);
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.restore();
}

function drawComet(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  rng: () => number
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const hx = w * (0.3 + rng() * 0.22);
  const hy = h * (0.52 + rng() * 0.16);
  const tx = hx + w * 0.48;
  const ty = hy - h * 0.36;

  // Blue straight ion tail
  const ion = ctx.createLinearGradient(hx, hy, tx, ty);
  ion.addColorStop(0, "rgba(165,243,252,0.85)");
  ion.addColorStop(0.35, "rgba(56,189,248,0.35)");
  ion.addColorStop(1, "rgba(0,0,0,0)");
  ctx.strokeStyle = ion;
  ctx.lineWidth = Math.min(w, h) * 0.022;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(tx, ty);
  ctx.stroke();

  // Sweeping golden dust tail fan
  for (let i = 0; i < 24; i++) {
    const spread = (i / 24) * 0.22;
    const dust = ctx.createLinearGradient(hx, hy, tx, ty + h * spread);
    dust.addColorStop(0, rgba(palette.accent, 0.14));
    dust.addColorStop(0.5, rgba(palette.primary, 0.05));
    dust.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = dust;
    ctx.lineWidth = Math.min(w, h) * 0.018;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.quadraticCurveTo(
      (hx + tx) * 0.5,
      (hy + ty) * 0.5 + h * spread * 0.3,
      tx,
      ty + h * spread
    );
    ctx.stroke();
  }

  drawDiffractionStar(ctx, hx, hy, Math.min(w, h) * 0.022, [140, 240, 255], true);
  ctx.restore();
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  noise: (x: number, y: number, oct?: number) => number
) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let band = 0; band < 3; band++) {
    const baseY = h * (0.44 + band * 0.08);
    const col: [number, number, number] =
      band === 0 ? [52, 211, 153] : band === 1 ? palette.secondary : [168, 85, 247];
    for (let x = 0; x < w; x += 4) {
      const wave = Math.sin(x * 0.008 + band * 2.1) * h * 0.055 +
        (noise(x * 0.012, band * 3.1, 3) - 0.5) * h * 0.08;
      const curtainH = h * (0.16 + noise(x * 0.02, band + 9, 3) * 0.16);
      const y = baseY + wave;
      const ag = ctx.createLinearGradient(x, y - curtainH, x, y + h * 0.04);
      ag.addColorStop(0, "rgba(0,0,0,0)");
      ag.addColorStop(0.45, rgba([168, 85, 247], 0.05));
      ag.addColorStop(0.82, rgba(col, 0.16));
      ag.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ag;
      ctx.fillRect(x, y - curtainH, 5, curtainH + h * 0.04);
    }
  }
  ctx.restore();
}

function drawHorizonAndExplorer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  palette: Palette,
  withAstronaut: boolean,
  withWater: boolean,
  noise: (x: number, y: number, oct?: number) => number
) {
  const horizonY = h * 0.77;

  // Atmospheric horizon glow
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const hg = ctx.createLinearGradient(0, horizonY - h * 0.18, 0, horizonY + h * 0.06);
  hg.addColorStop(0, "rgba(0,0,0,0)");
  hg.addColorStop(0.7, rgba(palette.secondary, 0.25));
  hg.addColorStop(1, rgba(palette.accent, 0.38));
  ctx.fillStyle = hg;
  ctx.fillRect(0, horizonY - h * 0.18, w, h * 0.24);
  ctx.restore();

  if (withWater) {
    // Mirror flip upper sky onto alien crystal sea
    ctx.save();
    ctx.translate(0, horizonY * 2);
    ctx.scale(1, -0.34);
    ctx.globalAlpha = 0.52;
    ctx.drawImage(ctx.canvas, 0, 0, w, horizonY, 0, 0, w, horizonY);
    ctx.restore();

    // Subtle water ripples
    ctx.fillStyle = "rgba(4,7,18,0.45)";
    ctx.fillRect(0, horizonY, w, h - horizonY);
    for (let y = horizonY; y < h; y += 3) {
      const shimmer = noise(y * 0.12, 1.5, 2);
      ctx.fillStyle = rgba(palette.accent, shimmer * 0.08);
      ctx.fillRect(w * (0.2 + shimmer * 0.2), y, w * (0.6 - shimmer * 0.4), 1.2);
    }
  }

  // Distant mountain range silhouette
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let x = 0; x <= w; x += 6) {
    const ridge =
      (noise(x * 0.006, 4.2, 5) - 0.45) * h * 0.16 +
      (withWater ? Math.abs(x / w - 0.5) * -h * 0.06 + h * 0.04 : 0);
    const py = horizonY - ridge;
    ctx.lineTo(x, withWater && x > w * 0.22 && x < w * 0.78 ? horizonY + h * 0.01 : py);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  const mg = ctx.createLinearGradient(0, horizonY - h * 0.12, 0, h);
  mg.addColorStop(0, "rgb(14,19,36)");
  mg.addColorStop(0.5, "rgb(6,9,18)");
  mg.addColorStop(1, "rgb(2,3,8)");
  ctx.fillStyle = mg;
  ctx.fill();

  // Foreground rocky promontory + backlit astronaut silhouette
  if (withAstronaut) {
    const ax = w * 0.5;
    const ay = h * 0.84;
    const s = Math.min(w, h) * 0.085;

    // Cliff peak
    ctx.fillStyle = "rgb(4,6,13)";
    ctx.beginPath();
    ctx.moveTo(w * 0.26, h);
    ctx.lineTo(ax - s * 0.8, ay + s * 0.18);
    ctx.lineTo(ax + s * 0.7, ay + s * 0.16);
    ctx.lineTo(w * 0.74, h);
    ctx.closePath();
    ctx.fill();

    // Rim backlight halo around astronaut
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const rim = ctx.createRadialGradient(ax, ay - s * 0.45, 0, ax, ay - s * 0.45, s * 1.1);
    rim.addColorStop(0, rgba(palette.accent, 0.38));
    rim.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rim;
    ctx.beginPath();
    ctx.arc(ax, ay - s * 0.45, s * 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Astronaut silhouette (legs, torso, PLSS backpack, helmet, golden visor glint)
    ctx.fillStyle = "#060912";
    ctx.strokeStyle = rgba(palette.accent, 0.75);
    ctx.lineWidth = 1.6;

    // Backpack
    ctx.fillRect(ax - s * 0.24, ay - s * 0.72, s * 0.48, s * 0.44);
    // Torso
    ctx.beginPath();
    ctx.roundRect(ax - s * 0.2, ay - s * 0.68, s * 0.4, s * 0.44, s * 0.08);
    ctx.fill();
    ctx.stroke();
    // Legs
    ctx.fillRect(ax - s * 0.18, ay - s * 0.26, s * 0.14, s * 0.44);
    ctx.fillRect(ax + s * 0.04, ay - s * 0.26, s * 0.14, s * 0.44);
    // Helmet
    ctx.beginPath();
    ctx.arc(ax, ay - s * 0.84, s * 0.17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Golden visor reflection
    ctx.fillStyle = rgba(palette.accent, 0.65);
    ctx.beginPath();
    ctx.arc(ax, ay - s * 0.85, s * 0.11, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
  }
}

export async function renderCosmicImageDataUrl(options: {
  prompt: string;
  style: CosmicStyle;
  aspectRatio: AspectRatioOption;
  seed: number;
}): Promise<string> {
  const { prompt, style, aspectRatio, seed } = options;
  const dims: Record<AspectRatioOption, [number, number]> = {
    "1:1": [1024, 1024],
    "16:9": [1280, 720],
    "9:16": [720, 1280],
  };
  const [w, h] = dims[aspectRatio];
  const minD = Math.min(w, h);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");

  const rng = mulberry32(seed);
  const noise = createNoise2D(rng);
  const q = prompt.toLowerCase();
  const palette = applyColorOverrides(STYLE_PALETTES[style], q);

  // 1. Deep-space obsidian sky gradient
  const sky = ctx.createLinearGradient(0, 0, w * 0.7, h);
  sky.addColorStop(0, rgba(palette.bg1, 1));
  sky.addColorStop(0.5, rgba(palette.bg2, 1));
  sky.addColorStop(1, rgba(palette.bg1, 1));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // 2. Domain-warped volumetric fBM nebula buffer (upscaled smoothly)
  const nw = Math.round(w / 4);
  const nh = Math.round(h / 4);
  const nebCanvas = document.createElement("canvas");
  nebCanvas.width = nw;
  nebCanvas.height = nh;
  const nctx = nebCanvas.getContext("2d")!;
  const imgData = nctx.createImageData(nw, nh);
  const data = imgData.data;

  const isHeavyNebula =
    style === "Nebula Inframerah" ||
    /nebula|pilar|awan|carina|orion|kosmik|warna|indah/.test(q);
  const nebIntensity = isHeavyNebula ? 1.15 : 0.68;
  const ox = rng() * 50;
  const oy = rng() * 50;

  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      const u = (x / nw) * 3.4 + ox;
      const v = (y / nh) * 3.4 + oy;
      // Domain warping for silky organic nebula filaments
      const wx = noise(u, v, 4);
      const wy = noise(u + 5.2, v + 1.3, 4);
      const f = noise(u + 2.2 * wx, v + 2.2 * wy, 5);
      const f2 = noise(u * 1.6 - wy * 1.8, v * 1.6 + wx * 1.8, 4);

      const ridge = Math.pow(Math.max(0, 1 - Math.abs(f * 2 - 1)), 2.6);
      const cloud = Math.max(0, f - 0.36) * 1.55;
      const dust = f2 < 0.36 ? 0.45 : 1.0;

      const r =
        (palette.primary[0] * cloud * 0.72 +
          palette.secondary[0] * f2 * 0.48 +
          palette.accent[0] * ridge * 0.55) *
        nebIntensity *
        dust;
      const g =
        (palette.primary[1] * cloud * 0.72 +
          palette.secondary[1] * f2 * 0.48 +
          palette.accent[1] * ridge * 0.55) *
        nebIntensity *
        dust;
      const b =
        (palette.primary[2] * cloud * 0.72 +
          palette.secondary[2] * f2 * 0.48 +
          palette.accent[2] * ridge * 0.55) *
        nebIntensity *
        dust;

      const idx = (y * nw + x) * 4;
      data[idx] = Math.min(255, r);
      data[idx + 1] = Math.min(255, g);
      data[idx + 2] = Math.min(255, b);
      data[idx + 3] = Math.min(235, (cloud * 155 + ridge * 95) * nebIntensity);
    }
  }
  nctx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.filter = "blur(6px)";
  ctx.drawImage(nebCanvas, 0, 0, w, h);
  ctx.restore();

  // 3. Rich realistic starfield (2,600 stars with blackbody colors)
  const starColors: Array<[number, number, number]> = [
    [185, 215, 255],
    [255, 255, 255],
    [255, 244, 214],
    [255, 210, 161],
    [165, 243, 252],
  ];
  for (let i = 0; i < 2600; i++) {
    const sx = rng() * w;
    const sy = rng() * h;
    const sr = Math.pow(rng(), 4.2) * 2.6 + 0.45;
    const sc = starColors[Math.floor(rng() * starColors.length)];
    ctx.fillStyle = rgba(sc, 0.25 + rng() * 0.75);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Semantic Subject Detection & Composition
  const wantBlackHole = /lubang hitam|black\s*hole|gargantua|event horizon|singularitas|kuasar|quasar/.test(q);
  const wantGalaxy = /galaksi|galaxy|bima sakti|milky way|andromeda|spiral|sombrero|whirlpool|m31|m87|m51/.test(q);
  const wantRings = /saturnus|saturn|cincin|ring|uranus/.test(q);
  const wantEarth = /bumi|earth|terra|indonesia/.test(q);
  const wantPlanet =
    wantRings ||
    wantEarth ||
    /planet|jupiter|mars|venus|merkurius|neptunus|eksoplanet|exoplanet|bulan|moon|dunia/.test(q);
  const wantComet = /komet|comet|meteor|bintang jatuh|asteroid|halley/.test(q);
  const wantAurora = /aurora|borealis|australis|cahaya utara|kutub/.test(q);
  const wantSupernova = /supernova|ledakan|pulsar|neutron|matahari|gerhana|eclipse|bintang kembar|wormhole|lubang cacing|portal/.test(q);
  const wantAstronaut = /astronot|astronaut|manusia|penjelajah|orang|pengamat|berdiri/.test(q);
  const wantWater = /laut|samudra|air|danau|pantai|refleksi|pantulan|ocean/.test(q);
  const wantHorizon =
    wantAstronaut ||
    wantWater ||
    wantAurora ||
    /gunung|tebing|permukaan|lanskap|horison|horizon|langit malam|daratan|gurun|es/.test(q);

  const focalY = wantHorizon ? h * 0.4 : h * 0.5;

  if (wantBlackHole) {
    drawBlackHole(
      ctx,
      w * 0.5,
      focalY,
      minD * 0.165,
      palette,
      -0.22 + (rng() - 0.5) * 0.24,
      rng
    );
  } else if (wantGalaxy) {
    drawGalaxy(
      ctx,
      w * 0.5,
      focalY,
      minD * 0.4,
      palette,
      -0.32 + (rng() - 0.5) * 0.4,
      0.38 + rng() * 0.28,
      rng
    );
    // Distant companion galaxy
    drawGalaxy(
      ctx,
      w * (0.18 + rng() * 0.12),
      h * (0.16 + rng() * 0.1),
      minD * 0.085,
      palette,
      0.5,
      0.5,
      rng
    );
  } else if (wantSupernova) {
    // Supernova shockwave shell + relativistic pulsar beams
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const cx = w * 0.5;
    const cy = focalY;
    const sr = minD * 0.3;

    // Polar relativistic jets
    const jetAngle = -0.55 + rng() * 0.4;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(jetAngle);
    const jg = ctx.createLinearGradient(-sr * 1.6, 0, sr * 1.6, 0);
    jg.addColorStop(0, "rgba(0,0,0,0)");
    jg.addColorStop(0.35, rgba(palette.secondary, 0.42));
    jg.addColorStop(0.5, "rgba(255,255,255,0.98)");
    jg.addColorStop(0.65, rgba(palette.secondary, 0.42));
    jg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.strokeStyle = jg;
    ctx.lineWidth = sr * 0.11;
    ctx.beginPath();
    ctx.moveTo(-sr * 1.6, 0);
    ctx.lineTo(sr * 1.6, 0);
    ctx.stroke();
    ctx.restore();

    // Expanding filament rings
    for (let i = 0; i < 48; i++) {
      const ang = (i / 48) * Math.PI * 2 + rng() * 0.1;
      const r1 = sr * (0.65 + rng() * 0.38);
      ctx.strokeStyle = i % 2 === 0 ? rgba(palette.primary, 0.25) : rgba(palette.secondary, 0.25);
      ctx.lineWidth = 2 + rng() * 4;
      ctx.beginPath();
      ctx.arc(cx, cy, r1, ang, ang + 0.32);
      ctx.stroke();
    }
    drawDiffractionStar(ctx, cx, cy, minD * 0.042, palette.accent, true);
    ctx.restore();
  } else if (wantPlanet) {
    drawPlanet(
      ctx,
      w * 0.52,
      focalY,
      minD * (wantRings ? 0.21 : 0.27),
      palette,
      wantRings || rng() > 0.55,
      wantEarth,
      rng,
      noise
    );
    // Companion moon
    drawPlanet(
      ctx,
      w * 0.2,
      focalY - minD * 0.18,
      minD * 0.045,
      palette,
      false,
      false,
      rng,
      noise
    );
  } else {
    // Rich cosmic composition for nebula / open-ended creative prompts
    const choice = rng();
    if (choice < 0.36) {
      drawPlanet(
        ctx,
        w * 0.62,
        focalY,
        minD * 0.2,
        palette,
        true,
        false,
        rng,
        noise
      );
      drawGalaxy(
        ctx,
        w * 0.24,
        h * 0.24,
        minD * 0.14,
        palette,
        -0.4,
        0.42,
        rng
      );
    } else if (choice < 0.7) {
      drawGalaxy(
        ctx,
        w * 0.5,
        focalY,
        minD * 0.36,
        palette,
        -0.38,
        0.45,
        rng
      );
    } else {
      // JWST Star-forming cluster with brilliant 6-point diffraction stars
      for (let i = 0; i < 6; i++) {
        drawDiffractionStar(
          ctx,
          w * (0.22 + rng() * 0.56),
          h * (0.2 + rng() * 0.52),
          minD * (0.012 + rng() * 0.016),
          i % 2 === 0 ? palette.accent : palette.secondary,
          true
        );
      }
    }
  }

  // Secondary planet if both black hole / galaxy AND planet mentioned
  if ((wantBlackHole || wantGalaxy) && wantPlanet) {
    drawPlanet(
      ctx,
      w * 0.78,
      h * 0.24,
      minD * 0.095,
      palette,
      wantRings,
      wantEarth,
      rng,
      noise
    );
  }

  if (wantComet) {
    drawComet(ctx, w, h, palette, rng);
  }

  if (wantAurora) {
    drawAurora(ctx, w, h, palette, noise);
  }

  // Bright signature foreground JWST stars
  const starCount = style === "Fotorealistik JWST" ? 9 : 5;
  for (let i = 0; i < starCount; i++) {
    const sx = w * (0.08 + rng() * 0.84);
    const sy = h * (0.06 + rng() * (wantHorizon ? 0.58 : 0.84));
    drawDiffractionStar(
      ctx,
      sx,
      sy,
      minD * (0.005 + rng() * 0.009),
      i % 2 === 0 ? palette.accent : palette.secondary,
      style === "Fotorealistik JWST" || i % 2 === 0
    );
  }

  if (wantHorizon) {
    drawHorizonAndExplorer(ctx, w, h, palette, wantAstronaut, wantWater, noise);
  }

  // 5. Subtle cinematic vignette for museum-grade finish
  const vig = ctx.createRadialGradient(w / 2, h / 2, minD * 0.32, w / 2, h / 2, Math.max(w, h) * 0.74);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(2,3,8,0.48)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  return canvas.toDataURL("image/png");
}

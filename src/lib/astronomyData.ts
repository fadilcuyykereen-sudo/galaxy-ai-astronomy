export interface CelestialSeedItem {
  slug: string;
  name: string;
  englishName: string;
  catalogCode: string;
  category: "star" | "planet" | "galaxy";
  classification: string;
  mass: string;
  massKg: string;
  massComparison: string;
  diameter: string;
  distance: string;
  gravity?: string;
  rotationPeriod?: string;
  rotationDirection?: string;
  rotationSpeed?: string;
  orbitalPeriod?: string;
  orbitalSpeed?: string;
  axialTilt?: string;
  temperature?: string;
  moonsCount?: string;
  atmosphere?: string;
  starCount?: string;
  age?: string;
  constellation?: string;
  centralBlackHole?: string;
  radialVelocity?: string;
  colorHex: string;
  summary: string;
  rotationInsight?: string;
  facts: string[];
  sortOrder: number;
}

export interface Planet3DConfig {
  slug: string;
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeedRad: number; // relative rad/s at 1x speed
  rotationSpeedRad: number; // sign indicates prograde (+) or retrograde (-)
  axialTiltDeg: number;
  orbitInclinationDeg: number;
  colorHex: string;
  accentHex: string;
  hasRings?: boolean;
  ringInner?: number;
  ringOuter?: number;
  hasMoon?: boolean;
  hasAtmosphere?: boolean;
  atmosphereColor?: string;
}

export interface Galaxy3DConfig {
  slug: string;
  name: string;
  subtitle: string;
  type: "barred-spiral" | "grand-spiral" | "spiral" | "sombrero" | "elliptical-jet" | "ring";
  arms: number;
  armTightness: number;
  barLength: number;
  coreSize: number;
  diskRadius: number;
  diskThickness: number;
  coreColor: string;
  midColor: string;
  outerColor: string;
  nebulaColor: string;
  diameterLy: number;
  massSolarBillion: number;
  starsBillion: number;
  hasCompanion?: boolean;
  hasSatellites?: boolean;
  hasJet?: boolean;
  showSolarSystemMarker?: boolean;
  annotations: Array<{
    label: string;
    detail: string;
    position: [number, number, number];
    color: string;
  }>;
}

export interface SolarMission {
  id: number;
  title: string;
  clue: string;
  targetSlug: string;
  points: number;
  explanation: string;
}

export const SOLAR_3D_CONFIGS: Planet3DConfig[] = [
  {
    slug: "matahari",
    name: "Matahari",
    radius: 4.4,
    orbitRadius: 0,
    orbitSpeedRad: 0,
    rotationSpeedRad: 0.14,
    axialTiltDeg: 7.25,
    orbitInclinationDeg: 0,
    colorHex: "#FDB813",
    accentHex: "#FF6B00",
  },
  {
    slug: "merkurius",
    name: "Merkurius",
    radius: 0.62,
    orbitRadius: 8.2,
    orbitSpeedRad: 1.18,
    rotationSpeedRad: 0.08,
    axialTiltDeg: 0.03,
    orbitInclinationDeg: 3.4,
    colorHex: "#A8A29E",
    accentHex: "#D6D3D1",
  },
  {
    slug: "venus",
    name: "Venus",
    radius: 0.98,
    orbitRadius: 11.8,
    orbitSpeedRad: 0.72,
    rotationSpeedRad: -0.05, // Retrograde!
    axialTiltDeg: 177.36,
    orbitInclinationDeg: 2.1,
    colorHex: "#E8B86D",
    accentHex: "#FDE68A",
    hasAtmosphere: true,
    atmosphereColor: "#F5C26B",
  },
  {
    slug: "bumi",
    name: "Bumi",
    radius: 1.15,
    orbitRadius: 16.2,
    orbitSpeedRad: 0.48,
    rotationSpeedRad: 1.15,
    axialTiltDeg: 23.44,
    orbitInclinationDeg: 0,
    colorHex: "#38BDF8",
    accentHex: "#22C55E",
    hasMoon: true,
    hasAtmosphere: true,
    atmosphereColor: "#4DA8FF",
  },
  {
    slug: "mars",
    name: "Mars",
    radius: 0.82,
    orbitRadius: 20.8,
    orbitSpeedRad: 0.34,
    rotationSpeedRad: 1.1,
    axialTiltDeg: 25.19,
    orbitInclinationDeg: 1.85,
    colorHex: "#E06D44",
    accentHex: "#FCA5A5",
    hasAtmosphere: true,
    atmosphereColor: "#E07A5F",
  },
  {
    slug: "jupiter",
    name: "Jupiter",
    radius: 2.75,
    orbitRadius: 29.5,
    orbitSpeedRad: 0.17,
    rotationSpeedRad: 2.35, // Fastest spinning planet
    axialTiltDeg: 3.13,
    orbitInclinationDeg: 1.3,
    colorHex: "#D9A066",
    accentHex: "#F3C969",
    hasAtmosphere: true,
    atmosphereColor: "#E5B98A",
  },
  {
    slug: "saturnus",
    name: "Saturnus",
    radius: 2.28,
    orbitRadius: 39.5,
    orbitSpeedRad: 0.11,
    rotationSpeedRad: 2.1,
    axialTiltDeg: 26.73,
    orbitInclinationDeg: 2.48,
    colorHex: "#E6C785",
    accentHex: "#FEF08A",
    hasRings: true,
    ringInner: 2.85,
    ringOuter: 5.4,
    hasAtmosphere: true,
    atmosphereColor: "#EAD29C",
  },
  {
    slug: "uranus",
    name: "Uranus",
    radius: 1.62,
    orbitRadius: 49.0,
    orbitSpeedRad: 0.068,
    rotationSpeedRad: -1.45, // Retrograde tilted sideways
    axialTiltDeg: 97.77,
    orbitInclinationDeg: 0.77,
    colorHex: "#67E8F9",
    accentHex: "#A5F3FC",
    hasRings: true,
    ringInner: 2.1,
    ringOuter: 2.75,
    hasAtmosphere: true,
    atmosphereColor: "#67E8F9",
  },
  {
    slug: "neptunus",
    name: "Neptunus",
    radius: 1.56,
    orbitRadius: 57.5,
    orbitSpeedRad: 0.045,
    rotationSpeedRad: 1.52,
    axialTiltDeg: 28.32,
    orbitInclinationDeg: 1.77,
    colorHex: "#4F7CFF",
    accentHex: "#93C5FD",
    hasAtmosphere: true,
    atmosphereColor: "#4F7CFF",
  },
];

export const GALAXY_3D_CONFIGS: Galaxy3DConfig[] = [
  {
    slug: "bima-sakti",
    name: "Bima Sakti",
    subtitle: "Milky Way • SBbc",
    type: "barred-spiral",
    arms: 4,
    armTightness: 0.42,
    barLength: 3.4,
    coreSize: 2.4,
    diskRadius: 13.5,
    diskThickness: 0.75,
    coreColor: "#FFE4A3",
    midColor: "#8FA8FF",
    outerColor: "#4B6BFB",
    nebulaColor: "#E879F9",
    diameterLy: 105700,
    massSolarBillion: 1500,
    starsBillion: 300,
    showSolarSystemMarker: true,
    annotations: [
      {
        label: "Sagittarius A*",
        detail: "Lubang hitam supermasif 4,3 juta M☉ di pusat Bima Sakti",
        position: [0, 0.7, 0],
        color: "#F3C969",
      },
      {
        label: "Tata Surya & Bumi",
        detail: "Lengan Orion — berjarak ~26.000 tahun cahaya dari pusat",
        position: [6.4, 0.35, 3.2],
        color: "#38BDF8",
      },
      {
        label: "Batang Galaksi",
        detail: "Struktur batang bintang tua sepanjang ~27.000 tahun cahaya",
        position: [-2.6, 0.4, -0.5],
        color: "#FDE68A",
      },
      {
        label: "Lengan Perseus",
        detail: "Salah satu dari dua lengan spiral mayor kaya pembibitan bintang",
        position: [-7.8, 0.25, 5.4],
        color: "#A78BFA",
      },
    ],
  },
  {
    slug: "andromeda",
    name: "Andromeda",
    subtitle: "Messier 31 • SA(s)b",
    type: "spiral",
    arms: 2,
    armTightness: 0.58,
    barLength: 0,
    coreSize: 3.1,
    diskRadius: 16.2,
    diskThickness: 0.85,
    coreColor: "#FFF0C2",
    midColor: "#9DB4FF",
    outerColor: "#5C7CFA",
    nebulaColor: "#67E8F9",
    diameterLy: 220000,
    massSolarBillion: 1500,
    starsBillion: 1000,
    hasSatellites: true,
    annotations: [
      {
        label: "Inti Ganda M31*",
        detail: "Lubang hitam supermasif ~140 juta M☉ dengan gugus bintang ganda",
        position: [0, 0.85, 0],
        color: "#F3C969",
      },
      {
        label: "Galaksi Satelit M32",
        detail: "Galaksi elips katai kompak yang mengorbit dekat piringan M31",
        position: [9.5, 2.2, -5.5],
        color: "#FDE68A",
      },
      {
        label: "Galaksi Satelit M110",
        detail: "Galaksi elips katai terang dengan populasi bintang muda di pusatnya",
        position: [-11.5, -2.5, 6.2],
        color: "#93C5FD",
      },
      {
        label: "Cincin Debu 32.000 ly",
        detail: "Zona aktif pembentukan bintang masif di piringan luar Andromeda",
        position: [7.5, 0.2, 7.2],
        color: "#38BDF8",
      },
    ],
  },
  {
    slug: "sombrero",
    name: "Galaksi Sombrero",
    subtitle: "Messier 104 • SA(s)a",
    type: "sombrero",
    arms: 2,
    armTightness: 1.15,
    barLength: 0,
    coreSize: 4.5,
    diskRadius: 13.0,
    diskThickness: 0.45,
    coreColor: "#FFF4D4",
    midColor: "#F3C969",
    outerColor: "#C08457",
    nebulaColor: "#FB923C",
    diameterLy: 50000,
    massSolarBillion: 800,
    starsBillion: 100,
    annotations: [
      {
        label: "Tonjolan Inti Raksasa",
        detail: "Bulge bola terang dengan lubang hitam ~1 miliar M☉ di pusatnya",
        position: [0, 2.8, 0],
        color: "#F3C969",
      },
      {
        label: "Cincin Debu Simetris",
        detail: "Jalur debu kosmik pekat tempat lahirnya bintang-bintang baru",
        position: [11.2, 0.15, 3.0],
        color: "#FB923C",
      },
      {
        label: "Halo Gugus Bola",
        detail: "Dihuni hampir 2.000 gugus bola purba (10x lebih banyak dari Bima Sakti)",
        position: [-6.5, 3.8, -3.5],
        color: "#FDE68A",
      },
    ],
  },
  {
    slug: "whirlpool",
    name: "Galaksi Pusaran",
    subtitle: "Messier 51 • SA(s)bc",
    type: "grand-spiral",
    arms: 2,
    armTightness: 0.52,
    barLength: 0,
    coreSize: 2.3,
    diskRadius: 12.8,
    diskThickness: 0.65,
    coreColor: "#FFE9B5",
    midColor: "#7DD3FC",
    outerColor: "#6366F1",
    nebulaColor: "#F472B6",
    diameterLy: 76000,
    massSolarBillion: 160,
    starsBillion: 100,
    hasCompanion: true,
    annotations: [
      {
        label: "Inti Aktif Seyfert 2",
        detail: "Pusat M51 dengan cincin debu yang menyelimuti lubang hitam aktif",
        position: [0, 0.7, 0],
        color: "#F3C969",
      },
      {
        label: "Lengan Grand-Design",
        detail: "Lengan spiral simetris kaya nebula H-II merah muda & bintang biru",
        position: [-6.2, 0.3, 5.2],
        color: "#F472B6",
      },
      {
        label: "Pendamping NGC 5195",
        detail: "Galaksi katai yang berinteraksi gravitasi melalui jembatan pasang surut",
        position: [13.5, 0.8, 4.8],
        color: "#FDE68A",
      },
    ],
  },
  {
    slug: "triangulum",
    name: "Galaksi Triangulum",
    subtitle: "Messier 33 • SA(s)cd",
    type: "spiral",
    arms: 3,
    armTightness: 0.35,
    barLength: 0,
    coreSize: 1.6,
    diskRadius: 11.8,
    diskThickness: 0.7,
    coreColor: "#E0F2FE",
    midColor: "#60A5FA",
    outerColor: "#818CF8",
    nebulaColor: "#34D399",
    diameterLy: 61100,
    massSolarBillion: 50,
    starsBillion: 40,
    annotations: [
      {
        label: "Pusat Wilayah H-II",
        detail: "Uniknya M33 hampir tidak memiliki lubang hitam supermasif besar",
        position: [0, 0.65, 0],
        color: "#67E8F9",
      },
      {
        label: "Nebula Raksasa NGC 604",
        detail: "Pabrik bintang selebar 1.500 tahun cahaya (40x ukuran Nebula Orion)",
        position: [6.8, 0.3, -4.6],
        color: "#34D399",
      },
    ],
  },
  {
    slug: "messier-87",
    name: "Messier 87 (Virgo A)",
    subtitle: "M87 / NGC 4486 • E0-1 pec",
    type: "elliptical-jet",
    arms: 0,
    armTightness: 0,
    barLength: 0,
    coreSize: 6.5,
    diskRadius: 13.5,
    diskThickness: 9.5,
    coreColor: "#FFF3D1",
    midColor: "#F5C978",
    outerColor: "#D99B52",
    nebulaColor: "#38BDF8",
    diameterLy: 132000,
    massSolarBillion: 2400,
    starsBillion: 1000,
    hasJet: true,
    annotations: [
      {
        label: "Lubang Hitam M87*",
        detail: "Bermassa 6,5 miliar M☉ — lubang hitam pertama yang difoto manusia (2019)",
        position: [0, 0.9, 0],
        color: "#F3C969",
      },
      {
        label: "Jet Plasma Relativistik",
        detail: "Semburan partikel bermuatan hampir secepat cahaya sepanjang 5.000 ly",
        position: [8.8, 5.8, 2.2],
        color: "#38BDF8",
      },
      {
        label: "12.000 Gugus Bola",
        detail: "Populasi gugus bola raksasa yang mengorbit halo galaksi elips M87",
        position: [-6.5, -3.5, 4.0],
        color: "#FDE68A",
      },
    ],
  },
  {
    slug: "cartwheel",
    name: "Galaksi Roda Pedati",
    subtitle: "ESO 350-40 • Galaksi Cincin",
    type: "ring",
    arms: 8,
    armTightness: 0.16,
    barLength: 0,
    coreSize: 2.6,
    diskRadius: 14.2,
    diskThickness: 0.6,
    coreColor: "#FDE68A",
    midColor: "#F472B6",
    outerColor: "#38BDF8",
    nebulaColor: "#818CF8",
    diameterLy: 144300,
    massSolarBillion: 4,
    starsBillion: 12,
    annotations: [
      {
        label: "Cincin Dalam Berdebu",
        detail: "Inti terang kaya debu panas sisa tabrakan galaksi 400 juta tahun lalu",
        position: [0, 0.75, 0],
        color: "#F3C969",
      },
      {
        label: "Jari-Jari Spiral (Spokes)",
        detail: "Aliran gas dan bintang yang mulai membentuk kembali lengan spiral",
        position: [-6.2, 0.3, 2.8],
        color: "#F472B6",
      },
      {
        label: "Cincin Starburst Luar",
        detail: "Gelombang kejut kosmik yang memicu ledakan supernova & bintang biru masif",
        position: [12.4, 0.25, -4.5],
        color: "#38BDF8",
      },
    ],
  },
];

export const CELESTIAL_SEED_DATA: CelestialSeedItem[] = [
  // === SOLAR SYSTEM ===
  {
    slug: "matahari",
    name: "Matahari",
    englishName: "Sun",
    catalogCode: "Sol • G2V",
    category: "star",
    classification: "Bintang Deret Utama Katai Kuning (G2V)",
    mass: "1,989 × 10³⁰ kg",
    massKg: "1,989 × 10³⁰ kg",
    massComparison: "333.000 × Massa Bumi (99,86% massa Tata Surya)",
    diameter: "1.392.700 km (109 × Bumi)",
    distance: "0 km (Pusat Tata Surya • 149,6 juta km dari Bumi)",
    gravity: "274,0 m/s² (28 × gravitasi Bumi)",
    rotationPeriod: "25,4 hari (khatulistiwa) – 35 hari (kutub)",
    rotationDirection: "Prograd (Barat ke Timur, rotasi diferensial plasma)",
    rotationSpeed: "7.189 km/jam",
    orbitalPeriod: "230 juta tahun (mengelilingi pusat Bima Sakti)",
    orbitalSpeed: "220 km/s (di dalam Bima Sakti)",
    axialTilt: "7,25°",
    temperature: "5.505 °C (permukaan) • 15.000.000 °C (inti)",
    moonsCount: "8 Planet & 5+ Planet Katai mengorbit",
    atmosphere: "73,4% Hidrogen, 24,8% Helium, 1,8% Oksigen/Karbon/Besi",
    age: "4,603 Miliar Tahun",
    colorHex: "#FDB813",
    summary:
      "Matahari adalah bintang induk Tata Surya yang menyumbang 99,86% dari seluruh massa sistem kita. Di intinya, reaksi fusi nuklir mengubah sekitar 600 juta ton hidrogen menjadi helium setiap detik, memancarkan cahaya dan energi yang menopang kehidupan di Bumi.",
    rotationInsight:
      "Karena tersusun dari plasma panas dan bukan batuan padat, Matahari mengalami rotasi diferensial: bagian khatulistiwanya berputar lebih cepat (25 hari) dibandingkan kutubnya (35 hari), yang memelintir medan magnet dan menciptakan bintik matahari.",
    facts: [
      "Cahaya Matahari membutuhkan waktu rata-rata 8 menit 20 detik untuk mencapai permukaan Bumi.",
      "Sekitar 1,3 juta planet seukuran Bumi dapat muat di dalam volume bola Matahari.",
      "Dalam ~5 miliar tahun, Matahari akan mengembang menjadi Raksasa Merah sebelum berakhir sebagai Katai Putih.",
    ],
    sortOrder: 1,
  },
  {
    slug: "merkurius",
    name: "Merkurius",
    englishName: "Mercury",
    catalogCode: "Sol I",
    category: "planet",
    classification: "Planet Kebumian (Terestrial)",
    mass: "3,301 × 10²³ kg",
    massKg: "3,301 × 10²³ kg",
    massComparison: "0,055 × Massa Bumi (5,5% massa Bumi)",
    diameter: "4.879 km",
    distance: "57,9 juta km (0,39 AU dari Matahari)",
    gravity: "3,70 m/s² (0,38 g)",
    rotationPeriod: "58 hari 15 jam 30 menit",
    rotationDirection: "Prograd (Barat ke Timur)",
    rotationSpeed: "10,89 km/jam",
    orbitalPeriod: "87,97 hari Bumi",
    orbitalSpeed: "47,36 km/s (tercepat di Tata Surya)",
    axialTilt: "0,03° (hampir tegak lurus sempurna)",
    temperature: "-180 °C (malam) hingga +430 °C (siang)",
    moonsCount: "0 Satelit Alami",
    atmosphere: "Eksosfer sangat tipis (Oksigen, Natrium, Hidrogen, Helium)",
    age: "4,503 Miliar Tahun",
    colorHex: "#A8A29E",
    summary:
      "Merkurius adalah planet terkecil sekaligus terdekat dengan Matahari. Meski paling dekat dengan Matahari, ketiadaan atmosfer tebal membuat panasnya langsung lepas ke angkasa pada malam hari, menghasilkan fluktuasi suhu paling ekstrem di Tata Surya.",
    rotationInsight:
      "Merkurius terkunci dalam resonansi spin-orbit 3:2 — ia berputar tepat 3 kali pada porosnya setiap 2 kali mengelilingi Matahari. Akibatnya, satu hari matahari penuh (siang ke siang) di Merkurius berlangsung selama 176 hari Bumi!",
    facts: [
      "Inti besi Merkurius sangat besar, mencakup sekitar 85% dari radius total planetnya.",
      "Di kawah kutub Merkurius yang tidak pernah terkena sinar Matahari, ilmuwan menemukan endapan es air murni.",
      "Kawah Caloris Basin di Merkurius memiliki lebar 1.550 km akibat hantaman asteroid purba.",
    ],
    sortOrder: 2,
  },
  {
    slug: "venus",
    name: "Venus",
    englishName: "Venus",
    catalogCode: "Sol II",
    category: "planet",
    classification: "Planet Kebumian (Terestrial)",
    mass: "4,867 × 10²⁴ kg",
    massKg: "4,867 × 10²⁴ kg",
    massComparison: "0,815 × Massa Bumi (81,5% massa Bumi)",
    diameter: "12.104 km",
    distance: "108,2 juta km (0,72 AU dari Matahari)",
    gravity: "8,87 m/s² (0,90 g)",
    rotationPeriod: "243 hari 26 menit (Retrograd)",
    rotationDirection: "Retrograd (Timur ke Barat — Terbalik!)",
    rotationSpeed: "6,52 km/jam (paling lambat)",
    orbitalPeriod: "224,7 hari Bumi",
    orbitalSpeed: "35,02 km/s",
    axialTilt: "177,36° (jungkir balik)",
    temperature: "+465 °C (planet terpanas di Tata Surya)",
    moonsCount: "0 Satelit Alami",
    atmosphere: "96,5% Karbon Dioksida, 3,5% Nitrogen, awan Asam Sulfat",
    age: "4,503 Miliar Tahun",
    colorHex: "#E8B86D",
    summary:
      "Sering dijuluki 'kembaran Bumi' karena ukuran dan massanya hampir setara, Venus justru memiliki lingkungan efek rumah kaca ekstrem. Atmosfer CO₂ super pekat dengan tekanan 92 kali atmosfer Bumi memerangkap panas hingga mampu melelehkan timbal.",
    rotationInsight:
      "Venus berotasi TERBALIK (retrograd) dari Timur ke Barat dengan sumbu miring 177,36°. Di Venus, Matahari terbit di sebelah Barat dan terbenam di sebelah Timur, dan satu kali rotasi siderisnya (243 hari) lebih lama daripada satu tahunnya (225 hari)!",
    facts: [
      "Venus adalah objek langit paling terang ketiga setelah Matahari dan Bulan (dikenal sebagai Bintang Kejora).",
      "Venus memiliki lebih dari 1.600 gunung berapi besar, termasuk Maxwell Montes setinggi 11 km.",
      "Wahana Venera 13 milik Uni Soviet (1982) bertahan 127 menit di permukaan panas Venus dan mengirim foto berwarna.",
    ],
    sortOrder: 3,
  },
  {
    slug: "bumi",
    name: "Bumi",
    englishName: "Earth",
    catalogCode: "Sol III • Terra",
    category: "planet",
    classification: "Planet Kebumian Berpenghuni",
    mass: "5,972 × 10²⁴ kg",
    massKg: "5,972 × 10²⁴ kg",
    massComparison: "1,00 M⊕ (Standar Acuan Massa Planet — 5,97 triliun triliun kg)",
    diameter: "12.742 km (khatulistiwa: 12.756 km)",
    distance: "149,6 juta km (1,00 AU dari Matahari)",
    gravity: "9,807 m/s² (1,00 g)",
    rotationPeriod: "23 jam 56 menit 4 detik (hari sideris) • 24 jam (hari surya)",
    rotationDirection: "Prograd (Barat ke Timur / berlawanan jarum jam dari Kutub Utara)",
    rotationSpeed: "1.674,4 km/jam (465 m/s di khatulistiwa)",
    orbitalPeriod: "365,256 hari (1 tahun sideris)",
    orbitalSpeed: "29,78 km/s (107.200 km/jam)",
    axialTilt: "23,44° (penyebab pergantian musim)",
    temperature: "+15 °C (rata-rata global)",
    moonsCount: "1 Satelit Alami (Bulan / Luna — massa 7,34 × 10²² kg)",
    atmosphere: "78,08% Nitrogen, 20,95% Oksigen, 0,93% Argon, 0,04% CO₂",
    age: "4,543 Miliar Tahun",
    colorHex: "#38BDF8",
    summary:
      "Bumi adalah planet terbesar di kelompok terestrial, planet terpadat di Tata Surya (5,51 g/cm³), dan satu-satunya dunia yang diketahui memiliki lautan air cair stabil di permukaan, lempeng tektonik aktif, medan magnet pelindung, serta biosfer kehidupan.",
    rotationInsight:
      "Bumi berputar dari Barat ke Timur dengan kemiringan sumbu 23,44° pada kecepatan 1.674 km/jam di khatulistiwa (15° bujur per jam). Rotasi ini menciptakan pergantian siang-malam di garis terminator, gerak semu Matahari terbit di Timur, pembagian 24 zona waktu (termasuk WIB, WITA, WIT di Indonesia), Efek Coriolis pada angin & arus laut, serta pepatan kutub Bumi.",
    facts: [
      "Sekitar 71% permukaan Bumi ditutupi lautan air cair, dan magnetosfer Bumi menangkis angin surya berbahaya.",
      "Tarikan pasang surut Bulan memperlambat rotasi Bumi sekitar 1,7 milidetik setiap satu abad — pada zaman dinosaurus, 1 hari hanya ~23 jam!",
      "Kemiringan sumbu 23,44° distabilkan oleh gravitasi Bulan sehingga iklim Bumi tetap ramah bagi kehidupan selama miliaran tahun.",
    ],
    sortOrder: 4,
  },
  {
    slug: "mars",
    name: "Mars",
    englishName: "Mars",
    catalogCode: "Sol IV",
    category: "planet",
    classification: "Planet Kebumian (Terestrial)",
    mass: "6,417 × 10²³ kg",
    massKg: "6,417 × 10²³ kg",
    massComparison: "0,107 × Massa Bumi (10,7% massa Bumi)",
    diameter: "6.779 km",
    distance: "227,9 juta km (1,52 AU dari Matahari)",
    gravity: "3,721 m/s² (0,38 g)",
    rotationPeriod: "24 jam 37 menit 22 detik (1 Sol)",
    rotationDirection: "Prograd (Barat ke Timur)",
    rotationSpeed: "868,2 km/jam",
    orbitalPeriod: "687 hari Bumi (1,88 tahun)",
    orbitalSpeed: "24,07 km/s",
    axialTilt: "25,19° (sangat mirip Bumi, memiliki 4 musim)",
    temperature: "-63 °C (rata-rata; -140 °C hingga +20 °C)",
    moonsCount: "2 Satelit Alami (Phobos & Deimos)",
    atmosphere: "95,3% Karbon Dioksida, 2,7% Nitrogen, 1,6% Argon",
    age: "4,603 Miliar Tahun",
    colorHex: "#E06D44",
    summary:
      "Dijuluki Planet Merah karena debu besi oksida (karat) yang menyelimuti permukaannya, Mars menyimpan jejak lembah sungai purba, delta danau kuno, tudung es kutub, dan gunung berapi terbesar di seluruh Tata Surya.",
    rotationInsight:
      "Durasi satu hari di Mars (disebut 'Sol') adalah 24 jam 39 menit surya dan kemiringan sumbunya 25,19° — sangat mirip dengan Bumi! Karena itu Mars juga mengalami pergantian musim semi, panas, gugur, dan dingin.",
    facts: [
      "Olympus Mons di Mars adalah gunung berapi setinggi 21,9 km — hampir 2,5 kali tinggi Gunung Everest.",
      "Ngarai Valles Marineris membentang sepanjang 4.000 km dengan kedalaman hingga 7 km.",
      "Senja hari di Mars berwarna kebiruan karena hamburan debu halus di atmosfer tipisnya.",
    ],
    sortOrder: 5,
  },
  {
    slug: "jupiter",
    name: "Jupiter",
    englishName: "Jupiter",
    catalogCode: "Sol V",
    category: "planet",
    classification: "Planet Raksasa Gas (Jovian)",
    mass: "1,898 × 10²⁷ kg",
    massKg: "1,898 × 10²⁷ kg",
    massComparison: "317,8 × Massa Bumi (2,5× gabungan seluruh planet lain!)",
    diameter: "139.820 km (11 × diameter Bumi)",
    distance: "778,5 juta km (5,20 AU dari Matahari)",
    gravity: "24,79 m/s² (2,53 g)",
    rotationPeriod: "9 jam 55 menit 30 detik (Tercepat!)",
    rotationDirection: "Prograd (Barat ke Timur)",
    rotationSpeed: "45.300 km/jam (27 × kecepatan rotasi Bumi)",
    orbitalPeriod: "11,86 tahun Bumi",
    orbitalSpeed: "13,07 km/s",
    axialTilt: "3,13° (hampir tidak memiliki musim)",
    temperature: "-110 °C (puncak awan)",
    moonsCount: "95 Satelit Alami (termasuk Io, Europa, Ganymede, Callisto)",
    atmosphere: "89,8% Hidrogen, 10,2% Helium, jejak Metana & Amonia",
    age: "4,603 Miliar Tahun",
    colorHex: "#D9A066",
    summary:
      "Jupiter adalah raja planet Tata Surya dengan massa 1,898 × 10²⁷ kg — lebih dari dua setengah kali total massa seluruh planet lain digabungkan. Gravitasi raksasanya berperan sebagai perisai kosmik yang membelokkan banyak komet periode panjang.",
    rotationInsight:
      "Jupiter adalah planet dengan rotasi paling cepat di Tata Surya: hanya butuh kurang dari 10 jam untuk satu putaran penuh! Putaran super cepat ini membuat khatulistiwanya menggembung 9.000 km lebih lebar dari kutubnya dan menarik awan menjadi sabuk badai paralel.",
    facts: [
      "Bintik Merah Besar (Great Red Spot) adalah badai antisiklon raksasa yang lebih lebar dari planet Bumi dan telah mengamuk >350 tahun.",
      "Bulan Ganymede milik Jupiter lebih besar daripada planet Merkurius, sedangkan Europa menyimpan samudra air cair di bawah kerak esnya.",
      "Di kedalaman Jupiter, tekanan ekstrem memampatkan hidrogen menjadi cairan hidrogen metalik penghasil medan magnet dahsyat.",
    ],
    sortOrder: 6,
  },
  {
    slug: "saturnus",
    name: "Saturnus",
    englishName: "Saturn",
    catalogCode: "Sol VI",
    category: "planet",
    classification: "Planet Raksasa Gas Bercincin",
    mass: "5,683 × 10²⁶ kg",
    massKg: "5,683 × 10²⁶ kg",
    massComparison: "95,16 × Massa Bumi",
    diameter: "116.460 km (sistem cincin utama: 282.000 km)",
    distance: "1,43 miliar km (9,58 AU dari Matahari)",
    gravity: "10,44 m/s² (1,065 g)",
    rotationPeriod: "10 jam 33 menit 38 detik",
    rotationDirection: "Prograd (Barat ke Timur)",
    rotationSpeed: "35.500 km/jam",
    orbitalPeriod: "29,45 tahun Bumi",
    orbitalSpeed: "9,68 km/s",
    axialTilt: "26,73° (membuat sudut cincin tampak berubah dari Bumi)",
    temperature: "-140 °C (puncak awan)",
    moonsCount: "146 Satelit Alami (terbanyak! Termasuk Titan & Enceladus)",
    atmosphere: "96,3% Hidrogen, 3,25% Helium, jejak Amonia & Metana",
    age: "4,503 Miliar Tahun",
    colorHex: "#E6C785",
    summary:
      "Saturnus adalah permata Tata Surya yang terkenal berkat sistem cincin es kristalin paling megah dan terang. Meski massanya 95 kali Bumi, kerapatan rata-ratanya hanya 0,687 g/cm³ — lebih ringan daripada kerapatan air cair!",
    rotationInsight:
      "Rotasi cepat 10,5 jam membuat Saturnus menjadi planet paling pepat di Tata Surya (diameter khatulistiwanya 10% lebih besar dari diameter kutub). Kemiringan 26,73° menampilkan kemegahan cincinnya dari sudut berbeda sepanjang orbit 29 tahunnya.",
    facts: [
      "Cincin Saturnus tersusun dari miliaran bongkahan es murni (99%) berukuran debu hingga sebesar gunung, namun ketebalannya rata-rata hanya 10–100 meter!",
      "Di kutub utara Saturnus terdapat pusaran arus jet berbentuk segi enam (heksagon) raksasa selebar 29.000 km.",
      "Bulan Titan memiliki atmosfer tebal serta sungai, hujan, dan danau metana cair; sementara Enceladus menyemburkan geyser air dari samudra bawah es.",
    ],
    sortOrder: 7,
  },
  {
    slug: "uranus",
    name: "Uranus",
    englishName: "Uranus",
    catalogCode: "Sol VII",
    category: "planet",
    classification: "Planet Raksasa Es (Ice Giant)",
    mass: "8,681 × 10²⁵ kg",
    massKg: "8,681 × 10²⁵ kg",
    massComparison: "14,54 × Massa Bumi",
    diameter: "50.724 km (4 × diameter Bumi)",
    distance: "2,87 miliar km (19,2 AU dari Matahari)",
    gravity: "8,69 m/s² (0,886 g)",
    rotationPeriod: "17 jam 14 menit 24 detik (Retrograd)",
    rotationDirection: "Retrograd Miring (menggelinding pada sisinya)",
    rotationSpeed: "9.320 km/jam",
    orbitalPeriod: "84,02 tahun Bumi",
    orbitalSpeed: "6,80 km/s",
    axialTilt: "97,77° (rebah menyamping hampir sejajar bidang orbit!)",
    temperature: "-195 °C (minimum -224 °C — atmosfer terdingin)",
    moonsCount: "28 Satelit Alami (Miranda, Ariel, Umbriel, Titania, Oberon)",
    atmosphere: "82,5% Hidrogen, 15,2% Helium, 2,3% Metana (pemberi warna sian)",
    age: "4,503 Miliar Tahun",
    colorHex: "#67E8F9",
    summary:
      "Uranus adalah raksasa es berwarna biru-sian lembut yang tersusun dari mantel fluida padat air, amonia, dan metana di atas inti berbatu kecil. Gas metana di atmosfer atasnya menyerap cahaya merah dan memantulkan warna biru kehijauan.",
    rotationInsight:
      "Uranus memiliki kemiringan sumbu paling unik: 97,77°, diduga akibat tabrakan kolosal dengan protoplanet seukuran Bumi miliaran tahun silam. Ia seolah menggelinding mengelilingi Matahari, sehingga tiap kutubnya mengalami 42 tahun siang terus-menerus diikuti 42 tahun malam!",
    facts: [
      "Uranus adalah planet pertama yang ditemukan menggunakan teleskop modern oleh William Herschel pada tahun 1781.",
      "Uranus memiliki 13 cincin redup yang berorientasi vertikal mengelilingi ekuator miringnya.",
      "Eksperimen tekanan tinggi menunjukkan bahwa karbon di dalam mantel Uranus dan Neptunus dapat mengkristal menjadi 'hujan berlian'.",
    ],
    sortOrder: 8,
  },
  {
    slug: "neptunus",
    name: "Neptunus",
    englishName: "Neptune",
    catalogCode: "Sol VIII",
    category: "planet",
    classification: "Planet Raksasa Es (Ice Giant)",
    mass: "1,024 × 10²⁶ kg",
    massKg: "1,024 × 10²⁶ kg",
    massComparison: "17,15 × Massa Bumi (sedikit lebih masif dari Uranus)",
    diameter: "49.244 km (3,86 × diameter Bumi)",
    distance: "4,50 miliar km (30,1 AU dari Matahari)",
    gravity: "11,15 m/s² (1,14 g)",
    rotationPeriod: "16 jam 6 menit 36 detik",
    rotationDirection: "Prograd (Barat ke Timur)",
    rotationSpeed: "9.650 km/jam",
    orbitalPeriod: "164,8 tahun Bumi",
    orbitalSpeed: "5,43 km/s",
    axialTilt: "28,32°",
    temperature: "-200 °C (rata-rata puncak awan)",
    moonsCount: "16 Satelit Alami (terbesar: Triton dengan orbit retrograd)",
    atmosphere: "80% Hidrogen, 19% Helium, 1,5% Metana & awan es metana",
    age: "4,503 Miliar Tahun",
    colorHex: "#4F7CFF",
    summary:
      "Neptunus adalah planet mayor terjauh dari Matahari — dunia raksasa es yang gelap, dingin, dan dicambuk oleh badai angin supersonik tercepat di seluruh Tata Surya. Meski sedikit lebih kecil dari Uranus, massanya lebih besar karena interiornya lebih padat.",
    rotationInsight:
      "Neptunus berputar dalam 16 jam 6 menit dengan kemiringan 28,32°. Karena orbitnya sangat luas, setiap satu musim di Neptunus berlangsung lebih dari 40 tahun Bumi. Sejak ditemukan pada 1846, Neptunus baru menyelesaikan satu orbit penuh pada tahun 2011!",
    facts: [
      "Neptunus adalah planet pertama yang ditemukan melalui perhitungan matematika murni (Urbain Le Verrier) sebelum diamati lewat teleskop.",
      "Kecepatan angin di atmosfer Neptunus mencapai 2.100 km/jam — menembus kecepatan suara!",
      "Bulan terbesarnya, Triton, berorbit berlawanan arah rotasi Neptunus dan diyakini merupakan objek Sabuk Kuiper yang tertangkap gravitasi.",
    ],
    sortOrder: 9,
  },

  // === GALAXIES ===
  {
    slug: "bima-sakti",
    name: "Bima Sakti",
    englishName: "Milky Way Galaxy",
    catalogCode: "Grup Lokal • SBbc",
    category: "galaxy",
    classification: "Galaksi Spiral Berbatang (Hubble: SBbc)",
    mass: "~1,5 × 10¹² M☉ (1,5 Triliun Massa Matahari)",
    massKg: "2,98 × 10⁴² kg (termasuk halo materi gelap)",
    massComparison: "1,00 × Bima Sakti (Rumah Kosmik Manusia)",
    diameter: "105.700 tahun cahaya (~32,4 kpc)",
    distance: "0 ly (Tata Surya berjarak ~26.000 ly dari pusat galaksi)",
    orbitalPeriod: "225–250 juta tahun (1 tahun galaktik Tata Surya)",
    starCount: "100 – 400 Miliar Bintang (+ ≥100 Miliar Eksoplanet)",
    age: "~13,6 Miliar Tahun",
    constellation: "Sagittarius (arah pusat galaksi)",
    centralBlackHole: "Sagittarius A* (4,3 juta M☉)",
    radialVelocity: "Bergerak 552 km/s relatif terhadap radiasi latar kosmik (CMB)",
    colorHex: "#8FA8FF",
    summary:
      "Bima Sakti adalah galaksi spiral berbatang megah tempat Tata Surya dan Bumi bernaung. Pusatnya memiliki batang bintang tua keemasan sepanjang ~27.000 tahun cahaya yang dikelilingi empat lengan spiral utama kaya gas, debu kosmik, dan nebula pembibitan bintang, serta diselubungi halo materi gelap raksasa.",
    facts: [
      "Tata Surya kita berada di Lengan Minor Orion-Cygnus, mengorbit pusat Bima Sakti dengan kecepatan 828.000 km/jam.",
      "Nama 'Bima Sakti' berasal dari budaya astronomi Nusantara (Jawa kuno) yang melihat siluet tokoh pewayangan Bima di pita gelap debu galaksi.",
      "Di pusat Bima Sakti bersemayam lubang hitam supermasif Sagittarius A* yang berhasil dipotret oleh Event Horizon Telescope pada tahun 2022.",
      "Ketebalan piringan bintang tipis Bima Sakti rata-rata sekitar 1.000 tahun cahaya, sementara tonjolan pusatnya setebal ~12.000 tahun cahaya.",
    ],
    sortOrder: 10,
  },
  {
    slug: "andromeda",
    name: "Galaksi Andromeda",
    englishName: "Andromeda Galaxy",
    catalogCode: "Messier 31 • NGC 224",
    category: "galaxy",
    classification: "Galaksi Spiral Raksasa (Hubble: SA(s)b)",
    mass: "~1,5 × 10¹² M☉ (1,5 Triliun Massa Matahari)",
    massKg: "2,98 × 10⁴² kg",
    massComparison: "Setara massa Bima Sakti, namun diameter 2× lebih luas",
    diameter: "220.000 tahun cahaya (~67,5 kpc)",
    distance: "2,537 Juta tahun cahaya (778 kpc)",
    starCount: "~1 Triliun Bintang (lebih dari 2× jumlah bintang Bima Sakti)",
    age: "~10,0 Miliar Tahun",
    constellation: "Andromeda",
    centralBlackHole: "M31* (~140 juta M☉ — 32× massa Sagittarius A*)",
    radialVelocity: "-110 km/s (Blueshift — mendekati Bima Sakti 400.000 km/jam!)",
    colorHex: "#9DB4FF",
    summary:
      "Andromeda (M31) adalah galaksi spiral terbesar di Grup Lokal dan tetangga galaksi besar terdekat Bima Sakti. Ia merupakan objek terjauh yang masih dapat diamati dengan mata telanjang manusia di langit malam yang sangat gelap. Cahaya yang kita lihat malam ini berangkat saat leluhur manusia purba baru muncul di Bumi.",
    facts: [
      "Andromeda dan Bima Sakti sedang saling mendekat pada kecepatan 110 km/s dan diprediksi akan bergabung membentuk galaksi elips raksasa 'Milkomeda' dalam ~4,5 miliar tahun.",
      "Meski dua galaksi bertabrakan, jarak antar bintang begitu luas sehingga hampir tidak ada bintang yang saling menabrak secara fisik.",
      "Andromeda dikelilingi oleh lebih dari 20 galaksi katai satelit, termasuk M32 dan M110 yang mudah diamati.",
      "Teleskop Hubble menemukan bahwa inti Andromeda tampak ganda karena orbit eksentrik piringan bintang tua di sekitar lubang hitam M31*.",
    ],
    sortOrder: 11,
  },
  {
    slug: "sombrero",
    name: "Galaksi Sombrero",
    englishName: "Sombrero Galaxy",
    catalogCode: "Messier 104 • NGC 4594",
    category: "galaxy",
    classification: "Galaksi Spiral Lensa Tak Berbatang (SA(s)a)",
    mass: "~8,0 × 10¹¹ M☉ (800 Miliar Massa Matahari)",
    massKg: "1,59 × 10⁴² kg",
    massComparison: "~0,53 × Massa Bima Sakti",
    diameter: "50.000 tahun cahaya (~15,3 kpc)",
    distance: "29,3 Juta tahun cahaya (9,0 Mpc)",
    starCount: "~100 Miliar Bintang + ~2.000 Gugus Bola",
    age: "~13,25 Miliar Tahun",
    constellation: "Virgo (perbatasan Corvus)",
    centralBlackHole: "M104* (~1 miliar M☉ — salah satu yang termasif di alam semesta dekat)",
    radialVelocity: "+1.024 km/s (menjauhi Bumi)",
    colorHex: "#F3C969",
    summary:
      "Galaksi Sombrero (M104) adalah salah satu galaksi paling fotogenik di alam semesta. Dilihat hampir dari samping (kemiringan 6° dari bidang ekuatornya), galaksi ini menampilkan tonjolan inti bintang putih-emas yang sangat cemerlang dikelilingi cincin debu simetris pekat bak topi sombrero Meksiko.",
    facts: [
      "Pengamatan inframerah James Webb Space Telescope (JWST) mengungkap gumpalan debu kompleks di cincin luar serta inti yang sangat halus.",
      "Sombrero memiliki sifat hibrida unik: memiliki piringan debu seperti galaksi spiral sekaligus halo sferis raksasa seperti galaksi elips.",
      "Lubang hitam di pusatnya mencapai 1 miliar massa Matahari — lebih dari 200 kali massa lubang hitam pusat Bima Sakti.",
    ],
    sortOrder: 12,
  },
  {
    slug: "whirlpool",
    name: "Galaksi Pusaran (Whirlpool)",
    englishName: "Whirlpool Galaxy",
    catalogCode: "Messier 51a • NGC 5194",
    category: "galaxy",
    classification: "Galaksi Spiral Grand-Design (SA(s)bc)",
    mass: "~1,6 × 10¹¹ M☉ (160 Miliar Massa Matahari)",
    massKg: "3,18 × 10⁴¹ kg",
    massComparison: "~0,11 × Massa Bima Sakti",
    diameter: "76.000 tahun cahaya (~23,3 kpc)",
    distance: "31,0 Juta tahun cahaya (9,5 Mpc)",
    starCount: "~100 Miliar Bintang",
    age: "~13,0 Miliar Tahun (ledakan bintang muda 400 juta tahun terakhir)",
    constellation: "Canes Venatici",
    centralBlackHole: "M51* (~1 juta M☉, Inti Galaksi Aktif Seyfert 2)",
    radialVelocity: "+463 km/s",
    colorHex: "#F472B6",
    summary:
      "Galaksi Pusaran (M51) adalah galaksi pertama dalam sejarah astronomi yang struktur spiralnya berhasil diidentifikasi (oleh Lord Rosse pada tahun 1845). Dua lengan spiral 'grand-design'-nya melengkung anggun penuh gugus bintang biru muda dan nebula hidrogen merah muda berkat tarikan pasang surut galaksi pendamping NGC 5195.",
    facts: [
      "Lengan spiral M51 berfungsi sebagai pabrik bintang kosmik: gelombang kerapatan memampatkan awan hidrogen hingga melahirkan jutaan bintang baru.",
      "Pada tahun 2020, astronom mendeteksi kandidat eksoplanet pertama di luar Bima Sakti (M51-ULS-1b) di dalam galaksi Whirlpool ini!",
      "Tiga supernova terang tercatat meledak di M51 hanya dalam kurun 17 tahun (SN 1994I, SN 2005cs, dan SN 2011dh).",
    ],
    sortOrder: 13,
  },
  {
    slug: "triangulum",
    name: "Galaksi Triangulum",
    englishName: "Triangulum Galaxy",
    catalogCode: "Messier 33 • NGC 598",
    category: "galaxy",
    classification: "Galaksi Spiral Terbuka (SA(s)cd)",
    mass: "~5,0 × 10¹⁰ M☉ (50 Miliar Massa Matahari)",
    massKg: "9,95 × 10⁴⁰ kg",
    massComparison: "~0,033 × Massa Bima Sakti (anggota terbesar ke-3 Grup Lokal)",
    diameter: "61.100 tahun cahaya (~18,7 kpc)",
    distance: "2,73 Juta tahun cahaya (837 kpc)",
    starCount: "~40 Miliar Bintang",
    age: "~10–12 Miliar Tahun",
    constellation: "Triangulum",
    centralBlackHole: "Tidak terdeteksi SMBH (>1.500 M☉ tidak ditemukan — anomali langka!)",
    radialVelocity: "-179 km/s (mendekati Bima Sakti & terikat dengan Andromeda)",
    colorHex: "#60A5FA",
    summary:
      "Galaksi Triangulum (M33) adalah anggota terbesar ketiga di Grup Lokal setelah Andromeda dan Bima Sakti. Berbeda dengan Bima Sakti, M33 tidak memiliki batang tengah maupun lubang hitam supermasif besar, melainkan memamerkan lengan spiral longgar yang memproduksi bintang baru 10 kali lebih intens per satuan luas dibandingkan Andromeda.",
    facts: [
      "M33 terhubung dengan Andromeda melalui jembatan arus gas hidrogen dan bintang, serta mungkin ikut dalam penggabungan Bima Sakti–Andromeda kelak.",
      "Di salah satu lengannya terdapat Nebula NGC 604 berdiameter 1.500 tahun cahaya yang menerangi lebih dari 200 bintang biru supermasif.",
      "Di lokasi bebas polusi cahaya ekstrem (Bortle 1), M33 menjadi tantangan tertinggi pengamatan mata telanjang bagi para astronom amatir.",
    ],
    sortOrder: 14,
  },
  {
    slug: "messier-87",
    name: "Messier 87 (Virgo A)",
    englishName: "Virgo A Supergiant Elliptical",
    catalogCode: "Messier 87 • NGC 4486",
    category: "galaxy",
    classification: "Galaksi Elips Superraksasa Aktif (E0-1 pec)",
    mass: "~2,4 × 10¹² M☉ (2,4 Triliun Massa Matahari — hingga 10¹³ M☉ di halo luar)",
    massKg: "4,77 × 10⁴² kg",
    massComparison: "~1,6 – 6 × Massa Bima Sakti (raksasa penguasa Gugus Virgo)",
    diameter: "132.000 tahun cahaya (halo luar mencapai ~1 juta ly)",
    distance: "53,5 Juta tahun cahaya (16,4 Mpc)",
    starCount: "~1 Triliun Bintang + ~12.000 Gugus Bola",
    age: "~13,2 Miliar Tahun",
    constellation: "Virgo",
    centralBlackHole: "M87* (6,5 Miliar M☉ — Foto Lubang Hitam Pertama di Dunia!)",
    radialVelocity: "+1.284 km/s",
    colorHex: "#F5C978",
    summary:
      "Messier 87 adalah galaksi elips kolosal yang mendominasi pusat Gugus Galaksi Virgo. Tidak seperti galaksi spiral yang pipih, M87 berbentuk bola elipsoid emas raksasa dari triliunan bintang tua. Dari jantungnya melesat semburan jet plasma biru relativistik sepanjang 5.000 tahun cahaya yang ditenagai monster lubang hitam M87*.",
    facts: [
      "Pada 10 April 2019, kolaborasi Event Horizon Telescope merilis citra langsung bayangan lubang hitam M87* — tonggak bersejarah astrofisika modern.",
      "Cakrawala peristiwa M87* berdiameter ~38 miliar km, cukup luas untuk menelan seluruh orbit planet di Tata Surya kita hingga jauh melampaui Pluto!",
      "M87 dikelilingi sekitar 12.000 gugus bola (bandingkan dengan Bima Sakti yang hanya memiliki ~150–200 gugus bola).",
    ],
    sortOrder: 15,
  },
  {
    slug: "cartwheel",
    name: "Galaksi Roda Pedati",
    englishName: "Cartwheel Galaxy",
    catalogCode: "ESO 350-40 • PGC 2248",
    category: "galaxy",
    classification: "Galaksi Cincin Lentikular (Hasil Tabrakan Kosmik)",
    mass: "~2,9 – 4,8 × 10⁹ M☉ (Massa Bintang Aktif; total ~10¹¹ M☉)",
    massKg: "7,96 × 10³⁹ kg (komponen cincin & piringan terang)",
    massComparison: "Diameter 1,36 × lebih lebar dari Bima Sakti",
    diameter: "144.300 tahun cahaya (~44,2 kpc)",
    distance: "500 Juta tahun cahaya (150 Mpc)",
    starCount: "Puluhan Miliar Bintang (miliaran bintang biru baru lahir)",
    age: "Cincin terbentuk ~400 Juta Tahun lalu akibat tabrakan telak",
    constellation: "Sculptor",
    centralBlackHole: "Lubang hitam pusat terselubung debu panas + puluhan ULX di cincin luar",
    radialVelocity: "+9.050 km/s",
    colorHex: "#38BDF8",
    summary:
      "Galaksi Roda Pedati (Cartwheel) dulunya adalah galaksi spiral normal seperti Bima Sakti sebelum sebuah galaksi lebih kecil menembus tepat di tengah intinya sekitar 400 juta tahun silam. Seperti batu yang dijatuhkan ke kolam tenang, benturan tersebut memancarkan gelombang kejut melingkar berkecepatan 320.000 km/jam yang menyalakan cincin biru kelahiran bintang.",
    facts: [
      "Potret gabungan NIRCam & MIRI dari Teleskop James Webb (2022) memamerkan jari-jari hidrokarbon dan debu silikat yang menghubungkan cincin dalam dan luar.",
      "Cincin luarnya menyimpan konsentrasi sumber sinar-X ultra-terang (ULX) terbanyak yang diketahui — kemungkinan lubang hitam bermassa bintang yang melahap materi.",
      "Jari-jari halus di antara dua cincin menunjukkan bahwa galaksi ini perlahan sedang memulihkan kembali lengan spiralnya.",
    ],
    sortOrder: 16,
  },
];

export const SEEDED_GALLERY_ITEMS = [
  {
    prompt: "Lubang hitam supermasif Gargantua dengan piringan akresi emas dan pelensaan gravitasi di ruang angkasa dalam",
    enhancedPrompt:
      "Ultra-photorealistic deep space observation of a supermassive black hole with relativistic golden-amber accretion disk, gravitational lensing halo, fine plasma filaments, JWST 8K",
    style: "Fotorealistik JWST",
    aspectRatio: "1:1",
    seed: 402918,
    imageUrl: "/images/gallery/blackhole-gargantua.jpg",
    isFavorite: true,
  },
  {
    prompt: "Tebing kosmik Nebula Carina berwarna emas dan biru safir tempat lahirnya bintang-bintang muda",
    enhancedPrompt:
      "James Webb Space Telescope NIRCam infrared capture of Carina Nebula cosmic cliffs, amber ionized dust pillars, celestial indigo gas, diffraction-spiked newborn stars",
    style: "Nebula Inframerah",
    aspectRatio: "1:1",
    seed: 881742,
    imageUrl: "/images/gallery/carina-nebula.jpg",
    isFavorite: true,
  },
  {
    prompt: "Galaksi Andromeda raksasa membentang di langit malam dilihat dari permukaan eksoplanet berbatu dengan pantulan air",
    enhancedPrompt:
      "Majestic Andromeda galaxy rising above crystalline alien exoplanet horizon, luminous golden core, sweeping indigo spiral arms and dust lanes, astrophotography 8K",
    style: "Sinematik Sci-Fi",
    aspectRatio: "1:1",
    seed: 619204,
    imageUrl: "/images/gallery/andromeda-collision.jpg",
    isFavorite: false,
  },
  {
    prompt: "Potret jarak dekat cincin kristal es Saturnus disinari Matahari dengan aurora biru di kutubnya",
    enhancedPrompt:
      "Cassini-inspired close-up photograph of backlit Saturn crystalline rings, polar electric-blue aurora, Enceladus ice plume against obsidian space",
    style: "Observatorium Deep-Field",
    aspectRatio: "1:1",
    seed: 274910,
    imageUrl: "/images/gallery/saturn-aurora.jpg",
    isFavorite: false,
  },
];

export const SOLAR_MISSIONS: SolarMission[] = [
  {
    id: 1,
    title: "Misi 01 • Raksasa Terberat",
    clue: "Klik planet dengan massa terbesar di Tata Surya (1,898 × 10²⁷ kg atau 317,8× massa Bumi) yang juga berotasi paling cepat!",
    targetSlug: "jupiter",
    points: 100,
    explanation:
      "Tepat! Jupiter bermassa 1,898 × 10²⁷ kg (2,5× gabungan seluruh planet lain) dan berputar sekali hanya dalam 9 jam 55 menit.",
  },
  {
    id: 2,
    title: "Misi 02 • Rotasi Kehidupan",
    clue: "Klik planet bermassa 5,972 × 10²⁴ kg yang memiliki kemiringan sumbu 23,44° dan berotasi 1.674 km/jam di khatulistiwa!",
    targetSlug: "bumi",
    points: 100,
    explanation:
      "Luar biasa! Bumi berotasi dari Barat ke Timur selama 23 jam 56 menit 4 detik dengan kemiringan 23,44° yang menciptakan musim dan siklus siang-malam.",
  },
  {
    id: 3,
    title: "Misi 03 • Matahari Terbit di Barat",
    clue: "Temukan planet terpanas (+465 °C) yang berotasi TERBALIK (retrograd) dengan sumbu jungkir balik 177,36°!",
    targetSlug: "venus",
    points: 150,
    explanation:
      "Benar sekali! Venus berotasi dari Timur ke Barat dalam 243 hari Bumi — lebih lama daripada satu tahun orbitnya (224,7 hari).",
  },
  {
    id: 4,
    title: "Misi 04 • Penguasa Cincin Es",
    clue: "Klik planet bermassa 5,683 × 10²⁶ kg yang memiliki 146 satelit alami dan kerapatan lebih rendah dari air!",
    targetSlug: "saturnus",
    points: 120,
    explanation:
      "Sempurna! Saturnus memiliki sistem cincin es selebar 282.000 km dan kerapatan rata-rata hanya 0,687 g/cm³.",
  },
  {
    id: 5,
    title: "Misi 05 • Planet Menggelinding",
    clue: "Temukan raksasa es berwarna sian yang berotasi rebah menyamping dengan kemiringan sumbu ekstrem 97,77°!",
    targetSlug: "uranus",
    points: 150,
    explanation:
      "Hebat! Kemiringan 97,77° membuat kutub Uranus bergantian mengalami 42 tahun siang dan 42 tahun malam tanpa henti.",
  },
  {
    id: 6,
    title: "Misi 06 • Angin Supersonik",
    clue: "Klik planet terjauh (4,5 miliar km) bermassa 1,024 × 10²⁶ kg dengan badai angin 2.100 km/jam!",
    targetSlug: "neptunus",
    points: 150,
    explanation:
      "Akurat! Neptunus ditemukan lewat perhitungan matematika dan membutuhkan 164,8 tahun Bumi untuk sekali mengelilingi Matahari.",
  },
  {
    id: 7,
    title: "Misi 07 • Pelari Orbit Tercepat",
    clue: "Klik planet terkecil bermassa 3,301 × 10²³ kg yang melesat mengelilingi Matahari dengan kecepatan 47,36 km/s!",
    targetSlug: "merkurius",
    points: 120,
    explanation:
      "Jitu! Merkurius hanya membutuhkan 88 hari Bumi untuk satu kali orbit dan memiliki inti besi raksasa.",
  },
  {
    id: 8,
    title: "Misi 08 • Gunung Tertinggi",
    clue: "Klik planet merah bermassa 6,417 × 10²³ kg yang durasi harinya (24 jam 37 menit) sangat mirip Bumi dan menyimpan Olympus Mons!",
    targetSlug: "mars",
    points: 120,
    explanation:
      "Mantap! Satu hari di Mars (Sol) hampir identik dengan Bumi, dan Olympus Mons menjulang setinggi 21,9 km.",
  },
];

export const EARTH_ROTATION_LESSONS = [
  {
    id: "dasar",
    title: "Arah & Kecepatan",
    metric: "1.674 km/jam",
    subtitle: "Barat → Timur (Prograd)",
    body: "Bumi berputar pada porosnya dari Barat ke Timur (berlawanan arah jarum jam jika dilihat dari atas Kutub Utara). Satu putaran penuh terhadap bintang jauh (hari sideris) memakan waktu 23 jam 56 menit 4 detik, sedangkan terhadap Matahari (hari surya) genap 24 jam. Kita tidak merasa terpental karena atmosfer, lautan, dan tubuh kita ikut bergerak konstan bersama gravitasi Bumi.",
  },
  {
    id: "siang-malam",
    title: "Siang, Malam & WIB/WITA/WIT",
    metric: "15° / Jam",
    subtitle: "Garis Terminator & Zona Waktu",
    body: "Belahan Bumi yang menghadap Matahari mengalami siang, sementara sisi sebaliknya mengalami malam (perhatikan lampu kota keemasan di sisi gelap Bumi 3D!). Batas keduanya disebut Garis Terminator. Karena 360° ÷ 24 jam = 15° per jam, Indonesia yang membentang 95° BT–141° BT terbagi menjadi 3 zona waktu: WIB (UTC+7), WITA (UTC+8), dan WIT (UTC+9).",
  },
  {
    id: "kemiringan",
    title: "Sumbu Miring 23,44°",
    metric: "23,44°",
    subtitle: "Musim & Panjang Siang",
    body: "Poros rotasi Bumi tidak tegak lurus, melainkan miring 23,44° terhadap bidang orbitnya (ekliptika). Saat Bumi berevolusi mengelilingi Matahari, kemiringan ini menyebabkan belahan utara dan selatan bergantian condong ke arah Matahari — melahirkan 4 musim di lintang sedang serta musim hujan/kemarau tropis akibat pergeseran angin muson.",
  },
  {
    id: "coriolis",
    title: "Efek Coriolis & Bentuk Bumi",
    metric: "+42,7 km",
    subtitle: "Gembung Khatulistiwa & Arus Angin",
    body: "Gaya sentrifugal rotasi membuat Bumi berbentuk bulat pepat (oblate spheroid): diameter khatulistiwa 42,7 km lebih lebar daripada diameter antar kutub. Rotasi juga menghasilkan Efek Coriolis yang membelokkan angin pasat, arus samudra, dan putaran badai siklon (berlawanan jarum jam di belahan utara, searah jarum jam di belahan selatan).",
  },
];

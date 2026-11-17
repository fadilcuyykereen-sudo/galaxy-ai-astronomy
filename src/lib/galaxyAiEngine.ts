import { CELESTIAL_SEED_DATA, type CelestialSeedItem } from "./astronomyData";

export interface AiReply {
  content: string;
  topic: string;
  suggestions: string[];
}

interface HistoryItem {
  role: string;
  content: string;
  topic?: string | null;
}

const BODY_ALIASES: Record<string, string[]> = {
  matahari: ["matahari", "surya", "sun", "sol ", "bintang kita"],
  merkurius: ["merkurius", "mercury"],
  venus: ["venus", "bintang kejora"],
  bumi: ["bumi", "earth", "terra"],
  mars: ["mars", "planet merah", "olympus mons"],
  jupiter: ["jupiter", "yupiter", "bintik merah besar", "ganymede", "europa"],
  saturnus: ["saturnus", "saturn", "titan", "enceladus"],
  uranus: ["uranus"],
  neptunus: ["neptunus", "neptune", "triton"],
  "bima-sakti": ["bima sakti", "bimasakti", "milky way", "galaksi kita", "sagittarius a"],
  andromeda: ["andromeda", "m31", "messier 31", "ngc 224"],
  sombrero: ["sombrero", "m104", "messier 104", "ngc 4594"],
  whirlpool: ["whirlpool", "galaksi pusaran", "m51", "messier 51", "ngc 5194"],
  triangulum: ["triangulum", "m33", "messier 33", "ngc 598"],
  "messier-87": ["m87", "messier 87", "virgo a", "ngc 4486"],
  cartwheel: ["cartwheel", "roda pedati", "eso 350-40"],
};

function findMentionedBodies(text: string): CelestialSeedItem[] {
  const q = ` ${text.toLowerCase()} `;
  const found: CelestialSeedItem[] = [];
  for (const [slug, aliases] of Object.entries(BODY_ALIASES)) {
    if (aliases.some((alias) => q.includes(alias))) {
      const item = CELESTIAL_SEED_DATA.find((b) => b.slug === slug);
      if (item) found.push(item);
    }
  }
  return found;
}

function formatBodyReport(body: CelestialSeedItem, query: string): AiReply {
  const q = query.toLowerCase();
  const isGalaxy = body.category === "galaxy";
  const focusMass = /massa|berat|bobot|seberat/.test(q);
  const focusRotation = /rotasi|berputar|putaran|poros|sumbu|siang|malam|hari/.test(q);

  let intro = `### ${body.name} (*${body.englishName}*)\n${body.summary}\n\n`;

  if (focusMass) {
    intro =
      `### Massa & Skala ${body.name}\n` +
      `Massa **${body.name}** tercatat sebesar **${body.mass}**` +
      (isGalaxy ? ` (setara **${body.massKg}**)` : "") +
      `, yaitu **${body.massComparison}**.\n\n${body.summary}\n\n`;
  } else if (focusRotation && body.rotationInsight) {
    intro =
      `### Dinamika Rotasi ${body.name}\n` +
      `${body.rotationInsight}\n\n` +
      `- **Periode Rotasi:** ${body.rotationPeriod}\n` +
      `- **Arah Rotasi:** ${body.rotationDirection}\n` +
      `- **Kecepatan Khatulistiwa:** ${body.rotationSpeed}\n` +
      `- **Kemiringan Sumbu:** ${body.axialTilt}\n\n`;
  }

  const table = isGalaxy
    ? [
        "| Parameter Astrofisika | Data Observasi |",
        "| :--- | :--- |",
        `| **Katalog & Klasifikasi** | ${body.catalogCode} — ${body.classification} |`,
        `| **Massa Total** | **${body.mass}** (${body.massKg}) |`,
        `| **Diameter** | ${body.diameter} |`,
        `| **Jarak dari Bumi** | ${body.distance} |`,
        `| **Populasi Bintang** | ${body.starCount} |`,
        `| **Usia Estimasi** | ${body.age} |`,
        `| **Rasi Bintang** | ${body.constellation} |`,
        `| **Lubang Hitam Pusat** | ${body.centralBlackHole} |`,
        `| **Kecepatan Radial** | ${body.radialVelocity} |`,
      ].join("\n")
    : [
        "| Parameter Telemetri | Data Ilmiah |",
        "| :--- | :--- |",
        `| **Klasifikasi** | ${body.classification} (${body.catalogCode}) |`,
        `| **Massa** | **${body.mass}** (${body.massComparison}) |`,
        `| **Diameter** | ${body.diameter} |`,
        `| **Gravitasi Permukaan** | ${body.gravity} |`,
        `| **Jarak dari Matahari** | ${body.distance} |`,
        `| **Periode Rotasi (1 Hari)** | ${body.rotationPeriod} (${body.rotationDirection}) |`,
        `| **Kemiringan Sumbu** | ${body.axialTilt} |`,
        `| **Periode Revolusi (1 Tahun)** | ${body.orbitalPeriod} (${body.orbitalSpeed}) |`,
        `| **Suhu & Satelit** | ${body.temperature} • ${body.moonsCount} |`,
        `| **Komposisi Atmosfer** | ${body.atmosphere} |`,
      ].join("\n");

  const rotBlock =
    !isGalaxy && !focusRotation && body.rotationInsight
      ? `\n\n#### Karakteristik Rotasi\n${body.rotationInsight}`
      : "";

  const factsBlock =
    `\n\n#### Fakta Ilmiah Penting\n` +
    body.facts.map((f) => `- ${f}`).join("\n");

  const tip = isGalaxy
    ? `\n\n> **Tip Interaktif:** Buka tab **Atlas Galaksi 3D** untuk memutar model 3D **${body.name}** secara 360° dan melihat struktur intinya dari dekat.`
    : `\n\n> **Tip Interaktif:** Buka menu **3D Game [ALPHA]** lalu klik **${body.name}** pada simulasi Tata Surya untuk mengamati orbit dan rotasinya secara langsung.`;

  const suggestions = isGalaxy
    ? [
        body.slug === "bima-sakti"
          ? "Bandingkan Bima Sakti dan Galaksi Andromeda"
          : `Bandingkan ${body.name} dengan Bima Sakti`,
        `Ceritakan lubang hitam di pusat ${body.name}`,
        "Galaksi apa yang paling besar di alam semesta?",
      ]
    : [
        body.slug === "bumi"
          ? "Apa yang terjadi jika Bumi berhenti berotasi?"
          : `Bandingkan ${body.name} dengan Bumi`,
        `Berapa berat badan 60 kg jika berada di ${body.name}?`,
        "Urutkan massa seluruh planet di Tata Surya",
      ];

  return {
    content: intro + table + rotBlock + factsBlock + tip,
    topic: body.name,
    suggestions,
  };
}

function formatComparison(a: CelestialSeedItem, b: CelestialSeedItem): AiReply {
  const bothGalaxies = a.category === "galaxy" && b.category === "galaxy";
  const rows = bothGalaxies
    ? [
        `| Parameter | ${a.name} | ${b.name} |`,
        "| :--- | :--- | :--- |",
        `| **Tipe Morfologi** | ${a.classification} | ${b.classification} |`,
        `| **Massa Total** | **${a.mass}** | **${b.mass}** |`,
        `| **Massa (kg)** | ${a.massKg} | ${b.massKg} |`,
        `| **Diameter** | ${a.diameter} | ${b.diameter} |`,
        `| **Jarak dari Bumi** | ${a.distance} | ${b.distance} |`,
        `| **Jumlah Bintang** | ${a.starCount} | ${b.starCount} |`,
        `| **Lubang Hitam Pusat** | ${a.centralBlackHole} | ${b.centralBlackHole} |`,
        `| **Kecepatan Radial** | ${a.radialVelocity} | ${b.radialVelocity} |`,
        `| **Rasi Bintang** | ${a.constellation} | ${b.constellation} |`,
      ]
    : [
        `| Parameter | ${a.name} | ${b.name} |`,
        "| :--- | :--- | :--- |",
        `| **Kategori** | ${a.classification} | ${b.classification} |`,
        `| **Massa** | **${a.mass}** | **${b.mass}** |`,
        `| **Rasio Massa** | ${a.massComparison} | ${b.massComparison} |`,
        `| **Diameter** | ${a.diameter} | ${b.diameter} |`,
        `| **Gravitasi** | ${a.gravity ?? "-"} | ${b.gravity ?? "-"} |`,
        `| **Periode Rotasi** | ${a.rotationPeriod ?? "-"} | ${b.rotationPeriod ?? "-"} |`,
        `| **Kemiringan Sumbu** | ${a.axialTilt ?? "-"} | ${b.axialTilt ?? "-"} |`,
        `| **Periode Orbit** | ${a.orbitalPeriod ?? "-"} | ${b.orbitalPeriod ?? "-"} |`,
        `| **Suhu** | ${a.temperature ?? "-"} | ${b.temperature ?? "-"} |`,
        `| **Satelit Alami** | ${a.moonsCount ?? "-"} | ${b.moonsCount ?? "-"} |`,
      ];

  let extraNote = `\n\n#### Analisis Ringkas\n- **${a.name}:** ${a.summary}\n- **${b.name}:** ${b.summary}`;
  if (
    (a.slug === "bima-sakti" && b.slug === "andromeda") ||
    (a.slug === "andromeda" && b.slug === "bima-sakti")
  ) {
    extraNote +=
      "\n- **Takdir Kosmik (Milkomeda):** Kedua galaksi raksasa ini sedang saling mendekat pada kecepatan **110 km/s** (400.000 km/jam). Dalam sekitar **4,5 miliar tahun**, keduanya akan menari dalam tarikan pasang surut gravitasi dan melebur menjadi satu galaksi elips raksasa yang dijuluki **Milkomeda**. Karena ruang antar bintang sangat renggang, Tata Surya hampir pasti selamat tanpa tabrakan bintang langsung!";
  }

  return {
    content: `### Perbandingan Astrofisika: ${a.name} vs ${b.name}\nBerikut perbandingan data observasi langsung antara **${a.name}** dan **${b.name}**:\n\n${rows.join("\n")}${extraNote}`,
    topic: `${a.name} vs ${b.name}`,
    suggestions: [
      `Fakta unik tentang ${a.name}`,
      `Fakta unik tentang ${b.name}`,
      bothGalaxies
        ? "Jelaskan proses tabrakan Bima Sakti dan Andromeda"
        : "Urutkan massa seluruh planet di Tata Surya",
    ],
  };
}

async function tryExternalLLM(
  message: string,
  history: HistoryItem[]
): Promise<AiReply | null> {
  const systemPrompt =
    "Kamu adalah Galaxy AI, asisten kecerdasan buatan astrofisika dan astronomi kelas premium berbahasa Indonesia. Jawablah dengan akurat secara ilmiah, terstruktur rapi menggunakan Markdown (heading, bullet, tabel jika relevan), hangat, menginspirasi, dan sertakan data kuantitatif (massa, jarak, kecepatan, suhu). Jangan pernah membatasi pertanyaan pengguna.";

  if (process.env.OPENAI_API_KEY) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.65,
          messages: [
            { role: "system", content: systemPrompt },
            ...history.slice(-8).map((m) => ({
              role: m.role === "assistant" ? "assistant" : "user",
              content: m.content,
            })),
            { role: "user", content: message },
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return {
            content,
            topic: "Astrofisika Galaxy AI",
            suggestions: [
              "Bagaimana pengaruh rotasi Bumi terhadap kehidupan?",
              "Bandingkan Bima Sakti dengan Galaksi Andromeda",
              "Bagaimana lubang hitam melengkungkan ruang-waktu?",
            ],
          };
        }
      }
    } catch {
      // Fallback to native astrophysics engine
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...history.slice(-8).map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
              { role: "user", parts: [{ text: message }] },
            ],
          }),
        }
      );
      if (res.ok) {
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (content) {
          return {
            content,
            topic: "Astrofisika Galaxy AI",
            suggestions: [
              "Jelaskan struktur Galaksi Bima Sakti",
              "Urutkan massa seluruh planet di Tata Surya",
              "Apa itu materi gelap dan energi gelap?",
            ],
          };
        }
      }
    } catch {
      // Fallback to native astrophysics engine
    }
  }

  return null;
}

export async function generateAstronomyReply(
  rawMessage: string,
  history: HistoryItem[] = []
): Promise<AiReply> {
  const external = await tryExternalLLM(rawMessage, history);
  if (external) return external;

  const msg = rawMessage.trim();
  const q = msg.toLowerCase();

  // 1. Dynamic Weight Calculator on Planets
  const weightMatch = q.match(/berat(?:\s+badan|\s+saya|\s+aku)?\s*(\d+(?:[.,]\d+)?)\s*kg/) ||
    (/berat\s+(?:di|badan|saya|aku)/.test(q) ? q.match(/(\d+(?:[.,]\d+)?)\s*kg/) : null);
  if (weightMatch) {
    const massKg = parseFloat(weightMatch[1].replace(",", "."));
    const factors: Array<[string, number, string]> = [
      ["Matahari", 27.94, "274,0 m/s²"],
      ["Merkurius", 0.377, "3,70 m/s²"],
      ["Venus", 0.904, "8,87 m/s²"],
      ["Bumi", 1.0, "9,81 m/s²"],
      ["Bulan (Luna)", 0.165, "1,62 m/s²"],
      ["Mars", 0.379, "3,72 m/s²"],
      ["Jupiter", 2.528, "24,79 m/s²"],
      ["Saturnus", 1.065, "10,44 m/s²"],
      ["Uranus", 0.886, "8,69 m/s²"],
      ["Neptunus", 1.137, "11,15 m/s²"],
      ["Pluto", 0.063, "0,62 m/s²"],
    ];
    const table = [
      "| Benda Langit | Gravitasi | Berat Terukur |",
      "| :--- | :--- | :--- |",
      ...factors.map(
        ([name, f, g]) =>
          `| **${name}** | ${g} | **${(massKg * f).toFixed(1).replace(".", ",")} kgf** (${(massKg * f * 9.807).toFixed(0)} N) |`
      ),
    ].join("\n");

    return {
      content:
        `### Kalkulasi Gravitasi untuk Massa ${massKg} kg\n` +
        `Dalam fisika, **massa** tubuh Anda tetap **${massKg} kg** di mana pun di alam semesta, tetapi **berat** (gaya tarik gravitasi $W = m \\times g$) berubah drastis sesuai massa dan radius benda langit:\n\n${table}\n\n` +
        `- Di **Mars**, Anda bisa melompat hampir **2,6 kali lebih tinggi** daripada di Bumi.\n` +
        `- Di permukaan **Bintang Neutron**, massa ${massKg} kg akan terasa setara **~${(massKg * 1.4e11 / 1e9).toFixed(0)} miliar ton**!`,
      topic: "Kalkulator Gravitasi",
      suggestions: [
        "Mengapa gravitasi Saturnus hampir sama dengan Bumi padahal jauh lebih besar?",
        "Apa itu bintang neutron dan pulsar?",
        "Konversi 4,24 tahun cahaya ke kilometer",
      ],
    };
  }

  // 2. Dynamic Light-Year Converter
  const lyMatch = q.match(/(\d+(?:[.,]\d+)?)\s*(?:tahun cahaya|light\s*year|ly\b)/);
  if (lyMatch && /berapa|konversi|jarak|km|kilometer|lama|waktu/.test(q)) {
    const ly = parseFloat(lyMatch[1].replace(",", "."));
    const kmTrillion = ly * 9.4607;
    const au = ly * 63241;
    const parkerYears = (ly * 9.4607e12) / (692000 * 24 * 365.25);
    return {
      content:
        `### Konversi Jarak Kosmik: ${ly} Tahun Cahaya\n` +
        `Satu tahun cahaya adalah jarak yang ditempuh foton cahaya dalam ruang hampa ($c = 299.792,458$ km/s) selama 1 tahun Julian (365,25 hari):\n\n` +
        `| Satuan / Wahana | Hasil Perhitungan |` +
        `\n| :--- | :--- |` +
        `\n| **Kilometer** | **${kmTrillion.toLocaleString("id-ID", { maximumFractionDigits: 2 })} Triliun km** |` +
        `\n| **Satuan Astronomi (AU)** | ${Math.round(au).toLocaleString("id-ID")} × jarak Bumi–Matahari |` +
        `\n| **Parsek (pc)** | ${(ly / 3.26156).toFixed(3).replace(".", ",")} pc |` +
        `\n| **Waktu Tempuh Cahaya** | ${ly} tahun |` +
        `\n| **Waktu Tempuh Parker Solar Probe** (692.000 km/jam) | ~${Math.round(parkerYears).toLocaleString("id-ID")} tahun |\n\n` +
        `Sebagai perbandingan, bintang terdekat di luar Tata Surya (**Proxima Centauri**) berjarak **4,24 tahun cahaya**, sedangkan **Galaksi Andromeda** berjarak **2,537 juta tahun cahaya**.`,
      topic: "Skala Tahun Cahaya",
      suggestions: [
        "Mungkinkah manusia bergerak melebihi kecepatan cahaya?",
        "Apa itu lubang cacing (wormhole)?",
        "Ceritakan tentang bintang terdekat Proxima Centauri",
      ],
    };
  }

  // 3. Hypothetical: Earth stops rotating
  if (/bumi/.test(q) && /berhenti\s*(berotasi|berputar|putar)/.test(q)) {
    return {
      content:
        `### Bagaimana Jika Bumi Tiba-Tiba Berhenti Berotasi?\n` +
        `Skenario ini adalah salah satu eksperimen pikiran astrofisika paling dramatis:\n\n` +
        `1. **Momentum Atmosfer Supersonik (1.674 km/jam):** Jika kerak Bumi berhenti mendadak, atmosfer dan samudra masih menyimpan inersia gerak ke arah Timur hingga **1.674 km/jam** di khatulistiwa — memicu angin supersonik dan megatsunami global.\n` +
        `2. **Samudra Bermigrasi ke Dua Kutub:** Tanpa gaya sentrifugal rotasi yang menahan "gembungan" air di khatulistiwa, lautan akan mengalir ke Kutub Utara dan Selatan, menyisakan satu superbenua kering raksasa yang melingkari khatulistiwa.\n` +
        `3. **6 Bulan Siang Membara & 6 Bulan Malam Beku:** Karena Bumi masih berevolusi mengelilingi Matahari, satu hari penuh akan berlangsung selama **365 hari** — setengah tahun terpanggang matahari ekstrem dan setengah tahun membeku gelap gulita.\n` +
        `4. **Melemahnya Perisai Magnetosfer:** Putaran inti besi cair (efek dinamo) akan terganggu, membuat permukaan Bumi terpapar radiasi angin surya berbahaya.\n\n` +
        `> **Kabar Baiknya:** Secara hukum kekekalan momentum sudut, tidak ada gaya alami yang bisa menghentikan rotasi Bumi secara mendadak. Tarikan pasang surut Bulan hanya memperlambat hari Bumi sekitar **1,7 milidetik per 100 tahun**.`,
      topic: "Dinamika Rotasi Bumi",
      suggestions: [
        "Bagaimana cara Bumi berotasi dan mengapa kita tidak merasakannya?",
        "Apa yang terjadi jika Matahari tiba-tiba menghilang?",
        "Planet mana yang berotasi terbalik di Tata Surya?",
      ],
    };
  }

  // 4. Deep Earth Rotation explanation
  if (
    (/rotasi\s+bumi/.test(q) ||
      (/bumi/.test(q) && /berotasi|berputar|siang.*malam|zona waktu|wib|musim|tidak\s+merasa/.test(q))) &&
    !/venus|jupiter|mars|saturnus|uranus|neptunus/.test(q)
  ) {
    return {
      content:
        `### Cara Kerja Rotasi Bumi & Dampaknya bagi Kehidupan\n` +
        `**Rotasi Bumi** adalah perputaran planet Bumi pada porosnya dari **Barat ke Timur** (berlawanan arah jarum jam jika diamati dari atas Kutub Utara).\n\n` +
        `| Parameter Rotasi Bumi | Nilai Presisi |` +
        `\n| :--- | :--- |` +
        `\n| **Massa Bumi** | **5,972 × 10²⁴ kg** |` +
        `\n| **Hari Sideris (360° murni)** | 23 jam 56 menit 4,09 detik |` +
        `\n| **Hari Surya (siang ke siang)** | 24 jam 0 menit |` +
        `\n| **Kecepatan Khatulistiwa** | **1.674,4 km/jam** (465,1 m/s) |` +
        `\n| **Kemiringan Sumbu (Oblikuitas)** | **23,44°** terhadap bidang orbit |` +
        `\n| **Kecepatan Sudut** | 15° garis bujur setiap 1 jam |\n\n` +
        `#### 5 Dampak Utama Rotasi Bumi\n` +
        `1. **Pergantian Siang & Malam:** Sisi yang menghadap Matahari mengalami siang, dipisahkan oleh **Garis Terminator** dari sisi malam.\n` +
        `2. **Gerak Semu Harian Matahari & Bintang:** Karena Bumi berputar ke Timur, Matahari dan rasi bintang tampak terbit dari Timur dan terbenam di Barat.\n` +
        `3. **Pembagian Zona Waktu (WIB, WITA, WIT):** Setiap selisih 15° bujur setara 1 jam — membagi Indonesia menjadi **WIB (UTC+7)**, **WITA (UTC+8)**, dan **WIT (UTC+9)**.\n` +
        `4. **Efek Coriolis:** Membelokkan arah angin pasat, arus laut, dan pusaran siklon tropis.\n` +
        `5. **Bentuk Bulat Pepat (*Oblate Spheroid*):** Khatulistiwa Bumi menggembung **42,7 km** lebih lebar dibandingkan diameter kutubnya.\n\n` +
        `#### Mengapa Kita Tidak Merasa Pusing?\n` +
        `Karena Bumi berputar dengan **kecepatan konstan** (percepatan hampir nol), dan kita, gedung, lautan, serta seluruh lapisan atmosfer ikut bergerak serempak bersama Bumi — persis seperti saat Anda minum kopi dengan tenang di dalam pesawat jet yang melaju 900 km/jam!\n\n` +
        `> **Coba Langsung dalam 3D:** Klik tab **3D Game [ALPHA]** lalu tekan tombol **Pelajari Rotasi Bumi** untuk melihat sumbu miring 23,44°, garis khatulistiwa, dan batas siang-malam Bumi secara interaktif.`,
      topic: "Rotasi Bumi",
      suggestions: [
        "Apa yang terjadi jika Bumi berhenti berotasi?",
        "Mengapa Venus berotasi terbalik dan Uranus berotasi miring?",
        "Jelaskan perbedaan rotasi dan revolusi Bumi",
      ],
    };
  }

  // 5. Milky Way & Andromeda Collision (Milkomeda)
  if (
    (/tabrakan|bertabrakan|bergabung|milkomeda/.test(q) &&
      /bima sakti|andromeda|galaksi/.test(q))
  ) {
    return {
      content:
        `### Tabrakan Kosmik Bima Sakti & Andromeda (*Milkomeda*)\n` +
        `Meski alam semesta secara keseluruhan mengembang, tarikan gravitasi bersama antara **Bima Sakti** ($1,5 \\times 10^{12}\\ M_\\odot$) dan **Galaksi Andromeda / M31** ($1,5 \\times 10^{12}\\ M_\\odot$) beserta halo materi gelapnya cukup kuat untuk mengalahkan ekspansi ruang lokal.\n\n` +
        `#### Garis Waktu Peristiwa\n` +
        `- **Saat Ini:** Berjarak **2,537 juta tahun cahaya**, saling mendekat pada kecepatan **110 km/s** (~400.000 km/jam).\n` +
        `- **+2 hingga +3,75 Miliar Tahun:** Andromeda tampak membesar dramatis memenuhi langit malam Bumi, menyaingi bentangan pita Bima Sakti.\n` +
        `- **+4,5 Miliar Tahun (Lintasan Pertama):** Kedua piringan spiral saling menembus; gaya pasang surut melontarkan ekor bintang raksasa dan memicu ledakan kelahiran jutaan bintang baru (*starburst*).\n` +
        `- **+6 Miliar Tahun (*Milkomeda*):** Kedua galaksi melebur utuh menjadi satu **galaksi elips raksasa**; lubang hitam pusat **Sagittarius A*** dan **M31*** bergabung sambil memancarkan gelombang gravitasi dahsyat.\n\n` +
        `#### Apakah Bumi & Matahari Akan Tertabrak Bintang Lain?\n` +
        `**Hampir mustahil!** Jarak rata-rata antar bintang adalah ~4 tahun cahaya (ibarat dua bola pingpong yang terpisah ribuan kilometer). Namun Tata Surya memiliki peluang ~50% terlempar ke orbit lebih jauh dari pusat galaksi baru — menyuguhkan pemandangan langit malam paling spektakuler dalam sejarah kosmos.`,
      topic: "Tabrakan Milkomeda",
      suggestions: [
        "Bandingkan Bima Sakti dan Galaksi Andromeda",
        "Ceritakan tentang Galaksi Roda Pedati hasil tabrakan kosmik",
        "Bagaimana nasib akhir Matahari dalam 5 miliar tahun?",
      ],
    };
  }

  // 6. All Planets Ranking / Solar System Overview
  if (
    /urutkan|daftar\s+planet|semua\s+planet|seluruh\s+planet|tata\s+surya|planet\s+terberat|planet\s+terbesar|massa\s+planet/.test(
      q
    )
  ) {
    const table = [
      "| Peringkat | Planet | Massa (kg) | Rasio Bumi | Diameter | Rotasi (1 Hari) |",
      "| :--- | :--- | :--- | :--- | :--- | :--- |",
      "| 1 | **Jupiter** | **1,898 × 10²⁷ kg** | 317,8 M⊕ | 139.820 km | 9j 55m |",
      "| 2 | **Saturnus** | **5,683 × 10²⁶ kg** | 95,16 M⊕ | 116.460 km | 10j 33m |",
      "| 3 | **Neptunus** | **1,024 × 10²⁶ kg** | 17,15 M⊕ | 49.244 km | 16j 06m |",
      "| 4 | **Uranus** | **8,681 × 10²⁵ kg** | 14,54 M⊕ | 50.724 km | 17j 14m (retrograd) |",
      "| 5 | **Bumi** | **5,972 × 10²⁴ kg** | 1,00 M⊕ | 12.742 km | 23j 56m |",
      "| 6 | **Venus** | **4,867 × 10²⁴ kg** | 0,815 M⊕ | 12.104 km | 243 hari (retrograd) |",
      "| 7 | **Mars** | **6,417 × 10²³ kg** | 0,107 M⊕ | 6.779 km | 24j 37m |",
      "| 8 | **Merkurius** | **3,301 × 10²³ kg** | 0,055 M⊕ | 4.879 km | 58h 15j |",
    ].join("\n");

    return {
      content:
        `### Peringkat Massa & Telemetri 8 Planet Tata Surya\n` +
        `Sebagai pembanding utama, **Matahari** memiliki massa **1,989 × 10³⁰ kg** (**99,86%** dari seluruh massa Tata Surya). Sisa 0,14%-nya didominasi oleh para planet berikut dari yang paling masif:\n\n${table}\n\n` +
        `#### Catatan Menarik\n` +
        `- **Neptunus vs Uranus:** Walaupun diameter Uranus sedikit lebih besar (50.724 km vs 49.244 km), **massa Neptunus 18% lebih berat** karena komposisi batuan dan esnya lebih padat!\n` +
        `- **Dominasi Jupiter:** Massa Jupiter sendirian mencapai **2,5 kali** gabungan massa 7 planet lainnya.\n` +
        `- **Sabuk Asteroid & Kuiper:** Di luar 8 planet mayor, Tata Surya juga dihuni planet katai seperti **Pluto** ($1,30 \\times 10^{22}$ kg), **Eris**, **Ceres**, **Haumea**, dan **Makemake**.`,
      topic: "Tata Surya",
      suggestions: [
        "Mengapa Pluto tidak lagi disebut planet utama?",
        "Berapa berat badan 60 kg di setiap planet?",
        "Bandingkan Jupiter dan Saturnus",
      ],
    };
  }

  // 7. Comparison or single body match
  const mentioned = findMentionedBodies(q);
  if (mentioned.length >= 2) {
    return formatComparison(mentioned[0], mentioned[1]);
  }
  if (
    mentioned.length === 1 &&
    !/lubang hitam.*apa|apa itu lubang hitam|big bang|eksoplanet|materi gelap|wormhole/.test(q)
  ) {
    return formatBodyReport(mentioned[0], q);
  }

  // 8. Black Holes & Relativistic Physics
  if (/lubang hitam|black\s*hole|event horizon|cakrawala peristiwa|gargantua|spaghet|ton 618|hawking|dilatasi waktu/.test(q)) {
    return {
      content:
        `### Lubang Hitam (*Black Hole*) & Kelengkungan Ruang-Waktu\n` +
        `**Lubang hitam** adalah wilayah ruang-waktu dengan gravitasi begitu ekstrem sehingga tidak ada materi maupun radiasi elektromagnetik (termasuk cahaya pada $299.792$ km/s) yang mampu lolos setelah melewati batas **Cakrawala Peristiwa (*Event Horizon*)**.\n\n` +
        `#### Struktur Anatomi Lubang Hitam\n` +
        `- **Piringan Akresi (*Accretion Disk*):** Pusaran gas dan plasma super panas (jutaan derajat Celsius) yang berpendar terang akibat gesekan relativistik sebelum terhisap.\n` +
        `- **Bola Foton (*Photon Sphere*):** Pada jarak $1,5 \\times R_s$, cahaya dibelokkan begitu kuat hingga mengorbit lubang hitam.\n` +
        `- **Radius Schwarzschild ($R_s = \\frac{2GM}{c^2}$):** Batas tak kembali. Jika Bumi dimampatkan menjadi lubang hitam, radiusnya hanya **8,87 milimeter**!\n` +
        `- **Singularitas:** Titik pusat di mana kerapatan materi melampaui batas fisika klasik.\n\n` +
        `#### Perbandingan Lubang Hitam Ikonik\n` +
        `| Nama Objek | Lokasi | Massa | Diameter Event Horizon |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        `| **Cygnus X-1** | Bima Sakti | 21,2 M☉ | ~125 km |\n` +
        `| **Sagittarius A*** | Pusat Bima Sakti | **4,3 Juta M☉** | ~25,4 juta km |\n` +
        `| **M87*** | Pusat Galaksi M87 | **6,5 Miliar M☉** | ~38,4 miliar km |\n` +
        `| **TON 618** | Kuasar Jauh (10,8 Miliar ly) | **~40–66 Miliar M☉** | ~240–390 miliar km |\n\n` +
        `#### Fenomena Dilatasi Waktu & *Spaghettification*\n` +
        `Menurut Relativitas Umum Einstein, semakin dekat Anda ke cakrawala peristiwa lubang hitam supermasif, **waktu berjalan jauh lebih lambat** dibandingkan pengamat di Bumi (seperti planet Miller di film *Interstellar*). Sementara pada lubang hitam kecil, perbedaan gravitasi antara kaki dan kepala akan meregangkan objek seperti mi panjang (*spaghettification*).`,
      topic: "Lubang Hitam",
      suggestions: [
        "Ceritakan tentang Galaksi Messier 87 dan jet plasmanya",
        "Apa itu lubang cacing (wormhole) dan apakah nyata?",
        "Bagaimana bintang meledak menjadi supernova dan lubang hitam?",
      ],
    };
  }

  // 9. Big Bang & Cosmology
  if (/big\s*bang|ledakan besar|awal\s+alam\s+semesta|usia\s+alam\s+semesta|terbentuknya\s+alam\s+semesta|cmb|mengembang/.test(q)) {
    return {
      content:
        `### Kosmologi Big Bang & Evolusi Alam Semesta\n` +
        `Berdasarkan pengukuran presisi satelit Planck, teleskop Hubble, dan JWST, alam semesta kita berusia **13,787 ± 0,020 miliar tahun**. *Big Bang* bukanlah ledakan di dalam ruang kosong, melainkan **ekspansi super cepat dari ruang-waktu itu sendiri** dari keadaan sangat panas dan padat.\n\n` +
        `#### Kronologi Kosmik Utama\n` +
        `1. **$10^{-36}$ detik (Inflasi Kosmik):** Ruang memuai secara eksponensial lebih cepat dari cahaya, menyebarkan fluktuasi kuantum yang kelak menjadi benih galaksi.\n` +
        `2. **3 Menit Pertama (Nukleosintesis):** Proton dan neutron bergabung membentuk inti atom ringan: **~75% Hidrogen** dan **~25% Helium**.\n` +
        `3. **380.000 Tahun (Rekombinasi & CMB):** Alam semesta mendingin hingga 3.000 K; atom netral terbentuk dan cahaya pertama bebas memancar — kini kita deteksi sebagai **Radiasi Latar Gelombang Mikro Kosmik (CMB)** bersuhu 2,725 K.\n` +
        `4. **100–300 Juta Tahun (Fajar Kosmik):** Bintang Populasi III pertama menyala dan galaksi-galaksi purba (seperti *JADES-GS-z14-0*) mulai merakit diri.\n` +
        `5. **9,2 Miliar Tahun Setelah Big Bang:** Matahari dan Bumi terbentuk di salah satu lengan spiral Bima Sakti.\n\n` +
        `Saat ini diameter **alam semesta teramati** mencapai **93 miliar tahun cahaya** karena ruang di antara gugus-gugus galaksi terus memuai (~67–73 km/s per Megaparsek).`,
      topic: "Kosmologi Big Bang",
      suggestions: [
        "Apa itu materi gelap (dark matter) dan energi gelap?",
        "Bagaimana nasib akhir alam semesta di masa depan?",
        "Galaksi apa yang paling besar dan paling jauh?",
      ],
    };
  }

  // 10. Dark Matter & Dark Energy
  if (/materi gelap|dark matter|energi gelap|dark energy|komposisi alam semesta/.test(q)) {
    return {
      content:
        `### Materi Gelap (*Dark Matter*) & Energi Gelap (*Dark Energy*)\n` +
        `Seluruh bintang, planet, nebula, galaksi, dan tubuh manusia yang bisa kita lihat ternyata hanyalah sebagian sangat kecil dari isi alam semesta!\n\n` +
        `| Komponen Kosmos | Persentase | Peran Astrofisika |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Energi Gelap (*Dark Energy*)** | **68,3%** | Mendorong percepatan ekspansi ruang alam semesta |\n` +
        `| **Materi Gelap (*Dark Matter*)** | **26,8%** | "Perekat gravitasi" tak kasatmata pembentuk halo galaksi |\n` +
        `| **Materi Biasa (*Baryonik*)** | **4,9%** | Seluruh atom, gas, bintang, planet, dan makhluk hidup |\n\n` +
        `#### Bagaimana Kita Tahu Materi Gelap Ada?\n` +
        `- **Kurva Rotasi Galaksi (Vera Rubin):** Bintang-bintang di tepi luar Bima Sakti dan Andromeda mengorbit terlalu cepat — tanpa selubung massa materi gelap raksasa, galaksi akan tercerai-berai.\n` +
        `- **Pelensaan Gravitasi (*Gravitational Lensing*):** Cahaya galaksi jauh melengkung melewati gugus galaksi lebih kuat daripada yang bisa dijelaskan oleh materi tampak saja (contoh terkenal: *Bullet Cluster*).`,
      topic: "Materi & Energi Gelap",
      suggestions: [
        "Jelaskan teori Big Bang dan usia alam semesta",
        "Bandingkan massa Bima Sakti dan Messier 87",
        "Apa itu lubang hitam supermasif?",
      ],
    };
  }

  // 11. Stars, Supernova, Neutron Stars, Pulsars
  if (/bintang|supernova|neutron|pulsar|magnetar|katai putih|betelgeuse|sirius|uy scuti|stephenson|proxima/.test(q)) {
    return {
      content:
        `### Siklus Hidup Bintang, Supernova & Objek Kompak\n` +
        `Bintang lahir di dalam awan molekuler dingin (nebula) ketika gravitasi meruntuhkan gas hidrogen hingga suhu intinya melampaui **10 juta °C** dan menyalakan **fusi termonuklir**. Takdir sebuah bintang sepenuhnya ditentukan oleh **massanya**:\n\n` +
        `- **Massa Rendah–Menengah ($0,08 - 8\\ M_\\odot$, seperti Matahari):** Deret Utama → Raksasa Merah → melepas Nebula Planeter → menyisakan inti karbon-oksigen padat bernama **Katai Putih (*White Dwarf*)**.\n` +
        `- **Massa Tinggi ($8 - 20\\ M_\\odot$):** Membakar unsur hingga inti besi → runtuh dalam hitungan milidetik dan meledak sebagai **Supernova Tipe II** → menyisakan **Bintang Neutron / Pulsar** (berdiameter ~20 km, namun 1 sendok teh materinya seberat ~1 miliar ton!).\n` +
        `- **Massa Ekstrem ($>20\\ M_\\odot$):** Ledakan supernova/hipernova yang meruntuhkan intinya langsung menjadi **Lubang Hitam**.\n\n` +
        `#### Bintang-Bintang Pemegang Rekor\n` +
        `- **Terdekat dari Bumi (selain Matahari):** *Proxima Centauri* (4,24 tahun cahaya, katai merah).\n` +
        `- **Paling Terang di Langit Malam:** *Sirius A* (8,6 tahun cahaya, massa $2,06\\ M_\\odot$).\n` +
        `- **Kandidat Supernova Dekat:** *Betelgeuse* di rasi Orion (~640 tahun cahaya, maharaksasa merah).\n` +
        `- **Radius Terbesar Diketahui:** *Stephenson 2-18* (~2.150 × radius Matahari — mampu menampung 10 miliar Matahari!).\n` +
        `- **Paling Masif Diketahui:** *R136a1* di Awan Magellan Besar (~200–230 × massa Matahari).\n\n` +
        `> *Kalsium di tulang Anda, besi di darah Anda, dan emas di perhiasan Anda semuanya ditempa di jantung ledakan supernova dan tabrakan bintang neutron miliaran tahun silam.*`,
      topic: "Evolusi Bintang",
      suggestions: [
        "Apa itu nebula dan bagaimana bintang lahir di dalamnya?",
        "Jelaskan lubang hitam supermasif dan cakrawala peristiwa",
        "Ceritakan data lengkap tentang Matahari kita",
      ],
    };
  }

  // 12. Galaxies overview / largest galaxies
  if (/galaksi|ic 1101|alcyoneus|jades|magellan|jenis galaksi|macam galaksi/.test(q)) {
    return {
      content:
        `### Klasifikasi & Atlas Galaksi di Alam Semesta\n` +
        `Diperkirakan terdapat **200 miliar hingga 2 triliun galaksi** di alam semesta teramati. Astronom Edwin Hubble mengelompokkannya berdasarkan morfologi 3D:\n\n` +
        `1. **Spiral (*Sa–Sc*) & Spiral Berbatang (*SBa–SBc*):** Piringan pipih berputar dengan lengan terang kaya gas & bintang muda — contoh: **Bima Sakti** (*SBbc*), **Andromeda** (*SA(s)b*), **Whirlpool M51**, dan **Triangulum M33**.\n` +
        `2. **Elips (*E0–E7*):** Bola atau elipsoid keemasan berisi triliunan bintang tua dengan sedikit debu — contoh: **Messier 87** (bermassa $2,4 \\times 10^{12}\\ M_\\odot$) dan raksasa **IC 1101**.\n` +
        `3. **Lentikular & Cincin (*S0 / Ring*):** Bentuk peralihan atau hasil tabrakan dramatis — contoh: **Galaksi Sombrero (M104)** dan **Galaksi Roda Pedati (*Cartwheel*)**.\n` +
        `4. **Tak Beraturan (*Irregular*):** Kaya gas tanpa bentuk simetris — contoh: **Awan Magellan Besar (LMC)** & **Kecil (SMC)** yang mengorbit Bima Sakti.\n\n` +
        `#### Rekor Galaksi Ekstrem\n` +
        `- **Galaksi Terbesar (Bintang):** **IC 1101** — diameter halo mencapai ~4 juta tahun cahaya dengan massa hingga ~$10^{14}\\ M_\\odot$.\n` +
        `- **Galaksi Radio Terpanjang:** **Alcyoneus** — lobus jet radionya membentang 16,3 juta tahun cahaya.\n` +
        `- **Galaksi Terjauh Terkonfirmasi (JWST):** **JADES-GS-z14-0** — cahayanya berasal dari masa hanya **290 juta tahun** setelah Big Bang!\n\n` +
        `> **Eksplorasi 3D:** Buka **Atlas Galaksi 3D** untuk memutar model 3D **Bima Sakti, Andromeda, Sombrero, Whirlpool, Triangulum, M87,** dan **Cartwheel** lengkap dengan data massanya.`,
      topic: "Atlas Galaksi",
      suggestions: [
        "Bandingkan Bima Sakti dan Galaksi Andromeda",
        "Ceritakan tentang Galaksi Sombrero (M104)",
        "Apa yang terjadi saat Bima Sakti dan Andromeda bertabrakan?",
      ],
    };
  }

  // 13. Moon & Eclipses
  if (/bulan|luna|gerhana|pasang surut|fase bulan/.test(q)) {
    return {
      content:
        `### Bulan (*Luna*), Pasang Surut & Fenomena Gerhana\n` +
        `**Bulan** adalah satu-satunya satelit alami permanen Bumi yang diyakini terbentuk ~4,51 miliar tahun lalu akibat tabrakan purba Bumi muda dengan protoplanet seukuran Mars bernama **Theia**.\n\n` +
        `| Parameter Bulan | Data Ilmiah |\n` +
        `| :--- | :--- |\n` +
        `| **Massa** | **7,342 × 10²² kg** (1,23% massa Bumi) |\n` +
        `| **Diameter** | 3.474,8 km (27% diameter Bumi) |\n` +
        `| **Jarak Rata-Rata** | 384.400 km (menjauh 3,8 cm per tahun) |\n` +
        `| **Gravitasi** | 1,62 m/s² (1/6 gravitasi Bumi) |\n` +
        `| **Rotasi & Orbit** | 27,32 hari (Penguncian Pasang Surut / *Tidal Locking*) |\n\n` +
        `- **Mengapa Wajah Bulan Selalu Sama?** Karena periode rotasi Bulan persis sama dengan periode orbitnya mengelilingi Bumi (*tidal locking*), sehingga hanya satu belahan yang selalu menghadap kita.\n` +
        `- **Gerhana Matahari:** Terjadi saat Bulan baru melintas tepat di antara Matahari dan Bumi. Kebetulan kosmik menakjubkan: Matahari 400× lebih besar dari Bulan, tetapi juga 400× lebih jauh — sehingga ukuran tampaknya hampir identik dan korona Matahari terlihat jelas!\n` +
        `- **Gerhana Bulan:** Terjadi saat Bumi berada di antara Matahari dan Bulan purnama; atmosfer Bumi membiaskan cahaya merah ke permukaan Bulan (*Blood Moon*).`,
      topic: "Bulan & Gerhana",
      suggestions: [
        "Bagaimana cara Bumi berotasi dan pengaruhnya pada iklim?",
        "Planet mana yang memiliki bulan paling banyak?",
        "Berapa berat badan 60 kg di Bulan dan Mars?",
      ],
    };
  }

  // 14. Exoplanets & Alien Life
  if (/eksoplanet|exoplanet|alien|kehidupan|trappist|kepler|fermi|planet layak huni|j1407b/.test(q)) {
    return {
      content:
        `### Eksoplanet & Pencarian Kehidupan di Alam Semesta\n` +
        `Hingga kini para astronom telah mengonfirmasi lebih dari **5.700 eksoplanet** (planet di luar Tata Surya), dan secara statistik Bima Sakti saja menyimpan lebih dari **100 miliar planet**.\n\n` +
        `#### Eksoplanet Paling Menakjubkan\n` +
        `- **Proxima Centauri b (4,24 ly):** Eksoplanet terdekat dari Bumi, bermassa ~1,07 M⊕ dan berada tepat di **zona layak huni** (*habitable zone*).\n` +
        `- **Sistem TRAPPIST-1 (40,7 ly):** Tujuh planet seukuran Bumi mengorbit satu bintang katai ultra-dingin; tiga di antaranya (e, f, g) berpotensi memiliki air cair!\n` +
        `- **K2-18b (124 ly):** Planet *Sub-Neptunus / Hycean* yang diamati JWST menunjukkan metana dan karbon dioksida di atmosfernya.\n` +
        `- **J1407b (434 ly):** Dijuluki *"Super-Saturnus"* karena sistem cincin raksasanya 200 kali lebih lebar dari cincin Saturnus.\n` +
        `- **55 Cancri e (41 ly):** Bumi-super ultra-panas dengan samudra magma membara di sisi siangnya.\n\n` +
        `#### Paradoks Fermi\n` +
        `Mengingat miliaran planet layak huni telah ada selama miliaran tahun, fisikawan Enrico Fermi bertanya: *"Di mana semua orang?"* Jawaban yang diteliti mencakup jarak antarbintang yang teramat luas, langkanya kehidupan cerdas (*Rare Earth Hypothesis*), atau keterbatasan teknologi deteksi *biosignature* kita saat ini.`,
      topic: "Eksoplanet & Astrobiologi",
      suggestions: [
        "Bagaimana Teleskop James Webb meneliti atmosfer eksoplanet?",
        "Konversi 40,7 tahun cahaya ke kilometer",
        "Apakah bulan Europa dan Enceladus bisa memiliki kehidupan?",
      ],
    };
  }

  // 15. Nebulae
  if (/nebula|pilar penciptaan|pillars of creation|carina|orion/.test(q)) {
    return {
      content:
        `### Nebula: Dapur Kelahiran & Sisa Kematian Bintang\n` +
        `**Nebula** adalah awan raksasa antarbintang yang tersusun dari gas hidrogen, helium, plasma terionisasi, dan debu silikat/karbon berdiameter puluhan hingga ratusan tahun cahaya.\n\n` +
        `- **Nebula Emisi (H-II):** Berpendar merah muda, emas, dan biru-sian karena gasnya diionisasi radiasi ultraviolet bintang-bintang bayi di dalamnya — contoh: **Nebula Orion (M42)**, **Nebula Carina (NGC 3372)**, dan **Pilar Penciptaan di Nebula Elang (M16)**.\n` +
        `- **Nebula Planeter:** Selubung gas berwarna-warni simetris yang dilepaskan bintang seukuran Matahari di akhir hayatnya — contoh: **Nebula Cincin (M57)** dan **Nebula Helix (NGC 7293 / "Mata Tuhan")**.\n` +
        `- **Sisa Supernova (*Supernova Remnant*):** Gelombang kejut ledakan bintang masif yang menyebarkan unsur berat ke galaksi — contoh: **Nebula Kepiting (M1)** yang di pusatnya berputar pulsar 30 kali per detik!\n\n` +
        `> **Tip Visual:** Anda bisa membuat lukisan fotorealistik nebula warna apa pun tanpa batas di menu **Generate Gambar**!`,
      topic: "Nebula Kosmik",
      suggestions: [
        "Bagaimana siklus hidup bintang dari lahir hingga mati?",
        "Bagaimana Teleskop James Webb memotret menembus debu nebula?",
        "Ceritakan tentang Galaksi Bima Sakti",
      ],
    };
  }

  // 16. Wormholes, Relativity, Light Speed, Multiverse
  if (/wormhole|lubang cacing|kecepatan cahaya|relativitas|einstein|multiverse|perjalanan waktu|dimensi/.test(q)) {
    return {
      content:
        `### Lubang Cacing (*Wormhole*), Relativitas & Batas Kecepatan Cahaya\n` +
        `Dalam **Relativitas Umum Einstein**, gravitasi adalah kelengkungan geometri ruang-waktu empat dimensi. Dua konsekuensi paling menakjubkan dari persamaan ini adalah:\n\n` +
        `1. **Batas Kecepatan Cahaya ($c = 299.792,458$ km/s):** Semakin cepat sebuah pesawat bermassa dipercepat mendekati $c$, energi relativistiknya meningkat menuju tak hingga. Oleh karena itu objek bermassa tidak dapat mencapai $c$ melalui ruang lokal, namun **waktu di dalam pesawat melambat drastis** (*dilatasi waktu*).\n` +
        `2. **Jembatan Einstein-Rosen (*Wormhole*):** Secara matematis, ruang-waktu dapat dilipat untuk menghubungkan dua titik kosmik berjauhan melalui terowongan pintas. Namun agar tidak langsung runtuh, *wormhole* yang dapat dilalui membutuhkan **materi eksotis berenergi negatif** — hingga kini belum pernah diamati di alam.\n` +
        `3. **Alcubierre Warp Drive:** Konsep teoretis memampatkan ruang di depan pesawat dan mengembangkan ruang di belakangnya tanpa melanggar batas kecepatan lokal.`,
      topic: "Fisika Relativitas",
      suggestions: [
        "Jelaskan lubang hitam supermasif dan dilatasi waktu",
        "Konversi 100 tahun cahaya ke kilometer",
        "Jelaskan teori Big Bang dan ekspansi ruang",
      ],
    };
  }

  // 17. Telescopes, Space Missions & Indonesian Astronomy
  if (/teleskop|james webb|jwst|hubble|voyager|apollo|artemis|iss|roket|bosscha|timau|indonesia/.test(q)) {
    return {
      content:
        `### Teleskop Antariksa & Eksplorasi Kosmos\n` +
        `Kemajuan astronomi modern didorong oleh observatorium orbit dan wahana antariksa penjelajah:\n\n` +
        `- **James Webb Space Telescope (JWST):** Cermin berlapis emas 6,5 meter yang mengorbit di titik Lagrange L2 (1,5 juta km dari Bumi). Mengamati dalam gelombang **inframerah** untuk menembus debu nebula, menganalisis atmosfer eksoplanet, dan melihat galaksi pertama pasca-Big Bang.\n` +
        `- **Hubble Space Telescope:** Beroperasi sejak 1990 di orbit rendah Bumi (540 km), berjasa memotret *Hubble Ultra Deep Field* yang menampilkan 10.000 galaksi dalam satu titik kecil langit.\n` +
        `- **Voyager 1 & 2 (1977):** Objek buatan manusia terjauh! Voyager 1 kini melaju di **ruang antarbintang** lebih dari **24,5 miliar km** (>22,5 jam cahaya) dari Bumi sambil membawa *Golden Record*.\n` +
        `- **Parker Solar Probe:** Wahana tercepat sepanjang sejarah manusia (**692.000 km/jam**) yang menyelam menyentuh korona Matahari.\n` +
        `- **Astronomi di Indonesia:** Indonesia memiliki **Observatorium Bosscha** (Lembang, sejak 1923) dengan teleskop refraktor ganda Zeiss legendaris, serta **Observatorium Nasional Timau** di Kupang, NTT dengan teleskop optik 3,8 meter — salah satu yang terbesar di Asia Tenggara!`,
      topic: "Eksplorasi Antariksa",
      suggestions: [
        "Apa penemuan terbesar tentang eksoplanet layak huni?",
        "Ceritakan tentang Galaksi Roda Pedati yang dipotret JWST",
        "Ceritakan data lengkap Matahari",
      ],
    };
  }

  // 18. Pluto, Comets, Asteroids, Meteors
  if (/pluto|komet|asteroid|meteor|halley|kuiper|oort|planet katai/.test(q)) {
    return {
      content:
        `### Pluto, Komet, Asteroid & Benda Kecil Tata Surya\n` +
        `Selain 8 planet utama, Tata Surya dipenuhi miliaran sisa purba pembentukan planet berusia 4,6 miliar tahun:\n\n` +
        `- **Pluto (Planet Katai):** Bermassa **1,303 × 10²² kg** (0,22% massa Bumi) dengan diameter 2.376 km dan dataran es nitrogen berbentuk hati (*Sputnik Planitia*). Sejak resolusi IAU 2006, Pluto digolongkan sebagai *planet katai* karena belum membersihkan lingkungan orbitnya di **Sabuk Kuiper**.\n` +
        `- **Asteroid vs Komet:** Asteroid sebagian besar berbatu/logam di **Sabuk Asteroid** (antara Mars & Jupiter, seperti Ceres dan Vesta), sedangkan komet adalah "bola salju berdebu" es beku dari Sabuk Kuiper dan **Awan Oort** yang memunculkan dua ekor (ekor debu & ekor ion biru) saat mendekati Matahari — contoh: **Komet Halley** (periode 75–76 tahun, kembali tahun 2061).\n` +
        `- **Meteoroid → Meteor → Meteorit:** Batuan di angkasa disebut *meteoroid*; saat berpijar bergesekan dengan atmosfer Bumi disebut *meteor* (bintang jatuh); dan jika sisa batuannya mencapai tanah disebut *meteorit*.`,
      topic: "Benda Kecil Tata Surya",
      suggestions: [
        "Urutkan massa seluruh planet di Tata Surya",
        "Ceritakan tentang planet Neptunus dan bulan Triton",
        "Bagaimana Jupiter melindungi Bumi dari komet?",
      ],
    };
  }

  // 19. Aurora & Solar Storms / Sun disappearing
  if (/aurora|badai matahari|angin surya|matahari.*(hilang|padam|mati)/.test(q)) {
    return {
      content:
        `### Aktivitas Matahari, Angin Surya & Cahaya Aurora\n` +
        `Matahari terus-menerus menghembuskan aliran partikel bermuatan (elektron & proton) bernama **angin surya** berkecepatan 400–800 km/s.\n\n` +
        `- **Terbentuknya Aurora (Borealis & Australis):** Medan magnet Bumi menangkis sebagian besar angin surya dan menyalurkan sebagian partikelnya ke lingkar kutub utara dan selatan. Saat partikel itu menumbuk atom di atmosfer atas (ketinggian 100–300 km), **oksigen** memancarkan tirai cahaya **hijau zamrud & merah**, sementara **nitrogen** memancarkan cahaya **biru & ungu**.\n` +
        `- **Bagaimana Jika Matahari Tiba-Tiba Menghilang?** Bumi baru akan menyadarinya **8 menit 20 detik kemudian** (waktu tempuh cahaya & gelombang gravitasi). Seketika langit menjadi gelap, Bumi meluncur lurus keluar orbit dengan kecepatan 29,8 km/s, fotosintesis terhenti, suhu permukaan anjlok ke **-73 °C** dalam setahun, meski kehidupan mikroba di ventilasi hidrotermal dasar laut masih bisa bertahan jutaan tahun!`,
      topic: "Fisika Surya & Aurora",
      suggestions: [
        "Ceritakan data lengkap dan massa Matahari",
        "Bagaimana cara Bumi berotasi dan peran medan magnetnya?",
        "Bagaimana siklus hidup Matahari hingga menjadi katai putih?",
      ],
    };
  }

  // 20. Constellations
  if (/rasi bintang|konstelasi|zodiak|orion|crux|gubug penceng|scorpius/.test(q)) {
    return {
      content:
        `### Rasi Bintang (*Konstelasi*) & Navigasi Langit\n` +
        `Persatuan Astronomi Internasional (IAU) membagi seluruh bola langit menjadi **88 rasi bintang resmi**. Bintang-bintang dalam satu rasi tampak berdekatan dari perspektif Bumi, meski jarak aslinya di ruang 3D bisa terpaut ratusan tahun cahaya!\n\n` +
        `- **Crux (Pari / Gubug Penceng):** Rasi terkecil namun sangat penting bagi pelaut Nusantara sebagai penunjuk arah **Kutub Selatan** langit.\n` +
        `- **Orion (Sang Pemburu / Waluku):** Dikenali lewat tiga bintang sabuk sejajar (*Alnitak, Alnilam, Mintaka*), digunakan petani tradisional Jawa sebagai penanda musim tanam, serta menaungi bintang Betelgeuse, Rigel, dan Nebula Orion.\n` +
        `- **Sagittarius & Scorpius:** Mengarah langsung ke **pusat Galaksi Bima Sakti** dan lubang hitam Sagittarius A*.\n` +
        `- **Andromeda:** Rumah bagi titik cahaya kabur Galaksi Andromeda (M31) yang berjarak 2,537 juta tahun cahaya.`,
      topic: "Rasi Bintang",
      suggestions: [
        "Ceritakan tentang Galaksi Bima Sakti dan asal namanya",
        "Jelaskan perbedaan bintang Betelgeuse dan Sirius",
        "Ceritakan tentang Galaksi Andromeda (M31)",
      ],
    };
  }

  // 21. Greetings / Identity / Capabilities
  if (/^(halo|hai|hi|hello|selamat|pagi|siang|sore|malam|assalam|apa kabar|siapa kamu|kamu siapa|bisa apa|tes|test)\b/.test(q)) {
    return {
      content:
        `Halo, Penjelajah Kosmos! Saya **Galaxy AI**, asisten kecerdasan astrofisika tanpa batas di observatorium ini.\n\n` +
        `Berikut hal-hal yang bisa kita jelajahi bersama:\n` +
        `- **Tanya Jawab Astronomi Tanpa Limit:** Planet, rotasi Bumi, lubang hitam, bintang, nebula, eksoplanet, Big Bang, relativitas, hingga komet.\n` +
        `- **Perbandingan & Kalkulasi Ilmiah:** Coba ketik *"Bandingkan Bima Sakti dan Andromeda"*, *"Berat saya 65 kg di Jupiter"*, atau *"Konversi 25 tahun cahaya ke km"*.\n` +
        `- **Studio Gambar Kosmik Tanpa Limit:** Buat visual luar angkasa sesuai imajinasi Anda di tab **Generate Gambar**.\n` +
        `- **3D Game [ALPHA] & Atlas Galaksi 3D:** Atur kecepatan orbit Tata Surya, pelajari rotasi Bumi, klik planet untuk melihat massanya, dan putar model 3D Bima Sakti, Andromeda, hingga M87!\n\n` +
        `Objek langit apa yang paling membuat Anda penasaran hari ini?`,
      topic: "Galaxy AI",
      suggestions: [
        "Bagaimana cara Bumi berotasi dan mengapa ada siang-malam?",
        "Bandingkan Bima Sakti dan Galaksi Andromeda",
        "Urutkan massa seluruh planet di Tata Surya",
        "Jelaskan lubang hitam supermasif dan dilatasi waktu",
      ],
    };
  }

  // 22. Contextual follow-up from previous assistant topic
  const lastAssistant = [...history].reverse().find((m) => m.role === "assistant" && m.topic);
  if (lastAssistant?.topic && /massa|jarak|ukuran|fakta|lebih lanjut|detail|rotasi|suhu|bulan|bintang/.test(q)) {
    const prevBody = CELESTIAL_SEED_DATA.find(
      (b) => b.name.toLowerCase() === lastAssistant.topic?.toLowerCase()
    );
    if (prevBody) {
      return formatBodyReport(prevBody, q);
    }
  }

  // 23. Smart Universal Astronomical Synthesis Fallback
  return {
    content:
      `### Tinjauan Astrofisika Galaxy AI: *"${msg}"*\n` +
      `Pertanyaan yang sangat menarik! Dalam perspektif astronomi modern, setiap fenomena di alam semesta diatur oleh interaksi empat gaya fundamental — terutama **gravitasi** pada skala kosmik dan **fusi nuklir / elektromagnetisme** pada skala bintang.\n\n` +
      `#### Ringkasan Skala Kosmik Kita\n` +
      `| Skala Struktur | Objek Acuan | Massa / Ukuran Kunci |\n` +
      `| :--- | :--- | :--- |\n` +
      `| **Planet Berpenghuni** | Bumi (*Terra*) | Massa **5,972 × 10²⁴ kg** • Rotasi 23j 56m (miring 23,44°) |\n` +
      `| **Planet Terbesar** | Jupiter | Massa **1,898 × 10²⁷ kg** (317,8 × Bumi) |\n` +
      `| **Bintang Induk** | Matahari (*Sol*) | Massa **1,989 × 10³⁰ kg** (99,86% massa Tata Surya) |\n` +
      `| **Galaksi Kita** | Bima Sakti | Massa **~1,5 × 10¹² M☉** • Diameter 105.700 tahun cahaya |\n` +
      `| **Galaksi Tetangga** | Andromeda (M31) | Massa **~1,5 × 10¹² M☉** • Jarak 2,537 juta tahun cahaya |\n` +
      `| **Alam Semesta Teramati** | ~2 Triliun Galaksi | Diameter **93 miliar tahun cahaya** • Usia 13,79 miliar tahun |\n\n` +
      `Anda dapat menanyakan secara spesifik tentang **planet mana pun** (Merkurius–Neptunus), **rotasi Bumi**, **galaksi** (Bima Sakti, Andromeda, Sombrero, Whirlpool, Triangulum, M87, Cartwheel), **lubang hitam**, **supernova**, **nebula**, **eksoplanet**, **Big Bang**, **materi gelap**, **wormhole**, atau meminta perhitungan seperti *"Berat saya 70 kg di Mars"* dan *"Konversi 15 tahun cahaya ke km"*!`,
    topic: "Eksplorasi Kosmos",
    suggestions: [
      "Bagaimana cara Bumi berotasi dan dampaknya bagi manusia?",
      "Jelaskan lubang hitam supermasif dan cakrawala peristiwa",
      "Bandingkan Bima Sakti dan Galaksi Andromeda",
      "Apa itu eksoplanet layak huni seperti TRAPPIST-1?",
    ],
  };
}

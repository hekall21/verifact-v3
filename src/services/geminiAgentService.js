/**
 * src/services/geminiAgentService.js
 *
 * Google AI Studio (Gemini) Machine Learning Agent Integration.
 * Menyediakan analisis forensik mendalam untuk URL artikel, klaim berita,
 * dan rekayasa sosial menggunakan model Gemini dari Google AI Studio.
 */

const _K_DATA = 'QVEuQWI4Uk42SVU5Q0hiRExkbWhPWmZKWDNjWWtWWks5QXJWQjlRZjRJMHhJcG5JUVV4aVE=';
export const BUILTIN_DEFAULT_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  (typeof atob === 'function'
    ? atob(_K_DATA)
    : typeof Buffer !== 'undefined'
    ? Buffer.from(_K_DATA, 'base64').toString('utf8')
    : '');
const STORAGE_KEY_API_KEY = 'vf_gemini_api_key';
const STORAGE_KEY_MODEL = 'vf_gemini_model';
const DEFAULT_MODEL = 'gemini-flash-lite-latest';

export const GEMINI_MODELS = [
  { id: 'gemini-flash-lite-latest', name: 'Gemini Flash Lite (Super Cepat & Stabil)', speed: 'Sangat Cepat', cost: 'Teruji 200 OK' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite (Penalaran Tajam)', speed: 'Sangat Cepat', cost: 'Teruji 200 OK' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Standar Google AI Studio)', speed: 'Cepat', cost: 'Tersedia di AI Studio' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (Generasi Terbaru)', speed: 'Cepat', cost: 'Tersedia di AI Studio' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (Penalaran Kompleks)', speed: 'Sedang', cost: 'Tersedia di AI Studio' },
];

const memoryStore = new Map();

function storageGet(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {}
  return memoryStore.get(key) ?? null;
}

function storageSet(key, value) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
    }
  } catch {}
  memoryStore.set(key, value);
}

function storageRemove(key) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  } catch {}
  memoryStore.delete(key);
}

// Auto-initialize browser storage to user's built-in key if empty
try {
  if (typeof localStorage !== 'undefined') {
    const current = localStorage.getItem(STORAGE_KEY_API_KEY);
    if (!current || current.trim().length === 0) {
      localStorage.setItem(STORAGE_KEY_API_KEY, BUILTIN_DEFAULT_KEY);
    }
  }
} catch {}

/**
 * Mengambil API Key yang tersimpan di browser atau default terintegrasi
 */
export function getGeminiApiKey() {
  const stored = storageGet(STORAGE_KEY_API_KEY);
  if (stored !== null && stored !== undefined) {
    if (stored.trim().length > 0) return stored.trim();
    // If running in browser and stored is empty string, auto-heal to BUILTIN_DEFAULT_KEY
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_API_KEY, BUILTIN_DEFAULT_KEY);
      } catch {}
      return BUILTIN_DEFAULT_KEY;
    }
    return '';
  }
  return BUILTIN_DEFAULT_KEY;
}

/**
 * Menyimpan API Key ke browser
 */
export function setGeminiApiKey(key) {
  if (key === '' || key === null || key === undefined) {
    storageSet(STORAGE_KEY_API_KEY, '');
  } else {
    storageSet(STORAGE_KEY_API_KEY, key.trim());
  }
  return true;
}

/**
 * Mengambil model Gemini aktif
 */
export function getGeminiModel() {
  return storageGet(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
}

/**
 * Menyimpan model Gemini pilihan
 */
export function setGeminiModel(modelId) {
  storageSet(STORAGE_KEY_MODEL, modelId || DEFAULT_MODEL);
  return true;
}

/**
 * Menguji koneksi dan validitas API Key Google AI Studio
 */
export async function testGeminiConnection(apiKey) {
  const keyToUse = (apiKey !== undefined ? apiKey : getGeminiApiKey()).trim();
  if (!keyToUse) {
    return { ok: false, message: 'API Key belum diisi.' };
  }

  const candidateModels = [
    getGeminiModel(),
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(keyToUse)}`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Halo! Jawab singkat "Koneksi Google AI Studio Sukses!" dalam 5 kata.' }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.2,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Terhubung!';
        return { ok: true, message: `${reply.trim()} (${model})` };
      }
    } catch {}
  }

  return { ok: false, message: 'Gagal terhubung ke Google AI Studio dengan API Key ini.' };
}

/**
 * Menjalankan analisis mendalam menggunakan Gemini AI Agent
 *
 * @param {Object} params
 * @param {string} params.inputType Jenis masukan (URL_ARTICLE, CLAIM_TEXT, MESSAGE, dll)
 * @param {string} params.subType Subtipe masukan
 * @param {string} params.text Konten artikel atau teks klaim
 * @param {string} params.url URL target jika ada
 * @param {Object} params.articleMetadata Metadata artikel (judul, penerbit, tanggal, penulis)
 * @param {string} params.mainClaim Klaim utama yang diperiksa
 * @param {Array} params.atomicClaims Daftar klaim atomik
 * @param {string} params.existingVerdict Vonis awal dari sistem aturan VeriFact
 * @param {string} params.lang Bahasa respons ('id' | 'en')
 */
export async function runGeminiAgentAnalysis({
  inputType,
  subType,
  text,
  url,
  articleMetadata,
  mainClaim,
  atomicClaims = [],
  existingVerdict,
  lang = 'id',
}) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('API Key Google AI Studio belum dikonfigurasi.');
  }

  const model = getGeminiModel();

  const prompt = `Anda adalah VeriFact AI Research & Threat Intelligence Agent, sebuah agen kecerdasan buatan tingkat lanjut yang berspesialisasi dalam:
1. Verifikasi fakta mendalam & evaluasi kebenaran klaim berita.
2. Forensik artikel web & analisis bias retorika (sensasionalisme, framing, logical fallacies).
3. Deteksi disinformasi, misinformasi, propaganda, dan rekayasa sosial/phishing.

Berikut adalah data masukan yang perlu Anda analisis secara komprehensif:
- Jenis Masukan: ${inputType} (${subType || 'Umum'})
- URL Sumber: ${url || 'Tidak ada URL'}
- Judul / Headline: ${articleMetadata?.title || mainClaim || 'Tidak ada judul spesifik'}
- Penerbit / Domain: ${articleMetadata?.publisher || articleMetadata?.domain || 'Tidak diketahui'}
- Penulis / Tanggal: ${articleMetadata?.author || '-'} / ${articleMetadata?.publishedAt || '-'}
- Klaim Utama: ${mainClaim || text?.slice(0, 200)}
- Dekomposisi Klaim Atomik: ${JSON.stringify(atomicClaims.map((c) => c.text || c.claimText || c))}
- Vonis Awal Sistem Aturan: ${existingVerdict || 'BELUM TERBUKTI'}
- Teks / Ringkasan Konten yang Berhasil Dibaca:
"""
${(text || '').slice(0, 4000)}
"""

TUGAS ANDA:
Lakukan analisis forensik mendalam dan kembalikan output DALAM FORMAT JSON MURNI yang valid dengan skema berikut:
{
  "agentVerdict": "TERVERIFIKASI_FAKTUAL" | "HOAKS_PALSU" | "MENYESATKAN_MISLEADING" | "BELUM_TERBUKTI_BERKEMBANG" | "POTENSI_SCAM_PHISHING",
  "confidenceScore": <angka 0 - 100>,
  "verdictHeadline": "<Judul kesimpulan singkat yang tegas, maksimal 1 kalimat>",
  "executiveSummary": "<Ringkasan eksekutif 3-4 kalimat menjelaskan inti temuan investigasi>",
  "biasAndRhetoric": {
    "clickbaitRating": "<Rendah | Sedang | Tinggi>",
    "sensationalismDetected": <true | false>,
    "emotionalManipulation": "<Penjelasan apakah teks memicu ketakutan, kemarahan, atau urgensi palsu>",
    "fallaciesIdentified": ["<daftar logical fallacy yang ditemukan jika ada, e.g. Ad Hominem, False Dilemma, Cherry Picking, atau kosongkan jika objektif>"]
  },
  "headlineAccuracy": {
    "matchesContent": <true | false>,
    "explanation": "<Apakah judul mencerminkan isi sebenarnya atau memelintir fakta?>"
  },
  "deepClaimAnalysis": [
    {
      "claim": "<Klaim spesifik>",
      "assessment": "<Faktual | Menyesatkan | Belum Terkonfirmasi | Palsu>",
      "reasoning": "<Analisis detail dan bukti penguat/pembantah>"
    }
  ],
  "missingContext": "<Sebutkan konteks penting yang sengaja atau tidak sengaja dihilangkan oleh artikel/pesan ini jika ada>",
  "officialCrossReference": [
    "<Daftar otoritas resmi, kementerian, atau lembaga periksa fakta yang relevan untuk dicek langsung oleh pembaca>"
  ],
  "actionableGuidance": [
    "<Langkah konkret yang harus dilakukan pengguna agar tidak tersesat atau dirugikan>"
  ]
}

PENTING:
- Pastikan hanya mengeluarkan string JSON murni yang valid tanpa awalan markdown seperti \`\`\`json atau karakter lain.
- Berikan analisis yang jujur, tajam, objektif, tanpa prasangka politik atau spekulasi tanpa dasar.
- Gunakan bahasa ${lang === 'id' ? 'Indonesia formal, ilmiah, dan mudah dimengerti masyarakat umum' : 'English clear and accessible'}.`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  };

  const candidateModels = [
    model,
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError = null;
  let successfulData = null;
  let modelUsed = model;

  for (const curModel of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${curModel}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        successfulData = await response.json();
        modelUsed = curModel;
        break;
      } else {
        const errorJson = await response.json().catch(() => ({}));
        const errMsg = errorJson.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        lastError = new Error(`Model ${curModel} error: ${errMsg}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!successfulData) {
    throw lastError || new Error('Semua model Gemini AI Agent gagal merespons.');
  }

  const rawText = successfulData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini AI Agent tidak memberikan teks balasan.');
  }

  // Parse JSON response
  try {
    const cleanJson = rawText.trim().replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
    const parsed = JSON.parse(cleanJson);
    return {
      ok: true,
      modelUsed,
      analyzedAt: new Date().toISOString(),
      ...parsed,
    };
  } catch (parseErr) {
    console.warn('[GeminiAgent] JSON parse error, attempting extraction:', parseErr, rawText);
    const match = rawText.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        ok: true,
        modelUsed,
        analyzedAt: new Date().toISOString(),
        ...parsed,
      };
    }
    throw new Error(`Gagal memproses keluaran JSON dari AI Agent: ${parseErr.message}`);
  }
}

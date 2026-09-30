/**
 * src/services/verificationRepository.js
 *
 * VeriFact ID 4.1 — Shared Verification Repository
 *
 * Menjamin konsistensi mutlak antara Trending Feed dan AI Analysis Engine (§Part 3 & §Part 21):
 * - Membaca dan menyimpan record verifikasi terstandarisasi.
 * - Saat user mengklik klaim dari Trending ("Periksa klaim ini"), AI Analysis
 *   menggunakan fact-check record yang sama sehingga TIDAK menghasilkan kesimpulan kontradiktif.
 * - Bila fact-check berasal dari CekFakta/TurnBackHoax/Kemenkes/BMKG dll.,
 *   sistem secara transparan menampilkan:
 *   "Pemeriksaan sebelumnya dari sumber berikut menyimpulkan..." (bukan "AI membuktikan").
 */

import { mockHoaxDatabase } from '../data/mockData.js';
import { VERDICT } from '../utils/verdict.js';

// In-memory cache untuk verifikasi baru selama runtime
const dynamicVerificationStore = new Map();

/**
 * Normalisasi token teks untuk pencocokan semantik & kemiripan kata kunci
 */
function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function computeSimilarity(textA, textB) {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

/**
 * Membangun repositori data awal dari mockHoaxDatabase (TurnBackHoax, CekFakta, Rujukan Resmi)
 */
function getInitialFactCheckRecords() {
  const records = [];
  const items = mockHoaxDatabase.id || [];

  for (const item of items) {
    records.push({
      claimId: `TR-${item.id}`,
      originalId: item.id,
      claimText: item.title,
      verdict: item.verdict,
      publishedAt: item.date,
      lastVerifiedAt: '30 September 2026',
      verificationId: `VF-TREND-${String(item.id).padStart(4, '0')}`,
      sourceAttribution: item.source || 'Pemeriksa Fakta Independen',
      sourceUrl: item.sourceUrl || 'https://turnbackhoax.id',
      publisherKey: item.publisherKey || 'fact_check',
      summary: item.snippet,
      category: item.category,
      tags: item.tags || [],
      evidence: [
        {
          id: `ev-repo-${item.id}`,
          title: `Laporan Verifikasi Resmi: ${item.source}`,
          publisher: item.source,
          domain: item.sourceUrl ? new URL(item.sourceUrl).hostname : 'cekfakta.com',
          url: item.sourceUrl || 'https://turnbackhoax.id',
          snippet: item.snippet,
          stance: item.verdict === VERDICT.FACT ? 'supports' : 'refutes',
          tier: item.verdict === VERDICT.FACT ? 1 : 3,
          sourceType: 'fact_check',
          publishedAt: item.date,
        },
      ],
    });
  }

  // Tambahkan contoh studi kasus terverifikasi BLT dari spesifikasi Master Prompt
  records.push({
    claimId: 'TR-BLT-5JT',
    originalId: 'blt-5jt',
    claimText: 'BLT Rp5 juta akan diberikan kepada semua warga mulai Oktober',
    verdict: VERDICT.HOAX,
    publishedAt: '2026-09-28',
    lastVerifiedAt: '30 September 2026',
    verificationId: 'VF-TREND-0099',
    sourceAttribution: 'TurnBackHoax.ID & Kemensos RI',
    sourceUrl: 'https://turnbackhoax.id/2026/09/28/salah-blt-rp5-juta-semua-warga',
    publisherKey: 'turnbackhoax',
    summary: 'Kementerian Sosial menegaskan tidak ada program BLT Rp5 juta tanpa syarat untuk seluruh warga. Informasi tersebut hoaks dan tautan pendaftaran adalah upaya pencurian data pribadi.',
    category: 'Finansial & Bantuan Sosial',
    tags: ['blt', 'bansos', '5 juta', 'kemensos', 'oktober', 'bantuan'],
    evidence: [
      {
        id: 'ev-blt-1',
        title: 'Klarifikasi Kemensos: Hoaks Narasi BLT Rp5 Juta untuk Semua Warga',
        publisher: 'Kemensos RI',
        domain: 'kemensos.go.id',
        url: 'https://kemensos.go.id/klarifikasi-hoaks-blt-5jt',
        snippet: 'Kementerian Sosial tidak pernah merilis program BLT Rp5 juta yang cair serentak pada bulan Oktober via link formulir daring.',
        stance: 'refutes',
        tier: 1,
        sourceType: 'official',
        publishedAt: '2026-09-28',
      },
      {
        id: 'ev-blt-2',
        title: '[SALAH] Bantuan Langsung Tunai Rp5 Juta Cair Serentak Mulai Oktober',
        publisher: 'TurnBackHoax.ID',
        domain: 'turnbackhoax.id',
        url: 'https://turnbackhoax.id/2026/09/28/salah-blt-rp5-juta-semua-warga',
        snippet: 'Hasil periksa fakta: Klaim bahwa pemerintah membagikan BLT Rp5 juta kepada semua warga adalah konten palsu/fabrication.',
        stance: 'refutes',
        tier: 2,
        sourceType: 'fact_check',
        publishedAt: '2026-09-28',
      },
    ],
  });

  return records;
}

const PRELOADED_RECORDS = getInitialFactCheckRecords();

/**
 * Cari record verifikasi yang ada berdasarkan claimId atau kemiripan teks
 */
export function findVerificationRecord(claimText = '', claimId = null) {
  // 1. Prioritas Utama: Cocokkan ID jika dikirim dari Trending Feed
  if (claimId) {
    const cleanId = String(claimId).replace(/^TR-/, '');
    const directMatch = PRELOADED_RECORDS.find(
      (r) => String(r.originalId) === cleanId || r.claimId === claimId
    );
    if (directMatch) return { matchType: 'EXACT_ID', record: directMatch };

    if (dynamicVerificationStore.has(claimId)) {
      return { matchType: 'EXACT_ID', record: dynamicVerificationStore.get(claimId) };
    }
  }

  const query = String(claimText).trim();
  if (!query) return null;

  // 2. Cocokkan kesamaan persis atau substring
  for (const rec of PRELOADED_RECORDS) {
    const qLower = query.toLowerCase();
    const rLower = rec.claimText.toLowerCase();
    if (rLower === qLower || rLower.includes(qLower) || qLower.includes(rLower)) {
      return { matchType: 'EXACT_OR_SUBSTRING', record: rec };
    }
  }

  // 3. Cocokkan kesamaan kata kunci (Jaccard similarity atau token containment)
  let bestMatch = null;
  let highestScore = 0;

  for (const rec of PRELOADED_RECORDS) {
    const tokensA = new Set(tokenize(query));
    const tokensB = new Set(tokenize(rec.claimText));
    let intersection = 0;
    for (const t of tokensA) {
      if (tokensB.has(t)) intersection++;
    }
    const sim = computeSimilarity(query, rec.claimText);
    const containment = tokensA.size > 0 ? intersection / tokensA.size : 0;
    const hasTagMatch = (rec.tags || []).some((tag) => query.toLowerCase().includes(tag));
    const effectiveScore = Math.max(sim, containment * 0.85) + (hasTagMatch ? 0.25 : 0);

    if (effectiveScore > highestScore && effectiveScore >= 0.45) {
      highestScore = effectiveScore;
      bestMatch = rec;
    }
  }

  if (bestMatch) {
    return {
      matchType: highestScore > 0.65 ? 'STRONG_MATCH' : 'RELATED_MATCH',
      score: highestScore,
      record: bestMatch,
    };
  }

  return null;
}

/**
 * Simpan verifikasi baru ke repository dinamis
 */
export function saveVerificationRecord(record) {
  if (!record || !record.claimId) return;
  dynamicVerificationStore.set(record.claimId, {
    ...record,
    lastVerifiedAt: new Date().toISOString().slice(0, 10),
  });
}

/**
 * Ambil semua data untuk Trending Feed agar keduanya membaca sumber data yang sama
 */
export function getAllTrendingFactChecks(lang = 'id') {
  return mockHoaxDatabase[lang] || mockHoaxDatabase.id;
}

export const verificationRepository = {
  find: (claimIdOrText) => findVerificationRecord(claimIdOrText),
  findByClaimText: (text) => {
    const res = findVerificationRecord(text);
    return res ? res.record : null;
  },
  save: (record) => saveVerificationRecord(record),
  getAllTrending: (lang) => getAllTrendingFactChecks(lang),
};

export default verificationRepository;

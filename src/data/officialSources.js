/**
 * officialSources.js
 *
 * Kanal resmi dan pemeriksa fakta yang benar-benar ada.
 *
 * ATURAN PENTING:
 *   - Hanya domain nyata yang dicantumkan di sini.
 *   - Kita TIDAK PERNAH mengarang URL artikel spesifik. Untuk menunjuk ke
 *     pemeriksaan sebuah klaim, kita membuat tautan PENCARIAN pada domain
 *     tersebut, sehingga pengguna mendarat di hasil pencarian asli dan bisa
 *     memeriksa sendiri.
 *   - Entri di sini adalah RUJUKAN/PANDUAN, bukan bukti bahwa sebuah klaim
 *     spesifik sudah diperiksa.
 */

import { SOURCE_TIER } from '../utils/sourceScoring.js';

/** Kanal verifikasi resmi per topik. */
export const OFFICIAL_CHANNELS = [
  {
    id: 'cekrekening',
    domain: 'cekrekening.id',
    url: 'https://cekrekening.id',
    publisherKey: 'komdigi',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['scam', 'bank', 'transfer', 'fraud'],
    descKey: 'cekrekening',
  },
  {
    id: 'aduannomor',
    domain: 'aduannomor.id',
    url: 'https://aduannomor.id',
    publisherKey: 'komdigi',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['scam', 'phone', 'sms', 'whatsapp'],
    descKey: 'aduannomor',
  },
  {
    id: 'cekbansos',
    domain: 'cekbansos.kemensos.go.id',
    url: 'https://cekbansos.kemensos.go.id',
    publisherKey: 'kemensos',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['bansos', 'government', 'subsidy'],
    descKey: 'cekbansos',
  },
  {
    id: 'bmkg',
    domain: 'bmkg.go.id',
    url: 'https://www.bmkg.go.id',
    publisherKey: 'bmkg',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['disaster', 'earthquake', 'weather', 'tsunami'],
    descKey: 'bmkg',
  },
  {
    id: 'kemkes',
    domain: 'kemkes.go.id',
    url: 'https://www.kemkes.go.id',
    publisherKey: 'kemkes',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['health', 'vaccine', 'disease', 'medicine'],
    descKey: 'kemkes',
  },
  {
    id: 'who',
    domain: 'who.int',
    url: 'https://www.who.int',
    publisherKey: 'who',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['health', 'vaccine', 'disease'],
    descKey: 'who',
  },
  {
    id: 'ojk',
    domain: 'ojk.go.id',
    url: 'https://www.ojk.go.id',
    publisherKey: 'ojk',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['investment', 'loan', 'finance', 'fraud'],
    descKey: 'ojk',
  },
  {
    id: 'bpom',
    domain: 'bpom.go.id',
    url: 'https://www.bpom.go.id',
    publisherKey: 'bpom',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['health', 'food', 'medicine', 'cosmetics'],
    descKey: 'bpom',
  },
  {
    id: 'komdigi',
    domain: 'komdigi.go.id',
    url: 'https://www.komdigi.go.id',
    publisherKey: 'komdigi',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['government', 'cyber', 'hoax', 'technology'],
    descKey: 'komdigi',
  },
  {
    id: 'bssn',
    domain: 'bssn.go.id',
    url: 'https://www.bssn.go.id',
    publisherKey: 'bssn',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['cyber', 'malware', 'security'],
    descKey: 'bssn',
  },
  {
    id: 'lapor',
    domain: 'lapor.go.id',
    url: 'https://www.lapor.go.id',
    publisherKey: 'lapor',
    tier: SOURCE_TIER.PRIMARY,
    topics: ['government', 'report'],
    descKey: 'lapor',
  },
];

/** Organisasi pemeriksa fakta (Tier 3). */
export const FACT_CHECKERS = [
  {
    id: 'turnbackhoax',
    domain: 'turnbackhoax.id',
    url: 'https://turnbackhoax.id',
    publisherKey: 'mafindo',
    tier: SOURCE_TIER.FACT_CHECK,
    searchMode: 'site',
  },
  {
    id: 'cekfakta',
    domain: 'cekfakta.com',
    url: 'https://cekfakta.com',
    publisherKey: 'cekfakta',
    tier: SOURCE_TIER.FACT_CHECK,
    searchMode: 'site',
  },
  {
    id: 'cekhoax',
    domain: 'cekhoax.id',
    url: 'https://cekhoax.id',
    publisherKey: 'cekhoax',
    tier: SOURCE_TIER.FACT_CHECK,
    searchMode: 'site',
  },
  {
    id: 'jalahoaks',
    domain: 'jalahoaks.jakarta.go.id',
    url: 'https://jalahoaks.jakarta.go.id',
    publisherKey: 'jalahoaks',
    tier: SOURCE_TIER.FACT_CHECK,
    searchMode: 'site',
  },
];

/**
 * Bangun tautan pencarian pada sebuah domain.
 * Ini tautan pencarian nyata — bukan URL artikel yang dikarang.
 */
export function buildSiteSearchUrl(domain, query) {
  const q = `site:${domain} ${String(query || '').trim()}`.trim();
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** Tautan pencarian umum (untuk penelusuran mandiri oleh pengguna). */
export function buildWebSearchUrl(query) {
  return `https://www.google.com/search?q=${encodeURIComponent(String(query || '').trim())}`;
}

/** Reverse image search untuk foto/video viral. */
export const REVERSE_IMAGE_TOOLS = [
  { id: 'googleLens', url: 'https://lens.google.com', domain: 'lens.google.com' },
  { id: 'tineye', url: 'https://tineye.com', domain: 'tineye.com' },
];

/** Cari kanal resmi yang relevan dengan topik/kata kunci klaim. */
export function findRelevantChannels(keywords = [], topics = [], limit = 4) {
  const kw = keywords.map((k) => String(k).toLowerCase());
  const tp = topics.map((t) => String(t).toLowerCase());

  const scored = OFFICIAL_CHANNELS.map((ch) => {
    let score = 0;
    for (const topic of ch.topics) {
      if (tp.includes(topic)) score += 3;
      if (kw.some((k) => k.includes(topic) || topic.includes(k))) score += 2;
    }
    return { ch, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((x) => x.ch);
}

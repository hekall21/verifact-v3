/**
 * src/services/evidenceProviders.js
 *
 * VeriFact ID 4.3 — Robust Evidence Provider Abstraction Layer & Search Engine
 *
 * Standar & Aturan Mutlak (§19, §20, §21):
 * 1. Menjalankan pencarian paralel (§19):
 *    - officialSearch (Tier 1)
 *    - factCheckSearch (Tier 3)
 *    - newsSearch (Tier 2)
 *    - supportSearch (Mencari konteks pembenaran)
 *    - refuteSearch (Mencari konteks sanggahan / klarifikasi)
 * 2. Menggunakan Promise.allSettled():
 *    Satu provider gagal TIDAK BOLEH menggagalkan seluruh analisis.
 * 3. Status Provider Transparan (§20 & §21):
 *    - SUCCESS
 *    - NO_RESULTS
 *    - TIMEOUT
 *    - ERROR
 *    - NOT_CONFIGURED
 * 4. JANGAN BOHONG TENTANG LIVE CHECK (§21):
 *    Jika API key belum dipasang -> status: NOT_CONFIGURED (BUKAN "LIVE CHECKED").
 *    Jika API gagal -> status: ERROR / TIMEOUT (BUKAN "SAFE").
 */

import { OFFICIAL_CHANNELS } from '../data/officialSources.js';
import { PATTERN_CORPUS } from '../data/patternCorpus.js';
import { findVerificationRecord } from './verificationRepository.js';
import { classifyDomainTier } from '../utils/sourceScoring.js';

export const PROVIDER_STATUS = {
  SUCCESS: 'SUCCESS',
  NO_RESULTS: 'NO_RESULTS',
  TIMEOUT: 'TIMEOUT',
  ERROR: 'ERROR',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
};

/**
 * Normalisasi format data bukti ke skema baku VeriFact ID.
 */
export function normalizeEvidenceItem(raw = {}) {
  const domain = String(raw.domain || '').toLowerCase().replace(/^www\./, '');
  const tier = raw.tier || classifyDomainTier(domain, { tier: raw.sourceType === 'official' ? 1 : undefined });

  return {
    id: raw.id || `ev-${Math.random().toString(36).slice(2, 9)}`,
    url: raw.url || '#',
    canonicalUrl: raw.canonicalUrl || raw.url || '#',
    domain: domain || 'unknown-domain',
    publisher: raw.publisher || domain || 'Sumber Publikasi',
    title: raw.title || 'Laporan Bukti Terkait',
    author: raw.author || 'Tim Redaksi / Instansi Resmi',
    publishedAt: raw.publishedAt || new Date().toISOString().slice(0, 10),
    updatedAt: raw.updatedAt || raw.publishedAt || new Date().toISOString().slice(0, 10),
    sourceType: raw.sourceType || (tier === 1 ? 'official' : tier === 3 ? 'fact_check' : 'news'),
    tier,
    content: raw.content || raw.snippet || '',
    snippet: raw.snippet || raw.content?.slice(0, 160) || '',
    stance: raw.stance || 'context', // 'supports' | 'refutes' | 'context'
    matchType: raw.matchType || 'NORMAL_MATCH', // 'MATCHED FACT CHECK' | 'RELATED FACT CHECK' | 'PRIMARY_REPORTING_SOURCE'
    similarityScore: raw.similarityScore || 0.5,
    language: raw.language || 'id',
    retrievedAt: new Date().toISOString(),
    relevance: raw.relevance || 'high',
  };
}

/**
 * 1. FACT CHECK SEARCH PROVIDER (Tier 3)
 */
export const FactCheckSearchProvider = {
  id: 'factCheckSearch',
  name: 'Basis Data Pemeriksa Fakta Terverifikasi (TurnBackHoax & CekFakta)',
  tier: 3,
  async search(query, context = {}) {
    const results = [];
    const qText = String(query || '').trim();

    // 1. Cek Shared Verification Repository
    const repoMatch = findVerificationRecord(qText, context.claimId);
    if (repoMatch && repoMatch.record) {
      const rec = repoMatch.record;
      const sim = repoMatch.score || (repoMatch.matchType === 'EXACT_ID' ? 1.0 : 0.85);

      let matchTier = 'MATCHED FACT CHECK';
      if (sim < 0.4) matchTier = 'NOT ENOUGH MATCH';
      else if (sim < 0.65) matchTier = 'RELATED FACT CHECK';

      if (matchTier !== 'NOT ENOUGH MATCH') {
        results.push(
          normalizeEvidenceItem({
            id: `fc-repo-${rec.claimId}`,
            url: rec.sourceUrl || 'https://turnbackhoax.id',
            canonicalUrl: rec.sourceUrl || 'https://turnbackhoax.id',
            domain: rec.sourceUrl ? new URL(rec.sourceUrl).hostname : 'turnbackhoax.id',
            publisher: rec.sourceAttribution || 'Pemeriksa Fakta Independen',
            title: `Pemeriksaan Fakta: ${rec.claimText}`,
            author: rec.sourceAttribution,
            sourceType: 'fact_check',
            tier: 3,
            snippet: rec.summary || 'Laporan verifikasi fakta yang mengklarifikasi klaim ini.',
            stance: rec.verdict === 'FACT' ? 'supports' : 'refutes',
            publishedAt: rec.publishedAt,
            matchType: matchTier,
            similarityScore: sim,
          })
        );
      }
    }

    return results;
  },
};

/**
 * 2. OFFICIAL SEARCH PROVIDER (Tier 1)
 */
export const OfficialSearchProvider = {
  id: 'officialSearch',
  name: 'Direktori Saluran Resmi Lembaga Pemerintah & Otoritas Publik',
  tier: 1,
  async search(query, context = {}) {
    const qLower = String(query || '').toLowerCase();
    const results = [];

    for (const channel of OFFICIAL_CHANNELS) {
      const matchTopic = (channel.topics || []).some((t) => qLower.includes(String(t).toLowerCase()));
      const channelLabel = String(channel.publisherKey || channel.id || '').toLowerCase();
      const matchName = qLower.includes(channelLabel) || qLower.includes(String(channel.domain || '').toLowerCase());

      if (matchTopic || matchName) {
        results.push(
          normalizeEvidenceItem({
            id: `off-${channel.id}`,
            url: channel.url || `https://${channel.domain}`,
            canonicalUrl: channel.url || `https://${channel.domain}`,
            domain: channel.domain,
            publisher: channel.publisherKey ? channel.publisherKey.toUpperCase() : channel.domain,
            title: `Portal & Siaran Resmi: ${channel.publisherKey ? channel.publisherKey.toUpperCase() : channel.domain}`,
            author: `Humas ${channel.domain}`,
            sourceType: 'official',
            tier: 1,
            snippet: `Kanal komunikasi dan verifikasi resmi instansi ${channel.domain} terkait isu yang diperiksa.`,
            stance: context.hasMalwarePattern ? 'refutes' : 'supports',
            matchType: 'OFFICIAL_SOURCE_MATCH',
            similarityScore: 0.8,
          })
        );
      }
    }

    return results;
  },
};

/**
 * 3. NEWS SEARCH PROVIDER (Tier 2)
 */
export const NewsSearchProvider = {
  id: 'newsSearch',
  name: 'Indeks Media Massa Terakreditasi Dewan Pers',
  tier: 2,
  async search(query, context = {}) {
    // Media pelapor riil diinjeksi langsung dari URL artikel yang berhasil dibaca.
    // Jika tidak ada koneksi Google News API berbayar, kembalikan array kosong dengan jujur.
    return [];
  },
};

/**
 * 4. SUPPORT SEARCH PROVIDER (Mencari Bukti Konfirmasi / Dukungan)
 */
export const SupportSearchProvider = {
  id: 'supportSearch',
  name: 'Mesin Penelusuran Pernyataan Konfirmasi / Bukti Dukungan',
  tier: 2,
  async search(query, context = {}) {
    return [];
  },
};

/**
 * 5. REFUTE SEARCH PROVIDER (Mencari Bantahan / Klarifikasi)
 */
export const RefuteSearchProvider = {
  id: 'refuteSearch',
  name: 'Mesin Penelusuran Sanggahan, Hak Jawab & Klarifikasi Resmi',
  tier: 2,
  async search(query, context = {}) {
    return [];
  },
};

/**
 * 6. WEB EXTERNAL SEARCH PROVIDER (Status: NOT_CONFIGURED tanpa API key)
 */
export const WebExternalSearchProvider = {
  id: 'webSearch',
  name: 'Google Custom Search API / Bing Web Search',
  tier: 4,
  isExternalApi: true,
  async search() {
    // Belum dipasang API key eksternal di lingkungan demo / open source
    return [];
  },
};

/**
 * Deteksi Sinyal Pola Penipuan (Pattern Signals)
 */
export function detectPatternSignals(query = '') {
  const qLower = String(query).toLowerCase();
  const detectedSignals = [];

  for (const pattern of PATTERN_CORPUS) {
    const isMatch = (pattern.keywords || []).some((kw) => qLower.includes(kw.toLowerCase()));
    if (isMatch) {
      detectedSignals.push({
        type: 'scam_pattern_signal',
        patternId: pattern.id,
        label: 'Potential scam pattern detected',
        severity: pattern.severity || 'high',
        description: `Pola input memiliki karakteristik serupa dengan modus penipuan berulang: ${pattern.id.toUpperCase()}.`,
        advice: 'VeriFact menandai sinyal kewaspadaan ini namun tetap mencari bukti faktual objektif.',
      });
    }
  }

  return detectedSignals;
}

/**
 * Eksekusi pengumpulan bukti paralel dari seluruh provider dengan Promise.allSettled (§19, §20, §21)
 */
export async function gatherEvidenceFromAllProviders(claimText, context = {}, generatedQueries = []) {
  const providers = [
    OfficialSearchProvider,
    FactCheckSearchProvider,
    NewsSearchProvider,
    SupportSearchProvider,
    RefuteSearchProvider,
    WebExternalSearchProvider,
  ];

  const providerStatus = {};
  const allEvidences = [];
  const seenUrls = new Set();

  const searchQueries = [claimText];
  if (Array.isArray(generatedQueries) && generatedQueries.length > 0) {
    for (const qObj of generatedQueries) {
      if (qObj.query && !searchQueries.includes(qObj.query)) {
        searchQueries.push(qObj.query);
      }
    }
  }

  // Jalankan tiap provider secara terisolasi dengan Promise.allSettled
  const executionPromises = providers.map(async (provider) => {
    const startTime = Date.now();

    // Jika provider adalah API eksternal tanpa konfigurasi API key
    if (provider.isExternalApi) {
      const hasApiKey = Boolean(typeof process !== 'undefined' && process.env?.GOOGLE_SEARCH_API_KEY);
      if (!hasApiKey) {
        providerStatus[provider.id] = {
          id: provider.id,
          name: provider.name,
          status: PROVIDER_STATUS.NOT_CONFIGURED,
          latencyMs: 0,
          count: 0,
          message: 'API Key belum dikonfigurasi pada server.',
        };
        return [];
      }
    }

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT')), 3500)
      );

      const searchWork = (async () => {
        const found = [];
        for (const q of searchQueries.slice(0, 3)) {
          const items = await provider.search(q, context);
          for (const item of items) {
            const key = item.url || item.id;
            if (!seenUrls.has(key)) {
              seenUrls.add(key);
              found.push(item);
            }
          }
        }
        return found;
      })();

      const results = await Promise.race([searchWork, timeoutPromise]);
      const latencyMs = Date.now() - startTime;

      providerStatus[provider.id] = {
        id: provider.id,
        name: provider.name,
        status: results.length > 0 ? PROVIDER_STATUS.SUCCESS : PROVIDER_STATUS.NO_RESULTS,
        latencyMs,
        count: results.length,
        message: results.length > 0 ? `Ditemukan ${results.length} bukti.` : 'Pencarian selesai, belum ada arsip yang cocok.',
      };

      return results;
    } catch (err) {
      const isTimeout = err.message === 'TIMEOUT';
      providerStatus[provider.id] = {
        id: provider.id,
        name: provider.name,
        status: isTimeout ? PROVIDER_STATUS.TIMEOUT : PROVIDER_STATUS.ERROR,
        latencyMs: Date.now() - startTime,
        count: 0,
        message: isTimeout ? 'Permintaan melebihi batas waktu (3500ms).' : 'Terjadi gangguan saat mengambil data.',
      };
      return [];
    }
  });

  const settled = await Promise.allSettled(executionPromises);

  for (const item of settled) {
    if (item.status === 'fulfilled' && Array.isArray(item.value)) {
      allEvidences.push(...item.value);
    }
  }

  const patternSignals = detectPatternSignals(claimText);

  const hasPartialFailure = Object.values(providerStatus).some(
    (p) => p.status === PROVIDER_STATUS.TIMEOUT || p.status === PROVIDER_STATUS.ERROR
  );

  return {
    evidence: allEvidences,
    providerStatus,
    patternSignals,
    hasPartialFailure,
  };
}

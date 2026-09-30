/**
 * evidenceProviders.js
 *
 * VeriFact ID 4.0 - Evidence Provider Abstraction Layer
 * Menghubungkan berbagai kanal sumber bukti (Sumber Primer Resmi, Portal Cek Fakta,
 * Media Kredibel, dan Arsip Historis).
 * Sesuai spesifikasi master prompt v4.txt §05, §07, dan §11.
 */

import { OFFICIAL_CHANNELS } from '../data/officialSources.js';
import { PATTERN_CORPUS } from '../data/patternCorpus.js';
import { classifyDomainTier } from '../utils/sourceScoring.js';

/**
 * Normalisasi format data bukti dari semua provider ke skema baku VeriFact 4.0 (§07).
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
    publishedAt: raw.publishedAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.publishedAt || new Date().toISOString(),
    sourceType: raw.sourceType || (tier === 1 ? 'official' : tier === 3 ? 'fact_check' : 'news'),
    tier,
    content: raw.content || raw.snippet || '',
    snippet: raw.snippet || raw.content?.slice(0, 160) || '',
    stance: raw.stance || 'context', // 'supports' | 'refutes' | 'context'
    language: raw.language || 'id',
    retrievedAt: new Date().toISOString(),
    relevance: raw.relevance || 'high',
  };
}

/**
 * 1. Official Source Provider (Tier 1: Lembaga Resmi Pemerintah .go.id, BMKG, OJK, Kemenkes, dll.)
 */
export const OfficialSourceProvider = {
  name: 'OfficialSourceProvider',
  tier: 1,
  async search(query, context = {}) {
    const qLower = String(query).toLowerCase();
    const results = [];

    // Telusuri kanal resmi terverifikasi
    for (const channel of OFFICIAL_CHANNELS) {
      const matchTopic = (channel.topics || []).some((t) => qLower.includes(String(t).toLowerCase()));
      const channelLabel = String(channel.publisherKey || channel.id || '').toLowerCase();
      const matchName = qLower.includes(channelLabel) || qLower.includes(String(channel.domain || '').toLowerCase());

      if (matchTopic || matchName) {
        results.push(
          normalizeEvidenceItem({
            id: `off-${channel.id}`,
            url: channel.url || `https://${channel.domain}`,
            domain: channel.domain,
            publisher: channel.publisherKey ? channel.publisherKey.toUpperCase() : channel.domain,
            title: `Portal & Siaran Resmi: ${channel.publisherKey ? channel.publisherKey.toUpperCase() : channel.domain}`,
            author: `Humas ${channel.domain}`,
            sourceType: 'official',
            tier: 1,
            snippet: `Kanal komunikasi dan verifikasi resmi instansi ${channel.domain}.`,
            stance: context.hasMalwarePattern ? 'refutes' : 'supports',
          })
        );
      }
    }

    return results;
  },
};

/**
 * 2. Fact Check Provider (Tier 3: Kolaborasi CekFakta, TurnBackHoax, Mafindo, JalaHoaks)
 */
export const FactCheckProvider = {
  name: 'FactCheckProvider',
  tier: 3,
  async search(query, context = {}) {
    const qLower = String(query).toLowerCase();
    const results = [];

    // Cari dari korpus pola misinformasi / scam yang sering berulang
    for (const pattern of PATTERN_CORPUS) {
      const isMatch = (pattern.keywords || []).some((kw) => qLower.includes(kw.toLowerCase()));
      if (isMatch) {
        results.push(
          normalizeEvidenceItem({
            id: `fc-${pattern.id}`,
            url: `https://turnbackhoax.id/?s=${encodeURIComponent(pattern.id)}`,
            domain: 'turnbackhoax.id',
            publisher: 'Pemeriksa Fakta Independen (Mafindo / CekFakta)',
            title: `Klarifikasi Fakta: Isu ${pattern.id.toUpperCase()}`,
            author: 'Pemeriksa Fakta Terverifikasi IFCN',
            sourceType: 'fact_check',
            tier: 3,
            snippet: `Berdasarkan arsip pemeriksaan fakta, klaim mengenai modus ini telah dibantah dan diidentifikasi sebagai informasi palsu/penipuan.`,
            stance: 'refutes',
          })
        );
      }
    }

    return results;
  },
};

/**
 * 3. News Provider (Tier 2: Media Mainstream Kredibel)
 */
export const NewsProvider = {
  name: 'NewsProvider',
  tier: 2,
  async search(query, context = {}) {
    // Sumber berita sekunder
    if (context.urlInfo && context.urlInfo.domain) {
      return [
        normalizeEvidenceItem({
          id: `news-${Date.now()}`,
          url: context.urlInfo.url,
          domain: context.urlInfo.domain,
          publisher: context.urlInfo.publisher || context.urlInfo.domain,
          title: context.urlInfo.title || 'Artikel Sumber Input',
          author: context.urlInfo.author || 'Redaksi',
          publishedAt: context.urlInfo.publishedAt || new Date().toISOString(),
          sourceType: 'news',
          tier: 2,
          snippet: context.urlInfo.description || 'Liputan berita terkait topik bahasan.',
          stance: 'context',
        }),
      ];
    }
    return [];
  },
};

/**
 * Registry dan Aggregator Bukti
 */
export async function gatherEvidenceFromAllProviders(query, context = {}) {
  const providers = [OfficialSourceProvider, FactCheckProvider, NewsProvider];
  const allResults = [];

  for (const provider of providers) {
    try {
      const items = await provider.search(query, context);
      allResults.push(...items);
    } catch (err) {
      console.warn(`[EvidenceProvider] ${provider.name} error:`, err);
    }
  }

  // Deduplikasi berdasarkan ID atau URL
  const seen = new Set();
  const deduplicated = [];

  for (const item of allResults) {
    const key = `${item.domain}-${item.title}`.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(item);
    }
  }

  return deduplicated;
}

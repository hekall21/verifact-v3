/**
 * sourceService.js
 *
 * Layanan katalog sumber dan kanal verifikasi resmi.
 * Menghasilkan tautan pencarian nyata ke masing-masing pangkalan data otoritas.
 */

import { OFFICIAL_CHANNELS, FACT_CHECKERS } from '../data/officialSources.js';
import { SOURCE_TIER, classifyDomainTier } from '../utils/sourceScoring.js';

export function getOfficialChannelsForTopics(topics = []) {
  if (!topics || !topics.length) return OFFICIAL_CHANNELS.slice(0, 4);

  const matched = OFFICIAL_CHANNELS.filter((ch) =>
    ch.topics.some((t) => topics.includes(t))
  );

  return matched.length ? matched : OFFICIAL_CHANNELS.slice(0, 4);
}

export function getAllFactCheckers() {
  return FACT_CHECKERS;
}

/**
 * Menghasilkan URL pencarian langsung di pangkalan data pemeriksa fakta.
 */
export function buildFactCheckSearchUrl(query) {
  const encoded = encodeURIComponent(String(query || '').trim());
  return [
    {
      name: 'TurnBackHoax (Mafindo)',
      domain: 'turnbackhoax.id',
      url: `https://turnbackhoax.id/?s=${encoded}`,
      tier: SOURCE_TIER.FACT_CHECK,
    },
    {
      name: 'CekFakta.com',
      domain: 'cekfakta.com',
      url: `https://cekfakta.com/?s=${encoded}`,
      tier: SOURCE_TIER.FACT_CHECK,
    },
    {
      name: 'Google Fact Check Explorer',
      domain: 'toolbox.google.com',
      url: `https://toolbox.google.com/factcheck/explorer/search/list?hl=id&query=${encoded}`,
      tier: SOURCE_TIER.FACT_CHECK,
    },
  ];
}

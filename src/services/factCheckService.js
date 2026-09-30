/**
 * factCheckService.js
 *
 * Layanan penelusuran korpus pola dan fakta.
 * Menghubungkan kata kunci klaim dengan korpus pola modus (patternCorpus.js)
 * dan kanal verifikasi resmi.
 */

import { PATTERN_CORPUS } from '../data/patternCorpus.js';
import { OFFICIAL_CHANNELS } from '../data/officialSources.js';

export function findMatchingPatterns(text = '', keywords = []) {
  const lower = String(text).toLowerCase();
  const kwLower = keywords.map((k) => String(k).toLowerCase());

  const matched = [];

  for (const pattern of PATTERN_CORPUS) {
    let hasRequirement = true;
    if (pattern.requireAny && pattern.requireAny.length > 0) {
      hasRequirement = pattern.requireAny.some((req) => lower.includes(req.toLowerCase()));
    }

    if (!hasRequirement) continue;

    // Hitung berapa kata kunci cocok
    const matchCount = pattern.keywords.filter((pk) => {
      const pkl = pk.toLowerCase();
      return lower.includes(pkl) || kwLower.some((k) => k.includes(pkl) || pkl.includes(k));
    }).length;

    if (matchCount > 0) {
      // Temukan objek kanal resmi yang bersesuaian
      const channels = (pattern.officialChannels || [])
        .map((cid) => OFFICIAL_CHANNELS.find((ch) => ch.id === cid))
        .filter(Boolean);

      matched.push({
        ...pattern,
        matchCount,
        channels,
      });
    }
  }

  // Urutkan berdasarkan kecocokan tertinggi
  return matched.sort((a, b) => b.matchCount - a.matchCount);
}

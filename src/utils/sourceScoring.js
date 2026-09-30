/**
 * sourceScoring.js
 *
 * Penilaian kualitas sumber dan perhitungan tingkat keyakinan analisis.
 *
 * Prinsip (master prompt §11):
 *   - Skor TIDAK BOLEH hardcoded.
 *   - Skor dihitung dari faktor yang benar-benar diketahui sistem.
 *   - Skor adalah "tingkat keyakinan sistem terhadap hasil pemeriksaan",
 *     BUKAN probabilitas bahwa klaim itu benar.
 *   - Bila tidak ada bukti, skor harus rendah dan itu memang jujur.
 */

import { getRegistrableDomain } from './urlDetector.js';
import { isInconclusive } from './verdict.js';

/** Tier sumber: 1 = primer/resmi, 2 = media kredibel, 3 = pemeriksa fakta. */
export const SOURCE_TIER = {
  PRIMARY: 1,
  REPORTING: 2,
  FACT_CHECK: 3,
  UNKNOWN: 4,
};

/** Bobot dasar per tier untuk perhitungan keyakinan. */
const TIER_WEIGHT = {
  1: 1.0,
  2: 0.7,
  3: 0.9,
  4: 0.3,
};

/** Relevansi -> faktor pengali. */
const RELEVANCE_FACTOR = {
  high: 1.0,
  medium: 0.7,
  low: 0.4,
};

/**
 * Klasifikasi tier dari domain.
 * Hanya berdasarkan sifat domain yang dapat diperiksa siapa pun
 * (mis. .go.id adalah domain instansi pemerintah Indonesia).
 */
export function classifyDomainTier(domainOrHost, hint = {}) {
  if (hint.tier) return hint.tier;
  const domain = getRegistrableDomain(domainOrHost);
  if (!domain) return SOURCE_TIER.UNKNOWN;

  if (domain.endsWith('.go.id') || domain.endsWith('.gov') || domain.endsWith('.gov.uk')) {
    return SOURCE_TIER.PRIMARY;
  }
  if (domain === 'who.int' || domain === 'un.org' || domain.endsWith('.int')) {
    return SOURCE_TIER.PRIMARY;
  }
  if (domain.endsWith('.ac.id') || domain.endsWith('.edu')) {
    return SOURCE_TIER.PRIMARY;
  }
  const factCheckers = ['turnbackhoax.id', 'cekfakta.com', 'cekhoax.id', 'jalahoaks.jakarta.go.id', 'mafindo.or.id'];
  if (factCheckers.includes(domain)) return SOURCE_TIER.FACT_CHECK;

  return SOURCE_TIER.UNKNOWN;
}

/** Label tier untuk i18n (kode, bukan teks bahasa). */
export function tierCode(tier) {
  switch (tier) {
    case SOURCE_TIER.PRIMARY: return 'primary';
    case SOURCE_TIER.REPORTING: return 'reporting';
    case SOURCE_TIER.FACT_CHECK: return 'factCheck';
    default: return 'unknown';
  }
}

/**
 * Hitung relevansi evidence terhadap kata kunci klaim.
 * Deterministik dan dapat dijelaskan: berapa banyak kata kunci klaim
 * yang benar-benar muncul pada judul/kutipan evidence.
 */
export function scoreRelevance(keywords = [], evidenceText = '') {
  const haystack = String(evidenceText).toLowerCase();
  if (!keywords.length || !haystack) return { level: 'low', matched: [], ratio: 0 };

  const matched = keywords.filter((k) => k.length > 2 && haystack.includes(k.toLowerCase()));
  const ratio = matched.length / Math.min(keywords.length, 8);

  let level = 'low';
  if (matched.length >= 3 && ratio >= 0.4) level = 'high';
  else if (matched.length >= 2 || ratio >= 0.25) level = 'medium';

  return { level, matched, ratio: Number(ratio.toFixed(2)) };
}

/** Kesegaran publikasi: bukti lama kurang meyakinkan untuk klaim aktual. */
function recencyFactor(publishedAt, now = Date.now()) {
  if (!publishedAt) return 0.85; // tanggal tidak diketahui: sedikit dikurangi
  const ts = new Date(publishedAt).getTime();
  if (!Number.isFinite(ts)) return 0.85;
  const days = Math.max(0, (now - ts) / 86_400_000);
  if (days <= 30) return 1.0;
  if (days <= 180) return 0.95;
  if (days <= 365) return 0.9;
  if (days <= 365 * 3) return 0.8;
  return 0.7;
}

/**
 * Tingkat keyakinan analisis (0-100).
 *
 * Faktor yang dipakai:
 *   - reliabilitas sumber (tier)
 *   - jumlah domain independen
 *   - ketersediaan sumber primer
 *   - konsistensi arah bukti terhadap verdict
 *   - kesegaran publikasi
 *   - apakah isi sumber berhasil dibaca
 *   - apakah pencarian bukti benar-benar dijalankan
 */
export function computeConfidence({
  verdict,
  evidence = [],
  stats = {},
  contentRetrieved = false,
  evidenceSearchPerformed = false,
  priorFactCheck = false,
  now = Date.now(),
} = {}) {
  const factors = [];

  // Tanpa pencarian bukti, keyakinan sistem memang sangat rendah.
  if (!evidenceSearchPerformed) {
    factors.push({ code: 'evidenceSearchNotPerformed', impact: -30 });
    return {
      score: 8,
      band: 'veryLow',
      factors,
      note: 'noEvidencePipeline',
    };
  }

  const usable = evidence.filter((e) => e && e.stance && e.stance !== 'unrelated');
  if (usable.length === 0) {
    factors.push({ code: 'noRelevantEvidenceFound', impact: -25 });
    return { score: 12, band: 'veryLow', factors, note: 'noEvidenceFound' };
  }

  // Basis: kualitas rata-rata evidence tertimbang tier & relevansi.
  let weighted = 0;
  for (const e of usable) {
    const tier = e.tier || classifyDomainTier(e.domain || '');
    const w = TIER_WEIGHT[tier] ?? 0.3;
    const rel = RELEVANCE_FACTOR[e.relevance] ?? 0.5;
    weighted += w * rel * recencyFactor(e.publishedAt, now);
  }
  const avgQuality = weighted / usable.length; // 0..1
  let score = 22 + avgQuality * 40; // 22..62
  factors.push({ code: 'sourceReliability', impact: Math.round(avgQuality * 40) });

  // Jumlah sumber independen.
  const domains = stats.independentDomains ?? new Set(usable.map((e) => e.domain).filter(Boolean)).size;
  if (domains >= 3) {
    score += 12;
    factors.push({ code: 'multipleIndependentSources', impact: 12 });
  } else if (domains === 2) {
    score += 7;
    factors.push({ code: 'twoIndependentSources', impact: 7 });
  } else {
    score -= 6;
    factors.push({ code: 'singleSourceOnly', impact: -6 });
  }

  // Sumber primer tersedia.
  if (stats.hasPrimary) {
    score += 10;
    factors.push({ code: 'primarySourceAvailable', impact: 10 });
  } else {
    score -= 5;
    factors.push({ code: 'noPrimarySource', impact: -5 });
  }

  // Laporan pemeriksa fakta yang sudah terbit.
  if (priorFactCheck || stats.hasFactCheck) {
    score += 8;
    factors.push({ code: 'factCheckReportExists', impact: 8 });
  }

  // Konsistensi arah bukti.
  const supporting = stats.supporting ?? 0;
  const refuting = stats.refuting ?? 0;
  const directional = supporting + refuting;
  if (directional > 0) {
    const dominance = Math.abs(supporting - refuting) / directional;
    const impact = Math.round(dominance * 12 - 6); // -6..+6
    score += impact;
    factors.push({ code: dominance >= 0.6 ? 'consistentEvidenceDirection' : 'conflictingEvidence', impact });
  } else {
    score -= 4;
    factors.push({ code: 'onlyContextualEvidence', impact: -4 });
  }

  // Isi sumber yang diperiksa berhasil dibaca.
  if (contentRetrieved) {
    score += 6;
    factors.push({ code: 'sourceContentRetrieved', impact: 6 });
  } else {
    score -= 8;
    factors.push({ code: 'sourceContentUnavailable', impact: -8 });
  }

  // Status yang tidak menyimpulkan tidak boleh tampil dengan keyakinan tinggi.
  if (isInconclusive(verdict)) {
    score = Math.min(score, 45);
    factors.push({ code: 'inconclusiveVerdictCap', impact: 0 });
  }

  const final = Math.max(5, Math.min(92, Math.round(score)));
  return { score: final, band: confidenceBand(final), factors, note: null };
}

/** Pita keyakinan untuk pelabelan i18n. */
export function confidenceBand(score) {
  if (score < 20) return 'veryLow';
  if (score < 40) return 'low';
  if (score < 60) return 'moderate';
  if (score < 78) return 'high';
  return 'veryHigh';
}

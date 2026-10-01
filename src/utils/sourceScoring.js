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

  // Kasus 1: Konten sumber belum berhasil dibaca -> Confidence N/A
  if (!contentRetrieved || verdict === 'SOURCE_CONTENT_UNAVAILABLE') {
    factors.push({ code: 'sourceContentUnavailable', impact: 0 });
    return {
      score: null,
      band: 'notAvailable',
      isNA: true,
      factors,
      note: 'sourceContentUnavailable',
      sourceCoverage: 'Not Available',
      primarySourcesCount: 0,
      independentClustersCount: 0,
    };
  }

  // Kasus 2: Pipeline pencarian bukti belum pernah dijalankan
  if (!evidenceSearchPerformed) {
    factors.push({ code: 'evidenceSearchNotPerformed', impact: -30 });
    return {
      score: null,
      band: 'notAvailable',
      isNA: true,
      factors,
      note: 'noEvidencePipeline',
      sourceCoverage: 'Not Available',
      primarySourcesCount: 0,
      independentClustersCount: 0,
    };
  }

  const usable = evidence.filter((e) => e && e.stance && e.stance !== 'unrelated');

  // Kasus 3: Bukti kosong
  if (usable.length === 0) {
    factors.push({ code: 'noRelevantEvidenceFound', impact: 0 });
    return {
      score: null,
      band: 'notAvailable',
      isNA: true,
      factors,
      note: 'noEvidenceFound',
      sourceCoverage: 'None',
      primarySourcesCount: 0,
      independentClustersCount: 0,
    };
  }

  const domains = stats.independentDomains ?? new Set(usable.map((e) => e.domain).filter(Boolean)).size;
  const clusters = stats.independentClusters ?? domains;
  const officialCount = stats.officialCount ?? usable.filter((e) => e.tier === 1 || e.sourceType === 'official').length;
  const factCheckCount = stats.factCheckCount ?? usable.filter((e) => e.tier === 3 || e.sourceType === 'fact_check').length;

  // Kasus 4 (§17 & §18): Jika status inconclusive (UNVERIFIED / INSUFFICIENT_EVIDENCE / UNPROVEN)
  // dan bukti belum memenuhi ambang batas independen (misal 1 media, 0 official, 0 fact check)
  // JANGAN MENAMPILKAN PERSENTASE PALSU (misal 41%)!
  if (isInconclusive(verdict) && officialCount === 0 && factCheckCount === 0 && clusters <= 1) {
    factors.push({ code: 'minimumEvidenceNotMet', impact: 0 });
    factors.push({ code: 'singleSourceNoOfficialConfirmation', impact: 0 });
    return {
      score: null,
      band: 'notAvailable',
      isNA: true,
      factors,
      note: 'insufficientEvidence',
      sourceCoverage: 'Low',
      primarySourcesCount: 0,
      independentClustersCount: 1,
    };
  }

  // Kasus 5: Menghitung tingkat keyakinan sistem dalam mendukung VERDICT yang dibuat (§15)
  // Basis: kualitas rata-rata evidence tertimbang tier & relevansi
  let weighted = 0;
  for (const e of usable) {
    const tier = e.tier || classifyDomainTier(e.domain || '');
    const w = TIER_WEIGHT[tier] ?? 0.3;
    const rel = RELEVANCE_FACTOR[e.relevance] ?? 0.5;
    weighted += w * rel * recencyFactor(e.publishedAt, now);
  }
  const avgQuality = weighted / usable.length; // 0..1
  let score = 25 + avgQuality * 35; // 25..60
  factors.push({ code: 'sourceReliability', impact: Math.round(avgQuality * 35) });

  // Kluster independen
  if (clusters >= 3) {
    score += 15;
    factors.push({ code: 'multipleIndependentSources', impact: 15 });
  } else if (clusters === 2) {
    score += 8;
    factors.push({ code: 'twoIndependentSources', impact: 8 });
  } else {
    score -= 5;
    factors.push({ code: 'singleSourceOnly', impact: -5 });
  }

  // Sumber primer tersedia
  if (officialCount > 0 || stats.hasPrimary) {
    score += 15;
    factors.push({ code: 'primarySourceAvailable', impact: 15 });
  } else {
    score -= 5;
    factors.push({ code: 'noPrimarySource', impact: -5 });
  }

  // Laporan pemeriksa fakta yang sudah terbit
  if (priorFactCheck || factCheckCount > 0 || stats.hasFactCheck) {
    score += 12;
    factors.push({ code: 'factCheckReportExists', impact: 12 });
  }

  // Konsistensi arah bukti
  const supporting = stats.supporting ?? 0;
  const refuting = stats.refuting ?? 0;
  const directional = supporting + refuting;
  if (directional > 0) {
    const dominance = Math.abs(supporting - refuting) / directional;
    const impact = Math.round(dominance * 14 - 4); // -4..+10
    score += impact;
    factors.push({ code: dominance >= 0.6 ? 'consistentEvidenceDirection' : 'conflictingEvidence', impact });
  } else {
    score -= 4;
    factors.push({ code: 'onlyContextualEvidence', impact: -4 });
  }

  // Isi sumber berhasil dibaca
  score += 5;
  factors.push({ code: 'sourceContentRetrieved', impact: 5 });

  // Status inconclusive dengan beberapa bukti (misal ada 2 sumber yang saling kontradiksi)
  if (isInconclusive(verdict)) {
    score = Math.min(score, 45);
    factors.push({ code: 'inconclusiveVerdictCap', impact: 0 });
  }

  const finalScore = Math.max(10, Math.min(96, Math.round(score)));
  let coverage = 'Low';
  if (clusters >= 3 || usable.length >= 4) coverage = 'High';
  else if (clusters >= 2 || usable.length >= 2) coverage = 'Medium';

  return {
    score: finalScore,
    band: confidenceBand(finalScore),
    factors,
    note: null,
    sourceCoverage: coverage,
    primarySourcesCount: officialCount,
    independentClustersCount: clusters,
  };
}

/**
 * Pita keyakinan untuk pelabelan i18n (§16).
 * 0–29: SANGAT RENDAH (veryLow)
 * 30–49: RENDAH (low)
 * 50–69: SEDANG (moderate)
 * 70–84: TINGGI (high)
 * 85–100: SANGAT TINGGI (veryHigh)
 */
export function confidenceBand(score) {
  if (score === null || score === undefined) return 'notAvailable';
  if (score < 30) return 'veryLow';
  if (score < 50) return 'low';
  if (score < 70) return 'moderate';
  if (score < 85) return 'high';
  return 'veryHigh';
}

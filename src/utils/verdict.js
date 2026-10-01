/**
 * verdict.js
 *
 * Sistem status pemeriksaan VeriFact ID.
 *
 * Prinsip yang tidak boleh dilanggar (master prompt §9, §10):
 *   1. Tujuh status, bukan hanya HOAKS/FAKTA.
 *   2. Bila bukti tidak cukup -> BELUM TERBUKTI atau TIDAK DAPAT DIVERIFIKASI.
 *      Jangan pernah memaksa HOAKS atau FAKTA.
 *   3. DISINFORMASI hanya boleh dipakai bila ada bukti konteks penyebaran
 *      yang disengaja. Sistem ini tidak menebak niat, sehingga status ini
 *      TIDAK PERNAH dihasilkan otomatis oleh mesin — hanya bisa berasal dari
 *      laporan pemeriksa fakta manusia yang sudah menyimpulkan demikian.
 *
 * Semua label ditampilkan lewat i18n (kode status -> teks), bukan string
 * bahasa yang di-hardcode di komponen.
 */

export const VERDICT = {
  FACT: 'FACT',
  PARTLY_TRUE: 'PARTLY_TRUE',
  MISLEADING: 'MISLEADING',
  DISINFORMATION: 'DISINFORMATION',
  HOAX: 'HOAX',
  UNPROVEN: 'UNPROVEN',
  UNVERIFIABLE: 'UNVERIFIABLE',
  SOURCE_CONTENT_UNAVAILABLE: 'SOURCE_CONTENT_UNAVAILABLE',
  NEWS_HOMEPAGE_DETECTED: 'NEWS_HOMEPAGE_DETECTED',
};

/** Urutan tampilan pada filter dan legenda. */
export const VERDICT_ORDER = [
  VERDICT.FACT,
  VERDICT.PARTLY_TRUE,
  VERDICT.MISLEADING,
  VERDICT.DISINFORMATION,
  VERDICT.HOAX,
  VERDICT.UNPROVEN,
  VERDICT.UNVERIFIABLE,
];

/**
 * Pemetaan status -> token warna semantik.
 * Dipakai komponen agar warna konsisten di dark & light mode.
 */
export const VERDICT_TONE = {
  [VERDICT.FACT]: 'fact',
  [VERDICT.PARTLY_TRUE]: 'partly',
  [VERDICT.MISLEADING]: 'misleading',
  [VERDICT.DISINFORMATION]: 'hoax',
  [VERDICT.HOAX]: 'hoax',
  [VERDICT.UNPROVEN]: 'unproven',
  [VERDICT.UNVERIFIABLE]: 'unproven',
  [VERDICT.SOURCE_CONTENT_UNAVAILABLE]: 'unproven',
  [VERDICT.NEWS_HOMEPAGE_DETECTED]: 'unproven',
};

/** Status yang menandakan mesin tidak menyimpulkan benar/salah. */
export function isInconclusive(verdict) {
  return verdict === VERDICT.UNPROVEN || verdict === VERDICT.UNVERIFIABLE;
}

/** Normalisasi label lama (v2.x) ke kode status v3. */
export function normalizeVerdict(value) {
  const v = String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  const map = {
    FAKTA: VERDICT.FACT,
    FACT: VERDICT.FACT,
    TRUE: VERDICT.FACT,
    SEBAGIAN_BENAR: VERDICT.PARTLY_TRUE,
    PARTLY_TRUE: VERDICT.PARTLY_TRUE,
    PARTLY: VERDICT.PARTLY_TRUE,
    MENYESATKAN: VERDICT.MISLEADING,
    MISLEADING: VERDICT.MISLEADING,
    DISINFORMASI: VERDICT.DISINFORMATION,
    DISINFORMATION: VERDICT.DISINFORMATION,
    HOAKS: VERDICT.HOAX,
    HOAX: VERDICT.HOAX,
    FALSE: VERDICT.HOAX,
    BELUM_TERBUKTI: VERDICT.UNPROVEN,
    UNPROVEN: VERDICT.UNPROVEN,
    UNSUBSTANTIATED: VERDICT.UNPROVEN,
    TIDAK_DAPAT_DIVERIFIKASI: VERDICT.UNVERIFIABLE,
    UNVERIFIABLE: VERDICT.UNVERIFIABLE,
  };
  return map[v] || VERDICT.UNPROVEN;
}

/**
 * Ringkasan kekuatan bukti dari daftar evidence.
 *
 * evidence item minimal: { stance, sourceType, tier, relevance }
 *   stance: 'supports' | 'refutes' | 'context' | 'unrelated'
 */
export function summarizeEvidence(evidence = []) {
  const usable = evidence.filter((e) => e && e.stance && e.stance !== 'unrelated');
  const supporting = usable.filter((e) => e.stance === 'supports');
  const refuting = usable.filter((e) => e.stance === 'refutes');
  const contextual = usable.filter((e) => e.stance === 'context');

  const domains = new Set(usable.map((e) => e.domain).filter(Boolean));
  const hasPrimary = usable.some((e) => e.tier === 1);
  const hasFactCheck = usable.some((e) => e.tier === 3);
  const strongRefuting = refuting.filter((e) => e.tier === 1 || e.tier === 3);
  const strongSupporting = supporting.filter((e) => e.tier === 1 || e.tier === 3);

  return {
    total: usable.length,
    supporting: supporting.length,
    refuting: refuting.length,
    contextual: contextual.length,
    independentDomains: domains.size,
    hasPrimary,
    hasFactCheck,
    strongRefuting: strongRefuting.length,
    strongSupporting: strongSupporting.length,
  };
}

/**
 * Tentukan status berdasarkan bukti yang benar-benar ada.
 *
 * @param {object} input
 *   evidence              daftar evidence hasil retrieval
 *   contentRetrieved      apakah isi sumber berhasil dibaca
 *   evidenceSearchPerformed  apakah pencarian bukti eksternal benar-benar jalan
 *   priorVerdict          verdict dari laporan pemeriksa fakta manusia (bila ada)
 * @returns {{ verdict: string, reasonCodes: string[], stats: object }}
 */
export function determineVerdict(input = {}) {
  const {
    evidence = [],
    contentRetrieved = false,
    evidenceSearchPerformed = false,
    priorVerdict = null,
  } = input;

  const stats = summarizeEvidence(evidence);
  const reasonCodes = [];

  if (!contentRetrieved) {
    reasonCodes.push('sourceContentUnavailable');
  }

  // Kasus 1: sudah ada laporan pemeriksa fakta manusia yang cocok.
  // Ini satu-satunya jalur yang boleh menghasilkan DISINFORMASI, karena
  // penilaian niat penyebaran dilakukan oleh pemeriksa fakta, bukan mesin.
  if (priorVerdict) {
    reasonCodes.push('priorFactCheckExists');
    if (stats.hasPrimary) reasonCodes.push('primarySourceAvailable');
    return { verdict: normalizeVerdict(priorVerdict), reasonCodes, stats };
  }

  // Kasus 2: pencarian bukti belum pernah dijalankan (backend belum terhubung).
  // Tidak boleh menyimpulkan apa pun.
  if (!evidenceSearchPerformed) {
    reasonCodes.push('evidenceSearchNotPerformed');
    return { verdict: VERDICT.UNVERIFIABLE, reasonCodes, stats };
  }

  // Kasus 3: pencarian jalan tetapi tidak ada bukti relevan.
  if (stats.total === 0) {
    reasonCodes.push('noRelevantEvidenceFound');
    return { verdict: VERDICT.UNPROVEN, reasonCodes, stats };
  }

  // Kasus 4: bukti kuat membantah klaim.
  if (stats.strongRefuting >= 1 && stats.refuting > stats.supporting) {
    reasonCodes.push('strongRefutingEvidence');
    if (stats.hasPrimary) reasonCodes.push('primarySourceContradicts');
    if (stats.hasFactCheck) reasonCodes.push('factCheckerRefuted');
    // HOAKS butuh bukti kuat + tidak ada dukungan berarti.
    if (stats.supporting === 0 && (stats.strongRefuting >= 2 || stats.hasPrimary)) {
      return { verdict: VERDICT.HOAX, reasonCodes, stats };
    }
    // Ada bukti di dua arah: klaim memakai elemen nyata tapi kesimpulannya salah.
    reasonCodes.push('mixedEvidenceDirection');
    return { verdict: VERDICT.MISLEADING, reasonCodes, stats };
  }

  // Kasus 5: bukti kuat mendukung klaim.
  if (stats.strongSupporting >= 1 && stats.supporting > stats.refuting) {
    reasonCodes.push('strongSupportingEvidence');
    if (stats.hasPrimary) reasonCodes.push('primarySourceConfirms');
    if (stats.refuting > 0 || stats.contextual > 0) {
      reasonCodes.push('importantContextMissing');
      return { verdict: VERDICT.PARTLY_TRUE, reasonCodes, stats };
    }
    if (stats.independentDomains >= 2 || stats.hasPrimary) {
      return { verdict: VERDICT.FACT, reasonCodes, stats };
    }
    reasonCodes.push('singleSourceOnly');
    return { verdict: VERDICT.PARTLY_TRUE, reasonCodes, stats };
  }

  // Kasus 6: bukti seimbang / hanya kontekstual -> tidak menyimpulkan.
  if (stats.supporting > 0 && stats.refuting > 0) {
    reasonCodes.push('conflictingEvidence');
    return { verdict: VERDICT.UNPROVEN, reasonCodes, stats };
  }
  if (stats.contextual > 0 && stats.supporting === 0 && stats.refuting === 0) {
    reasonCodes.push('onlyContextualEvidence');
    return { verdict: VERDICT.UNPROVEN, reasonCodes, stats };
  }

  reasonCodes.push('insufficientEvidenceWeight');
  return { verdict: VERDICT.UNPROVEN, reasonCodes, stats };
}

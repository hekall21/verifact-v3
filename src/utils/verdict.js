/**
 * src/utils/verdict.js
 *
 * VeriFact ID — Verdict Engine V2
 *
 * Prinsip Mutlak (§1 s.d. §10):
 *   1. VERDICT TIDAK BOLEH DITENTUKAN DARI CONFIDENCE.
 *      Confidence dan verdict adalah dua hal berbeda.
 *      Confidence menjelaskan "seberapa kuat sistem mendukung verdict yang sudah dibuat",
 *      bukan "jika confidence rendah berarti klaim salah".
 *   2. VERDICT HARUS BERDASARKAN EVIDENCE.
 *      Dilarang memberikan FALSE, MISLEADING, HOAX hanya berdasarkan keyword, pattern,
 *      sentiment, clickbait, URL structure, 1 media source, atau heuristic score.
 *   3. MINIMUM EVIDENCE RULE (§3):
 *      Jika hanya ada 1 source, 0 official source, dan 0 fact-check:
 *      -> JANGAN memberikan FALSE, MISLEADING, HOAX!
 *      -> Gunakan UNVERIFIED (UI: BELUM TERBUKTI).
 *   4. VERDICT HIERARCHY (§4 & §5):
 *      - VERIFIED_TRUE (Fakta Terverifikasi)
 *      - SUPPORTED (Didukung Bukti Awal)
 *      - MISLEADING (Menyesatkan — HARUS ada bukti membedakan mana yang benar & mana yang dipelintir)
 *      - FALSE (Salah / Terbantah secara definitif oleh otoritas/pemeriksa fakta)
 *      - DISINFORMATION (Khusus laporan periksa fakta manusia dengan bukti niat penyebaran)
 *      - UNVERIFIED (Belum Terbukti — Bukti belum cukup)
 *      - INSUFFICIENT_EVIDENCE (Bukti Tidak Cukup)
 *      - UNVERIFIABLE (Tidak Dapat Diverifikasi)
 *      - SOURCE_CONTENT_UNAVAILABLE (Konten Sumber Belum Berhasil Diakses)
 *      - NEWS_HOMEPAGE_DETECTED (Halaman Beranda Media)
 *   5. EVIDENCE TIERS (§6):
 *      Tier 1: Primary / Official
 *      Tier 2: Independent reputable media
 *      Tier 3: Fact-check organization
 *      Tier 4: Secondary / context sources
 *      Tier 5: Heuristic / pattern signals (TIER 5 TIDAK BOLEH SENDIRIAN MENENTUKAN VERDICT).
 */

export const VERDICT = {
  VERIFIED_TRUE: 'VERIFIED_TRUE',
  FACT: 'FACT',
  SUPPORTED: 'SUPPORTED',
  PARTLY_TRUE: 'PARTLY_TRUE',
  MISLEADING: 'MISLEADING',
  FALSE: 'FALSE',
  HOAX: 'HOAX',
  DISINFORMATION: 'DISINFORMATION',
  UNVERIFIED: 'UNVERIFIED',
  INSUFFICIENT_EVIDENCE: 'INSUFFICIENT_EVIDENCE',
  UNPROVEN: 'UNPROVEN',
  UNVERIFIABLE: 'UNVERIFIABLE',
  SOURCE_CONTENT_UNAVAILABLE: 'SOURCE_CONTENT_UNAVAILABLE',
  NEWS_HOMEPAGE_DETECTED: 'NEWS_HOMEPAGE_DETECTED',
  IDENTIFIED_SOURCE: 'IDENTIFIED_SOURCE',
};

/** Urutan tampilan pada filter dan legenda */
export const VERDICT_ORDER = [
  VERDICT.VERIFIED_TRUE,
  VERDICT.SUPPORTED,
  VERDICT.MISLEADING,
  VERDICT.FALSE,
  VERDICT.HOAX,
  VERDICT.DISINFORMATION,
  VERDICT.UNVERIFIED,
  VERDICT.UNVERIFIABLE,
];

/**
 * Pemetaan status -> token warna semantik konsisten dark/light mode
 */
export const VERDICT_TONE = {
  [VERDICT.VERIFIED_TRUE]: 'fact',
  [VERDICT.FACT]: 'fact',
  [VERDICT.SUPPORTED]: 'partly',
  [VERDICT.PARTLY_TRUE]: 'partly',
  [VERDICT.MISLEADING]: 'misleading',
  [VERDICT.FALSE]: 'hoax',
  [VERDICT.HOAX]: 'hoax',
  [VERDICT.DISINFORMATION]: 'hoax',
  [VERDICT.UNVERIFIED]: 'unproven',
  [VERDICT.INSUFFICIENT_EVIDENCE]: 'unproven',
  [VERDICT.UNPROVEN]: 'unproven',
  [VERDICT.UNVERIFIABLE]: 'unproven',
  [VERDICT.SOURCE_CONTENT_UNAVAILABLE]: 'unproven',
  [VERDICT.NEWS_HOMEPAGE_DETECTED]: 'unproven',
  [VERDICT.IDENTIFIED_SOURCE]: 'partly',
};

/** Status yang menandakan sistem tidak menyimpulkan benar/salah secara definitif */
export function isInconclusive(verdict) {
  return (
    verdict === VERDICT.UNVERIFIED ||
    verdict === VERDICT.INSUFFICIENT_EVIDENCE ||
    verdict === VERDICT.UNPROVEN ||
    verdict === 'UNPROVEN' ||
    verdict === 'INSUFFICIENT_EVIDENCE' ||
    verdict === 'UNVERIFIED' ||
    verdict === VERDICT.UNVERIFIABLE ||
    verdict === VERDICT.SOURCE_CONTENT_UNAVAILABLE ||
    verdict === VERDICT.NEWS_HOMEPAGE_DETECTED ||
    verdict === VERDICT.IDENTIFIED_SOURCE
  );
}

/** Normalisasi berbagai format string ke kode status kanonikal */
export function normalizeVerdict(value) {
  const v = String(value || '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  const map = {
    VERIFIED_TRUE: VERDICT.VERIFIED_TRUE,
    VERIFIED: VERDICT.VERIFIED_TRUE,
    FAKTA: VERDICT.FACT,
    FACT: VERDICT.FACT,
    TRUE: VERDICT.VERIFIED_TRUE,
    SUPPORTED: VERDICT.SUPPORTED,
    TERDUKUNG: VERDICT.SUPPORTED,
    SEBAGIAN_BENAR: VERDICT.PARTLY_TRUE,
    PARTLY_TRUE: VERDICT.PARTLY_TRUE,
    PARTLY: VERDICT.PARTLY_TRUE,
    MENYESATKAN: VERDICT.MISLEADING,
    MISLEADING: VERDICT.MISLEADING,
    DISINFORMASI: VERDICT.DISINFORMATION,
    DISINFORMATION: VERDICT.DISINFORMATION,
    SALAH: VERDICT.FALSE,
    FALSE: VERDICT.FALSE,
    HOAKS: VERDICT.HOAX,
    HOAX: VERDICT.HOAX,
    BELUM_TERBUKTI: VERDICT.UNVERIFIED,
    UNVERIFIED: VERDICT.UNVERIFIED,
    UNPROVEN: VERDICT.UNPROVEN,
    INSUFFICIENT_EVIDENCE: VERDICT.INSUFFICIENT_EVIDENCE,
    UNSUBSTANTIATED: VERDICT.UNVERIFIED,
    TIDAK_DAPAT_DIVERIFIKASI: VERDICT.UNVERIFIABLE,
    UNVERIFIABLE: VERDICT.UNVERIFIABLE,
    SOURCE_CONTENT_UNAVAILABLE: VERDICT.SOURCE_CONTENT_UNAVAILABLE,
    NEWS_HOMEPAGE_DETECTED: VERDICT.NEWS_HOMEPAGE_DETECTED,
  };
  return map[v] || VERDICT.UNVERIFIED;
}

/**
 * Ringkasan kekuatan bukti dari daftar evidence.
 *
 * evidence item minimal: { stance, sourceType, tier, relevance, domain, clusterId }
 *   stance: 'supports' | 'refutes' | 'context' | 'unrelated'
 */
export function summarizeEvidence(evidence = [], sourceClusters = []) {
  const usable = evidence.filter((e) => e && e.stance && e.stance !== 'unrelated');
  const supporting = usable.filter((e) => e.stance === 'supports');
  const refuting = usable.filter((e) => e.stance === 'refutes');
  const contextual = usable.filter((e) => e.stance === 'context');

  const domains = new Set(usable.map((e) => e.domain).filter(Boolean));
  const officialList = usable.filter((e) => e.tier === 1 || e.sourceType === 'official');
  const mediaList = usable.filter((e) => e.tier === 2 || e.sourceType === 'news');
  const factCheckList = usable.filter((e) => e.tier === 3 || e.sourceType === 'fact_check');
  const contextList = usable.filter((e) => e.tier === 4 || e.stance === 'context');
  const patternList = usable.filter((e) => e.tier === 5);

  const hasPrimary = officialList.length > 0;
  const hasFactCheck = factCheckList.length > 0;
  const strongRefuting = refuting.filter((e) => e.tier === 1 || e.tier === 3);
  const strongSupporting = supporting.filter((e) => e.tier === 1 || e.tier === 3);

  // Kluster cerita / independensi sumber (§9)
  const clusterCount = Array.isArray(sourceClusters) && sourceClusters.length > 0
    ? sourceClusters.length
    : domains.size;

  return {
    total: usable.length,
    supporting: supporting.length,
    refuting: refuting.length,
    contextual: contextual.length,
    officialCount: officialList.length,
    mediaCount: mediaList.length,
    factCheckCount: factCheckList.length,
    contextCount: contextList.length,
    patternCount: patternList.length,
    independentDomains: domains.size,
    independentClusters: clusterCount,
    hasPrimary,
    hasFactCheck,
    strongRefuting: strongRefuting.length,
    strongSupporting: strongSupporting.length,
  };
}

/**
 * Verdict Engine V2 — Tentukan status berdasarkan bukti nyata (Evidence-Driven).
 *
 * @param {object} input
 *   evidence              daftar evidence hasil retrieval
 *   contentRetrieved      apakah isi sumber berhasil dibaca
 *   evidenceSearchPerformed  apakah pencarian bukti eksternal benar-benar jalan
 *   priorVerdict          verdict dari laporan pemeriksa fakta manusia (bila ada)
 *   sourceClusters        kluster independensi sumber
 * @returns {{ verdict: string, reasonCodes: string[], stats: object, explanation: string }}
 */
export function determineVerdict(input = {}) {
  const {
    evidence = [],
    contentRetrieved = false,
    evidenceSearchPerformed = false,
    priorVerdict = null,
    sourceClusters = [],
  } = input;

  const stats = summarizeEvidence(evidence, sourceClusters);
  const reasonCodes = [];

  // Kasus 0: Konten artikel belum berhasil dibaca
  if (!contentRetrieved) {
    reasonCodes.push('sourceContentUnavailable');
    return {
      verdict: VERDICT.SOURCE_CONTENT_UNAVAILABLE,
      reasonCodes,
      stats,
      explanation: 'Sistem belum berhasil mengakses isi artikel, sehingga verifikasi faktual ditangguhkan secara transparan.',
    };
  }

  // Kasus 1: Ada laporan resmi pemeriksa fakta manusia yang terverifikasi (TurnBackHoax/CekFakta/Mafindo)
  if (priorVerdict) {
    reasonCodes.push('priorFactCheckExists');
    if (stats.hasPrimary) reasonCodes.push('primarySourceAvailable');
    const normalized = normalizeVerdict(priorVerdict);
    return {
      verdict: normalized,
      reasonCodes,
      stats,
      explanation: 'Status verifikasi bersumber langsung dari catatan periksa fakta terakreditasi.',
    };
  }

  // Kasus 2: Pipeline pencarian bukti belum pernah dijalankan
  if (!evidenceSearchPerformed) {
    reasonCodes.push('evidenceSearchNotPerformed');
    return {
      verdict: VERDICT.UNVERIFIABLE,
      reasonCodes,
      stats,
      explanation: 'Penelusuran bukti independen belum dijalankan.',
    };
  }

  // Kasus 3: Tidak ada bukti relevan yang ditemukan sama sekali
  if (stats.total === 0) {
    reasonCodes.push('noRelevantEvidenceFound');
    return {
      verdict: VERDICT.UNVERIFIED,
      reasonCodes,
      stats,
      explanation: 'Belum ditemukan bukti independen untuk memverifikasi klaim ini.',
    };
  }

  // =========================================================================
  // ATURAN MUTLAK §3: MINIMUM EVIDENCE RULE
  // Jika hanya ada 1 source, 0 official source, dan 0 fact-check:
  // JANGAN memberikan FALSE, MISLEADING, HOAX!
  // =========================================================================
  if (
    stats.officialCount === 0 &&
    stats.factCheckCount === 0 &&
    (stats.mediaCount <= 1 || stats.independentClusters <= 1) &&
    stats.strongRefuting === 0
  ) {
    reasonCodes.push('minimumEvidenceThresholdNotMet');
    reasonCodes.push('singleSourceNoOfficialConfirmation');

    // Jika satu-satunya sumber adalah artikel itu sendiri yang memberitakan peristiwa
    if (stats.supporting >= 1 && stats.refuting === 0) {
      reasonCodes.push('reportedBySingleMediaSource');
    } else {
      reasonCodes.push('onlyContextualEvidence');
    }

    return {
      verdict: VERDICT.UNVERIFIED,
      reasonCodes,
      stats,
      explanation: 'Artikel berita berhasil dianalisis. Namun, belum ada sumber resmi atau laporan cek fakta independen yang mengonfirmasi atau membantah laporan ini.',
    };
  }

  // Kasus 4: BUKTI KUAT MEMBANTAH KLAIM (Refuting Evidence)
  if (stats.strongRefuting >= 1 && stats.refuting > stats.supporting) {
    reasonCodes.push('strongRefutingEvidence');
    if (stats.hasPrimary) reasonCodes.push('primarySourceContradicts');
    if (stats.hasFactCheck) reasonCodes.push('factCheckerRefuted');

    // MISLEADING: Ada bagian klaim yang benar secara fakta dasar, tetapi konteks penting dihilangkan / dipelintir (§5)
    if (stats.supporting > 0) {
      reasonCodes.push('importantContextMissing');
      return {
        verdict: VERDICT.MISLEADING,
        reasonCodes,
        stats,
        explanation: 'Klaim memuat sebagian fakta nyata tetapi menghilangkan konteks penting sehingga menghasilkan kesimpulan yang keliru.',
      };
    }

    // FALSE: Terbantah secara definitif tanpa dasar fakta
    return {
      verdict: VERDICT.FALSE,
      reasonCodes,
      stats,
      explanation: 'Klaim utama dibantah oleh bukti resmi atau laporan klarifikasi terakreditasi.',
    };
  }

  // Kasus 5: BUKTI KUAT MENDUKUNG KLAIM (Supporting Evidence)
  if (stats.supporting > 0 && stats.refuting === 0) {
    // Terverifikasi Penuh: Ada sumber resmi Tier 1 ATAU minimal 2 kluster media independen terpercaya
    if (stats.hasPrimary || (stats.independentClusters >= 2 && stats.mediaCount >= 2)) {
      reasonCodes.push('strongSupportingEvidence');
      if (stats.hasPrimary) reasonCodes.push('primarySourceConfirms');
      if (stats.independentClusters >= 2) reasonCodes.push('multipleIndependentSources');

      return {
        verdict: VERDICT.VERIFIED_TRUE,
        reasonCodes,
        stats,
        explanation: 'Klaim terkonfirmasi selaras dengan laporan sumber resmi dan liputan media independen terakreditasi.',
      };
    }

    // Terdukung Awal: Ada bukti mendukung tetapi belum mencapai verifikasi independen ganda
    reasonCodes.push('supportingEvidenceFound');
    reasonCodes.push('awaitingOfficialConfirmation');
    return {
      verdict: VERDICT.SUPPORTED,
      reasonCodes,
      stats,
      explanation: 'Laporan awal mendukung narasi klaim, namun masih memerlukan konfirmasi independen lanjutan.',
    };
  }

  // Kasus 6: BUKTI BERLAWANAN / TIDAK SEIMBANG (Conflicting Evidence)
  if (stats.supporting > 0 && stats.refuting > 0) {
    reasonCodes.push('conflictingEvidence');
    return {
      verdict: VERDICT.UNVERIFIED,
      reasonCodes,
      stats,
      explanation: 'Terdapat diskrepansi dan perbedaan pernyataan antar sumber; belum dapat ditarik simpulan pasti.',
    };
  }

  // Kasus 7: Bukti hanya bersifat latar belakang / konteks umum
  if (stats.contextual > 0 && stats.supporting === 0 && stats.refuting === 0) {
    reasonCodes.push('onlyContextualEvidence');
    return {
      verdict: VERDICT.UNVERIFIED,
      reasonCodes,
      stats,
      explanation: 'Bukti yang ditemukan sebatas informasi latar belakang, belum mengonfirmasi substansi klaim utama.',
    };
  }

  // Default Fallback
  reasonCodes.push('insufficientEvidenceWeight');
  return {
    verdict: VERDICT.UNVERIFIED,
    reasonCodes,
    stats,
    explanation: 'Bukti yang tersedia saat ini belum cukup untuk membuat simpulan faktual definitif.',
  };
}

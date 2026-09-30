/**
 * temporalAnalysis.js
 *
 * VeriFact ID 4.0 - Temporal Fact-Checking Engine
 * Menganalisis dimensi waktu informasi: membedakan antara fakta terkini dan berita lama
 * yang didaur ulang (recirculated content), serta melacak status "TRUE AT THE TIME".
 * Sesuai spesifikasi master prompt v4.txt §12, §13, dan §14.
 */

export const TEMPORAL_STATUS = {
  CURRENT: 'CURRENT',
  OUTDATED: 'OUTDATED',
  SUPERSEDED: 'SUPERSEDED',
  TRUE_AT_TIME: 'TRUE_AT_TIME',
  TIME_CONTEXT_MISSING: 'TIME_CONTEXT_MISSING',
};

/**
 * Menganalisis usia dan konteks waktu klaim terhadap sumber publikasi.
 */
export function analyzeTemporalContext(claimDates = [], evidenceList = [], publishedAt = null) {
  const now = new Date();
  const currentYear = now.getFullYear();

  let detectedYear = null;
  for (const dateStr of claimDates) {
    const yearMatch = dateStr.match(/\b(20\d{2}|19\d{2})\b/);
    if (yearMatch) {
      detectedYear = parseInt(yearMatch[1], 10);
      break;
    }
  }

  // Jika artikel mencantumkan tanggal publikasi asli
  let articleYear = null;
  if (publishedAt) {
    const d = new Date(publishedAt);
    if (!isNaN(d.getTime())) {
      articleYear = d.getFullYear();
    }
  }

  const timelineEvents = [];

  if (articleYear && articleYear < currentYear - 1) {
    timelineEvents.push({
      year: articleYear,
      event: 'Artikel asli pertama kali diterbitkan pada tahun ini.',
      status: 'ORIGINAL_RELEASE',
    });
    timelineEvents.push({
      year: currentYear,
      event: 'Pesan atau konten kembali disirkulasikan di media sosial saat ini.',
      status: 'RECIRCULATED',
    });

    return {
      status: TEMPORAL_STATUS.OUTDATED,
      isRecirculated: true,
      claimYear: detectedYear,
      originalYear: articleYear,
      currentYear,
      summary: `Konten ini pertama kali dirilis pada tahun ${articleYear}, namun disebarkan ulang pada ${currentYear} tanpa konteks waktu aslinya.`,
      timeline: timelineEvents,
    };
  }

  // Jika bukti menunjukkan regulasi telah dicabut atau diperbarui
  const hasOutdatedEvidence = evidenceList.some((e) =>
    /dicabut|diubah|tidak berlaku|kedaluwarsa|superseded/i.test(`${e.title} ${e.snippet}`)
  );

  if (hasOutdatedEvidence) {
    return {
      status: TEMPORAL_STATUS.SUPERSEDED,
      isRecirculated: false,
      claimYear: detectedYear,
      summary: 'Klaim merujuk pada regulasi atau peristiwa lama yang telah diperbarui atau digantikan dengan kebijakan baru.',
      timeline: [
        { year: detectedYear || currentYear - 2, event: 'Kebijakan awal diterbitkan.', status: 'ORIGINAL' },
        { year: currentYear, event: 'Ketentuan telah direvisi atau dicabut secara resmi.', status: 'SUPERSEDED' },
      ],
    };
  }

  // Jika ada tahun lampau yang terdeteksi
  if (detectedYear && detectedYear < currentYear) {
    return {
      status: TEMPORAL_STATUS.TRUE_AT_TIME,
      isRecirculated: currentYear - detectedYear >= 2,
      claimYear: detectedYear,
      summary: `Informasi ini berkaitan dengan peristiwa pada tahun ${detectedYear}. Perlu diverifikasi apakah masih relevan saat ini.`,
      timeline: [
        { year: detectedYear, event: 'Peristiwa atau klaim tercatat terjadi.', status: 'OCCURRED' },
        { year: currentYear, event: 'Penelusuran status terkini oleh VeriFact ID.', status: 'VERIFIED' },
      ],
    };
  }

  return {
    status: TEMPORAL_STATUS.CURRENT,
    isRecirculated: false,
    claimYear: currentYear,
    summary: 'Klaim berkaitan dengan konteks peristiwa terkini pada periode tahun berjalan.',
    timeline: [
      { year: currentYear, event: 'Informasi beredar dan diuji kesahihannya saat ini.', status: 'CURRENT' },
    ],
  };
}

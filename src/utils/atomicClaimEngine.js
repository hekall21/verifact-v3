/**
 * atomicClaimEngine.js
 *
 * VeriFact ID 4.0 - Atomic Claim Engine
 * Memecah artikel atau klaim majemuk menjadi klaim atomik (propositional claims).
 * Menghubungkan setiap klaim atomik ke bukti spesifik dan menghitung status individual.
 * Sesuai spesifikasi v4.txt §03 dan §04.
 */

const CONJUNCTIONS_ID = [
  ' dan ', ' serta ', ' tetapi ', ' tapi ', ' namun ', ' sedangkan ', ' sementara ',
  ' melainkan ', ' padahal ', ' bahwa ', ' sehingga ', ' akibatnya ', ' dengan cara ',
  ' melalui ', ' lewat ', ' bagi ', ' untuk '
];

const CONJUNCTIONS_EN = [
  ' and ', ' but ', ' however ', ' while ', ' whereas ', ' that ', ' so that ',
  ' through ', ' via ', ' by means of '
];

/**
 * Memecah kalimat atau paragraf menjadi klaim atomik mandiri.
 */
export function decomposeIntoAtomicClaims(text = '', entities = {}, amounts = [], dates = []) {
  const cleanInput = String(text || '').trim();
  if (!cleanInput) return [];

  // 1. Pecah teks berdasarkan tanda baca akhir kalimat
  const rawSentences = cleanInput
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const candidateChunks = [];

  for (const sentence of rawSentences) {
    let subClauses = [sentence];

    // Pecah berdasarkan kata hubung majemuk
    for (const conj of [...CONJUNCTIONS_ID, ...CONJUNCTIONS_EN]) {
      const nextClauses = [];
      for (const clause of subClauses) {
        if (clause.length > 25 && clause.toLowerCase().includes(conj)) {
          const parts = clause.split(new RegExp(conj, 'i')).map((p) => p.trim()).filter((p) => p.length > 6);
          nextClauses.push(...parts);
        } else {
          nextClauses.push(clause);
        }
      }
      subClauses = nextClauses;
    }

    candidateChunks.push(...subClauses);
  }

  // Jika kalimat sangat pendek dan tidak terpecah, jadikan 1 klaim atomik
  const filteredChunks = candidateChunks.length > 0 ? candidateChunks : [cleanInput];

  // Batasi klaim atomik maksimal 5 agar analisis tetap fokus dan tidak membingungkan
  const atomicList = filteredChunks.slice(0, 5).map((chunk, index) => {
    // Normalisasi teks klaim atomik: pastikan diawali huruf kapital dan diakhiri titik
    let formattedText = chunk.charAt(0).toUpperCase() + chunk.slice(1);
    if (!formattedText.endsWith('.')) formattedText += '.';

    // Cari apakah ada entitas, nominal, atau tanggal yang relevan dengan klaim atomik ini
    const lowerChunk = chunk.toLowerCase();
    const matchedAmounts = amounts.filter((amt) => lowerChunk.includes(amt.toLowerCase()));
    const matchedDates = dates.filter((d) => lowerChunk.includes(d.toLowerCase()));

    return {
      id: `claim-${index + 1}`,
      index: index + 1,
      text: formattedText,
      amounts: matchedAmounts,
      dates: matchedDates,
      status: 'UNPROVEN', // Default status: 'SUPPORTED' | 'REFUTED' | 'UNPROVEN' | 'CONTEXT_CHANGED'
      confidence: 0,
      evidenceIds: [],
      reasoning: '',
    };
  });

  return atomicList;
}

/**
 * Mengevaluasi status setiap klaim atomik terhadap kumpulan bukti (evidence list).
 */
export function evaluateAtomicClaims(atomicClaims = [], evidenceList = []) {
  if (!atomicClaims.length) return [];

  return atomicClaims.map((claim) => {
    const claimLower = claim.text.toLowerCase();
    const matchedEvidences = [];

    let supportsWeight = 0;
    let refutesWeight = 0;
    let contextWeight = 0;

    for (const ev of evidenceList) {
      const evText = `${ev.title || ''} ${ev.excerpt || ''} ${ev.snippet || ''}`.toLowerCase();

      // Cek apakah ada kata kunci atau sub-frasa yang bersesuaian
      const words = claimLower
        .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const matchHits = words.filter((w) => evText.includes(w)).length;
      const matchRatio = words.length > 0 ? matchHits / words.length : 0;

      if (matchRatio >= 0.3 || (claim.amounts.length && claim.amounts.some((a) => evText.includes(a.toLowerCase())))) {
        matchedEvidences.push(ev);

        const weight = ev.tier === 1 ? 1.0 : ev.tier === 3 ? 0.9 : 0.6;
        if (ev.stance === 'supports') supportsWeight += weight;
        else if (ev.stance === 'refutes') refutesWeight += weight;
        else if (ev.stance === 'context') contextWeight += weight;
      }
    }

    let status = 'UNPROVEN';
    let reasoning = 'Belum ditemukan bukti kredibel spesifik yang memverifikasi pernyataan ini.';

    if (refutesWeight > 0 && refutesWeight >= supportsWeight) {
      status = 'REFUTED';
      reasoning = 'Pernyataan ini dibantah oleh bukti atau klarifikasi resmi yang ditemukan.';
    } else if (supportsWeight > 0 && supportsWeight > refutesWeight) {
      status = 'SUPPORTED';
      reasoning = 'Pernyataan ini terkonfirmasi dan didukung oleh dokumen atau laporan resmi.';
    } else if (contextWeight > 0) {
      status = 'CONTEXT_CHANGED';
      reasoning = 'Konteks informasi ini telah berubah atau merujuk pada peristiwa terdahulu.';
    }

    return {
      ...claim,
      status,
      confidence: Math.min(95, Math.round((supportsWeight + refutesWeight) * 35) || 50),
      evidenceIds: matchedEvidences.map((e) => e.id),
      reasoning,
    };
  });
}

/**
 * Menghasilkan kesimpulan keseluruhan dari evaluasi klaim atomik.
 */
export function synthesizeOverallVerdict(evaluatedClaims = []) {
  if (!evaluatedClaims.length) {
    return { verdict: 'UNPROVEN', summary: 'Klaim tidak dapat dievaluasi.' };
  }

  const supported = evaluatedClaims.filter((c) => c.status === 'SUPPORTED').length;
  const refuted = evaluatedClaims.filter((c) => c.status === 'REFUTED').length;
  const contextChanged = evaluatedClaims.filter((c) => c.status === 'CONTEXT_CHANGED').length;
  const total = evaluatedClaims.length;

  if (refuted === total) {
    return {
      verdict: 'HOAX',
      summary: 'Seluruh klaim spesifik terbukti tidak benar berdasarkan verifikasi bukti.',
    };
  }

  if (supported === total) {
    return {
      verdict: 'FACT',
      summary: 'Seluruh klaim spesifik terkonfirmasi benar oleh sumber resmi primer.',
    };
  }

  if (refuted > 0 && supported > 0) {
    return {
      verdict: 'PARTLY_TRUE',
      summary: 'Sebagian informasi benar, namun terdapat poin krusial yang keliru atau dibantah.',
    };
  }

  if (contextChanged > 0) {
    return {
      verdict: 'MISLEADING',
      summary: 'Informasi disebarkan di luar konteks waktu atau tempat peristiwa aslinya.',
    };
  }

  return {
    verdict: 'UNPROVEN',
    summary: 'Bukti yang tersedia saat ini belum cukup untuk menyimpulkan seluruh klaim.',
  };
}

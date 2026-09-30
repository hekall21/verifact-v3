/**
 * src/services/analysisService.js
 *
 * VeriFact ID 4.1 — Evidence Intelligence Platform
 * Orchestrator Utama Pipeline Verifikasi Fakta
 *
 * Pembaruan Krusial v4.1 (§Part 1, §Part 2, §Part 3, §Part 5, §Part 7, §Part 8, §Part 15, §Part 20, §Part 21):
 * 1. Membaca artikel melalui Backend Article Fetcher.
 * 2. Jika artikel tidak dapat dibaca: JANGAN MENGARANG, kembalikan SOURCE_CONTENT_UNAVAILABLE.
 * 3. Jika artikel berhasil dibaca: ekstrak klaim dari isi artikel (bukan raw URL).
 * 4. Konsistensi Trending & AI Analysis via shared verificationRepository.
 * 5. Eksekusi query generated secara nyata (Support & Refute query).
 * 6. Provider isolation & pemisahan sinyal pattern corpus dari bukti faktual.
 */

import { classifyInput } from '../utils/urlDetector.js';
import {
  extractClaim,
  extractAmounts,
  extractDates,
  extractLocations,
  extractKeywords,
  detectStyleMarkers,
} from '../utils/claimExtractor.js';
import { decomposeIntoAtomicClaims, evaluateAtomicClaims, synthesizeOverallVerdict } from '../utils/atomicClaimEngine.js';
import { generateVerificationQueries } from './queryGenerator.js';
import { gatherEvidenceFromAllProviders } from './evidenceProviders.js';
import { clusterSources } from '../utils/sourceClustering.js';
import { detectEvidenceConflicts } from '../utils/conflictDetector.js';
import { analyzeTemporalContext } from '../utils/temporalAnalysis.js';
import { generateVerificationId, computeReportHash } from '../utils/reportIntegrity.js';
import { computeConfidence } from '../utils/sourceScoring.js';
import { fetchAndExtractArticle } from './articleService.js';
import { determineVerdict, VERDICT } from '../utils/verdict.js';
import { findVerificationRecord, saveVerificationRecord } from './verificationRepository.js';

export async function runVerification(rawInput, onProgressOrOptions, options = {}) {
  let onProgress = typeof onProgressOrOptions === 'function' ? onProgressOrOptions : null;
  let opts = typeof onProgressOrOptions === 'object' && onProgressOrOptions !== null
    ? { ...onProgressOrOptions, ...options }
    : { ...options };

  let actualInput = rawInput;
  if (typeof rawInput === 'object' && rawInput !== null) {
    opts = { ...rawInput, ...opts };
    actualInput = rawInput.claimText || rawInput.text || rawInput.query || rawInput.rawInput || '';
  }

  const timestamp = new Date().toISOString();
  const verificationId = generateVerificationId('VF-2026');

  // LANGKAH 1: Klasifikasi Format Input
  if (onProgress) onProgress(1);
  const classification = classifyInput(actualInput);

  if (classification.kind === 'empty') {
    return { ok: false, error: 'empty' };
  }

  if (classification.kind === 'invalid-url') {
    return {
      ok: false,
      error: 'invalid-url',
      classification,
      inputKind: 'invalid-url',
    };
  }

  // LANGKAH 2: Pengambilan Konten Artikel (Jika URL) atau Teks Bebas
  if (onProgress) onProgress(2);
  let urlInfo = null;
  let textToAnalyze = String(actualInput).trim();
  let contentRetrieved = false;
  let sourceInaccessible = false;
  let articleMetadata = null;

  if (classification.kind === 'url') {
    const article = await fetchAndExtractArticle(rawInput);
    urlInfo = article;

    // Jika artikel TIDAK DAPAT DIBACA: JANGAN MENGARANG!
    if (!article.ok || !article.content?.text) {
      sourceInaccessible = true;
      contentRetrieved = false;

      return {
        ok: true,
        version: '4.1.0',
        verificationId,
        timestamp,
        inputKind: 'url',
        rawInput,
        urlInfo: article,
        sourceInaccessible: true,
        contentRetrieved: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        verdict: VERDICT.UNVERIFIABLE,
        reasonKey: 'sourceContentUnavailable',
        reasonCodes: ['sourceContentUnavailable'],
        claim: {
          mainClaim: 'Konten artikel pada tautan ini tidak dapat diakses secara langsung',
          sentences: [],
          entities: [],
          amounts: [],
          dates: [],
          locations: [],
          styleMarkers: [],
          keywords: [],
        },
        atomicClaims: [],
        generatedQueries: [],
        evidence: [],
        sourceClusters: [],
        conflictAnalysis: { hasConflict: false },
        temporalAnalysis: { isCurrent: true, label: 'Waktu Tidak Diketahui' },
        confidence: {
          score: 0,
          level: 'low',
          label: 'TIDAK TERSEDIA',
          sourceCoverage: 'None',
          primarySourcesCount: 0,
          independentClustersCount: 0,
        },
        honestNotice: {
          title: 'ARTIKEL TIDAK DAPAT DIBACA',
          message: 'Kami berhasil mengenali URL ini, tetapi isi artikel tidak dapat diakses. Karena isi sumber tidak berhasil dibaca, VeriFact tidak akan membuat kesimpulan berdasarkan URL saja.',
          actionSuggestions: [
            'Tempelkan teks pernyataan / klaim langsung ke kolom pencarian',
            'Salin dan tempel paragraf isi artikel secara manual',
          ],
        },
        limitations: [
          'Isi artikel tidak dapat diambil oleh mesin perayap (CORS, proteksi bot, atau tautan tertutup).',
          'Sistem menolak membuat kesimpulan verifikasi spekulatif hanya dari alamat tautan.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL.' },
          { step: 2, title: 'Source Retrieval', detail: 'Pengambilan artikel gagal / dibatasi (SOURCE_CONTENT_UNAVAILABLE).' },
          { step: 3, title: 'Honest Fallback', detail: 'VeriFact menghentikan analisis agar tidak menghasilkan halusinasi spekulatif.' },
        ],
        methodology: {
          engine: 'VeriFact Evidence Intelligence Engine 4.1',
          standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
        },
      };
    }

    // Artikel BERHASIL diambil: Ekstrak dari ISI ARTIKEL
    contentRetrieved = true;
    articleMetadata = article.source;
    // Gunakan judul artikel + ringkasan + teks tubuh artikel
    const fullArticleContent = `${article.source.title || ''}. ${article.source.description || ''}\n\n${article.content.text}`;
    textToAnalyze = fullArticleContent;
  } else {
    contentRetrieved = true;
  }

  // LANGKAH 3: Ekstraksi Klaim & Dekomposisi Klaim Atomik (§Part 2)
  if (onProgress) onProgress(3);

  // Jika berasal dari URL, utamakan title dan paragraf awal artikel untuk claim extraction
  const claimSourceText = articleMetadata
    ? `${articleMetadata.title || ''}. ${textToAnalyze.slice(0, 1500)}`
    : textToAnalyze;

  const claimStructure = extractClaim(claimSourceText);

  // Jika input dari URL, pasang mainClaim yang representatif dari judul artikel
  if (articleMetadata && articleMetadata.title) {
    claimStructure.mainClaim = articleMetadata.title;
  }

  const entitiesList = [
    ...(claimStructure.entities.organizations || []),
    ...(claimStructure.entities.people || []),
  ];
  const amounts = claimStructure.amounts || [];
  const dates = claimStructure.dates || [];
  const locations = claimStructure.entities.locations || [];
  const styleMarkers = claimStructure.styleMarkers || [];
  const keywords = claimStructure.keywords || [];

  // Dekomposisi Klaim Atomik
  const atomicClaims = decomposeIntoAtomicClaims(
    claimStructure.mainClaim || textToAnalyze.slice(0, 200),
    claimStructure.entities,
    amounts,
    dates
  );

  // Generasi Multi-Query Cerdas (Support & Refute Queries)
  const generatedQueries = generateVerificationQueries(
    claimStructure.mainClaim || textToAnalyze.slice(0, 200),
    atomicClaims,
    entitiesList,
    dates
  );

  // LANGKAH 4: Konsistensi Trending & Penelusuran Multi-Provider (§Part 3 & §Part 5)
  if (onProgress) onProgress(4);

  // Periksa apakah klaim ini sudah memiliki record di repositori verifikasi bersama
  const existingRepoCheck = findVerificationRecord(claimStructure.mainClaim, opts.claimId);
  let priorFactCheckRecord = null;
  let sourceAttributionNotice = null;

  if (existingRepoCheck && existingRepoCheck.record) {
    priorFactCheckRecord = existingRepoCheck.record;
    sourceAttributionNotice = `Pemeriksaan sebelumnya dari sumber rujukan (${priorFactCheckRecord.sourceAttribution}) menyimpulkan status klaim ini.`;
  }

  // Kumpulkan bukti dari seluruh provider (FactCheck, Official, News, Web)
  const providerResults = await gatherEvidenceFromAllProviders(
    claimStructure.mainClaim || textToAnalyze.slice(0, 200),
    {
      urlInfo,
      hasMalwarePattern: styleMarkers.length > 2,
      claimId: opts.claimId,
    },
    generatedQueries
  );

  const gatheredEvidences = providerResults.evidence || [];
  const patternSignals = providerResults.patternSignals || [];

  // Jika ada record existing dari fact-check repo, pastikan buktinya disatukan
  if (priorFactCheckRecord && priorFactCheckRecord.evidence) {
    for (const ev of priorFactCheckRecord.evidence) {
      if (!gatheredEvidences.some((ge) => ge.id === ev.id || ge.url === ev.url)) {
        gatheredEvidences.unshift(ev);
      }
    }
  }

  // LANGKAH 5: Klasterisasi Sumber & Evaluasi Klaim Atomik
  if (onProgress) onProgress(5);
  const sourceClusters = clusterSources(gatheredEvidences);
  const evaluatedAtomicClaims = evaluateAtomicClaims(atomicClaims, gatheredEvidences);

  // LANGKAH 6: Deteksi Konflik & Analisis Linimasa Temporal
  if (onProgress) onProgress(6);
  const conflictAnalysis = detectEvidenceConflicts(gatheredEvidences);
  const temporalAnalysis = analyzeTemporalContext(dates, gatheredEvidences, urlInfo?.source?.publishedAt);

  // LANGKAH 7: Sintesis Kesimpulan Keseluruhan (Verdict Priority §Part 8)
  if (onProgress) onProgress(7);
  const atomicSynthesis = synthesizeOverallVerdict(evaluatedAtomicClaims);

  // Prioritas: Jika ada existing fact check yang cocok kuat, gunakan priorVerdict
  const priorVerdictToUse = priorFactCheckRecord?.verdict || atomicSynthesis.verdict;

  const verdictResult = determineVerdict({
    evidence: gatheredEvidences,
    contentRetrieved,
    evidenceSearchPerformed: true,
    priorVerdict: priorVerdictToUse,
  });

  // Kalkulasi Keyakinan
  const confidenceResult = computeConfidence({
    verdict: verdictResult.verdict,
    evidence: gatheredEvidences,
    stats: verdictResult.stats,
    contentRetrieved,
    evidenceSearchPerformed: true,
  });

  // Tentukan cakupan sumber (Source Coverage)
  let sourceCoverage = 'Low';
  if (sourceClusters.length >= 3 || gatheredEvidences.length >= 4) {
    sourceCoverage = 'High';
  } else if (sourceClusters.length >= 2 || gatheredEvidences.length >= 2) {
    sourceCoverage = 'Medium';
  }

  // Daftarkan Batasan Jujur Sistem (Transparent Limitations)
  const limitations = [
    'Penilaian dilakukan berdasarkan data dan bukti yang berhasil diakses pada saat pemeriksaan.',
    'Konten media sosial privat atau grup percakapan tertutup tidak dapat diakses secara langsung.',
    'Pemeriksaan tidak menyimpulkan motif personal pihak terkait di luar bukti pernyataan resmi.',
  ];

  if (patternSignals.length > 0) {
    limitations.push('Sinyal pola penipuan terdeteksi sebagai pengingat kewaspadaan awal, bukan vonis mutlak.');
  }

  if (providerResults.hasPartialFailure) {
    limitations.push('Beberapa kanal bukti mengalami perlambatan jaringan (partial verification).');
  }

  // Audit Trail Langkah Kerja Sistem ("Show Your Work")
  const auditTrail = [
    { step: 1, title: 'Input Classification', detail: `Format masukan terdeteksi sebagai: ${classification.kind.toUpperCase()}` },
    { step: 2, title: 'Source Retrieval', detail: classification.kind === 'url' ? 'Berhasil mengambil teks artikel dan metadata via Backend Fetcher.' : 'Teks langsung diproses untuk dekomposisi klaim.' },
    { step: 3, title: 'Claim & Query Extraction', detail: `Mengekstrak ${atomicClaims.length} klaim atomik dan membuat ${generatedQueries.length} query pencarian (Support + Refute).` },
    { step: 4, title: 'Evidence Retrieval', detail: `Ditemukan ${gatheredEvidences.length} bukti dari kanal resmi dan arsip periksa fakta.` },
    { step: 5, title: 'Source Independence Clustering', detail: `Dikelompokkan menjadi ${sourceClusters.length} kluster sumber independen.` },
    { step: 6, title: 'Conflict & Temporal Check', detail: conflictAnalysis.hasConflict ? 'Terdeteksi diskrepansi antar sumber.' : 'Arah kesimpulan sumber konsisten.' },
    { step: 7, title: 'Verdict Synthesis', detail: `Status verifikasi disintesis menjadi: ${verdictResult.verdict}` },
  ];

  // Simpan record baru ke Shared Verification Repository
  const newVerificationRecord = {
    claimId: opts.claimId || `VF-${Date.now()}`,
    claimText: claimStructure.mainClaim || textToAnalyze.slice(0, 150),
    verdict: verdictResult.verdict,
    publishedAt: new Date().toISOString().slice(0, 10),
    lastVerifiedAt: new Date().toISOString().slice(0, 10),
    verificationId,
    sourceAttribution: priorFactCheckRecord?.sourceAttribution || 'VeriFact Evidence Registry',
    summary: claimStructure.mainClaim,
    evidence: gatheredEvidences,
  };
  saveVerificationRecord(newVerificationRecord);

  // Hitung Report Hash SHA-256
  const reportPayload = {
    verificationId,
    claim: { mainClaim: claimStructure.mainClaim },
    verdict: verdictResult.verdict,
    confidence: confidenceResult,
    timestamp,
  };
  const reportHash = await computeReportHash(reportPayload);

  return {
    ok: true,
    version: '4.1.0',
    verificationId,
    reportHash,
    timestamp,
    inputKind: classification.kind,
    rawInput,
    urlInfo,
    sourceInaccessible: false,
    contentRetrieved: true,
    claim: {
      mainClaim: claimStructure.mainClaim || textToAnalyze.slice(0, 200),
      sentences: claimStructure.sentences,
      entities: entitiesList,
      amounts,
      dates,
      locations,
      styleMarkers,
      keywords,
    },
    atomicClaims: evaluatedAtomicClaims,
    generatedQueries,
    evidence: gatheredEvidences,
    sourceClusters,
    conflictAnalysis,
    temporalAnalysis,
    verdict: verdictResult.verdict,
    reasonKey: verdictResult.reasonKey,
    reasonCodes: verdictResult.reasonCodes,
    stats: verdictResult.stats,
    confidence: {
      ...confidenceResult,
      sourceCoverage,
      primarySourcesCount: gatheredEvidences.filter((e) => e.tier === 1).length,
      independentClustersCount: sourceClusters.length,
    },
    sourceAttributionNotice,
    reusedVerification: Boolean(priorFactCheckRecord),
    patternSignals,
    limitations,
    auditTrail,
    methodology: {
      engine: 'VeriFact Evidence Intelligence Engine 4.1',
      standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
    },
  };
}

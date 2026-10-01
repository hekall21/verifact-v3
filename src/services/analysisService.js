/**
 * src/services/analysisService.js
 *
 * VeriFact ID 4.2 — Evidence Intelligence Platform
 * Orchestrator Utama Pipeline Verifikasi Fakta
 *
 * Fitur & Standar Kritis v4.2:
 * 1. Pipeline State Machine:
 *    - classifying -> retrieving-source -> extracting-content -> extracting-claims
 *    - searching-evidence -> comparing-evidence -> building-verdict -> completed
 * 2. News Homepage Detection:
 *    Jika URL adalah domain/homepage berita (mis. https://www.detik.com/),
 *    sistem menolak menganggapnya artikel dan memberikan panduan jujur.
 * 3. Jika artikel tidak dapat dibaca: JANGAN MENGARANG, kembalikan SOURCE_CONTENT_UNAVAILABLE.
 * 4. Verdict berasal dari: article content + claim extraction + evidence + source comparison (BUKAN DARI URL!).
 * 5. Multi-Query Execution (Support & Refute Queries nyata).
 * 6. Provider Isolation (kegagalan satu provider tidak membuat proses macet).
 * 7. Konsistensi Trending & AI Analysis via shared verificationRepository.
 * 8. Pemisahan tegas antara Analysis Progress, Confidence Score, dan Verdict.
 */

import { classifyInput, isNewsHomepageUrl } from '../utils/urlDetector.js';
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

export const PIPELINE_STATES = {
  CLASSIFYING: { step: 1, state: 'classifying', label: 'Mengenali format input' },
  RETRIEVING_SOURCE: { step: 2, state: 'retrieving-source', label: 'Mengambil sumber / validasi tautan' },
  EXTRACTING_CONTENT: { step: 3, state: 'extracting-content', label: 'Membaca isi dan metadata' },
  EXTRACTING_CLAIMS: { step: 4, state: 'extracting-claims', label: 'Mengekstrak klaim atomik' },
  SEARCHING_EVIDENCE: { step: 5, state: 'searching-evidence', label: 'Mencari bukti dari multi-provider' },
  COMPARING_EVIDENCE: { step: 6, state: 'comparing-evidence', label: 'Membandingkan bukti & kluster independensi' },
  BUILDING_VERDICT: { step: 7, state: 'building-verdict', label: 'Menyusun kesimpulan & keyakinan' },
  COMPLETED: { step: 7, state: 'completed', label: 'Analisis selesai' },
  FAILED: { step: 0, state: 'failed', label: 'Analisis gagal' },
};

export async function runVerification(rawInput, onProgressOrOptions, options = {}) {
  let onProgress = typeof onProgressOrOptions === 'function' ? onProgressOrOptions : null;
  let opts = typeof onProgressOrOptions === 'object' && onProgressOrOptions !== null
    ? { ...onProgressOrOptions, ...options }
    : { ...options };

  const notifyProgress = (stateObj) => {
    if (onProgress) {
      try {
        onProgress(stateObj.step, stateObj);
      } catch {
        // Safe progression
      }
    }
  };

  let actualInput = rawInput;
  if (typeof rawInput === 'object' && rawInput !== null) {
    opts = { ...rawInput, ...opts };
    actualInput = rawInput.claimText || rawInput.text || rawInput.query || rawInput.rawInput || '';
  }

  const timestamp = new Date().toISOString();
  const verificationId = generateVerificationId('VF-2026');

  // LANGKAH 1: Mengenali format input
  notifyProgress(PIPELINE_STATES.CLASSIFYING);
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

  // LANGKAH 2 & 3: Mengambil sumber & Membaca isi
  notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
  let urlInfo = null;
  let textToAnalyze = String(actualInput).trim();
  let contentRetrieved = false;
  let sourceInaccessible = false;
  let articleMetadata = null;

  if (classification.kind === 'url') {
    const article = await fetchAndExtractArticle(rawInput);
    urlInfo = article;

    // KASUS KHUSUS 1: NEWS HOMEPAGE (Detik.com, Kompas.com, dll.)
    if (article.status === 'NEWS_HOMEPAGE_DETECTED' || article.isHomepage) {
      notifyProgress(PIPELINE_STATES.COMPLETED);
      return {
        ok: true,
        version: '4.2.0',
        verificationId,
        timestamp,
        inputKind: 'url',
        rawInput,
        urlInfo: article,
        isNewsHomepage: true,
        sourceInaccessible: true,
        contentRetrieved: false,
        status: 'NEWS_HOMEPAGE_DETECTED',
        verdict: 'NEWS_HOMEPAGE_DETECTED',
        reasonKey: 'newsHomepageDetected',
        reasonCodes: ['newsHomepageDetected'],
        claim: null,
        atomicClaims: [],
        generatedQueries: [],
        evidence: [],
        sourceClusters: [],
        conflictAnalysis: { hasConflict: false },
        temporalAnalysis: { isCurrent: true, label: 'Waktu Tidak Diketahui' },
        confidence: null,
        honestNotice: {
          title: 'HALAMAN UTAMA MEDIA TERDETEKSI',
          domain: article.domain,
          message: article.message || `DOMAIN TERDETEKSI: ${article.domain}. Ini adalah halaman utama situs berita, bukan URL artikel tertentu. Untuk analisis berita, masukkan URL artikel spesifik.`,
          actionSuggestions: [
            'Buka artikel berita spesifik dan salin tautannya',
            'Tempel teks judul atau isi artikel langsung ke kolom verifikasi',
          ],
        },
        limitations: [
          'Halaman depan portal berita memuat ratusan judul artikel dinamis yang selalu diperbarui.',
          'Pemeriksaan fakta akurat membutuhkan URL artikel spesifik atau isi teks yang ingin diverifikasi.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL web.' },
          { step: 2, title: 'Domain Inspection', detail: `Terdeteksi sebagai beranda situs berita (${article.domain}).` },
          { step: 3, title: 'Honest Guidance', detail: 'Sistem meminta tautan artikel spesifik dan tidak membuat vonis spekulatif.' },
        ],
        methodology: {
          engine: 'VeriFact Evidence Intelligence Engine 4.2',
          standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
        },
      };
    }

    // KASUS KHUSUS 2: ARTIKEL TIDAK DAPAT DIAKSES
    if (!article.ok || !article.content?.text) {
      sourceInaccessible = true;
      contentRetrieved = false;
      notifyProgress(PIPELINE_STATES.COMPLETED);

      return {
        ok: true,
        version: '4.2.0',
        verificationId,
        timestamp,
        inputKind: 'url',
        rawInput,
        urlInfo: article,
        sourceInaccessible: true,
        contentRetrieved: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        verdict: 'SOURCE_CONTENT_UNAVAILABLE',
        reasonKey: 'sourceContentUnavailable',
        reasonCodes: ['sourceContentUnavailable'],
        claim: null,
        atomicClaims: [],
        generatedQueries: [],
        evidence: [],
        sourceClusters: [],
        conflictAnalysis: { hasConflict: false },
        temporalAnalysis: { isCurrent: true, label: 'Waktu Tidak Diketahui' },
        confidence: null,
        honestNotice: {
          title: 'SOURCE CONTENT UNAVAILABLE',
          domain: article.domain || 'Sumber Eksternal',
          message: article.message || 'Artikel terdeteksi, tetapi isi halaman belum berhasil dibaca oleh server. Alasan: Request timeout / bot protection / JavaScript rendering / extraction failure.',
          actionSuggestions: [
            'Tempel teks artikel',
            'Coba lagi (Retry)',
            'Masukkan URL artikel lain',
          ],
        },
        limitations: [
          'Isi artikel tidak dapat diambil oleh mesin perayap (CORS, proteksi bot, atau tautan tertutup).',
          'Sistem menolak membuat kesimpulan verifikasi spekulatif tanpa isi artikel yang terbaca.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL.' },
          { step: 2, title: 'Source Retrieval', detail: 'Pengambilan artikel belum berhasil (SOURCE_CONTENT_UNAVAILABLE).' },
          { step: 3, title: 'Honest Fallback', detail: 'VeriFact menghentikan analisis agar tidak menghasilkan klaim palsu atau kesimpulan spekulatif.' },
        ],
        methodology: {
          engine: 'VeriFact Evidence Intelligence Engine 4.2',
          standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
        },
      };
    }

    // Artikel BERHASIL diambil
    notifyProgress(PIPELINE_STATES.EXTRACTING_CONTENT);
    contentRetrieved = true;
    articleMetadata = article.source;
    const fullArticleContent = `${article.source.title || ''}. ${article.source.description || ''}\n\n${article.content.text}`;
    textToAnalyze = fullArticleContent;
  } else {
    notifyProgress(PIPELINE_STATES.EXTRACTING_CONTENT);
    contentRetrieved = true;
  }

  // LANGKAH 4: Mengekstrak klaim & Dekomposisi Klaim Atomik
  notifyProgress(PIPELINE_STATES.EXTRACTING_CLAIMS);

  const claimSourceText = articleMetadata
    ? `${articleMetadata.title || ''}. ${textToAnalyze.slice(0, 1500)}`
    : textToAnalyze;

  const claimStructure = extractClaim(claimSourceText);

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

  const atomicClaims = decomposeIntoAtomicClaims(
    claimStructure.mainClaim || textToAnalyze.slice(0, 200),
    claimStructure.entities,
    amounts,
    dates
  );

  const generatedQueries = generateVerificationQueries(
    claimStructure.mainClaim || textToAnalyze.slice(0, 200),
    atomicClaims,
    entitiesList,
    dates
  );

  // LANGKAH 5: Mencari bukti dari multi-provider (Support & Refute Queries)
  notifyProgress(PIPELINE_STATES.SEARCHING_EVIDENCE);

  const existingRepoCheck = findVerificationRecord(claimStructure.mainClaim, opts.claimId);
  let priorFactCheckRecord = null;
  let sourceAttributionNotice = null;

  if (existingRepoCheck && existingRepoCheck.record) {
    priorFactCheckRecord = existingRepoCheck.record;
    sourceAttributionNotice = `Pemeriksaan sebelumnya dari sumber rujukan (${priorFactCheckRecord.sourceAttribution}) menyimpulkan status klaim ini.`;
  }

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

  if (priorFactCheckRecord && priorFactCheckRecord.evidence) {
    for (const ev of priorFactCheckRecord.evidence) {
      if (!gatheredEvidences.some((ge) => ge.id === ev.id || ge.url === ev.url)) {
        gatheredEvidences.unshift(ev);
      }
    }
  }

  // LANGKAH 6: Membandingkan bukti & Kluster independensi
  notifyProgress(PIPELINE_STATES.COMPARING_EVIDENCE);
  const sourceClusters = clusterSources(gatheredEvidences);
  const evaluatedAtomicClaims = evaluateAtomicClaims(atomicClaims, gatheredEvidences);
  const conflictAnalysis = detectEvidenceConflicts(gatheredEvidences);
  const temporalAnalysis = analyzeTemporalContext(dates, gatheredEvidences, urlInfo?.source?.publishedAt);

  // LANGKAH 7: Menyusun kesimpulan & keyakinan
  notifyProgress(PIPELINE_STATES.BUILDING_VERDICT);
  const atomicSynthesis = synthesizeOverallVerdict(evaluatedAtomicClaims);
  const priorVerdictToUse = priorFactCheckRecord?.verdict || atomicSynthesis.verdict;

  const verdictResult = determineVerdict({
    evidence: gatheredEvidences,
    contentRetrieved,
    evidenceSearchPerformed: true,
    priorVerdict: priorVerdictToUse,
  });

  const confidenceResult = computeConfidence({
    verdict: verdictResult.verdict,
    evidence: gatheredEvidences,
    stats: verdictResult.stats,
    contentRetrieved,
    evidenceSearchPerformed: true,
    priorFactCheck: Boolean(priorFactCheckRecord),
  });

  let sourceCoverage = 'Low';
  if (sourceClusters.length >= 3 || gatheredEvidences.length >= 4) {
    sourceCoverage = 'High';
  } else if (sourceClusters.length >= 2 || gatheredEvidences.length >= 2) {
    sourceCoverage = 'Medium';
  }

  const limitations = [
    'Penilaian dilakukan secara objektif berdasarkan bukti independen yang berhasil diverifikasi.',
    'Konten media sosial tertutup atau pesan instan privat tidak dapat diakses secara publik.',
    'Pemeriksaan tidak menyimpulkan motif personal pihak terkait di luar bukti pernyataan resmi.',
  ];

  if (patternSignals.length > 0) {
    limitations.push('Sinyal pola penipuan terdeteksi sebagai pengingat kewaspadaan awal, bukan vonis mutlak.');
  }

  if (providerResults.hasPartialFailure) {
    limitations.push('Beberapa kanal bukti eksternal mengalami perlambatan atau belum dikonfigurasi API resminya.');
  }

  const auditTrail = [
    { step: 1, title: 'Input Classification', detail: `Format masukan terdeteksi sebagai: ${classification.kind.toUpperCase()}` },
    { step: 2, title: 'Source Retrieval', detail: classification.kind === 'url' ? 'Berhasil mengambil teks artikel dan metadata via Multi-Strategy Extractor.' : 'Teks langsung diproses untuk dekomposisi klaim.' },
    { step: 3, title: 'Claim & Query Extraction', detail: `Mengekstrak ${atomicClaims.length} klaim atomik dan membuat ${generatedQueries.length} query pencarian (Support + Refute).` },
    { step: 4, title: 'Evidence Retrieval', detail: `Ditemukan ${gatheredEvidences.length} bukti terverifikasi dari kanal resmi dan pemeriksa fakta.` },
    { step: 5, title: 'Source Independence Clustering', detail: `Dikelompokkan menjadi ${sourceClusters.length} kluster sumber independen.` },
    { step: 6, title: 'Conflict & Temporal Check', detail: conflictAnalysis.hasConflict ? 'Terdeteksi diskrepansi antar sumber.' : 'Arah kesimpulan sumber konsisten.' },
    { step: 7, title: 'Verdict Synthesis', detail: `Status verifikasi disintesis menjadi: ${verdictResult.verdict}` },
  ];

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

  const reportPayload = {
    verificationId,
    claim: { mainClaim: claimStructure.mainClaim },
    verdict: verdictResult.verdict,
    confidence: confidenceResult,
    timestamp,
  };
  const reportHash = await computeReportHash(reportPayload);

  notifyProgress(PIPELINE_STATES.COMPLETED);

  return {
    ok: true,
    version: '4.2.0',
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
    status: verdictResult.verdict,
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
      engine: 'VeriFact Evidence Intelligence Engine 4.2',
      standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
    },
  };
}

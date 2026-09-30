/**
 * analysisService.js
 *
 * VeriFact ID 4.0 — Evidence Intelligence Platform
 * Orchestrator Utama Pipeline Verifikasi Fakta 12 Langkah
 * Mengintegrasikan:
 *   - Input Classification & Content Retrieval
 *   - Atomic Claim Decomposition (§03)
 *   - Multi-Query Generation (§06)
 *   - Evidence Provider Abstraction (§05)
 *   - Source Normalization & Multi-Factor Quality (§07, §08)
 *   - Source Independence & Clustering (§09, §10)
 *   - Temporal Fact Checking & "True At The Time" (§12, §13)
 *   - Conflict Detection Engine (§22)
 *   - Verification ID & Cryptographic Report Hash (§25, §27)
 *   - Confidence 2.0 & Transparent Limitations (§32, §59)
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
import { determineVerdict } from '../utils/verdict.js';

export async function runVerification(rawInput, onProgress) {
  const timestamp = new Date().toISOString();
  const verificationId = generateVerificationId('VF-2026');

  // LANGKAH 1: Klasifikasi Format Input
  if (onProgress) onProgress(1);
  const classification = classifyInput(rawInput);

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

  // LANGKAH 2: Pengambilan Konten & Ekstraksi Klaim Awal
  if (onProgress) onProgress(2);
  let urlInfo = null;
  let textToAnalyze = String(rawInput).trim();
  let contentRetrieved = false;
  let sourceInaccessible = false;

  if (classification.kind === 'url') {
    urlInfo = await fetchAndExtractArticle(rawInput);
    textToAnalyze = urlInfo.title || (classification.host + ' ' + (classification.path || '').replace(/[/_-]/g, ' '));
    contentRetrieved = urlInfo.contentRetrieved;
    sourceInaccessible = !contentRetrieved;
  }

  const claimStructure = extractClaim(rawInput);
  const entitiesList = [
    ...(claimStructure.entities.organizations || []),
    ...(claimStructure.entities.people || []),
  ];
  const amounts = claimStructure.amounts || [];
  const dates = claimStructure.dates || [];
  const locations = claimStructure.entities.locations || [];
  const styleMarkers = claimStructure.styleMarkers || [];
  const keywords = claimStructure.keywords || [];

  // LANGKAH 3: Dekomposisi Klaim Atomik & Generasi Multi-Query
  if (onProgress) onProgress(3);
  const atomicClaims = decomposeIntoAtomicClaims(
    claimStructure.mainClaim || textToAnalyze,
    claimStructure.entities,
    amounts,
    dates
  );

  const generatedQueries = generateVerificationQueries(
    claimStructure.mainClaim || textToAnalyze,
    atomicClaims,
    entitiesList,
    dates
  );

  // LANGKAH 4: Penelusuran Multi-Provider & Klasterisasi Bukti
  if (onProgress) onProgress(4);
  const gatheredEvidences = await gatherEvidenceFromAllProviders(
    claimStructure.mainClaim || textToAnalyze,
    { urlInfo, hasMalwarePattern: styleMarkers.length > 2 }
  );

  // Jika input URL menyertakan sinyal struktural domain
  if (urlInfo && urlInfo.signals && urlInfo.signals.length > 0) {
    for (const sig of urlInfo.signals) {
      gatheredEvidences.push({
        id: `sig-${sig.code}`,
        title: `Indikasi Keamanan Domain: ${sig.code}`,
        domain: urlInfo.domain,
        stance: 'refutes',
        tier: 2,
        relevance: 'high',
        snippet: sig.detail || 'Sinyal struktural pada tautan mengindikasikan potensi risiko.',
        publisher: urlInfo.domain,
        sourceType: 'security_signal',
        retrievedAt: timestamp,
      });
    }
  }

  // Klasterisasi Bukti (Source Independence & Deduplication)
  const sourceClusters = clusterSources(gatheredEvidences);

  // Evaluasi Tiap Klaim Atomik terhadap Bukti
  const evaluatedAtomicClaims = evaluateAtomicClaims(atomicClaims, gatheredEvidences);

  // LANGKAH 5: Deteksi Konflik & Analisis Linimasa Temporal
  if (onProgress) onProgress(5);
  const conflictAnalysis = detectEvidenceConflicts(gatheredEvidences);
  const temporalAnalysis = analyzeTemporalContext(dates, gatheredEvidences, urlInfo?.publishedAt);

  // Sintesis Kesimpulan Keseluruhan (Overall Verdict)
  const atomicSynthesis = synthesizeOverallVerdict(evaluatedAtomicClaims);

  const verdictResult = determineVerdict({
    evidence: gatheredEvidences,
    contentRetrieved,
    evidenceSearchPerformed: true,
    priorVerdict: atomicSynthesis.verdict,
  });

  // Kalkulasi Keyakinan 2.0
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
  if (sourceInaccessible) {
    limitations.unshift('Konten halaman tautan sumber tidak dapat diakses secara langsung oleh mesin perayap.');
  }

  // Audit Trail Langkah Kerja Sistem ("Show Your Work")
  const auditTrail = [
    { step: 1, title: 'Input Classification', detail: `Format masukan terdeteksi sebagai: ${classification.kind.toUpperCase()}` },
    { step: 2, title: 'Claim Extraction', detail: `Berhasil mengekstrak ${atomicClaims.length} proposisi klaim atomik independen.` },
    { step: 3, title: 'Search Query Generation', detail: `Menghasilkan ${generatedQueries.length} variasi query pencarian ke berbagai kanal.` },
    { step: 4, title: 'Evidence Retrieval', detail: `Ditemukan ${gatheredEvidences.length} kandidat bukti dari berbagai tier sumber.` },
    { step: 5, title: 'Source Independence Clustering', detail: `Dikelompokkan menjadi ${sourceClusters.length} kluster sumber independen.` },
    { step: 6, title: 'Conflict & Temporal Check', detail: conflictAnalysis.hasConflict ? 'Terdeteksi diskrepansi antar sumber.' : 'Arah kesimpulan sumber konsisten.' },
    { step: 7, title: 'Final Synthesis', detail: `Status verifikasi disintesis menjadi: ${verdictResult.verdict}` },
  ];

  // Hitung Report Hash SHA-256
  const reportPayload = {
    verificationId,
    claim: { mainClaim: claimStructure.mainClaim || textToAnalyze },
    verdict: verdictResult.verdict,
    confidence: confidenceResult,
    timestamp,
  };
  const reportHash = await computeReportHash(reportPayload);

  return {
    ok: true,
    version: '4.0.0',
    verificationId,
    reportHash,
    timestamp,
    inputKind: classification.kind,
    rawInput,
    urlInfo,
    sourceInaccessible,
    claim: {
      mainClaim: claimStructure.mainClaim || textToAnalyze,
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
    reasonCodes: verdictResult.reasonCodes || (sourceInaccessible ? ['sourceContentUnavailable'] : []),
    stats: verdictResult.stats,
    confidence: {
      ...confidenceResult,
      sourceCoverage,
      primarySourcesCount: gatheredEvidences.filter((e) => e.tier === 1).length,
      independentClustersCount: sourceClusters.length,
    },
    limitations,
    auditTrail,
    methodology: {
      engine: 'VeriFact Evidence Intelligence Engine 4.0',
      standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
    },
  };
}

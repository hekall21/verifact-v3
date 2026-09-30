/**
 * analysisService.js
 *
 * Orchestrator utama alur analisis VeriFact ID 3.0.
 * Menjalankan 5 langkah verifikasi transparan sesuai master prompt §2, §3, §4, §9, §11.
 */

import { classifyInput, parseUrl, inspectUrl } from '../utils/urlDetector.js';
import {
  extractClaim,
  extractAmounts,
  extractDates,
  extractLocations,
  extractKeywords,
  detectStyleMarkers,
} from '../utils/claimExtractor.js';
import { determineVerdict, VERDICT } from '../utils/verdict.js';
import { computeConfidence } from '../utils/sourceScoring.js';
import { fetchAndExtractArticle } from './articleService.js';
import { findMatchingPatterns } from './factCheckService.js';
import { getOfficialChannelsForTopics, buildFactCheckSearchUrl } from './sourceService.js';

export async function runVerification(rawInput, onProgress) {
  // Langkah 1: Deteksi dan Klasifikasi Input
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

  // Langkah 2: Ekstraksi Struktur Klaim & Konten
  if (onProgress) onProgress(2);

  let urlInfo = null;
  let textToAnalyze = String(rawInput).trim();
  let contentRetrieved = false;
  let sourceInaccessible = false;

  if (classification.kind === 'url') {
    urlInfo = await fetchAndExtractArticle(rawInput);
    textToAnalyze = classification.host + ' ' + (classification.path || '').replace(/[/_-]/g, ' ');
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


  // Langkah 3: Penelusuran Bukti & Korpus
  if (onProgress) onProgress(3);

  const matchedPatterns = findMatchingPatterns(rawInput, keywords);
  const searchLinks = buildFactCheckSearchUrl(claimStructure.mainClaim || rawInput);

  let topics = [];
  if (matchedPatterns.length > 0) {
    topics = matchedPatterns[0].topics || [];
  }
  const officialChannels = getOfficialChannelsForTopics(topics);

  // Bentuk daftar evidence
  const evidenceList = [];

  // Jika input adalah URL dengan sinyal risiko (misal: shortener, TLD aneh)
  if (urlInfo && urlInfo.signals && urlInfo.signals.length > 0) {
    for (const sig of urlInfo.signals) {
      evidenceList.push({
        id: `sig-${sig.code}`,
        title: `Indikasi Keamanan Domain: ${sig.code}`,
        domain: urlInfo.domain,
        stance: 'refutes',
        tier: 2,
        relevance: 'high',
        excerpt: sig.detail || 'Sinyal struktural pada tautan mengindikasikan potensi risiko.',
      });
    }
  }

  // Jika cocok dengan pola korpus kejahatan siber
  if (matchedPatterns.length > 0) {
    const topPattern = matchedPatterns[0];
    evidenceList.push({
      id: `pat-${topPattern.id}`,
      title: `Pola Modus Dikenal: ${topPattern.id.toUpperCase()}`,
      domain: topPattern.channels[0]?.domain || 'verifact.id',
      stance: 'context',
      tier: 3,
      relevance: 'high',
      excerpt: `Pola pesan memiliki karakteristik yang serupa dengan modus ${topPattern.id}.`,
    });
  }

  // Langkah 4: Penentuan Verdict & Alasan
  if (onProgress) onProgress(4);

  // evidenceSearchPerformed: apakah kita melakukan pengecekan bukti struktural
  const evidenceSearchPerformed = true;

  const verdictResult = determineVerdict({
    evidence: evidenceList,
    contentRetrieved,
    evidenceSearchPerformed,
    priorVerdict: null,
  });

  // Langkah 5: Kalkulasi Keyakinan & Finalisasi Laporan
  if (onProgress) onProgress(5);

  const confidenceResult = computeConfidence({
    verdict: verdictResult.verdict,
    evidence: evidenceList,
    stats: verdictResult.stats,
    contentRetrieved,
    evidenceSearchPerformed,
  });

  return {
    ok: true,
    inputKind: classification.kind,
    rawInput,
    urlInfo,
    sourceInaccessible,
    claim: {
      mainClaim: claimStructure.mainClaim,
      sentences: claimStructure.sentences,
      entities: entitiesList,
      amounts,
      dates,
      locations,
      styleMarkers,
      keywords,
    },
    verdict: verdictResult.verdict,
    reasonCodes: verdictResult.reasonCodes,
    stats: verdictResult.stats,
    confidence: confidenceResult,
    matchedPatterns,
    evidenceList,
    officialChannels,
    searchLinks,
    timestamp: new Date().toISOString(),
  };
}

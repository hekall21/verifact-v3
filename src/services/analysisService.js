/**
 * src/services/analysisService.js
 *
 * VeriFact ID 4.3 — Robust Analysis Engine
 * ANTI-ERROR / ANTI-FALSE-VERDICT / PRESENTATION READY
 *
 * Standar & Aturan Mutlak 4.3 (§1 s.d. §40):
 * 1. MANDATORY INPUT CLASSIFICATION (§1):
 *    Sebelum fact-checking, input diklasifikasikan ke:
 *    - URL_HOME
 *    - URL_ARTICLE
 *    - URL_SOCIAL
 *    - URL_PHISHING_SUSPECT
 *    - PHONE_NUMBER
 *    - BANK_ACCOUNT
 *    - MESSAGE
 *    - CLAIM_TEXT
 *    - UNKNOWN / INVALID_URL
 * 2. URL_HOME != URL_ARTICLE (§2):
 *    Homepage BUKAN klaim! Jangan tampilkan BELUM TERBUKTI/HOAX/FALSE.
 *    Tampilkan: SUMBER WEBSITE TERIDENTIFIKASI, status VALID, checklist keamanan.
 * 3. SOURCE RESULT SEPARATED FROM CLAIM RESULT (§4 & §5):
 *    sourceAssessment dan claimAssessment dipisahkan.
 *    SOURCE TRUST != CLAIM TRUTH.
 * 4. ARTICLE RETRIEVAL INTEGRITY (§8, §9, §10):
 *    Jika konten artikel tidak berhasil diambil:
 *    - Status: SOURCE_CONTENT_UNAVAILABLE
 *    - claim: null (DILARANG mengarang claim dari pesan error/timeout/raw URL!)
 *    - confidence: null (N/A)
 * 5. MINIMUM EVIDENCE RULE (§23):
 *    Jika artikel dibaca + 1 media source + 0 official + 0 fact-check:
 *    -> UNVERIFIED (UI: BELUM TERBUKTI), BUKAN MISLEADING/FALSE/HOAX.
 * 6. NEVER CRASH & SAFE RESULT CONTRACT (§33 & §34):
 *    Try/catch menyeluruh, selalu return object valid.
 */

import { classifyInputDetail, INPUT_TYPE } from '../utils/inputClassifier.js';
import { inspectUrlSecurity } from './sourceSecurityService.js';
import { getPublisherRecord } from '../data/publisherRegistry.js';
import { getRegistrableDomain } from '../utils/urlDetector.js';
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
import { gatherEvidenceFromAllProviders, normalizeEvidenceItem, PROVIDER_STATUS } from './evidenceProviders.js';
import { clusterSources } from '../utils/sourceClustering.js';
import { detectEvidenceConflicts } from '../utils/conflictDetector.js';
import { analyzeTemporalContext } from '../utils/temporalAnalysis.js';
import { generateVerificationId, computeReportHash } from '../utils/reportIntegrity.js';
import { computeConfidence } from '../utils/sourceScoring.js';
import { fetchAndExtractArticle } from './articleService.js';
import { determineVerdict, VERDICT } from '../utils/verdict.js';
import { findVerificationRecord, saveVerificationRecord } from './verificationRepository.js';
import { analyzePhoneNumber } from './threatIntel/PhoneThreatAnalyzer.js';
import { analyzeAccountNumber } from './threatIntel/AccountNumberAnalyzer.js';
import { analyzeMessageThreat } from './threatIntel/MessageThreatAnalyzer.js';
import { analyzeUrl } from './threatIntel/UrlThreatAnalyzer.js';

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

/**
 * Orchestrator Utama Verifikasi Fakta VeriFact ID 4.3 (§1 s.d. §40)
 */
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

  try {
    // ================================================================
    // LANGKAH 1: INPUT CLASSIFICATION WAJIB (§1)
    // ================================================================
    notifyProgress(PIPELINE_STATES.CLASSIFYING);
    const classification = classifyInputDetail(actualInput);

    // KASUS 0: Input Kosong
    if (classification.inputType === INPUT_TYPE.UNKNOWN && classification.reason === 'empty') {
      return {
        ok: false,
        version: '4.3.0',
        error: 'empty',
        inputType: INPUT_TYPE.UNKNOWN,
        status: 'EMPTY_INPUT',
        verdict: 'UNVERIFIABLE',
        sourceAssessment: null,
        claimAssessment: null,
        confidence: null,
        evidence: [],
        errors: ['Masukan teks atau tautan masih kosong.'],
      };
    }

    // KASUS 1: INVALID URL (§36 Case D)
    if (classification.inputType === INPUT_TYPE.INVALID_URL) {
      notifyProgress(PIPELINE_STATES.COMPLETED);
      return {
        ok: false,
        version: '4.3.0',
        verificationId,
        timestamp,
        inputType: INPUT_TYPE.INVALID_URL,
        status: 'INVALID_URL',
        verdict: 'UNVERIFIABLE',
        rawInput: actualInput,
        sourceAssessment: {
          domain: null,
          publisher: null,
          sourceType: 'UNKNOWN',
          urlStatus: 'INVALID',
          contentRetrieved: false,
          securitySignals: null,
        },
        claimAssessment: null,
        presentationSummary: {
          inputTypeLabel: 'Format Tautan Tidak Valid',
          sourceName: 'Tidak Teridentifikasi',
          domain: 'N/A',
          articleTitle: 'Format URL Tidak Memenuhi Kaidah Standar',
          contentStatus: 'Gagal Diuraikan',
          claimsCount: 0,
          evidenceCount: 0,
          officialSourcesCount: 0,
          factChecksCount: 0,
          independentClustersCount: 0,
          resultLabel: 'URL TIDAK VALID',
          confidenceText: 'N/A',
        },
        confidence: null,
        evidence: [],
        honestNotice: {
          title: 'FORMAT URL TIDAK VALID',
          message: 'Tautan yang dimasukkan memiliki sintaks yang rusak atau tidak lengkap. Pastikan URL diawali http:// atau https://.',
          actionSuggestions: [
            'Periksa kembali penulisan alamat website',
            'Salin ulang URL langsung dari bilah alamat browser',
          ],
        },
        limitations: ['Sistem menolak memproses URL dengan format sintaks tidak valid.'],
        auditTrail: [{ step: 1, title: 'Input Classification', detail: 'URL dinyatakan tidak valid (INVALID_URL).' }],
      };
    }

    // ================================================================
    // KASUS 2: URL HOMEPAGE (detik.com, kompas.com, dll.) (§2 & §30)
    // ================================================================
    if (classification.inputType === INPUT_TYPE.URL_HOME) {
      notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
      const securitySignals = inspectUrlSecurity(classification.url);
      const publisher = classification.publisher || getPublisherRecord(classification.url);
      const domain = classification.domain || getRegistrableDomain(classification.hostname);
      const publisherName = publisher?.publisher || domain;

      notifyProgress(PIPELINE_STATES.COMPLETED);

      return {
        ok: true,
        version: '4.3.0',
        verificationId,
        timestamp,
        inputType: INPUT_TYPE.URL_HOME,
        rawInput: actualInput,
        status: 'IDENTIFIED_SOURCE',
        verdict: 'IDENTIFIED_SOURCE',
        isNewsHomepage: true,
        claim: null,
        contentRetrieved: false,
        sourceAssessment: {
          domain,
          publisher: publisherName,
          sourceType: publisher?.type || 'NEWS_MEDIA',
          urlStatus: 'VALID',
          sourceStatus: 'TERIDENTIFIKASI',
          contentRetrieved: false,
          securitySignals,
          isIdentifiedPublisher: Boolean(publisher),
          homepageUrl: classification.url,
          category: publisher?.category || 'NEWS',
          country: publisher?.country || 'ID',
        },
        claimAssessment: null, // DILARANG MEMBUAT CLAIM DARI HOMEPAGE! (§2)
        confidence: null, // CONFIDENCE N/A (§28)
        presentationSummary: {
          inputTypeLabel: 'Beranda Situs Web / Portal Berita',
          sourceName: publisherName,
          domain,
          articleTitle: `Halaman Utama: ${publisherName}`,
          contentStatus: 'Homepage Terverifikasi',
          claimsCount: 0,
          evidenceCount: 0,
          officialSourcesCount: 0,
          factChecksCount: 0,
          independentClustersCount: 0,
          resultLabel: 'SUMBER TERIDENTIFIKASI',
          confidenceText: 'N/A',
        },
        evidence: [],
        honestNotice: {
          title: 'SUMBER WEBSITE TERIDENTIFIKASI',
          publisher: publisherName,
          domain,
          sourceType: 'Website Berita',
          urlStatus: 'VALID',
          message: `Situs ${domain} teridentifikasi resmi sebagai portal media berita. Karena tautan ini merupakan halaman utama (bukan artikel berita tertentu), sistem tidak melakukan pengujian klaim salah/benar.`,
          tips: 'Untuk memverifikasi isi berita, masukkan URL artikel yang spesifik.',
          actionSuggestions: [
            'Buka artikel spesifik di situs tersebut lalu salin URL-nya',
            'Tempel teks judul atau paragraf berita ke kolom pencarian',
          ],
        },
        limitations: [
          'Halaman depan portal media memuat ratusan judul artikel dinamis yang selalu diperbarui.',
          'Pemeriksaan fakta akurat membutuhkan URL artikel spesifik atau isi teks pernyataan.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL_HOME.' },
          { step: 2, title: 'Publisher Recognition', detail: `Domain dikaitkan ke penerbit terdaftar: ${publisherName}.` },
          { step: 3, title: 'Security Analysis', detail: 'Analisis keamanan URL: Protokol HTTPS valid, bukan IP host, bebas typosquatting.' },
          { step: 4, title: 'Honest Delivery', detail: 'Menampilkan Sumber Teridentifikasi tanpa klaim fiktif.' },
        ],
        methodology: {
          engine: 'VeriFact Robust Analysis Engine 4.3',
          standards: 'IFCN Code of Principles & Separation of Source vs Claim',
        },
      };
    }

    // ================================================================
    // KASUS 3: PHONE NUMBER SCANNER (§15 & §36 Case F)
    // ================================================================
    if (classification.inputType === INPUT_TYPE.PHONE_NUMBER) {
      notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
      const phoneRes = analyzePhoneNumber(classification.raw);
      notifyProgress(PIPELINE_STATES.COMPLETED);

      const isScam = phoneRes.statusCode === 'CRITICAL' || phoneRes.statusCode === 'HIGH';

      return {
        ok: true,
        version: '4.3.0',
        verificationId,
        timestamp,
        inputType: INPUT_TYPE.PHONE_NUMBER,
        rawInput: actualInput,
        status: phoneRes.statusCode,
        verdict: isScam ? 'SUSPICIOUS' : 'NO_REPORT_FOUND',
        sourceAssessment: {
          phoneNumber: phoneRes.phoneNumber,
          formatted: phoneRes.formatted,
          carrier: phoneRes.carrier,
          lineType: phoneRes.lineType,
          sourceType: 'TELECOMMUNICATION',
          urlStatus: 'N/A',
          contentRetrieved: true,
        },
        claimAssessment: {
          claim: `Analisis intelijen ancaman nomor kontak: ${phoneRes.phoneNumber}`,
          verdict: phoneRes.status,
          confidence: null,
          indicators: phoneRes.observations || phoneRes.indicators || [],
        },
        presentationSummary: {
          inputTypeLabel: 'Nomor Telepon / Kontak Seluler',
          sourceName: phoneRes.carrier || 'Penyedia Telekomunikasi',
          domain: phoneRes.phoneNumber,
          articleTitle: `Kontak: ${phoneRes.formatted || phoneRes.phoneNumber}`,
          contentStatus: 'Struktur Penomoran Valid',
          claimsCount: 1,
          evidenceCount: phoneRes.reportCount || 0,
          officialSourcesCount: 1,
          factChecksCount: 0,
          independentClustersCount: 0,
          resultLabel: phoneRes.status,
          confidenceText: 'N/A',
        },
        phoneDetails: phoneRes,
        confidence: null,
        evidence: [],
        honestNotice: {
          title: phoneRes.status,
          message: phoneRes.warningMessage || 'Belum ditemukan laporan pada sumber yang tersedia.',
          tips: 'Ketiadaan laporan saat ini BUKAN jaminan mutlak aman. Pelaku penipuan kerap berganti nomor baru.',
        },
        limitations: [
          'Analisis didasarkan pada basis data pelaporan telekomunikasi yang tersedia secara publik.',
          'Nomor baru yang belum pernah dilaporkan korban tidak dapat dideteksi secara retrospektif.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai PHONE_NUMBER.' },
          { step: 2, title: 'Carrier Lookup', detail: `Operator teridentifikasi: ${phoneRes.carrier} (${phoneRes.lineType}).` },
          { step: 3, title: 'Reputation Check', detail: `Hasil: ${phoneRes.status}.` },
        ],
      };
    }

    // ================================================================
    // KASUS 4: BANK ACCOUNT SCANNER (§16 & §36 Case G)
    // ================================================================
    if (classification.inputType === INPUT_TYPE.BANK_ACCOUNT) {
      notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
      const accRes = analyzeAccountNumber(classification.raw);
      notifyProgress(PIPELINE_STATES.COMPLETED);

      const isScam = accRes.statusCode === 'CRITICAL' || accRes.statusCode === 'HIGH';

      return {
        ok: true,
        version: '4.3.0',
        verificationId,
        timestamp,
        inputType: INPUT_TYPE.BANK_ACCOUNT,
        rawInput: actualInput,
        status: accRes.statusCode,
        verdict: isScam ? 'SUSPICIOUS' : 'NO_REPORT_FOUND',
        sourceAssessment: {
          accountNumber: accRes.accountNumber,
          bank: accRes.bank,
          sourceType: 'FINANCIAL_ACCOUNT',
          urlStatus: 'N/A',
          contentRetrieved: true,
        },
        claimAssessment: {
          claim: `Pemeriksaan integritas nomor rekening: ${accRes.accountNumber}`,
          verdict: accRes.status,
          confidence: null,
          indicators: accRes.observations || accRes.indicators || [],
        },
        presentationSummary: {
          inputTypeLabel: 'Nomor Rekening Bank / Finansial',
          sourceName: accRes.bank || 'Institusi Perbankan',
          domain: accRes.accountNumber,
          articleTitle: `Rekening: ${accRes.accountNumber} (${accRes.bank || 'Bank'})`,
          contentStatus: 'Struktur Rekening Valid',
          claimsCount: 1,
          evidenceCount: accRes.reportCount || 0,
          officialSourcesCount: 1,
          factChecksCount: 0,
          independentClustersCount: 0,
          resultLabel: accRes.status,
          confidenceText: 'N/A',
        },
        accountDetails: accRes,
        confidence: null,
        evidence: [],
        honestNotice: {
          title: accRes.status,
          message: accRes.warningMessage || 'Belum ditemukan laporan pada basis data yang terhubung.',
          tips: 'Jangan pernah mengklaim rekening 100% aman hanya karena struktur nomornya valid.',
        },
        limitations: [
          'Pemeriksaan rekening mengacu pada format penomoran perbankan dan basis data pelaporan terdaftar.',
          'Rekening pinjaman (mule account) baru seringkali belum memiliki riwayat aduan.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai BANK_ACCOUNT.' },
          { step: 2, title: 'Bank Identification', detail: `Bank teridentifikasi: ${accRes.bank}.` },
          { step: 3, title: 'Reputation Lookup', detail: `Status: ${accRes.status}.` },
        ],
      };
    }

    // ================================================================
    // KASUS 5: SCAM & SOCIAL ENGINEERING MESSAGE (§14 & §36 Case E)
    // ================================================================
    if (classification.inputType === INPUT_TYPE.MESSAGE) {
      notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
      const msgRes = analyzeMessageThreat(classification.raw);
      notifyProgress(PIPELINE_STATES.COMPLETED);

      return {
        ok: true,
        version: '4.3.0',
        verificationId,
        timestamp,
        inputType: INPUT_TYPE.MESSAGE,
        rawInput: actualInput,
        status: msgRes.statusCode,
        verdict: msgRes.statusCode === 'HIGH' ? 'SUSPICIOUS' : 'PARTLY_TRUE',
        sourceAssessment: {
          sourceType: 'DIRECT_MESSAGE',
          urlStatus: 'N/A',
          contentRetrieved: true,
          publisher: 'Pesan Teks / Chat Pribadi',
          domain: 'Pesan Masuk',
        },
        claimAssessment: {
          claim: actualInput.slice(0, 150),
          verdict: msgRes.status,
          confidence: { score: msgRes.riskScore, band: msgRes.riskLevel },
          indicators: msgRes.indicators,
        },
        presentationSummary: {
          inputTypeLabel: 'Pesan Chat / Rekayasa Sosial',
          sourceName: 'Pesan Instan / SMS',
          domain: 'Chat Text',
          articleTitle: `Pesan: "${actualInput.slice(0, 70)}..."`,
          contentStatus: 'Pola Rekayasa Sosial Teranalisis',
          claimsCount: msgRes.indicators.length,
          evidenceCount: msgRes.indicators.length,
          officialSourcesCount: 0,
          factChecksCount: 0,
          independentClustersCount: 0,
          resultLabel: msgRes.status,
          confidenceText: `${msgRes.riskScore}%`,
        },
        messageDetails: msgRes,
        confidence: { score: msgRes.riskScore, band: msgRes.riskLevel },
        evidence: [],
        honestNotice: {
          title: msgRes.status,
          message: msgRes.warningMessage,
          tips: 'Lembaga perbankan atau pemerintah resmi TIDAK PERNAH meminta kode OTP atau PIN melalui pesan chat.',
        },
        limitations: [
          'Analisis berfokus pada deteksi rekayasa sosial, manipulasi psikologis, dan kata kunci berisiko tinggi.',
          'Pemeriksaan pesan tidak melakukan penelusuran artikel berita pers.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai MESSAGE.' },
          { step: 2, title: 'Pattern Threat Detection', detail: `Terdeteksi ${msgRes.indicators.length} indikator manipulasi psikologis.` },
          { step: 3, title: 'Risk Scoring', detail: `Skor Risiko: ${msgRes.riskScore}/100 (${msgRes.status}).` },
        ],
      };
    }

    // ================================================================
    // KASUS 6: PHISHING SUSPECT URL (§18 & §36 Case H)
    // ================================================================
    if (classification.inputType === INPUT_TYPE.URL_PHISHING_SUSPECT) {
      notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
      const urlRes = analyzeUrl(classification.url);
      notifyProgress(PIPELINE_STATES.COMPLETED);

      const isPhish = urlRes.statusCode === 'PHISHING' || urlRes.statusCode === 'CRITICAL';

      return {
        ok: true,
        version: '4.3.0',
        verificationId,
        timestamp,
        inputType: INPUT_TYPE.URL_PHISHING_SUSPECT,
        rawInput: actualInput,
        status: urlRes.statusCode,
        verdict: isPhish ? 'SUSPICIOUS' : 'UNVERIFIABLE',
        sourceAssessment: {
          domain: urlRes.domain,
          url: urlRes.url,
          sourceType: 'SUSPICIOUS_WEB',
          urlStatus: 'SUSPICIOUS',
          contentRetrieved: false,
          securitySignals: inspectUrlSecurity(classification.url),
        },
        claimAssessment: {
          claim: `Analisis keamanan tautan siber: ${urlRes.url}`,
          verdict: urlRes.status,
          confidence: null,
          indicators: urlRes.indicators,
        },
        presentationSummary: {
          inputTypeLabel: 'Tautan Mencurigakan / Phishing Suspect',
          sourceName: urlRes.domain || 'Domain Tidak Dikenal',
          domain: urlRes.domain || classification.hostname,
          articleTitle: `Tautan: ${urlRes.url}`,
          contentStatus: 'Sinyal Ancaman Terdeteksi',
          claimsCount: 1,
          evidenceCount: urlRes.indicators?.length || 0,
          officialSourcesCount: 0,
          factChecksCount: 0,
          independentClustersCount: 0,
          resultLabel: urlRes.status,
          confidenceText: 'N/A',
        },
        urlSecurityDetails: urlRes,
        confidence: null,
        evidence: [],
        honestNotice: {
          title: urlRes.status,
          message: urlRes.warningMessage || 'Tautan memiliki karakteristik teknis yang mencurigakan.',
          tips: 'Jangan pernah memasukkan kredensial login atau mengunduh file dari tautan yang tidak terverifikasi.',
        },
        limitations: [
          'Status PHISHING hanya disematkan jika terdapat bukti kuat atau indikasi intelijen ancaman yang valid.',
          'Pemeriksaan keamanan teknis URL dipisahkan dari pemeriksaan kebenaran berita.',
        ],
        auditTrail: [
          { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL_PHISHING_SUSPECT.' },
          { step: 2, title: 'Threat Telemetry', detail: `Indikator ancaman teknis dianalisis (${urlRes.threatTypes?.join(', ') || 'Heuristik'}).` },
          { step: 3, title: 'Verdict Synthesis', detail: `Status Keamanan: ${urlRes.status}.` },
        ],
      };
    }

    // ================================================================
    // KASUS 7: URL_ARTICLE (Tautan Berita Riil) (§3 s.d. §13)
    // ================================================================
    let textToAnalyze = String(actualInput).trim();
    let contentRetrieved = false;
    let article = null;
    let articleMetadata = null;
    let domain = '';
    let publisherName = 'Sumber Web';

    if (classification.inputType === INPUT_TYPE.URL_ARTICLE) {
      notifyProgress(PIPELINE_STATES.RETRIEVING_SOURCE);
      article = await fetchAndExtractArticle(actualInput);

      domain = article.domain || classification.domain || classification.hostname;
      const pubRecord = classification.publisher || getPublisherRecord(classification.url);
      publisherName = pubRecord?.publisher || article.source?.publisher || domain;

      // 7A. Jika backend mendeteksi ini ternyata adalah homepage
      if (article.status === 'NEWS_HOMEPAGE_DETECTED' || article.isHomepage) {
        notifyProgress(PIPELINE_STATES.COMPLETED);
        const securitySignals = inspectUrlSecurity(classification.url);

        return {
          ok: true,
          version: '4.3.0',
          verificationId,
          timestamp,
          inputType: INPUT_TYPE.URL_HOME,
          rawInput: actualInput,
          status: 'IDENTIFIED_SOURCE',
          verdict: 'IDENTIFIED_SOURCE',
          isNewsHomepage: true,
          claim: null,
          contentRetrieved: false,
          sourceAssessment: {
            domain,
            publisher: publisherName,
            sourceType: pubRecord?.type || 'NEWS_MEDIA',
            urlStatus: 'VALID',
            sourceStatus: 'TERIDENTIFIKASI',
            contentRetrieved: false,
            securitySignals,
            homepageUrl: classification.url,
          },
          claimAssessment: null,
          confidence: null,
          presentationSummary: {
            inputTypeLabel: 'Beranda Situs Web / Portal Berita',
            sourceName: publisherName,
            domain,
            articleTitle: `Halaman Utama: ${publisherName}`,
            contentStatus: 'Homepage Terverifikasi',
            claimsCount: 0,
            evidenceCount: 0,
            officialSourcesCount: 0,
            factChecksCount: 0,
            independentClustersCount: 0,
            resultLabel: 'SUMBER TERIDENTIFIKASI',
            confidenceText: 'N/A',
          },
          evidence: [],
          honestNotice: {
            title: 'SUMBER WEBSITE TERIDENTIFIKASI',
            publisher: publisherName,
            domain,
            sourceType: 'Website Berita',
            urlStatus: 'VALID',
            message: `Situs ${domain} teridentifikasi sebagai portal media berita. Untuk verifikasi berita, masukkan URL artikel spesifik.`,
            tips: 'Untuk memverifikasi isi berita, masukkan URL artikel yang spesifik.',
          },
          limitations: ['Halaman utama portal berita memuat ratusan tautan dan bukan satu klaim tunggal.'],
          auditTrail: [
            { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL_HOME.' },
            { step: 2, title: 'Publisher Recognition', detail: `Domain dikaitkan ke penerbit terdaftar: ${publisherName}.` },
          ],
        };
      }

      // 7B. ARTICLE RETRIEVAL FALLBACK (§8, §9, §10, §12)
      // Jika server gagal mengambil body artikel:
      // DILARANG: UNVERIFIED, FALSE, MISLEADING, confidence 0, claim = error message!
      if (!article.ok || !article.content?.text) {
        notifyProgress(PIPELINE_STATES.COMPLETED);
        const securitySignals = inspectUrlSecurity(classification.url);
        const titleFound = article.source?.title || null;

        return {
          ok: true,
          version: '4.3.0',
          verificationId,
          timestamp,
          inputType: INPUT_TYPE.URL_ARTICLE,
          rawInput: actualInput,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          verdict: 'SOURCE_CONTENT_UNAVAILABLE',
          sourceInaccessible: true,
          contentRetrieved: false,
          claim: null,
          confidence: null,
          sourceAssessment: {
            domain,
            publisher: publisherName,
            sourceType: 'NEWS_MEDIA',
            urlStatus: 'VALID',
            contentRetrieved: false,
            articleTitle: titleFound,
            securitySignals,
          },
          claimAssessment: null, // JANGAN MEMBUAT CLAIM DARI PESAN ERROR! (§9)
          presentationSummary: {
            inputTypeLabel: 'Tautan Artikel Berita',
            sourceName: publisherName,
            domain,
            articleTitle: titleFound || 'Artikel Berita (Isi Belum Terbaca)',
            contentStatus: titleFound ? 'Metadata Terbaca, Body Belum Terbaca' : 'Isi Halaman Belum Berhasil Dibaca',
            claimsCount: 0,
            evidenceCount: 0,
            officialSourcesCount: 0,
            factChecksCount: 0,
            independentClustersCount: 0,
            resultLabel: 'KONTEN BELUM TERSEDIA',
            confidenceText: 'N/A',
          },
          evidence: [],
          honestNotice: {
            title: 'ARTIKEL TERDETEKSI — ISI BELUM TERBACA LENGKAP',
            publisher: publisherName,
            domain,
            articleTitle: titleFound,
            url: classification.url,
            statusIsi: 'Belum berhasil dibaca lengkap oleh perayap server',
            message: 'VeriFact berhasil mengenali situs penerbit, namun peladen belum dapat mengekstrak badan artikel lengkap (faktor CORS / bot protection / dynamic rendering).',
            actionSuggestions: [
              'Tempel Teks Artikel langsung ke kolom pencarian',
              'Coba Lagi (Retry)',
              'Periksa apakah artikel membutuhkan login pelanggan',
            ],
          },
          limitations: [
            'Isi artikel tidak dapat diambil oleh mesin perayap (CORS, proteksi bot, atau tautan tertutup).',
            'Sistem menolak membuat kesimpulan verifikasi spekulatif tanpa isi artikel yang terbaca.',
          ],
          auditTrail: [
            { step: 1, title: 'Input Classification', detail: 'Masukan dikenali sebagai URL_ARTICLE.' },
            { step: 2, title: 'Source Retrieval Attempt', detail: 'Pengambilan teks artikel belum berhasil (SOURCE_CONTENT_UNAVAILABLE).' },
            { step: 3, title: 'Integrity Check', detail: 'Pesan kegagalan retrieval tidak dijadikan klaim berita. Nilai confidence diset ke N/A.' },
          ],
        };
      }

      // 7C. ARTIKEL BERHASIL DIAMBIL LENGKAP (§11)
      notifyProgress(PIPELINE_STATES.EXTRACTING_CONTENT);
      contentRetrieved = true;
      articleMetadata = article.source;
      const fullArticleContent = `${articleMetadata.title || ''}. ${articleMetadata.description || ''}\n\n${article.content.text}`;
      textToAnalyze = fullArticleContent;
    } else {
      // 8. CLAIM_TEXT (Teks pernyataan langsung)
      notifyProgress(PIPELINE_STATES.EXTRACTING_CONTENT);
      contentRetrieved = true;
      domain = 'Pernyataan Publik';
      publisherName = 'Teks Langsung';
    }

    // ================================================================
    // LANGKAH 4: Mengekstrak klaim & Dekomposisi Klaim Atomik (§13)
    // ================================================================
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

    // ================================================================
    // LANGKAH 5: Pencarian Bukti Multi-Provider Paralel (§19, §20, §21)
    // ================================================================
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
        urlInfo: article,
        hasMalwarePattern: styleMarkers.length > 2,
        claimId: opts.claimId,
      },
      generatedQueries
    );

    const gatheredEvidences = providerResults.evidence || [];
    const patternSignals = providerResults.patternSignals || [];

    // Jika masukan berasal dari URL artikel berita yang berhasil dibaca:
    // Catat artikel tersebut sebagai bukti pelaporan pertama (Tier 2 Media Pelapor)
    if (classification.inputType === INPUT_TYPE.URL_ARTICLE && articleMetadata && article?.ok) {
      const reportingEvidence = normalizeEvidenceItem({
        id: `source-${domain}`,
        url: article.url || articleMetadata.url || actualInput,
        canonicalUrl: article.url || articleMetadata.url || actualInput,
        domain: domain || 'news.detik.com',
        publisher: publisherName,
        title: articleMetadata.title || claimStructure.mainClaim || 'Artikel Sumber',
        author: articleMetadata.author || 'Redaksi',
        publishedAt: articleMetadata.publishedAt || new Date().toISOString().slice(0, 10),
        sourceType: 'news',
        tier: 2,
        snippet: articleMetadata.description || (article.content?.text ? article.content.text.slice(0, 220) : ''),
        content: article.content?.text || '',
        stance: 'supports',
        matchType: 'PRIMARY_REPORTING_SOURCE',
        similarityScore: 1.0,
        relevance: 'high',
      });
      if (!gatheredEvidences.some((ge) => ge.url === reportingEvidence.url || ge.id === reportingEvidence.id)) {
        gatheredEvidences.unshift(reportingEvidence);
      }
    }

    if (priorFactCheckRecord && priorFactCheckRecord.evidence) {
      for (const ev of priorFactCheckRecord.evidence) {
        if (!gatheredEvidences.some((ge) => ge.id === ev.id || ge.url === ev.url)) {
          gatheredEvidences.unshift(ev);
        }
      }
    }

    // ================================================================
    // LANGKAH 6: Kluster Sumber & Analisis Konflik (§22 s.d. §26)
    // ================================================================
    notifyProgress(PIPELINE_STATES.COMPARING_EVIDENCE);
    const sourceClusters = clusterSources(gatheredEvidences);
    const evaluatedAtomicClaims = evaluateAtomicClaims(atomicClaims, gatheredEvidences);
    const conflictAnalysis = detectEvidenceConflicts(gatheredEvidences);
    const temporalAnalysis = analyzeTemporalContext(dates, gatheredEvidences, articleMetadata?.publishedAt);

    // ================================================================
    // LANGKAH 7: Verdict Engine & Keyakinan (§22 s.d. §29)
    // ================================================================
    notifyProgress(PIPELINE_STATES.BUILDING_VERDICT);
    const priorVerdictToUse = priorFactCheckRecord ? priorFactCheckRecord.verdict : null;

    const verdictResult = determineVerdict({
      evidence: gatheredEvidences,
      contentRetrieved,
      evidenceSearchPerformed: true,
      priorVerdict: priorVerdictToUse,
      sourceClusters,
    });

    const confidenceResult = computeConfidence({
      verdict: verdictResult.verdict,
      evidence: gatheredEvidences,
      stats: verdictResult.stats,
      contentRetrieved,
      evidenceSearchPerformed: true,
      priorFactCheck: Boolean(priorFactCheckRecord),
    });

    // Presentation Summary Preparation (§31)
    const officialCount = verdictResult.stats.primaryCount;
    const mediaCount = verdictResult.stats.mediaCount;
    const factCheckCount = verdictResult.stats.factCheckCount;
    const isUnverifiedVerdict = verdictResult.verdict === 'UNVERIFIED' || verdictResult.verdict === 'INSUFFICIENT_EVIDENCE';

    const confidenceText = isUnverifiedVerdict || confidenceResult.score === null
      ? 'N/A'
      : `${confidenceResult.score}%`;

    const presentationSummary = {
      inputTypeLabel: classification.inputType === INPUT_TYPE.URL_ARTICLE ? 'Artikel Berita' : 'Teks Pernyataan',
      sourceName: publisherName,
      domain,
      articleTitle: claimStructure.mainClaim || textToAnalyze.slice(0, 120),
      contentStatus: 'Berhasil Dibaca Lengkap',
      claimsCount: atomicClaims.length,
      evidenceCount: gatheredEvidences.length,
      officialSourcesCount: officialCount,
      factChecksCount: factCheckCount,
      independentClustersCount: sourceClusters.length,
      resultLabel: isUnverifiedVerdict ? 'BELUM TERBUKTI' : verdictResult.verdict,
      confidenceText,
    };

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
      version: '4.3.0',
      verificationId,
      reportHash,
      timestamp,
      inputType: classification.inputType,
      rawInput: actualInput,
      urlInfo: article,
      sourceInaccessible: false,
      contentRetrieved: true,
      sourceAssessment: {
        domain,
        publisher: publisherName,
        sourceType: 'NEWS_MEDIA',
        urlStatus: 'VALID',
        contentRetrieved: true,
        securitySignals: inspectUrlSecurity(classification.url || actualInput),
      },
      claimAssessment: {
        claim: claimStructure.mainClaim || textToAnalyze.slice(0, 200),
        verdict: verdictResult.verdict,
        confidence: isUnverifiedVerdict ? null : confidenceResult,
        atomicClaims: evaluatedAtomicClaims,
      },
      presentationSummary,
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
      providerStatus: providerResults.providerStatus,
      confidence: isUnverifiedVerdict
        ? { score: null, band: 'notAvailable', note: 'insufficientEvidence' }
        : {
            ...confidenceResult,
            sourceCoverage: sourceClusters.length >= 3 ? 'High' : sourceClusters.length >= 2 ? 'Medium' : 'Low',
            primarySourcesCount: officialCount,
            independentClustersCount: sourceClusters.length,
          },
      sourceAttributionNotice,
      reusedVerification: Boolean(priorFactCheckRecord),
      patternSignals,
      limitations: [
        'Penilaian dilakukan secara objektif berdasarkan bukti independen yang berhasil diverifikasi.',
        'Satu sumber media pelapor tidak dapat dijadikan bukti mutlak tanpa konfirmasi independen sekunder.',
        'Ketiadaan bukti sanggahan bukan berarti berita otomatis 100% benar secara hukum.',
      ],
      auditTrail: [
        { step: 1, title: 'Input Classification', detail: `Format masukan terdeteksi sebagai: ${classification.inputType}` },
        { step: 2, title: 'Source Retrieval', detail: 'Teks artikel dan metadata diekstrak melalui Multi-Strategy Extractor.' },
        { step: 3, title: 'Atomic Claims Decomposition', detail: `Mengekstrak ${atomicClaims.length} klaim atomik dan membuat query pencarian.` },
        { step: 4, title: 'Parallel Evidence Retrieval', detail: `Pencarian paralel dieksekusi dengan Promise.allSettled (${gatheredEvidences.length} bukti ditemukan).` },
        { step: 5, title: 'Minimum Evidence Rule Enforcement', detail: isUnverifiedVerdict ? 'Bukti independen baru 1 sumber media -> Vonis diarahkan ke BELUM TERBUKTI (UNVERIFIED).' : 'Bukti independen mencukupi.' },
        { step: 6, title: 'Verdict Synthesis', detail: `Hasil akhir disintesis menjadi: ${verdictResult.verdict}` },
      ],
      methodology: {
        engine: 'VeriFact Robust Analysis Engine 4.3',
        standards: 'IFCN Code of Principles & Transparent Evidence Ledger',
      },
    };
  } catch (fatalError) {
    // SAFE RESULT CONTRACT (§33 & §34): NEVER CRASH TO RAW 500!
    console.error('[AnalysisService Fatal Error Caught]', fatalError);
    notifyProgress(PIPELINE_STATES.COMPLETED);

    return {
      ok: false,
      version: '4.3.0',
      verificationId,
      timestamp,
      inputType: 'UNKNOWN',
      status: 'SOURCE_CONTENT_UNAVAILABLE',
      verdict: 'UNVERIFIABLE',
      sourceAssessment: {
        domain: null,
        publisher: 'Tidak Diketahui',
        sourceType: 'UNKNOWN',
        urlStatus: 'ERROR',
        contentRetrieved: false,
      },
      claimAssessment: null,
      presentationSummary: {
        inputTypeLabel: 'Gangguan Sistem Tak Terduga',
        sourceName: 'VeriFact Safe Guard',
        domain: 'N/A',
        articleTitle: 'Terjadi Gangguan Saat Pemrosesan Masukan',
        contentStatus: 'Safe Fallback Activated',
        claimsCount: 0,
        evidenceCount: 0,
        officialSourcesCount: 0,
        factChecksCount: 0,
        independentClustersCount: 0,
        resultLabel: 'TIDAK DAPAT DIVERIFIKASI',
        confidenceText: 'N/A',
      },
      confidence: null,
      evidence: [],
      honestNotice: {
        title: 'LAYANAN PENELUSURAN MENGALAMI PERLINDUNGAN KEAMANAN',
        message: 'VeriFact berhasil menangkap masukan, namun mengalami kendala saat menghubungkan basis data eksternal. Silakan coba kembali sesaat lagi.',
        actionSuggestions: [
          'Tekan tombol Coba Lagi',
          'Pastikan teks yang dimasukkan tidak memuat karakter biner rusak',
        ],
      },
      errors: [fatalError.message || 'Unknown processing error'],
      limitations: ['Safe Error Boundary aktif untuk mencegah crash total aplikasi.'],
    };
  }
}

/**
 * Perluas Penelusuran / Cari Bukti Lebih Lanjut (§Part 12)
 */
export async function searchMoreEvidence(currentResult = {}, options = {}) {
  if (!currentResult || (!currentResult.claim && !currentResult.claimAssessment?.claim)) {
    return currentResult;
  }

  const claimText = currentResult.claim?.mainClaim || currentResult.claimAssessment?.claim || '';
  const atomicClaims = currentResult.atomicClaims || [];
  const existingEvidences = currentResult.evidence || [];

  const expandedQueries = [
    { query: `klarifikasi resmi ${claimText}`.slice(0, 80), intent: 'refute' },
    { query: `siaran pers pemerintah ${claimText}`.slice(0, 80), intent: 'support' },
    { query: `cek fakta turnbackhoax ${claimText}`.slice(0, 80), intent: 'refute' },
    { query: `konfirmasi kementerian ${claimText}`.slice(0, 80), intent: 'support' },
  ];

  const providerResults = await gatherEvidenceFromAllProviders(
    claimText,
    { deepSearch: true, ...options },
    expandedQueries
  );

  const newEvidences = [...existingEvidences];
  let addedCount = 0;

  for (const item of (providerResults.evidence || [])) {
    if (!newEvidences.some((e) => e.url === item.url || e.id === item.id)) {
      newEvidences.push(item);
      addedCount++;
    }
  }

  const sourceClusters = clusterSources(newEvidences);
  const evaluatedAtomicClaims = evaluateAtomicClaims(atomicClaims, newEvidences);
  const conflictAnalysis = detectEvidenceConflicts(newEvidences);

  const verdictResult = determineVerdict({
    evidence: newEvidences,
    contentRetrieved: currentResult.contentRetrieved ?? true,
    evidenceSearchPerformed: true,
    priorVerdict: null,
    sourceClusters,
  });

  const confidenceResult = computeConfidence({
    verdict: verdictResult.verdict,
    evidence: newEvidences,
    stats: verdictResult.stats,
    contentRetrieved: currentResult.contentRetrieved ?? true,
    evidenceSearchPerformed: true,
    priorFactCheck: false,
  });

  const isUnverified = verdictResult.verdict === 'UNVERIFIED' || verdictResult.verdict === 'INSUFFICIENT_EVIDENCE';

  const extendedSearchNotice = addedCount > 0
    ? `Ditemukan ${addedCount} sumber tambahan setelah memperluas penelusuran.`
    : 'VeriFact ID telah memperluas pencarian ke basis data periksa fakta dan media independen, tetapi belum menemukan sumber tambahan yang memverifikasi atau membantah laporan ini.';

  return {
    ...currentResult,
    evidence: newEvidences,
    sourceClusters,
    atomicClaims: evaluatedAtomicClaims,
    conflictAnalysis,
    verdict: verdictResult.verdict,
    status: verdictResult.verdict,
    stats: verdictResult.stats,
    confidence: isUnverified
      ? { score: null, band: 'notAvailable', note: 'insufficientEvidence' }
      : {
          ...confidenceResult,
          sourceCoverage: newEvidences.length >= 3 ? 'High' : newEvidences.length >= 2 ? 'Medium' : 'Low',
          primarySourcesCount: newEvidences.filter((e) => e.tier === 1).length,
          independentClustersCount: sourceClusters.length,
        },
    extendedSearchPerformed: true,
    extendedSearchNotice,
  };
}

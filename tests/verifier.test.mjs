/**
 * tests/verifier.test.mjs
 *
 * VeriFact ID 4.2 — Comprehensive Test Suite
 *
 * Menguji seluruh modul kritis versi 4.2:
 * 1. News Homepage vs Article Recognition (Detik.com root vs article)
 * 2. Multi-Strategy Article Extraction & Honest Unavailable Handling
 * 3. Shared Verification Repository (Trending & AI Consistency)
 * 4. Threat Intelligence: Account Analyzer & Demo Fixtures
 * 5. Threat Intelligence: Phone Analyzer & User Number Integrity
 * 6. Threat Intelligence: URL Analyzer, News Detection, & .invalid RFC 2606 Fixtures
 * 7. Threat Intelligence: Message Scanner (Social Engineering & Urgency Heuristics)
 * 8. Quiz Engine (100+ Question Pool, Fisher-Yates, 5 Unique per Session, Retry Independence)
 * 9. I18N & Confidence Score Transparency
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyInput, isValidUrl, parseUrl, isNewsHomepageUrl } from '../src/utils/urlDetector.js';
import { extractClaim, extractAmounts } from '../src/utils/claimExtractor.js';
import { determineVerdict, VERDICT } from '../src/utils/verdict.js';
import { computeConfidence } from '../src/utils/sourceScoring.js';
import { runVerification, searchMoreEvidence } from '../src/services/analysisService.js';
import { translate } from '../src/i18n/index.js';

import {
  fetchAndExtractArticleBackend,
  extractArticleContent,
  DetikAdapter,
  KompasAdapter,
} from '../server/articleExtractor.mjs';

import { analyzeAccountNumber } from '../src/services/threatIntel/AccountNumberAnalyzer.js';
import { analyzePhoneNumber } from '../src/services/threatIntel/PhoneThreatAnalyzer.js';
import { analyzeUrl } from '../src/services/threatIntel/UrlThreatAnalyzer.js';
import { analyzeMessageThreat } from '../src/services/threatIntel/MessageThreatAnalyzer.js';
import { ThreatIntelProvider, DEMO_FIXTURES } from '../src/services/threatIntel/ThreatIntelProvider.js';

import {
  getAllQuestions,
  createQuizSession,
  questionsId,
  questionsEn,
} from '../src/data/quiz/index.js';
import { verificationRepository } from '../src/services/verificationRepository.js';
import { classifyInputDetail, INPUT_TYPE, INPUT_SUBTYPE } from '../src/utils/inputClassifier.js';
import { maskSensitiveData } from '../src/utils/sanitize.js';
import { getPublisherRecord, isRegisteredPublisher } from '../src/data/publisherRegistry.js';
import { inspectUrlSecurity } from '../src/services/sourceSecurityService.js';
import { gatherEvidenceFromAllProviders } from '../src/services/evidenceProviders.js';

// ============================================================
// PART 1: URL & NEWS INPUT ANALYSIS (DETIK HOMEPAGE VS ARTICLE)
// ============================================================

test('Test 1: URL detik.com root wajib dikenali sebagai valid website domain, bukan article', async () => {
  const detikHomepage = 'https://www.detik.com/';
  const parsed = parseUrl(detikHomepage);
  assert.equal(parsed.ok, true, 'URL detik.com harus valid');
  assert.equal(isNewsHomepageUrl(parsed.url), true, 'Harus terdeteksi sebagai news homepage');

  const classification = classifyInput(detikHomepage);
  assert.equal(classification.kind, 'url');
  assert.equal(classification.isNewsHomepage, true);

  // Jalankan verifikasi backend extractor
  const backendRes = await fetchAndExtractArticleBackend(detikHomepage);
  assert.equal(backendRes.ok, false);
  assert.equal(backendRes.status, 'NEWS_HOMEPAGE_DETECTED');
  assert.equal(backendRes.isHomepage, true);
  assert.match(backendRes.message, /DOMAIN TERDETEKSI/);
  assert.match(backendRes.message, /halaman utama situs berita/);

  // Jalankan pipeline verifikasi utama
  const pipelineRes = await runVerification(detikHomepage);
  assert.equal(pipelineRes.ok, true);
  assert.equal(pipelineRes.isNewsHomepage, true);
  assert.equal(pipelineRes.status, 'IDENTIFIED_SOURCE');
  assert.equal(pipelineRes.verdict, 'IDENTIFIED_SOURCE');
  assert.equal(pipelineRes.claim, null, 'News homepage tidak boleh mengekstrak klaim fiktif');
  assert.equal(pipelineRes.confidence, null, 'News homepage tidak boleh memiliki confidence 0%');
  assert.match(pipelineRes.honestNotice.title, /SUMBER WEBSITE TERIDENTIFIKASI|HALAMAN UTAMA MEDIA/);
});

test('Test 2: Multi-Strategy Extractor & DetikAdapter berhasil mengekstrak artikel berita riil bahkan dengan nested ads', () => {
  const sampleDetikHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Menkes Pastikan Vaksinasi Baru Gratis untuk Lansia - detikNews</title>
        <meta property="og:title" content="Menkes Pastikan Vaksinasi Baru Gratis untuk Lansia" />
        <meta name="author" content="Tim Redaksi Detik" />
        <meta property="article:published_time" content="2026-03-15T10:00:00Z" />
      </head>
      <body>
        <div class="detail__body-text itp_bodycontent">
          <div class="ad-container"><div class="inner-ad">Iklan Banner</div></div>
          <p>Jakarta - Kementerian Kesehatan memastikan program vaksinasi terbaru dapat diakses secara gratis oleh kelompok lanjut usia mulai pekan depan.</p>
          <div class="ad-container"><div class="inner-ad">Iklan Tengah</div></div>
          <p>Menteri Kesehatan menyatakan anggaran telah disiapkan oleh pemerintah pusat untuk mencakup seluruh fasilitas kesehatan di daerah.</p>
          <p>Masyarakat diminta untuk mendaftar melalui puskesmas terdekat tanpa dipungut biaya apapun.</p>
        </div>
      </body>
    </html>
  `;

  const extracted = DetikAdapter.extract(sampleDetikHtml);
  assert.ok(extracted, 'DetikAdapter harus berhasil mengekstrak konten dengan nested ads');
  assert.match(extracted, /Kementerian Kesehatan memastikan program vaksinasi/);
  assert.match(extracted, /fasilitas kesehatan/);

  const strategyResult = extractArticleContent(sampleDetikHtml, 'news.detik.com');
  assert.equal(strategyResult.strategy, 'DetikAdapter');
  assert.ok(strategyResult.text.length > 50);
});

test('Test 3: URL tidak dapat diakses menghasilkan status SOURCE_CONTENT_UNAVAILABLE, claim null, dan confidence null', async () => {
  const unreachableUrl = 'https://situs-berita-pasti-tidak-ada-999888.org/artikel-fiktif';
  const res = await runVerification(unreachableUrl);

  assert.equal(res.ok, true);
  assert.equal(res.sourceInaccessible, true);
  assert.equal(res.contentRetrieved, false);
  assert.equal(res.status, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.verdict, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.claim, null, 'Error message TIDAK BOLEH pernah dijadikan claim');
  assert.equal(res.confidence, null, 'Confidence harus null (bukan 0%) saat artikel tidak dapat dibaca');
  assert.deepEqual(res.evidence, []);
  assert.notEqual(res.verdict, VERDICT.HOAX, 'URL tidak dapat diakses TIDAK BOLEH divonis HOAKS');
  assert.notEqual(res.verdict, VERDICT.FACT, 'URL tidak dapat diakses TIDAK BOLEH divonis FAKTA');
  assert.ok(res.honestNotice);
  assert.match(res.honestNotice.title, /BELUM TERBACA|SOURCE CONTENT UNAVAILABLE/i);
});

// ============================================================
// PART 2: SHARED VERIFICATION REPOSITORY (TRENDING & AI)
// ============================================================

test('Test 4: Shared verification record digunakan secara konsisten antara Trending dan AI Analysis', async () => {
  const existingRecord = verificationRepository.findByClaimText('BLT Rp5 juta');
  assert.ok(existingRecord, 'Harus menemukan record tersimpan untuk BLT');
  assert.equal(existingRecord.verdict, 'HOAX');

  const res = await runVerification({
    claimId: existingRecord.claimId,
    claimText: 'Pemerintah bagikan BLT Rp5 juta untuk semua warga mulai Oktober',
  });

  assert.equal(res.ok, true);
  assert.equal(res.verdict, VERDICT.HOAX, 'AI analysis harus konsisten dengan putusan verifikasi tersimpan');
  assert.ok(res.reusedVerification, 'Harus menandai bahwa verifikasi sebelumnya digunakan');
  assert.ok(res.sourceAttributionNotice, 'Harus menyertakan atribusi sumber pemeriksaan sebelumnya');
});

// ============================================================
// PART 3: THREAT INTELLIGENCE — PHONE SCANNER & INTEGRITY
// ============================================================

test('Test 5: Phone scanner: Nomor user yang tidak ditemukan menghasilkan NO_REPORT_FOUND, bukan SAFE 100%', () => {
  const userCleanPhone = '081234567890';
  const res = analyzePhoneNumber(userCleanPhone);

  assert.equal(res.status, 'TIDAK DITEMUKAN LAPORAN');
  assert.equal(res.statusCode, 'NO_REPORT_FOUND');
  assert.notEqual(res.status, 'SAFE 100%');
  assert.notEqual(res.status, 'AMAN 100%');
  assert.equal(res.riskLevel, 'LOW');
  assert.ok(res.disclaimer.includes('BUKAN'));
  assert.ok(res.disclaimer.includes('aman'));
  assert.ok(res.carrier);

  // Sumber harus transparan (MANUAL_REFERENCE untuk portal pemerintah)
  const aduanNomorSource = res.sourcesChecked.find((s) => s.name.includes('AduanNomor'));
  assert.ok(aduanNomorSource);
  assert.equal(aduanNomorSource.status, 'MANUAL_REFERENCE');
});

test('Test 6: Simulated phone fixture DEMO_PHONE_SCAM menghasilkan status terindikasi bahaya dan badge SIMULASI', () => {
  // Gunakan fixture simulasi nomor dilaporkan
  const demoScam = analyzePhoneNumber('0812-0000-9999');

  assert.equal(demoScam.isSimulation, true, 'Harus terdeteksi sebagai simulasi');
  assert.match(demoScam.simulationBadge, /SIMULASI/);
  assert.equal(demoScam.riskLevel, 'CRITICAL');
  assert.equal(demoScam.statusCode, 'SIMULATED_THREAT');
  assert.match(demoScam.disclaimer, /DATA SIMULASI/);
});

// ============================================================
// PART 4: THREAT INTELLIGENCE — ACCOUNT SCANNER
// ============================================================

test('Test 7: Account scanner: Fixture DEMO_ACCOUNT_SCAM bukan rekening orang sungguhan dan bertanda simulasi', () => {
  const demoAccount = analyzeAccountNumber('9999-8888-7777');

  assert.equal(demoAccount.isSimulation, true);
  assert.match(demoAccount.simulationBadge, /SIMULASI/);
  assert.equal(demoAccount.statusCode, 'SIMULATED_THREAT');
  assert.match(demoAccount.disclaimer, /DATA SIMULASI/);

  // Rekening biasa tanpa laporan
  const normalAccount = analyzeAccountNumber('1234567890'); // 10 digit BCA
  assert.equal(normalAccount.statusCode, 'NO_REPORT_FOUND');
  assert.notEqual(normalAccount.status, 'AMAN 100%');
  assert.ok(normalAccount.disclaimer.includes('BUKAN jaminan'));
});

// ============================================================
// PART 5: THREAT INTELLIGENCE — URL SCANNER & PHISHING
// ============================================================

test('Test 8: URL scanner: Gunakan test fixture .invalid untuk menguji phishing tanpa bahaya nyata', () => {
  const phishUrl = 'https://login-bank-example.invalid/verify-account';
  const res = analyzeUrl(phishUrl);

  assert.equal(res.valid, true);
  assert.equal(res.statusCode, 'PHISHING');
  assert.equal(res.isSimulation, true, 'Domain .invalid wajib terdeteksi sebagai simulasi');
  assert.match(res.simulationBadge, /SIMULASI/);
  assert.equal(res.sslInfo.hasHttps, true);
  // Aturan HTTPS != SAFE
  assert.ok(res.sslInfo.explanation.includes('HANYA mengenkripsi'));
});

test('Test 9: URL scanner: Detik.com dikenali sebagai News Website dan bukan phishing', () => {
  const detikUrl = 'https://www.detik.com/';
  const res = analyzeUrl(detikUrl);

  assert.equal(res.valid, true);
  assert.equal(res.statusCode, 'NEWS_WEBSITE');
  assert.equal(res.domainType, 'News Website');
  assert.notEqual(res.statusCode, 'PHISHING');
  assert.match(res.warningMessage, /Situs berita terdeteksi/);
});

// ============================================================
// PART 6: THREAT INTELLIGENCE — MESSAGE SCANNER (SOCIAL ENGINEERING)
// ============================================================

test('Test 10: Message scanner mendeteksi urgency, ancaman pemblokiran, permintaan OTP, dan link mencurigakan', () => {
  const scamMsg = 'Pemberitahuan Resmi! Rekening bank Anda akan diblokir dalam 24 jam. Segera verifikasi kode OTP Anda melalui link: https://login-bank-example.invalid/auth';
  const res = analyzeMessageThreat(scamMsg);

  assert.equal(res.valid, true);
  assert.equal(res.statusCode, 'HIGH');
  assert.equal(res.riskLevel, 'CRITICAL');
  assert.ok(res.indicators.length >= 3, 'Harus mendeteksi minimal 3 indikator manipulasi');

  const categories = res.indicators.map((i) => i.category);
  assert.ok(categories.includes('urgency'), 'Harus mendeteksi urgency');
  assert.ok(categories.includes('fear_threat'), 'Harus mendeteksi ancaman pemblokiran');
  assert.ok(categories.includes('otp_request'), 'Harus mendeteksi permintaan OTP');
  assert.ok(categories.includes('suspicious_link'), 'Harus mendeteksi link URL');

  // Pesan aman normal
  const safeMsg = 'Halo Andi, nanti sore kita jadi kerja kelompok di perpustakaan jam 4 ya.';
  const safeRes = analyzeMessageThreat(safeMsg);
  assert.equal(safeRes.statusCode, 'LOW');
});

// ============================================================
// PART 7: QUIZ ENGINE (100+ POOL, 5 UNIQUE PER SESSION, RETRY)
// ============================================================

test('Test 11: Quiz pool memiliki >= 100 soal per bahasa, sesi memilih 5 soal unik, dan retry menghasilkan sesi baru', () => {
  const poolId = getAllQuestions('id');
  const poolEn = getAllQuestions('en');

  assert.ok(poolId.length >= 100, `Pool ID harus >= 100 (aktual: ${poolId.length})`);
  assert.ok(poolEn.length >= 100, `Pool EN harus >= 100 (aktual: ${poolEn.length})`);

  // Pastikan ID dalam pool tidak ada duplikasi
  const uniquePoolIds = new Set(poolId.map((q) => q.id));
  assert.equal(uniquePoolIds.size, poolId.length, 'Seluruh question.id di pool ID harus unik');

  // Sesi 1: 5 soal
  const session1 = createQuizSession('id', 5);
  assert.equal(session1.length, 5, 'Satu sesi kuis harus tepat 5 soal');

  const s1Ids = new Set(session1.map((q) => q.id));
  assert.equal(s1Ids.size, 5, '5 soal dalam satu sesi tidak boleh ada duplikat');

  // Total skor 100
  const totalScore = session1.reduce((acc, q) => acc + (q.points || 20), 0);
  assert.equal(totalScore, 100);

  // Sesi 2 (Retry): membuat sesi baru dengan Fisher-Yates
  const session2 = createQuizSession('id', 5);
  assert.equal(session2.length, 5);
  const s2Ids = new Set(session2.map((q) => q.id));
  assert.equal(s2Ids.size, 5);
});

// ============================================================
// PART 8: I18N & CONFIDENCE SCORE TRANSPARENCY
// ============================================================

test('Test 12: Alih bahasa menerjemahkan status dan Official Reporting nav item', () => {
  const navReportId = translate('id', 'nav.report');
  const navReportEn = translate('en', 'nav.report');

  assert.equal(navReportId, 'Lapor Resmi');
  assert.equal(navReportEn, 'Official Reporting');

  const conf = computeConfidence({
    verdict: VERDICT.UNPROVEN,
    evidence: [],
    evidenceSearchPerformed: true,
  });

  assert.ok(conf.score <= 45, 'Inconclusive verdict harus dibatasi pada keyakinan rendah');
  assert.ok(conf.factors.length > 0, 'Harus menyertakan faktor penentu keyakinan');
});

test('Test 13: URL retrieval failure integrity: error message tidak boleh menjadi claim, confidence harus null, status SOURCE_CONTENT_UNAVAILABLE', async () => {
  const mockUnreachableUrl = 'https://situs-berita-pasti-down-offline-888999.invalid/artikel-hilang';
  const res = await runVerification(mockUnreachableUrl);

  assert.equal(res.ok, true);
  assert.equal(res.status, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.verdict, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.claim, null, 'Claim HARUS null, bukan string error message');
  assert.equal(res.confidence, null, 'Confidence HARUS null, bukan score 0%');
  assert.deepEqual(res.evidence, [], 'Evidence harus kosong');
  assert.equal(res.sourceInaccessible, true);
  assert.equal(res.contentRetrieved, false);
});

test('Test 14: URL berita riil (Detik) mematuhi Minimum Evidence Rule: UNVERIFIED, Confidence N/A, 1 Media Source', async () => {
  const detikArticleUrl = 'https://news.detik.com/berita/d-8686957/klaster-mewah-lapas-cibinong-kini-rata-dengan-tanah';
  const res = await runVerification(detikArticleUrl);

  assert.equal(res.ok, true);
  assert.equal(res.contentRetrieved, true);
  assert.ok(res.claim, 'Claim harus berhasil diekstrak');
  assert.match(res.claim.mainClaim, /Lapas Cibinong/i, 'Judul artikel Detik harus menjadi klaim utama');
  assert.equal(res.verdict, VERDICT.UNVERIFIED, 'Verdict harus UNVERIFIED karena bukti belum cukup');
  assert.notEqual(res.verdict, VERDICT.MISLEADING, 'TIDAK BOLEH salah vonis MENYESATKAN');
  assert.notEqual(res.verdict, VERDICT.FALSE, 'TIDAK BOLEH salah vonis SALAH');
  assert.equal(res.confidence.score, null, 'Confidence score harus null / N/A untuk 1 media tanpa konfirmasi resmi');
  assert.equal(res.confidence.band, 'notAvailable');
  assert.ok(res.evidence.length >= 1, 'Harus mencantumkan artikel Detik sebagai sumber pelaporan (Tier 2)');
  assert.equal(res.stats.officialCount, 0, 'Official count harus 0');
  assert.ok(res.stats.mediaCount >= 1, 'Media count minimal 1');
  assert.equal(res.stats.factCheckCount, 0, 'Fact-check count harus 0');
  assert.notEqual(res.status, 'SOURCE_CONTENT_UNAVAILABLE');
});

test('Test 15: searchMoreEvidence memperluas pencarian bukti secara transparan tanpa klaim palsu', async () => {
  const detikArticleUrl = 'https://news.detik.com/berita/d-8686957/klaster-mewah-lapas-cibinong-kini-rata-dengan-tanah';
  const initialRes = await runVerification(detikArticleUrl);
  const expandedRes = await searchMoreEvidence(initialRes);

  assert.equal(expandedRes.ok, true);
  assert.equal(expandedRes.extendedSearchPerformed, true);
  assert.ok(expandedRes.extendedSearchNotice, 'Harus menyertakan pesan transparan hasil perluasan');
});

// ============================================================
// PART 9: VERIFACT ID 4.3 REGRESSION TEST MATRIX (§36 CASES A - K)
// ============================================================

test('Case A (§36): https://www.detik.com/ -> URL_HOME, IDENTIFIED_SOURCE, confidence N/A, 0 claims, not BELUM TERBUKTI', async () => {
  const url = 'https://www.detik.com/';
  const classification = classifyInputDetail(url);
  assert.equal(classification.inputType, INPUT_TYPE.URL_HOME);

  const res = await runVerification(url);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.URL_HOME);
  assert.equal(res.verdict, 'IDENTIFIED_SOURCE');
  assert.equal(res.status, 'IDENTIFIED_SOURCE');
  assert.equal(res.confidence, null, 'Confidence harus null / N/A');
  assert.equal(res.claim, null, 'Tidak boleh ada claim untuk homepage');
  assert.equal(res.presentationSummary.claimsCount, 0);
  assert.equal(res.presentationSummary.evidenceCount, 0);
  assert.equal(res.presentationSummary.resultLabel, 'SUMBER TERIDENTIFIKASI');
  assert.equal(res.presentationSummary.confidenceText, 'N/A');
  assert.notEqual(res.verdict, VERDICT.UNVERIFIED, 'TIDAK BOLEH BELUM TERBUKTI');
  assert.notEqual(res.verdict, VERDICT.FALSE, 'TIDAK BOLEH FALSE');
  assert.notEqual(res.verdict, VERDICT.MISLEADING, 'TIDAK BOLEH MISLEADING');
  assert.notEqual(res.verdict, VERDICT.HOAX, 'TIDAK BOLEH HOAX');
});

test('Case B (§36): https://news.detik.com/ -> URL_HOME, IDENTIFIED_SOURCE, publisher detikcom, bukan article claim', async () => {
  const url = 'https://news.detik.com/';
  const classification = classifyInputDetail(url);
  assert.equal(classification.inputType, INPUT_TYPE.URL_HOME);

  const res = await runVerification(url);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.URL_HOME);
  assert.equal(res.verdict, 'IDENTIFIED_SOURCE');
  assert.equal(res.claim, null, 'Subdomain portal berita tanpa path artikel bukan klaim');
  assert.equal(res.sourceAssessment.publisher, 'detikcom');
  assert.equal(res.presentationSummary.confidenceText, 'N/A');
});

test('Case C (§36): Real article URL -> URL_ARTICLE, Minimum Evidence Rule enforced (UNVERIFIED, confidence N/A)', async () => {
  const url = 'https://news.detik.com/berita/d-8686957/klaster-mewah-lapas-cibinong-kini-rata-dengan-tanah';
  const classification = classifyInputDetail(url);
  assert.equal(classification.inputType, INPUT_TYPE.URL_ARTICLE);

  const res = await runVerification(url);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.URL_ARTICLE);
  assert.equal(res.contentRetrieved, true);
  assert.ok(res.claim, 'Judul dan isi artikel harus diekstrak');
  assert.equal(res.verdict, VERDICT.UNVERIFIED, '1 sumber media tanpa konfirmasi resmi harus UNVERIFIED');
  assert.notEqual(res.verdict, VERDICT.MISLEADING, 'DILARANG memberikan vonis MENYESATKAN pada berita riil');
  assert.notEqual(res.verdict, VERDICT.FALSE, 'DILARANG memberikan vonis SALAH pada berita riil');
  assert.notEqual(res.verdict, VERDICT.HOAX, 'DILARANG memberikan vonis HOAKS pada berita riil');
  assert.equal(res.confidence.score, null, 'Confidence score harus null (N/A)');
  assert.equal(res.presentationSummary.confidenceText, 'N/A');
  assert.ok(res.presentationSummary.evidenceCount >= 1);
});

test('Case D (§36): Invalid URL https:// -> INVALID_URL, ok: false, user-friendly notice', async () => {
  const url = 'https://';
  const classification = classifyInputDetail(url);
  assert.equal(classification.inputType, INPUT_TYPE.INVALID_URL);

  const res = await runVerification(url);
  assert.equal(res.ok, false);
  assert.equal(res.inputType, INPUT_TYPE.INVALID_URL);
  assert.equal(res.status, 'INVALID_URL');
  assert.equal(res.presentationSummary.resultLabel, 'URL TIDAK VALID');
  assert.ok(res.honestNotice.message.includes('sintaks yang rusak'));
});

test('Case E (§36): Social engineering / scam message -> MESSAGE, threat indicators detected', async () => {
  const msg = 'Selamat! Anda memenangkan undian 100 juta rupiah dari Bank Mandiri. Segera verifikasi kode OTP Anda di link: https://login-bank-example.invalid/auth';
  const classification = classifyInputDetail(msg);
  assert.equal(classification.inputType, INPUT_TYPE.MESSAGE);

  const res = await runVerification(msg);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.MESSAGE);
  assert.ok(res.messageDetails.indicators.length >= 2, 'Harus mendeteksi minimal 2 indikator rekayasa sosial');
  assert.equal(res.presentationSummary.inputTypeLabel, 'Pesan Chat / Rekayasa Sosial');
  assert.ok(res.messageDetails.riskScore > 50);
});

test('Case F (§36): Clean phone number 081234567890 -> PHONE_NUMBER, NO_REPORT_FOUND, never AMAN 100%', async () => {
  const phone = '081234567890';
  const classification = classifyInputDetail(phone);
  assert.equal(classification.inputType, INPUT_TYPE.PHONE_NUMBER);

  const res = await runVerification(phone);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.PHONE_NUMBER);
  assert.equal(res.status, 'NO_REPORT_FOUND');
  assert.notEqual(res.sourceAssessment.urlStatus, 'AMAN 100%');
  assert.notEqual(res.presentationSummary.resultLabel, 'SAFE 100%');
  assert.notEqual(res.presentationSummary.resultLabel, 'AMAN 100%');
  assert.equal(res.confidence, null, 'Confidence nomor telepon non-laporan harus null');
});

test('Case G (§36): Clean bank account 1234567890 -> BANK_ACCOUNT, NO_REPORT_FOUND, never AMAN 100%', async () => {
  const account = '1234567890';
  const classification = classifyInputDetail(account);
  assert.equal(classification.inputType, INPUT_TYPE.BANK_ACCOUNT);

  const res = await runVerification(account);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.BANK_ACCOUNT);
  assert.equal(res.status, 'NO_REPORT_FOUND');
  assert.notEqual(res.presentationSummary.resultLabel, 'SAFE 100%');
  assert.notEqual(res.presentationSummary.resultLabel, 'AMAN 100%');
  assert.match(res.honestNotice.message, /Belum ditemukan.*laporan/i);
});

test('Case H (§36): Phishing suspect URL -> URL_PHISHING_SUSPECT, detected risk, SSL explanation', async () => {
  const phishUrl = 'https://login-bank-example.invalid/verify-account';
  const classification = classifyInputDetail(phishUrl);
  assert.equal(classification.inputType, INPUT_TYPE.URL_PHISHING_SUSPECT);

  const res = await runVerification(phishUrl);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.URL_PHISHING_SUSPECT);
  assert.equal(res.status, 'PHISHING');
  assert.ok(res.urlSecurityDetails.sslInfo.explanation.includes('HANYA mengenkripsi'));
  assert.equal(res.confidence, null);
});

test('Case I (§36): Retrieval failure -> SOURCE_CONTENT_UNAVAILABLE, claim null, confidence null, 0 evidence', async () => {
  const failUrl = 'https://situs-berita-pasti-tidak-ada-999888.org/artikel-fiktif';
  const res = await runVerification(failUrl);

  assert.equal(res.ok, true);
  assert.equal(res.status, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.verdict, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.claim, null, 'Error message TIDAK BOLEH pernah dijadikan claim');
  assert.equal(res.confidence, null, 'Confidence harus null (N/A)');
  assert.deepEqual(res.evidence, []);
  assert.notEqual(res.verdict, VERDICT.HOAX);
  assert.notEqual(res.verdict, VERDICT.FALSE);
  assert.notEqual(res.verdict, VERDICT.MISLEADING);
});

test('Case J (§36): Provider timeout / partial failure handled gracefully with Promise.allSettled', async () => {
  const providerResults = await gatherEvidenceFromAllProviders(
    'Klaim uji konkurensi timeout dan kegagalan parsial',
    { timeout: 50 },
    [{ query: 'uji coba timeout provider', intent: 'search' }]
  );

  assert.ok(Array.isArray(providerResults.evidence));
  assert.ok(providerResults.providerStatus);
  assert.ok(typeof providerResults.hasPartialFailure === 'boolean');
  // Tidak melempar uncaught rejection, eksekusi selesai aman
});

test('Case K (§36): All providers fail / 0 evidence -> INSUFFICIENT_EVIDENCE / UNVERIFIED, never FALSE or MISLEADING', () => {
  const verdictResult = determineVerdict({
    evidence: [],
    contentRetrieved: true,
    evidenceSearchPerformed: true,
    priorVerdict: null,
    sourceClusters: [],
  });

  assert.equal(verdictResult.verdict, VERDICT.UNVERIFIED);
  assert.notEqual(verdictResult.verdict, VERDICT.FALSE, '0 evidence dilarang divonis FALSE');
  assert.notEqual(verdictResult.verdict, VERDICT.MISLEADING, '0 evidence dilarang divonis MISLEADING');
  assert.notEqual(verdictResult.verdict, VERDICT.HOAX, '0 evidence dilarang divonis HOAX');
});

// ============================================================
// PART 6: VERIFACT ID 5.0 — MANDATORY 12 TEST CASES (§45) & SCHEMAS
// ============================================================

test('Test 1 (§45): https://www.detik.com/ -> URL_HOME, teridentifikasi detikcom, bukan FALSE/HOAX', async () => {
  const input = 'https://www.detik.com/';
  const res = await runVerification(input);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, 'URL_HOME');
  assert.equal(res.isNewsHomepage, true);
  assert.equal(res.verdict, 'IDENTIFIED_SOURCE');
  assert.equal(res.sourceAssessment.publisher, 'detikcom');
  assert.notEqual(res.verdict, 'FALSE');
  assert.notEqual(res.verdict, 'HOAX');
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.sources.length > 0);
  assert.ok(res.education);
  assert.ok(Array.isArray(res.reportResources));
});

test('Test 2 (§45): https://news.detik.com/... -> URL_ARTICLE, ekstrak artikel, summary, klaim, sumber pembanding', async () => {
  const articleUrl = 'https://news.detik.com/berita/d-1234567/kebijakan-vaksinasi-lansia-resmi-berlaku';
  const res = await runVerification(articleUrl);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, 'URL_ARTICLE');
  assert.ok(res.sourceSummary, 'Source Summary (§8) wajib ada untuk URL_ARTICLE');
  assert.ok(res.articleExplanation, 'Article Explanation (§9) wajib ada untuk URL_ARTICLE');
  assert.ok(res.articleExplanation.simpleExplanation);
  assert.ok(res.articleExplanation.context);
  assert.ok(res.articleExplanation.mainClaim);
  assert.ok(res.articleExplanation.pointsToNote);
  assert.ok(Array.isArray(res.atomicClaims));
  assert.ok(res.atomicClaims.length > 0);
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.sources.length > 0);
});

test('Test 3 (§45): Selamat Anda memenangkan undian 100 juta klik link... -> SCAM_MESSAGE / PHISHING_MESSAGE, risk high/critical', async () => {
  const msg = 'Selamat! Anda memenangkan undian 100 juta rupiah dari Telkomsel. Segera klaim di https://undian-telkomsel-2026.invalid/hadiah';
  const classification = classifyInputDetail(msg);
  assert.equal(classification.isScamMessage, true);
  assert.ok(
    classification.subType === INPUT_SUBTYPE.PHISHING_MESSAGE ||
    classification.subType === INPUT_SUBTYPE.SCAM_MESSAGE
  );

  const res = await runVerification(msg);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, 'MESSAGE');
  assert.ok(res.scamAnalysis, 'scamAnalysis (§17, §29) wajib tersedia');
  assert.ok(
    res.scamAnalysis.riskLevel === 'CRITICAL RISK' ||
    res.scamAnalysis.riskLevel === 'HIGH RISK'
  );
  assert.ok(res.scamAnalysis.whatIsOffered);
  assert.ok(res.scamAnalysis.whyRisky);
  assert.ok(Array.isArray(res.scamAnalysis.thingsToVerify));
  assert.ok(Array.isArray(res.scamAnalysis.recommendedActions));
});

test('Test 4 (§45): Jual akun ML Mythic murah 50rb transfer dulu -> ACCOUNT_SALE / SCAM_MESSAGE, risk high', async () => {
  const msg = 'Jual akun ML Mythic Glory skin kolektor murah cuma 50rb butuh duit mendesak transfer dulu langsung kirim email montoon';
  const classification = classifyInputDetail(msg);
  assert.equal(classification.subType, INPUT_SUBTYPE.ACCOUNT_SALE);
  assert.equal(classification.isScamMessage, true);

  const res = await runVerification(msg);
  assert.equal(res.ok, true);
  assert.equal(res.subType, INPUT_SUBTYPE.ACCOUNT_SALE);
  assert.ok(res.scamAnalysis);
  assert.ok(
    res.scamAnalysis.riskLevel === 'HIGH RISK' ||
    res.scamAnalysis.riskLevel === 'CRITICAL RISK'
  );
  assert.match(res.scamAnalysis.whatIsOffered, /Akun Game/i);
  assert.ok(res.scamAnalysis.thingsToVerify.some(t => /rekber|escrow|resmi|ToS/i.test(t)));
});

test('Test 5 (§45): Presiden Jokowi mengumumkan libur nasional 1 bulan -> NEWS_CLAIM, search evidence, compare sources', async () => {
  const claimText = 'Presiden Jokowi mengumumkan libur nasional 1 bulan penuh mulai besok untuk seluruh instansi';
  const classification = classifyInputDetail(claimText);
  assert.equal(classification.subType, INPUT_SUBTYPE.NEWS_CLAIM);

  const res = await runVerification(claimText);
  assert.equal(res.ok, true);
  assert.equal(res.subType, INPUT_SUBTYPE.NEWS_CLAIM);
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.sources.length > 0);
  assert.ok(res.sourceSummary);
  assert.ok(res.articleExplanation);
  assert.ok(Array.isArray(res.atomicClaims));
  assert.ok(res.atomicClaims.length > 0);
});

test('Test 6 (§45): 081234567890 -> PHONE_NUMBER, carrier detected, reporting status checked', async () => {
  const phone = '081234567890';
  const classification = classifyInputDetail(phone);
  assert.equal(classification.inputType, INPUT_TYPE.PHONE_NUMBER);

  const res = await runVerification(phone);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.PHONE_NUMBER);
  assert.ok(res.phoneDetails);
  assert.ok(res.phoneDetails.carrier);
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.sources.some(s => s.domain.includes('aduannomor') || s.domain.includes('komdigi') || s.sourceType === 'GOVERNMENT'));
});

test('Test 7 (§45): BCA 1234567890 -> BANK_ACCOUNT, bank detected, fraud report checked', async () => {
  const bankAcc = 'BCA 1234567890';
  const classification = classifyInputDetail(bankAcc);
  assert.equal(classification.inputType, INPUT_TYPE.BANK_ACCOUNT);

  const res = await runVerification(bankAcc);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.BANK_ACCOUNT);
  assert.ok(res.accountDetails);
  assert.equal(res.accountDetails.bank, 'BCA');
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.sources.some(s => s.domain.includes('cekrekening') || s.sourceType === 'GOVERNMENT'));
});

test('Test 8 (§45): https://login-bca-palsu.com -> URL_PHISHING_SUSPECT, fake domain detected', async () => {
  const phishingUrl = 'https://login-bca-palsu.com';
  const classification = classifyInputDetail(phishingUrl);
  assert.equal(classification.inputType, INPUT_TYPE.URL_PHISHING_SUSPECT);

  const res = await runVerification(phishingUrl);
  assert.equal(res.ok, true);
  assert.equal(res.inputType, INPUT_TYPE.URL_PHISHING_SUSPECT);
  assert.equal(res.status, 'PHISHING');
  assert.ok(res.urlSecurityDetails);
});

test('Test 9 (§45): Lowongan kerja like video TikTok dibayar 500rb per hari deposit dulu -> JOB_OFFER / SCAM_MESSAGE, fake job scam detected', async () => {
  const jobMsg = 'Lowongan kerja paruh waktu online like dan follow video TikTok dibayar 500rb per hari tanpa keahlian deposit dulu saldo aktivasi';
  const classification = classifyInputDetail(jobMsg);
  assert.equal(classification.subType, INPUT_SUBTYPE.JOB_OFFER);
  assert.equal(classification.isScamMessage, true);

  const res = await runVerification(jobMsg);
  assert.equal(res.ok, true);
  assert.equal(res.subType, INPUT_SUBTYPE.JOB_OFFER);
  assert.ok(
    res.scamAnalysis.riskLevel === 'HIGH RISK' ||
    res.scamAnalysis.riskLevel === 'CRITICAL RISK'
  );
  assert.match(res.scamAnalysis.whatIsOffered, /Pekerjaan|Tugas/i);
  assert.match(res.scamAnalysis.whyRisky, /deposit|keuangan|ponzi|biaya/i);
});

test('Test 10 (§45): Titip dana trading profit 30% per hari garansi modal kembali -> INVESTMENT_OFFER / SCAM_MESSAGE, ponzi/investment scam detected', async () => {
  const invMsg = 'Program titip dana trading forex profit pasti 30% per hari garansi anti rugi modal kembali dalam 24 jam legal berizin';
  const classification = classifyInputDetail(invMsg);
  assert.equal(classification.subType, INPUT_SUBTYPE.INVESTMENT_OFFER);
  assert.equal(classification.isScamMessage, true);

  const res = await runVerification(invMsg);
  assert.equal(res.ok, true);
  assert.equal(res.subType, INPUT_SUBTYPE.INVESTMENT_OFFER);
  assert.ok(
    res.scamAnalysis.riskLevel === 'HIGH RISK' ||
    res.scamAnalysis.riskLevel === 'CRITICAL RISK'
  );
  assert.match(res.scamAnalysis.whatIsOffered, /Investasi|Titip Dana|Trading/i);
  assert.match(res.scamAnalysis.whyRisky, /OJK|ilegal|Ponzi|pasti untung/i);
});

test('Test 11 (§45): Artikel tidak bisa diakses / bot blocked -> SOURCE_CONTENT_UNAVAILABLE, jujur bilang tidak bisa dibaca', async () => {
  const unreachableUrl = 'https://situs-tidak-dapat-dihubungi-sama-sekali-xyz123.com/artikel-berita';
  const res = await runVerification(unreachableUrl);
  assert.equal(res.ok, true);
  assert.equal(res.status, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.verdict, 'SOURCE_CONTENT_UNAVAILABLE');
  assert.equal(res.claim, null, 'Tidak boleh mengarang klaim bila konten gagal dibaca');
  assert.equal(res.confidence, null, 'Confidence harus null bila isi belum terbaca');
  assert.deepEqual(res.evidence, []);
});

test('Test 12 (§45): Masukan tidak jelas / asdfghjkl -> UNKNOWN / CLAIM_TEXT, jujur bilang informasi tidak cukup', async () => {
  const gibberish = 'asdfghjkl qwertyuiop zxcvbnm';
  const res = await runVerification(gibberish);
  assert.equal(res.ok, true);
  assert.ok(
    res.verdict === VERDICT.UNVERIFIED ||
    res.verdict === VERDICT.INSUFFICIENT_EVIDENCE
  );
  assert.notEqual(res.verdict, VERDICT.FALSE, 'Masukan acak tidak boleh divonis FALSE tanpa bukti');
  assert.notEqual(res.verdict, VERDICT.HOAX, 'Masukan acak tidak boleh divonis HOAX tanpa bukti');
  assert.ok(res.honestNotice);
});

test('Test 13 (§30): Sensitive Data Masking -> maskSensitiveData masks phone numbers, OTP, PIN, credit cards', () => {
  const rawText = 'Halo nomor saya 081234567890 dan +6281298765432. Kode OTP Anda: 492817. PIN: 123456. Card: 4111 2222 3333 4444.';
  const masked = maskSensitiveData(rawText);

  assert.equal(masked.includes('0812****7890'), true, 'Nomor 081234567890 harus dimask menjadi 0812****7890');
  assert.equal(masked.includes('+62812****5432'), true, 'Nomor +6281298765432 harus dimask');
  assert.equal(masked.includes('492817'), false, 'OTP token tidak boleh bocor');
  assert.equal(masked.includes('123456'), false, 'PIN tidak boleh bocor');
  assert.equal(masked.includes('4111 2222 3333 4444'), false, 'Nomor kartu kredit tidak boleh bocor');
  assert.match(masked, /Kode OTP Anda: \*{6}/);
  assert.match(masked, /PIN: \*{6}/);
  assert.match(masked, /\*{4}-\*{4}-\*{4}-4444/);
});

test('Test 14 (§5): Source Discovery strictly conforms to 9-field schema', async () => {
  const res = await runVerification('https://news.detik.com/berita/d-1234567/kebijakan-vaksinasi-lansia-resmi-berlaku');
  assert.ok(Array.isArray(res.sources));
  assert.ok(res.sources.length > 0);

  const requiredKeys = [
    'title',
    'url',
    'domain',
    'publisher',
    'sourceType',
    'publishedAt',
    'retrievedAt',
    'relevance',
    'contentAvailable',
  ];

  for (const source of res.sources) {
    for (const key of requiredKeys) {
      assert.ok(key in source, `Field "${key}" wajib ada dalam objek sumber sesuai §5`);
    }
    // Cek bahwa sourceType adalah salah satu dari enum terstandarisasi
    const validTypes = [
      'OFFICIAL',
      'GOVERNMENT',
      'NEWS_MEDIA',
      'FACT_CHECK',
      'SECURITY_ORGANIZATION',
      'ACADEMIC',
      'COMMUNITY_REPORT',
      'SOCIAL_MEDIA',
      'BLOG',
      'UNKNOWN',
    ];
    assert.ok(
      validTypes.includes(source.sourceType),
      `sourceType "${source.sourceType}" harus valid sesuai §5`
    );
  }
});

test('Test 15 (§AI): Gemini Agent Service API Key & Model state handling', async () => {
  const {
    getGeminiApiKey,
    setGeminiApiKey,
    getGeminiModel,
    setGeminiModel,
    testGeminiConnection,
    runGeminiAgentAnalysis,
    GEMINI_MODELS,
  } = await import('../src/services/geminiAgentService.js');

  // Pastikan daftar model Gemini terdefinisi
  assert.ok(Array.isArray(GEMINI_MODELS));
  assert.ok(GEMINI_MODELS.some((m) => m.id === 'gemini-2.5-flash'));

  // Test set dan get model
  setGeminiModel('gemini-1.5-flash');
  assert.equal(getGeminiModel(), 'gemini-1.5-flash');
  setGeminiModel('gemini-2.5-flash');
  assert.equal(getGeminiModel(), 'gemini-2.5-flash');

  // Test connection tanpa key harus mengembalikan ok: false
  const testRes = await testGeminiConnection('');
  assert.equal(testRes.ok, false);
  assert.match(testRes.message, /belum diisi/i);

  // Test run analysis tanpa API key harus melempar error jelas
  setGeminiApiKey('');
  await assert.rejects(
    async () => {
      await runGeminiAgentAnalysis({
        inputType: 'CLAIM_TEXT',
        text: 'Klaim uji coba',
      });
    },
    {
      message: /API Key Google AI Studio belum dikonfigurasi/i,
    }
  );
});




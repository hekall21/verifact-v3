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
import { runVerification } from '../src/services/analysisService.js';
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
  assert.equal(pipelineRes.status, 'NEWS_HOMEPAGE_DETECTED');
  assert.equal(pipelineRes.verdict, 'NEWS_HOMEPAGE_DETECTED');
  assert.equal(pipelineRes.claim, null, 'News homepage tidak boleh mengekstrak klaim fiktif');
  assert.equal(pipelineRes.confidence, null, 'News homepage tidak boleh memiliki confidence 0%');
  assert.equal(pipelineRes.honestNotice.title, 'HALAMAN UTAMA MEDIA TERDETEKSI');
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
  assert.equal(res.honestNotice.title, 'SOURCE CONTENT UNAVAILABLE');
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

test('Test 14: URL berita riil (Detik) berhasil diekstrak kontennya, menghasilkan claim judul berita asli dan confidence terhitung', async () => {
  const detikArticleUrl = 'https://news.detik.com/berita/d-8686957/klaster-mewah-lapas-cibinong-kini-rata-dengan-tanah';
  const res = await runVerification(detikArticleUrl);

  assert.equal(res.ok, true);
  assert.equal(res.contentRetrieved, true);
  assert.ok(res.claim, 'Claim harus berhasil diekstrak');
  assert.match(res.claim.mainClaim, /Lapas Cibinong/i, 'Judul artikel Detik harus menjadi klaim utama');
  assert.ok(res.confidence, 'Confidence harus terhitung');
  assert.ok(typeof res.confidence.score === 'number' && res.confidence.score > 0, 'Confidence score harus > 0%');
  assert.notEqual(res.status, 'SOURCE_CONTENT_UNAVAILABLE');
});


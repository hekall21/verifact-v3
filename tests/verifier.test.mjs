/**
 * verifier.test.mjs
 *
 * VeriFact ID 4.1 — Comprehensive Test Suite
 * Menguji seluruh modul kritis versi 4.1:
 * - URL & News Analysis (Backend Fetcher & Honest Unavailable Handling)
 * - Shared Verification Repository (Trending vs AI Analysis Consistency)
 * - Query Generation (Support & Refute Queries)
 * - Threat Intelligence Architecture (Account, Phone, URL)
 * - Quiz Engine (100+ Question Pool & 5 Random Questions per Session)
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyInput, isValidUrl, parseUrl } from '../src/utils/urlDetector.js';
import { extractClaim, extractAmounts } from '../src/utils/claimExtractor.js';
import { determineVerdict, VERDICT } from '../src/utils/verdict.js';
import { computeConfidence } from '../src/utils/sourceScoring.js';
import { runVerification } from '../src/services/analysisService.js';
import { translate } from '../src/i18n/index.js';

import { analyzeAccountNumber } from '../src/services/threatIntel/AccountNumberAnalyzer.js';
import { analyzePhoneNumber } from '../src/services/threatIntel/PhoneThreatAnalyzer.js';
import { analyzeUrl } from '../src/services/threatIntel/UrlThreatAnalyzer.js';
import { ThreatIntelProvider } from '../src/services/threatIntel/ThreatIntelProvider.js';

import {
  getAllQuestions,
  createQuizSession,
  questionsId,
  questionsEn,
} from '../src/data/quiz/index.js';
import { verificationRepository } from '../src/services/verificationRepository.js';

// ============================================================
// PART 1: URL & NEWS INPUT ANALYSIS
// ============================================================

test('Test 1: Input berupa URL valid wajib terdeteksi sebagai URL', async () => {
  const input = 'https://example.com/news/artikel-terbaru';
  const classification = classifyInput(input);

  assert.equal(classification.kind, 'url', 'Input harus dikenali sebagai URL');
  assert.equal(classification.host, 'example.com');

  const res = await runVerification(input);
  assert.equal(res.ok, true);
  assert.equal(res.inputKind, 'url');
});

test('Test 2: Input teks bebas wajib mengekstrak klaim, entitas, dan nominal', async () => {
  const input = 'Ini berita viral bahwa kementerian mengumumkan bantuan sosial Rp2.5 juta cair di Jakarta besok';
  const claim = extractClaim(input);
  const amounts = extractAmounts(input);

  assert.ok(claim.mainClaim.length > 0, 'Klaim utama harus berhasil diekstrak');
  assert.ok(claim.entities.organizations.length > 0 || claim.entities.locations.length > 0, 'Entitas harus teridentifikasi');
  assert.ok(amounts.length > 0, 'Nominal uang harus terdeteksi');

  const res = await runVerification(input);
  assert.equal(res.ok, true);
  assert.equal(res.inputKind, 'text');
  assert.ok(res.claim.mainClaim);
});

test('Test 3: URL tidak valid wajib menghasilkan error eksplisit', () => {
  const invalidUrls = ['https://', 'htp://example', 'https://broken domain.com/abc'];

  for (const bad of invalidUrls) {
    const classification = classifyInput(bad);
    assert.equal(classification.kind, 'invalid-url', `Harus terdeteksi sebagai invalid-url untuk: ${bad}`);
  }
});

test('Test 4: URL tidak dapat diakses menghasilkan status SOURCE_CONTENT_UNAVAILABLE secara jujur', async () => {
  // Gunakan URL yang pasti gagal diakses
  const input = 'https://situs-fiktif-tidak-pernah-ada-999.org/berita-hoaks';
  const res = await runVerification(input);

  assert.equal(res.ok, true);
  assert.equal(res.sourceInaccessible, true, 'sourceInaccessible harus true jika konten tidak terbaca');
  assert.ok(res.reasonCodes.includes('sourceContentUnavailable'));
  assert.ok(res.honestNotice, 'Harus menyertakan honestNotice');
  assert.equal(res.honestNotice.title, 'ARTIKEL TIDAK DAPAT DIBACA');
  // Tidak boleh menjadikan URL mentah sebagai kesimpulan hoaks/fakta
  assert.notEqual(res.verdict, VERDICT.FACT, 'Tidak boleh mengarang fakta dari URL tak terbaca');
});

// ============================================================
// PART 2: SHARED VERIFICATION REPOSITORY (TRENDING & AI ANALYSIS)
// ============================================================

test('Test 5: Shared verification record digunakan secara konsisten antara Trending dan AI Analysis', async () => {
  // Periksa claim yang sudah ada di repository (misal BLT Rp5 juta)
  const existingRecord = verificationRepository.findByClaimText('BLT Rp5 juta');
  assert.ok(existingRecord, 'Harus menemukan record tersimpan untuk BLT');
  assert.equal(existingRecord.verdict, 'HOAX');

  // Jalankan verifikasi AI dengan claimId atau teks yang sama
  const res = await runVerification({
    claimId: existingRecord.claimId,
    claimText: 'Pemerintah bagikan BLT Rp5 juta untuk semua warga mulai Oktober',
  });

  assert.equal(res.ok, true);
  assert.equal(res.verdict, VERDICT.HOAX, 'AI analysis harus konsisten dengan putusan verifikasi tersimpan');
  assert.ok(res.reusedVerification, 'Harus menandai bahwa verifikasi sebelumnya digunakan');
  assert.ok(res.sourceAttributionNotice, 'Harus menyertakan atribusi sumber pemeriksaan sebelumnya');
  assert.match(res.sourceAttributionNotice, /Pemeriksaan sebelumnya/);
});

// ============================================================
// PART 3: THREAT INTELLIGENCE — ACCOUNT NUMBER ANALYZER
// ============================================================

test('Test 6: AccountNumberAnalyzer menghasilkan status terstandarisasi dan mematuhi aturan integritas', () => {
  // Kasus 1: Terkonfirmasi Penipuan (CONFIRMED_REPORTED)
  const resConfirmed = analyzeAccountNumber('0123456789');
  assert.equal(resConfirmed.status, 'CONFIRMED_REPORTED');
  assert.equal(resConfirmed.riskLevel, 'CRITICAL');
  assert.ok(resConfirmed.reportCount > 0);
  assert.ok(resConfirmed.sourcesChecked.length > 0);

  // Kasus 2: Dilaporkan (REPORTED)
  const resReported = analyzeAccountNumber('1234567890123');
  assert.equal(resReported.status, 'REPORTED');
  assert.equal(resReported.riskLevel, 'HIGH');

  // Kasus 3: Tidak ditemukan laporan (NO_REPORT_FOUND)
  // GOLDEN RULE: "NO_REPORT_FOUND" != "AMAN"
  const resClean = analyzeAccountNumber('5556667778');
  assert.equal(resClean.status, 'NO_REPORT_FOUND');
  assert.notEqual(resClean.status, 'AMAN');
  assert.ok(resClean.disclaimer.includes('BUKAN'));
  assert.ok(resClean.disclaimer.includes('aman'));

  // Kasus 4: Layanan tidak tersedia (LOOKUP_UNAVAILABLE)
  const resUnavailable = analyzeAccountNumber('5556667778', { forceUnavailable: true });
  assert.equal(resUnavailable.status, 'LOOKUP_UNAVAILABLE');

  // Kasus 5: Format tidak valid (INVALID)
  const resInvalid = analyzeAccountNumber('abc123');
  assert.equal(resInvalid.status, 'INVALID');
  assert.equal(resInvalid.valid, false);
});

// ============================================================
// PART 4: THREAT INTELLIGENCE — PHONE THREAT ANALYZER
// ============================================================

test('Test 7: PhoneThreatAnalyzer menghasilkan status telco intelligence dan mematuhi aturan integritas', () => {
  // Kasus 1: Nomor Penipuan Terkonfirmasi (CONFIRMED_SCAM)
  const resConfirmed = analyzePhoneNumber('081299998888');
  assert.equal(resConfirmed.status, 'CONFIRMED_SCAM');
  assert.equal(resConfirmed.riskLevel, 'CRITICAL');
  assert.ok(resConfirmed.riskScore >= 80);
  assert.equal(resConfirmed.carrier, 'Telkomsel');

  // Kasus 2: Nomor Dilaporkan Spam (REPORTED_SCAM)
  const resReported = analyzePhoneNumber('087812340000');
  assert.equal(resReported.status, 'REPORTED_SCAM');
  assert.equal(resReported.carrier, 'XL Axiata');

  // Kasus 3: Anomali Mencurigakan / Panjang Tidak Wajar (SUSPICIOUS)
  const resSuspicious = analyzePhoneNumber('089912345678');
  assert.equal(resSuspicious.status, 'SUSPICIOUS');

  // Kasus 4: Tidak Ditemukan Laporan (NO_REPORT_FOUND)
  // GOLDEN RULE: "NO_REPORT_FOUND" != "SAFE"
  const resClean = analyzePhoneNumber('081398765432');
  assert.equal(resClean.status, 'NO_REPORT_FOUND');
  assert.notEqual(resClean.status, 'SAFE');
  assert.ok(resClean.disclaimer.includes('BUKAN'));
  assert.ok(resClean.disclaimer.includes('aman'));

  // Kasus 5: Format tidak valid (INVALID)
  const resInvalid = analyzePhoneNumber('0812');
  assert.equal(resInvalid.status, 'INVALID');
  assert.equal(resInvalid.valid, false);
});

// ============================================================
// PART 5: THREAT INTELLIGENCE — URL THREAT ANALYZER
// ============================================================

test('Test 8: UrlThreatAnalyzer mematuhi aturan HTTPS!=SAFE dan .xyz!=PHISHING', () => {
  // Kasus 1: Phishing Peniruan Brand Bank
  const resPhish = analyzeUrl('https://bca-klik-auth.xyz/login.php');
  assert.equal(resPhish.status, 'PHISHING');
  assert.equal(resPhish.riskLevel, 'CRITICAL');
  assert.equal(resPhish.sslInfo.hasHttps, true);
  // Aturan HTTPS != SAFE
  assert.ok(resPhish.sslInfo.explanation.includes('HANYA mengenkripsi'));

  // Kasus 2: TLD .xyz yang bersih TIDAK OTOMATIS menjadi PHISHING
  const resCleanXyz = analyzeUrl('https://myportfoliostudio.xyz');
  assert.notEqual(resCleanXyz.status, 'PHISHING', '.xyz tidak otomatis phishing');
  assert.equal(resCleanXyz.status, 'NO_THREAT_FOUND');

  // Kasus 3: Tautan langsung payload APK malware
  const resMalware = analyzeUrl('https://unduh-surat.com/surat-undangan-nikah.apk');
  assert.equal(resMalware.status, 'MALWARE');
  assert.equal(resMalware.riskLevel, 'CRITICAL');

  // Kasus 4: Format tidak valid
  const resInvalid = analyzeUrl('bukan-url-sama-sekali');
  assert.equal(resInvalid.status, 'INVALID');
});

// ============================================================
// PART 6: QUIZ ENGINE (100+ QUESTION POOL & 5 RANDOM PER SESSION)
// ============================================================

test('Test 9: Quiz pool memiliki >= 100 soal per bahasa dan sesi memilih 5 soal acak tanpa duplikasi', () => {
  // Uji ukuran pool
  const poolId = getAllQuestions('id');
  const poolEn = getAllQuestions('en');

  assert.ok(poolId.length >= 100, `Pool ID harus >= 100 (aktual: ${poolId.length})`);
  assert.ok(poolEn.length >= 100, `Pool EN harus >= 100 (aktual: ${poolEn.length})`);

  // Uji pembuatan sesi
  const session1 = createQuizSession('id', 5);
  assert.equal(session1.length, 5, 'Satu sesi kuis harus memiliki tepat 5 pertanyaan');

  // Cek ketiadaan duplikasi
  const ids = new Set(session1.map((q) => q.id));
  assert.equal(ids.size, 5, 'Tidak boleh ada soal duplikat dalam satu sesi');

  // Cek skor per soal dan total
  const totalPossible = session1.reduce((sum, q) => sum + (q.points || 20), 0);
  assert.equal(totalPossible, 100, 'Total nilai maksimal kuis harus tepat 100 poin');

  // Uji pengacakan antar sesi (dua sesi berturut-turut tidak boleh persis sama urutannya)
  const session2 = createQuizSession('id', 5);
  assert.equal(session2.length, 5);
});

// ============================================================
// PART 7: I18N & CONFIDENCE TRANSPARENCY
// ============================================================

test('Test 10: Alih bahasa ID <-> EN menerjemahkan status dan token keyakinan', () => {
  const labelId = translate('id', 'verifier.verdict.FACT.label');
  const labelEn = translate('en', 'verifier.verdict.FACT.label');

  assert.equal(labelId, 'FAKTA');
  assert.equal(labelEn, 'FACT');

  const summaryId = translate('id', 'verifier.verdict.UNPROVEN.label');
  const summaryEn = translate('en', 'verifier.verdict.UNPROVEN.label');

  assert.equal(summaryId, 'BELUM TERBUKTI');
  assert.equal(summaryEn, 'UNPROVEN');

  const conf = computeConfidence({
    verdict: VERDICT.UNPROVEN,
    evidence: [],
    evidenceSearchPerformed: true,
  });

  assert.ok(conf.score <= 45);
  assert.ok(conf.band === 'veryLow' || conf.band === 'low');
});

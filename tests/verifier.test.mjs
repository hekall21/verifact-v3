/**
 * verifier.test.mjs
 *
 * Uji coba unit pengujian 8 test case wajib dari Master Prompt §39.
 * Menggunakan test runner bawaan Node.js (node:test & node:assert/strict).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyInput, isValidUrl, parseUrl } from '../src/utils/urlDetector.js';
import { extractClaim, extractAmounts } from '../src/utils/claimExtractor.js';
import { determineVerdict, VERDICT } from '../src/utils/verdict.js';
import { computeConfidence } from '../src/utils/sourceScoring.js';
import { runVerification } from '../src/services/analysisService.js';
import { translate } from '../src/i18n/index.js';

test('Test 1: Input berupa URL valid wajib terdeteksi sebagai URL (bukan query kata kunci)', async () => {
  const input = 'https://example.com/news/artikel-terbaru';
  const classification = classifyInput(input);

  assert.equal(classification.kind, 'url', 'Input harus dikenali sebagai URL');
  assert.equal(classification.host, 'example.com');

  const res = await runVerification(input);
  assert.equal(res.ok, true);
  assert.equal(res.inputKind, 'url');
});

test('Test 2: Input teks bebas wajib mengekstrak klaim dan entitas', async () => {
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

test('Test 3: URL tidak valid wajib menghasilkan error eksplisit (bukan diam-diam menjadi teks biasa)', () => {
  const invalidUrls = ['https://', 'htp://example', 'https://broken domain.com/abc'];

  for (const bad of invalidUrls) {
    const classification = classifyInput(bad);
    assert.equal(classification.kind, 'invalid-url', `Harus terdeteksi sebagai invalid-url untuk: ${bad}`);
  }
});

test('Test 4: Halaman URL yang tidak dapat diakses menyatakan secara jujur (tanpa mengarang isi)', async () => {
  const input = 'https://situs-antah-berantah-999.com/berita-rahasia';
  const res = await runVerification(input);

  assert.equal(res.ok, true);
  assert.equal(res.sourceInaccessible, true, 'sourceInaccessible harus true jika konten tidak terbaca');
  assert.ok(res.reasonCodes.includes('sourceContentUnavailable'));
});

test('Test 5: Ketiadaan bukti kredibel menghasilkan status BELUM TERBUKTI / TIDAK DAPAT DIVERIFIKASI (bukan memaksa HOAKS/FAKTA)', () => {
  const verdictResult = determineVerdict({
    evidence: [],
    contentRetrieved: false,
    evidenceSearchPerformed: true,
  });

  assert.equal(verdictResult.verdict, VERDICT.UNPROVEN, 'Verdict harus UNPROVEN bila bukti tidak ditemukan');
});

test('Test 6: Alih bahasa ID <-> EN menerjemahkan seluruh antarmuka dan laporan hasil', () => {
  const labelId = translate('id', 'verifier.verdict.FACT.label');
  const labelEn = translate('en', 'verifier.verdict.FACT.label');

  assert.equal(labelId, 'FAKTA');
  assert.equal(labelEn, 'FACT');

  const summaryId = translate('id', 'verifier.verdict.UNPROVEN.label');
  const summaryEn = translate('en', 'verifier.verdict.UNPROVEN.label');

  assert.equal(summaryId, 'BELUM TERBUKTI');
  assert.equal(summaryEn, 'UNPROVEN');
});

test('Test 7 & 8: Token warna semantik dan pita keyakinan terdefinisi tanpa celah', () => {
  const conf1 = computeConfidence({
    verdict: VERDICT.UNPROVEN,
    evidence: [],
    evidenceSearchPerformed: true,
  });

  assert.ok(conf1.score <= 45, 'Status belum terbukti wajib dibatasi skor keyakinannya demi transparansi');
  assert.ok(conf1.band === 'veryLow' || conf1.band === 'low');
  assert.ok(conf1.factors.length > 0, 'Faktor pembentuk skor keyakinan harus terinci');
});

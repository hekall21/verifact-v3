/**
 * scamPatterns.js
 *
 * Sinyal STRUKTURAL yang dapat diamati dari nomor rekening, nomor telepon,
 * dan URL — tanpa memerlukan akses database eksternal.
 *
 * PERBEDAAN KRUSIAL (master prompt §28):
 *   - "Tidak ditemukan laporan" ≠ "AMAN"
 *   - "absence of evidence ≠ evidence of safety"
 *   - Setiap hasil observasi harus mengarahkan pengguna ke kanal resmi
 *     untuk pengecekan lebih lanjut (cekrekening.id, aduannomor.id).
 */

import { parseUrl, inspectUrl, isShortener, getRegistrableDomain } from '../utils/urlDetector.js';

/**
 * Observasi struktural nomor rekening.
 * Ini BUKAN verdict — hanya fakta observasi yang bisa dilihat siapa pun.
 */
export function analyzeAccountNumber(raw) {
  const clean = String(raw || '').replace(/[\s.-]+/g, '');
  if (!/^\d{6,20}$/.test(clean)) {
    return { valid: false, reasonCode: 'invalidAccountFormat' };
  }

  const observations = [];

  if (clean.length < 10) observations.push('shortAccountNumber');
  if (/^(\d)\1{5,}/.test(clean)) observations.push('repeatingDigits');

  // Identifikasi bank dari awalan (BCA 8 digit, BRI 15 digit, dll.)
  let bankHint = null;
  if (clean.length === 10 && clean.startsWith('0')) bankHint = 'BCA';
  else if (clean.length === 15 && clean.startsWith('0')) bankHint = 'BRI';
  else if (clean.length === 13 && clean.startsWith('1')) bankHint = 'Mandiri';
  else if (clean.length === 10 && clean.startsWith('1')) bankHint = 'BNI';
  // E-wallet biasanya nomor telepon
  else if (clean.startsWith('08') && clean.length >= 10 && clean.length <= 13) bankHint = 'e-wallet/telp';

  return {
    valid: true,
    cleaned: clean,
    length: clean.length,
    bankHint,
    observations,
    // Tautan verifikasi nyata:
    verifyUrl: 'https://cekrekening.id',
    reportUrl: 'https://lapor.go.id',
    statusCode: 'noReportFound', // Selalu ini karena kita TIDAK punya database
  };
}

/** Observasi struktural nomor telepon. */
export function analyzePhoneNumber(raw) {
  const clean = String(raw || '').replace(/[\s\-().+]+/g, '');
  // Normalisasi 62xxx -> 0xxx
  const normalized = clean.startsWith('62') && clean.length > 10 ? `0${clean.slice(2)}` : clean;

  if (!/^0\d{8,13}$/.test(normalized) && !/^\d{8,14}$/.test(normalized)) {
    return { valid: false, reasonCode: 'invalidPhoneFormat' };
  }

  const observations = [];

  // Awalan operator Indonesia
  const prefix = normalized.slice(0, 4);
  let carrierHint = null;
  if (['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853'].includes(prefix)) carrierHint = 'Telkomsel';
  else if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) carrierHint = 'Indosat';
  else if (['0817', '0818', '0819', '0859', '0877', '0878'].includes(prefix)) carrierHint = 'XL Axiata';
  else if (['0831', '0832', '0833', '0838'].includes(prefix)) carrierHint = 'Axis';
  else if (['0895', '0896', '0897', '0898', '0899'].includes(prefix)) carrierHint = 'Three (3)';
  else if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix)) carrierHint = 'Smartfren';

  // Nomor terlalu panjang (melebihi standar Indonesia)
  if (normalized.length > 13) observations.push('unusualLength');
  if (/(\d)\1{6,}/.test(normalized)) observations.push('repeatingDigits');

  return {
    valid: true,
    cleaned: normalized,
    length: normalized.length,
    carrierHint,
    observations,
    verifyUrl: 'https://aduannomor.id',
    statusCode: 'noReportFound',
  };
}

/** Observasi keamanan URL. */
export function analyzeUrl(raw) {
  const parsed = parseUrl(raw);
  if (!parsed.ok) {
    return { valid: false, reasonCode: 'invalidUrl' };
  }

  const url = parsed.url;
  const { host, domain, signals } = inspectUrl(url);

  const riskIndicators = [];

  if (signals.includes('no-https')) riskIndicators.push('noHttps');
  if (signals.includes('shortener')) riskIndicators.push('urlShortener');
  if (signals.includes('low-trust-tld')) riskIndicators.push('lowTrustTld');
  if (signals.includes('many-hyphens')) riskIndicators.push('manyHyphens');
  if (signals.includes('deep-subdomain')) riskIndicators.push('deepSubdomain');
  if (signals.includes('apk-download')) riskIndicators.push('apkDownload');
  if (signals.includes('institution-name-outside-official-domain')) riskIndicators.push('institutionImpersonation');
  if (signals.includes('gov-domain')) riskIndicators.push('govDomain');
  if (signals.includes('academic-domain')) riskIndicators.push('academicDomain');

  const isHighRisk = riskIndicators.some((r) =>
    ['apkDownload', 'institutionImpersonation'].includes(r)
  );
  const isSuspicious = riskIndicators.some((r) =>
    ['noHttps', 'lowTrustTld', 'urlShortener', 'manyHyphens', 'deepSubdomain'].includes(r)
  );

  let statusCode = 'noIssuesObserved';
  if (isHighRisk) statusCode = 'highRiskObserved';
  else if (isSuspicious) statusCode = 'suspiciousIndicators';

  return {
    valid: true,
    url: url.toString(),
    host,
    domain,
    hasHttps: url.protocol === 'https:',
    isShortener: isShortener(host),
    riskIndicators,
    statusCode,
  };
}

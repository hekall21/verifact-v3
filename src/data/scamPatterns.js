/**
 * scamPatterns.js
 *
 * VeriFact ID 4.1 — Threat Intelligence Gateway Wrapper
 * Menyediakan interoperabilitas mundur untuk modul ScamShield dan pengujian.
 *
 * PERBEDAAN KRUSIAL:
 * - "Tidak ditemukan laporan" ≠ "AMAN" (absence of evidence ≠ evidence of safety)
 * - "HTTPS ≠ AMAN" (enkripsi data tidak menjamin pemilik situs kredibel)
 * - TLD murah (.xyz, .top) bukan otomatis phishing tanpa bukti peniruan brand
 */

import { analyzeAccountNumber as analyzeAcc } from '../services/threatIntel/AccountNumberAnalyzer.js';
import { analyzePhoneNumber as analyzePh } from '../services/threatIntel/PhoneThreatAnalyzer.js';
import { analyzeUrl as analyzeU } from '../services/threatIntel/UrlThreatAnalyzer.js';

export function analyzeAccountNumber(raw, opts) {
  const result = analyzeAcc(raw, opts);
  return {
    ...result,
    cleaned: result.accountNumber,
    bankHint: result.bank,
    statusCode: result.status === 'CONFIRMED_REPORTED' || result.status === 'REPORTED'
      ? 'reportedThreat'
      : result.status === 'NO_REPORT_FOUND'
      ? 'noReportFound'
      : result.status.toLowerCase(),
  };
}

export function analyzePhoneNumber(raw, opts) {
  const result = analyzePh(raw, opts);
  return {
    ...result,
    cleaned: result.phoneNumber,
    carrierHint: result.carrier,
    statusCode: result.status === 'CONFIRMED_SCAM' || result.status === 'REPORTED_SCAM'
      ? 'reportedThreat'
      : result.status === 'NO_REPORT_FOUND'
      ? 'noReportFound'
      : result.status.toLowerCase(),
  };
}

export function analyzeUrl(raw, opts) {
  const result = analyzeU(raw, opts);
  return {
    ...result,
    host: result.domain,
    hasHttps: result.sslInfo?.hasHttps || false,
    riskIndicators: result.indicators || [],
    statusCode: result.status === 'MALICIOUS' || result.status === 'PHISHING' || result.status === 'MALWARE'
      ? 'highRiskObserved'
      : result.status === 'SUSPICIOUS'
      ? 'suspiciousIndicators'
      : result.status === 'NO_THREAT_FOUND'
      ? 'noIssuesObserved'
      : result.status.toLowerCase(),
  };
}

/**
 * ThreatIntelProvider.js
 *
 * VeriFact ID 4.1 — Threat Intelligence Architecture
 * Gateway terpadu untuk analisis ancaman:
 * - Rekening Bank & E-Wallet (AccountNumberAnalyzer)
 * - Nomor Telepon & Kontak Seluler (PhoneThreatAnalyzer)
 * - URL, Phishing & Malware (UrlThreatAnalyzer)
 */

import { analyzeAccountNumber } from './AccountNumberAnalyzer.js';
import { analyzePhoneNumber } from './PhoneThreatAnalyzer.js';
import { analyzeUrl } from './UrlThreatAnalyzer.js';

export { analyzeAccountNumber } from './AccountNumberAnalyzer.js';
export { analyzePhoneNumber } from './PhoneThreatAnalyzer.js';
export { analyzeUrl } from './UrlThreatAnalyzer.js';

export const ThreatIntelProvider = {
  analyzeAccount: (accountNo, opts) => analyzeAccountNumber(accountNo, opts),
  analyzePhone: (phoneNo, opts) => analyzePhoneNumber(phoneNo, opts),
  analyzeUrl: (url, opts) => analyzeUrl(url, opts),
};

export default ThreatIntelProvider;

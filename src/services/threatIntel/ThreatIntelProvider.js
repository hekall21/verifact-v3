/**
 * src/services/threatIntel/ThreatIntelProvider.js
 *
 * VeriFact ID 4.2 — Unified Threat Intelligence Gateway
 *
 * Menyediakan antarmuka standar untuk:
 * - checkAccount(accountNo, opts)
 * - checkPhone(phoneNo, opts)
 * - checkUrl(url, opts)
 * - checkDomain(domain, opts)
 * - checkMessage(message, opts)
 * - getDemoFixtures()
 */

import { analyzeAccountNumber } from './AccountNumberAnalyzer.js';
import { analyzePhoneNumber } from './PhoneThreatAnalyzer.js';
import { analyzeUrl } from './UrlThreatAnalyzer.js';
import { analyzeMessageThreat } from './MessageThreatAnalyzer.js';
import { DEMO_FIXTURES } from './demoFixtures.js';

export { analyzeAccountNumber } from './AccountNumberAnalyzer.js';
export { analyzePhoneNumber } from './PhoneThreatAnalyzer.js';
export { analyzeUrl } from './UrlThreatAnalyzer.js';
export { analyzeMessageThreat } from './MessageThreatAnalyzer.js';
export { DEMO_FIXTURES } from './demoFixtures.js';

export const ThreatIntelProvider = {
  checkAccount: (accountNo, opts) => analyzeAccountNumber(accountNo, opts),
  checkPhone: (phoneNo, opts) => analyzePhoneNumber(phoneNo, opts),
  checkUrl: (url, opts) => analyzeUrl(url, opts),
  checkDomain: (domain, opts) => analyzeUrl(`https://${domain}`, opts),
  checkMessage: (message, opts) => analyzeMessageThreat(message, opts),
  analyzeAccount: (accountNo, opts) => analyzeAccountNumber(accountNo, opts),
  analyzePhone: (phoneNo, opts) => analyzePhoneNumber(phoneNo, opts),
  analyzeUrl: (url, opts) => analyzeUrl(url, opts),
  analyzeMessage: (message, opts) => analyzeMessageThreat(message, opts),
  getDemoFixtures: () => DEMO_FIXTURES,
};

export default ThreatIntelProvider;

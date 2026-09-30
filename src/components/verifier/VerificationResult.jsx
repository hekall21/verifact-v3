/**
 * VerificationResult.jsx
 *
 * Laporan pemeriksaan fakta menyeluruh dan transparan (Redesign Total master prompt §12).
 * Menyajikan status (VerdictBadge), keyakinan terhitung (ConfidenceMeter),
 * rincian klaim (ClaimCard), bukti & tindakan (EvidenceTimeline), serta sumber (SourceCard).
 */

import React, { useState } from 'react';
import { VerdictBadge } from './VerdictBadge.jsx';
import { ConfidenceMeter } from './ConfidenceMeter.jsx';
import { ClaimCard } from './ClaimCard.jsx';
import { EvidenceTimeline } from './EvidenceTimeline.jsx';
import { SourceCard } from './SourceCard.jsx';
import { CopyIcon, CheckIcon, RefreshIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function VerificationResult({ result = {}, onReset, lang = 'id' }) {
  const [copied, setCopied] = useState(false);

  const {
    verdict,
    reasonCodes = [],
    confidence = {},
    claim = {},
    sourceInaccessible = false,
    matchedPatterns = [],
    evidenceList = [],
    officialChannels = [],
    searchLinks = [],
    timestamp,
  } = result;

  const handleCopySummary = () => {
    const verdictLabel = t(lang, `verifier.verdict.${verdict}.label`) || verdict;
    const summaryText = `[VeriFact ID 3.0 Report]
Status: ${verdictLabel} (Keyakinan: ${confidence.score || 0}%)
Klaim: "${claim.mainClaim || ''}"
Waktu Pemeriksaan: ${new Date(timestamp || Date.now()).toLocaleString()}
Detail Verifikasi: https://verifact.id`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 vf-fade-up">
      {/* Top Banner: Status Verdict & Key Summary */}
      <div className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-4"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4"
          style={{ borderColor: 'var(--vf-border)' }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
              {t(lang, 'verifier.result.title')}
            </span>
            <VerdictBadge verdict={verdict} lang={lang} size="lg" />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm border"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
                color: 'var(--vf-text)',
              }}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-3.5 h-3.5" />
                  <span>{t(lang, 'verifier.result.copyReportBtn')}</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm text-white"
              style={{
                backgroundColor: 'var(--vf-primary)',
              }}
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>{t(lang, 'verifier.result.newCheckBtn')}</span>
            </button>
          </div>
        </div>

        {/* Verdict Summary Text */}
        <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
          {t(lang, `verifier.verdict.${verdict}.summary`)}
        </p>

        {/* Confidence Meter Section */}
        <ConfidenceMeter confidence={confidence} lang={lang} />
      </div>

      {/* Claim Breakdown Card */}
      <ClaimCard
        claim={claim}
        reasonCodes={reasonCodes}
        sourceInaccessible={sourceInaccessible}
        lang={lang}
      />

      {/* Evidence Timeline & Scam Signals */}
      <EvidenceTimeline
        matchedPatterns={matchedPatterns}
        evidenceList={evidenceList}
        lang={lang}
      />

      {/* Source Cards & Direct Verifications */}
      <SourceCard
        officialChannels={officialChannels}
        searchLinks={searchLinks}
        lang={lang}
      />
    </div>
  );
}

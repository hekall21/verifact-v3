/**
 * VerificationResult.jsx
 *
 * VeriFact ID 4.0 — Evidence Intelligence Platform
 * Laporan pemeriksaan fakta transparan dengan:
 * - Atomic Claim Decomposition
 * - Evidence Ledger
 * - Source Independence Clusters
 * - Conflict Detection
 * - Temporal Analysis
 * - Verification ID & SHA-256 Report Hash
 * - "Why This Result?" Explainability Mode
 */

import React, { useState } from 'react';
import { VerdictBadge } from './VerdictBadge.jsx';
import { ConfidenceMeter } from './ConfidenceMeter.jsx';
import { ClaimCard } from './ClaimCard.jsx';
import { EvidenceTimeline } from './EvidenceTimeline.jsx';
import { SourceCard } from './SourceCard.jsx';
import { AtomicClaimsCard } from './AtomicClaimsCard.jsx';
import { EvidenceLedger } from './EvidenceLedger.jsx';
import { SourceClustersCard } from './SourceClustersCard.jsx';
import { ConflictAlertBanner } from './ConflictAlertBanner.jsx';
import { TemporalTimelineCard } from './TemporalTimelineCard.jsx';
import { WhyThisResultModal } from './WhyThisResultModal.jsx';
import { CopyIcon, CheckIcon, RefreshIcon, SearchIcon } from '../common/Icons.jsx';
import { buildShareableReportUrl } from '../../utils/reportIntegrity.js';
import { t } from '../../i18n/index.js';

export function VerificationResult({ result = {}, onReset, lang = 'id' }) {
  const [copied, setCopied] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

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
    verificationId,
    reportHash,
    atomicClaims = [],
    sourceClusters = [],
    conflictAnalysis = {},
    temporalAnalysis = {},
    limitations = [],
    auditTrail = [],
    generatedQueries = [],
  } = result;

  const handleCopySummary = () => {
    const verdictLabel = t(lang, `verifier.verdict.${verdict}.label`) || verdict;
    const summaryText = `[VeriFact ID 4.0 Report]
Verification ID: ${verificationId || 'VF-2026-XXXXXX'}
Status: ${verdictLabel} (Confidence: ${confidence.score || 0}%)
Source Coverage: ${confidence.sourceCoverage || 'Low'}
Claim: "${claim.mainClaim || ''}"
Timestamp: ${new Date(timestamp || Date.now()).toISOString()}
Report Hash: ${reportHash || 'N/A'}
Detail: ${buildShareableReportUrl(verificationId || '')}`;

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
      <div
        className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-4"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4"
          style={{ borderColor: 'var(--vf-border)' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                {verificationId || 'VF-2026-XXXXXX'}
              </span>
              {reportHash && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                  {reportHash.slice(0, 20)}...
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
              {t(lang, 'verifier.result.title')}
            </span>
            <VerdictBadge verdict={verdict} lang={lang} size="lg" />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setWhyOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm border"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
                color: 'var(--vf-text)',
              }}
            >
              <SearchIcon className="w-3.5 h-3.5" />
              <span>{lang === 'id' ? 'Mengapa Hasil Ini?' : 'Why This Result?'}</span>
            </button>

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
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm border"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
                color: 'var(--vf-text)',
              }}
            >
              <CopyIcon className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            <button
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm text-white"
              style={{ backgroundColor: 'var(--vf-primary)' }}
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

        {/* Limitations */}
        {limitations && limitations.length > 0 && (
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
            <span className="font-bold text-amber-500 block mb-1">
              {lang === 'id' ? 'Batasan Sistem:' : 'System Limitations:'}
            </span>
            <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
              {limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Conflict Alert Banner */}
      <ConflictAlertBanner conflictAnalysis={conflictAnalysis} lang={lang} />

      {/* Atomic Claims Card */}
      <AtomicClaimsCard atomicClaims={atomicClaims} lang={lang} />

      {/* Evidence Ledger */}
      <EvidenceLedger evidenceList={evidenceList} lang={lang} />

      {/* Source Clusters */}
      <SourceClustersCard sourceClusters={sourceClusters} lang={lang} />

      {/* Temporal Timeline */}
      <TemporalTimelineCard temporalAnalysis={temporalAnalysis} lang={lang} />

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

      {/* Why This Result Modal */}
      <WhyThisResultModal
        isOpen={whyOpen}
        onClose={() => setWhyOpen(false)}
        result={result}
        lang={lang}
      />
    </div>
  );
}

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
    evidenceList = result.evidence || result.evidenceList || [],
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
    honestNotice = result.honestNotice,
    sourceAttributionNotice = result.sourceAttributionNotice,
    patternSignals = result.patternSignals || [],
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

        {/* Source Content Inaccessible / Honest Notice */}
        {honestNotice && (
          <div className="p-4 sm:p-5 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-sm sm:text-base text-amber-400 tracking-wide uppercase">
                  {honestNotice.title || (lang === 'id' ? 'ARTIKEL TIDAK DAPAT DIBACA' : 'SOURCE CONTENT UNAVAILABLE')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {honestNotice.message || (lang === 'id'
                    ? 'Kami berhasil mengenali URL ini, tetapi isi artikel tidak dapat diakses. Karena isi sumber tidak berhasil dibaca, VeriFact tidak akan membuat kesimpulan berdasarkan URL saja.'
                    : 'The URL was recognized, but content could not be read. VeriFact will not infer a verdict from the URL alone.')}
                </p>
                {honestNotice.suggestions && honestNotice.suggestions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {honestNotice.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={onReset}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Official Source Attribution Notice */}
        {sourceAttributionNotice && (
          <div className="p-3.5 rounded-xl border bg-sky-500/10 border-sky-500/30 text-sky-200 text-xs sm:text-sm flex items-start gap-2.5">
            <span className="text-sky-400 font-bold text-base">🔍</span>
            <div className="flex-1">
              <span className="font-semibold text-sky-300 block mb-0.5">
                {lang === 'id' ? 'Atribusi Pemeriksaan Resmi / Tersimpan' : 'Official / Prior Verification Attribution'}
              </span>
              <p className="text-slate-300 leading-relaxed">{sourceAttributionNotice}</p>
            </div>
          </div>
        )}

        {/* Scam / Manipulation Pattern Signals */}
        {patternSignals && patternSignals.length > 0 && (
          <div className="p-4 rounded-xl border bg-purple-500/10 border-purple-500/30 space-y-2.5">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs sm:text-sm">
              <span>🛡️</span>
              <span>
                {lang === 'id'
                  ? 'Sinyal Pola Scam / Manipulasi Terdeteksi'
                  : 'Scam / Manipulation Pattern Signals Detected'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {patternSignals.map((sig, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-black/25 border border-purple-500/20 space-y-1">
                  <div className="font-bold text-purple-300">{sig.patternName || sig.patternMatch}</div>
                  <div className="text-slate-300 text-[11px] leading-relaxed">{sig.explanation || sig.indicator}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-purple-300/70 italic">
              * {lang === 'id'
                ? 'Catatan Integritas: Sinyal pola di atas menunjukkan indikator risiko struktural, bukan vonis mutlak tanpa bukti faktual.'
                : 'Integrity note: Pattern signals flag structural risk indicators, not definitive verdicts without empirical evidence.'}
            </p>
          </div>
        )}

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

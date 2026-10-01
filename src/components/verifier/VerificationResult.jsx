/**
 * src/components/verifier/VerificationResult.jsx
 *
 * VeriFact ID 4.2 — Clean Transparent Verification Result
 *
 * Struktur Hasil Terstruktur & Cepat Dipahami (§35 & §36):
 * 1. [Verdict Badge] + Klaim Utama + Ringkasan Eksekutif
 * 2. Confidence Card Terpisah ("Tingkat Keyakinan Hasil" dengan breakdown)
 * 3. Ringkasan Cepat Sumber (Berapa sumber diperiksa, resmi, media, periksa fakta)
 * 4. Navigasi Tab / Accordion:
 *    - Ringkasan (Atomic claims & Why This Result)
 *    - Bukti yang Ditemukan (Mendukung & Membantah)
 *    - Sumber yang Diperiksa & Kluster Independen
 *    - Linimasa Temporal
 *    - Keterbatasan Jujur & Metodologi
 * 5. Dukungan penuh Dark/Light Mode dengan CSS variable tokens (tanpa hardcoded text-slate-300).
 */

import React, { useState } from 'react';
import { VerdictBadge } from './VerdictBadge.jsx';
import { ConfidenceMeter } from './ConfidenceMeter.jsx';
import { EvidenceLedger } from './EvidenceLedger.jsx';
import { SourceClustersCard } from './SourceClustersCard.jsx';
import { ConflictAlertBanner } from './ConflictAlertBanner.jsx';
import { TemporalTimelineCard } from './TemporalTimelineCard.jsx';
import { WhyThisResultModal } from './WhyThisResultModal.jsx';
import { CopyIcon, CheckIcon, RefreshIcon, SearchIcon, ExternalLinkIcon, ShieldIcon } from '../common/Icons.jsx';
import { buildShareableReportUrl } from '../../utils/reportIntegrity.js';
import { t } from '../../i18n/index.js';

export function VerificationResult({ result = {}, onReset, onRetry, lang = 'id' }) {
  const [copied, setCopied] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(result.claim ? 'summary' : 'limitations');

  const {
    status = result.verdict,
    verdict,
    confidence = null,
    claim = null,
    sourceInaccessible = false,
    evidence = [],
    timestamp,
    verificationId,
    reportHash,
    atomicClaims = [],
    sourceClusters = [],
    conflictAnalysis = {},
    temporalAnalysis = {},
    limitations = [],
    auditTrail = [],
    honestNotice = result.honestNotice,
    sourceAttributionNotice = result.sourceAttributionNotice,
    patternSignals = result.patternSignals || [],
    isNewsHomepage = result.isNewsHomepage || false,
  } = result;

  const isSourceUnavailable = status === 'SOURCE_CONTENT_UNAVAILABLE' || verdict === 'SOURCE_CONTENT_UNAVAILABLE' || claim === null;
  const isHomepage = status === 'NEWS_HOMEPAGE_DETECTED' || verdict === 'NEWS_HOMEPAGE_DETECTED' || isNewsHomepage;

  const gatheredEvidences = evidence || [];
  const primaryCount = isSourceUnavailable ? '—' : gatheredEvidences.filter((e) => e.tier === 1).length;
  const mediaCount = isSourceUnavailable ? '—' : gatheredEvidences.filter((e) => e.tier === 2).length;
  const factCheckCount = isSourceUnavailable ? '—' : gatheredEvidences.filter((e) => e.tier === 3 || e.sourceType === 'fact_check').length;

  const handleCopySummary = () => {
    const verdictLabel = t(lang, `verifier.verdict.${verdict}.label`) || verdict;
    const confidenceText = (confidence && typeof confidence.score === 'number')
      ? `${confidence.score}%`
      : (lang === 'id' ? 'N/A (Belum Tersedia)' : 'N/A (Not Available)');
    const claimText = claim?.mainClaim || (lang === 'id' ? '[Isi artikel belum berhasil dibaca]' : '[Source content unavailable]');

    const summaryText = `[VeriFact ID 4.2 Report]
Verification ID: ${verificationId || 'VF-2026-XXXXXX'}
Status: ${verdictLabel} (Keyakinan Hasil: ${confidenceText})
Cakupan: ${confidence?.sourceCoverage || 'N/A'}
Klaim: "${claimText}"
Waktu: ${new Date(timestamp || Date.now()).toISOString()}
Detail: ${buildShareableReportUrl(verificationId || '')}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sections = [
    { id: 'summary', label: lang === 'id' ? 'Ringkasan & Klaim' : 'Summary & Claims', count: atomicClaims.length },
    { id: 'evidence', label: lang === 'id' ? 'Bukti Ditemukan' : 'Evidence', count: gatheredEvidences.length },
    { id: 'sources', label: lang === 'id' ? 'Sumber Diperiksa' : 'Sources', count: sourceClusters.length },
    { id: 'timeline', label: lang === 'id' ? 'Linimasa' : 'Timeline' },
    { id: 'limitations', label: lang === 'id' ? 'Keterbatasan & Metode' : 'Limitations' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 vf-fade-up">
      {/* 1. TOP CARD: VERDICT BANNER & EXECUTIVE SUMMARY */}
      <div
        className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-5"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        {/* Verification ID & Quick Actions */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--vf-border)' }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {verificationId || 'VF-2026-XXXXXX'}
            </span>
            {reportHash && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                Hash: {reportHash.slice(0, 16)}...
              </span>
            )}
            <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
              {new Date(timestamp || Date.now()).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setWhyOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm border hover:opacity-85"
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
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm border hover:opacity-85"
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
              type="button"
              onClick={onReset}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm text-white hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--vf-primary)' }}
            >
              <RefreshIcon className="w-3.5 h-3.5" />
              <span>{t(lang, 'verifier.result.newCheckBtn')}</span>
            </button>
          </div>
        </div>

        {/* Verdict Badge & Main Claim Headline */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={verdict} lang={lang} size="lg" />
          </div>

          {claim && claim.mainClaim ? (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
                {lang === 'id' ? 'Klaim Utama yang Diperiksa:' : 'Primary Claim Verified:'}
              </span>
              <h2
                className="text-lg sm:text-2xl font-bold tracking-tight leading-snug"
                style={{
                  color: 'var(--vf-text)',
                  fontFamily: 'var(--font-display)',
                  maxWidth: '65ch',
                }}
              >
                &ldquo;{claim.mainClaim}&rdquo;
              </h2>
            </div>
          ) : (
            /* Dedicated UI When Article Retrieval Failed or Root Domain Detected (§4 & §5) */
            <div
              className="p-5 rounded-2xl border space-y-4 my-2"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-block">
                  {isHomepage ? 'NEWS HOMEPAGE' : 'SOURCE CONTENT UNAVAILABLE'}
                </span>
                <h3
                  className="text-base sm:text-xl font-bold tracking-tight"
                  style={{ color: 'var(--vf-text)', fontFamily: 'var(--font-display)' }}
                >
                  {isHomepage
                    ? (lang === 'id' ? 'Halaman Utama Portal Media Terdeteksi' : 'News Portal Homepage Detected')
                    : (lang === 'id' ? 'Konten Artikel Belum Berhasil Dibaca' : 'Article Content Could Not Be Retrieved')}
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                  {isHomepage
                    ? (lang === 'id'
                        ? 'Tautan yang dimasukkan merupakan alamat beranda portal media, bukan URL artikel berita tertentu. Untuk verifikasi faktual, masukkan URL artikel spesifik.'
                        : 'The URL entered is the homepage of a news publisher, not a specific article. Please enter a specific article link to run verification.')
                    : (lang === 'id'
                        ? 'Artikel terdeteksi, tetapi isi halaman belum berhasil dibaca oleh server (bukan vonis salah/benar terhadap isi berita).'
                        : 'The article link was recognized, but the page body text could not be extracted by the crawler.')}
                </p>
              </div>

              {!isHomepage && (
                <div className="space-y-1.5 pt-2 border-t text-xs" style={{ borderColor: 'var(--vf-border)' }}>
                  <span className="font-semibold block" style={{ color: 'var(--vf-text)' }}>
                    {lang === 'id' ? 'Alasan teknis pembatasan perayapan:' : 'Technical extraction limitations:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-500">&bull;</span>
                      <span>Request timeout / perlambatan jaringan</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-500">&bull;</span>
                      <span>Proteksi bot / verifikasi Cloudflare WAF</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-500">&bull;</span>
                      <span>Halaman memerlukan JavaScript client rendering</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-500">&bull;</span>
                      <span>Artikel tertutup paywall / login anggota</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={onReset}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow hover:opacity-90 active:scale-95 transition-all"
                  style={{ backgroundColor: 'var(--vf-primary)' }}
                >
                  {lang === 'id' ? 'Tempel Teks Artikel' : 'Paste Article Text'}
                </button>

                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border shadow-sm hover:opacity-85 active:scale-95 transition-all flex items-center space-x-1.5"
                    style={{
                      backgroundColor: 'var(--vf-surface)',
                      borderColor: 'var(--vf-border)',
                      color: 'var(--vf-text)',
                    }}
                  >
                    <RefreshIcon className="w-3.5 h-3.5" />
                    <span>{lang === 'id' ? 'Coba Lagi (Retry)' : 'Retry'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onReset}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border shadow-sm hover:opacity-85 active:scale-95 transition-all"
                  style={{
                    backgroundColor: 'var(--vf-surface)',
                    borderColor: 'var(--vf-border)',
                    color: 'var(--vf-text)',
                  }}
                >
                  {lang === 'id' ? 'Masukkan URL Artikel Lain' : 'Enter Another URL'}
                </button>
              </div>
            </div>
          )}

          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{
              color: 'var(--vf-text-secondary)',
              lineHeight: 1.5,
              maxWidth: '65ch',
            }}
          >
            {t(lang, `verifier.verdict.${verdict}.summary`)}
          </p>
        </div>

        {/* Honest Notice for Inaccessible Source / News Homepage */}
        {honestNotice && claim && (
          <div
            className="p-4 sm:p-5 rounded-xl border space-y-3"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-warning) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--vf-warning) 30%, transparent)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
                <h4 className="font-bold tracking-wide uppercase text-amber-600 dark:text-amber-400">
                  {honestNotice.title}
                </h4>
                <p style={{ color: 'var(--vf-text-secondary)' }}>
                  {honestNotice.message}
                </p>
                {honestNotice.actionSuggestions && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {honestNotice.actionSuggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={onReset}
                        className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors border text-amber-700 dark:text-amber-300 hover:opacity-85"
                        style={{
                          backgroundColor: 'color-mix(in srgb, var(--vf-warning) 15%, transparent)',
                          borderColor: 'color-mix(in srgb, var(--vf-warning) 35%, transparent)',
                        }}
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

        {/* Attribution Notice when Reusing Pre-Verified Fact Check */}
        {sourceAttributionNotice && (
          <div
            className="p-3.5 rounded-xl border flex items-center gap-2.5 text-xs"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-primary) 8%, transparent)',
              borderColor: 'color-mix(in srgb, var(--vf-primary) 25%, transparent)',
              color: 'var(--vf-text)',
            }}
          >
            <ShieldIcon className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>{sourceAttributionNotice}</span>
          </div>
        )}

        {/* Quick Snapshot Metrics (§36) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
          <div
            className="p-3 rounded-xl border text-center"
            style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
          >
            <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Total Bukti</span>
            <span className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
              {isSourceUnavailable ? '—' : `${gatheredEvidences.length} Sumber`}
            </span>
          </div>
          <div
            className="p-3 rounded-xl border text-center"
            style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
          >
            <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Sumber Resmi</span>
            <span className="text-base font-bold text-sky-600 dark:text-sky-400">
              {isSourceUnavailable ? '—' : `${primaryCount} Otoritas`}
            </span>
          </div>
          <div
            className="p-3 rounded-xl border text-center"
            style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
          >
            <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Media Kredibel</span>
            <span className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
              {isSourceUnavailable ? '—' : `${mediaCount} Redaksi`}
            </span>
          </div>
          <div
            className="p-3 rounded-xl border text-center"
            style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
          >
            <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Periksa Fakta</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {isSourceUnavailable ? '—' : `${factCheckCount} Koalisi`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CONFIDENCE METER (SEPARATE DEDICATED CARD) */}
      <ConfidenceMeter confidence={confidence} lang={lang} />

      {/* 3. SECTION ACCORDION / TABS */}
      <div
        className="rounded-2xl p-6 border shadow-sm space-y-6"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-2 border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isActive ? 'shadow-sm font-bold' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--vf-primary)' : 'var(--vf-surface-muted)',
                  color: isActive ? '#FFFFFF' : 'var(--vf-text-secondary)',
                  border: isActive ? '1px solid var(--vf-primary)' : '1px solid var(--vf-border)',
                }}
              >
                <span>{sec.label}</span>
                {sec.count !== undefined && sec.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-500/15 text-slate-400'
                    }`}
                  >
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Summary & Atomic Claims */}
        {activeSection === 'summary' && (
          <div className="space-y-6">
            {atomicClaims.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--vf-text-muted)' }}>
                  Dekomposisi Klaim Atomik ({atomicClaims.length})
                </h4>
                <div className="space-y-2">
                  {atomicClaims.map((ac, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border flex items-start justify-between gap-3 text-xs"
                      style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                    >
                      <div className="space-y-1">
                        <span className="font-semibold block" style={{ color: 'var(--vf-text)' }}>
                          {idx + 1}. {ac.text}
                        </span>
                        {ac.basis && (
                          <span className="text-[11px] block" style={{ color: 'var(--vf-text-secondary)' }}>
                            Dasar: {ac.basis}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                          ac.status === 'SUPPORTED'
                            ? 'bg-emerald-500/15 text-emerald-500'
                            : ac.status === 'REFUTED'
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {ac.status || 'UNVERIFIED'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conflictAnalysis?.hasConflict && (
              <ConflictAlertBanner conflict={conflictAnalysis} lang={lang} />
            )}
          </div>
        )}

        {/* Tab 2: Evidence Ledger */}
        {activeSection === 'evidence' && (
          <EvidenceLedger evidence={gatheredEvidences} lang={lang} />
        )}

        {/* Tab 3: Sources & Independence Clusters */}
        {activeSection === 'sources' && (
          <SourceClustersCard clusters={sourceClusters} lang={lang} />
        )}

        {/* Tab 4: Temporal Timeline */}
        {activeSection === 'timeline' && (
          <TemporalTimelineCard temporal={temporalAnalysis} lang={lang} />
        )}

        {/* Tab 5: Limitations & Methodology */}
        {activeSection === 'limitations' && (
          <div className="space-y-6 text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--vf-text)' }}>
                Keterbatasan Transparan Sistem
              </h4>
              <ul className="list-disc list-inside space-y-1.5">
                {limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm mb-2" style={{ color: 'var(--vf-text)' }}>
                Jejak Audit Pemeriksaan (Audit Trail)
              </h4>
              <div className="space-y-2">
                {auditTrail.map((tr, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border flex items-start gap-2.5"
                    style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                  >
                    <span className="font-mono font-bold text-indigo-500 shrink-0">#{tr.step}</span>
                    <div>
                      <span className="font-semibold block" style={{ color: 'var(--vf-text)' }}>{tr.title}</span>
                      <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>{tr.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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

export default VerificationResult;

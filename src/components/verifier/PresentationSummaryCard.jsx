/**
 * src/components/verifier/PresentationSummaryCard.jsx
 *
 * VeriFact ID 4.3 — Presentation Summary Card (§31 & §38)
 *
 * Menjawab langsung 6 Pertanyaan Kunci Pengguna & Penguji:
 * 1. Apa yang saya masukkan? (Input Type)
 * 2. Apa yang ditemukan? (Source & Content status)
 * 3. Apa hasilnya? (Verdict & Status)
 * 4. Kenapa hasilnya begitu? (Ringkasan pertimbangan evidence)
 * 5. Seberapa kuat buktinya? (Confidence percentage atau N/A)
 * 6. Sumber mana yang digunakan? (Official, Media, Fact Checks, Kluster)
 */

import React from 'react';
import { ShieldIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon } from '../common/Icons.jsx';

export function PresentationSummaryCard({ result = {}, lang = 'id' }) {
  const {
    inputType = 'CLAIM_TEXT',
    sourceAssessment = {},
    claimAssessment = {},
    presentationSummary = {},
    verdict,
    confidence,
    evidence = [],
    stats = {},
  } = result;

  const isHomepage = inputType === 'URL_HOME' || verdict === 'IDENTIFIED_SOURCE' || verdict === 'NEWS_HOMEPAGE_DETECTED';
  const isUnavailable = verdict === 'SOURCE_CONTENT_UNAVAILABLE' || claimAssessment?.claim === null;
  const isPhone = inputType === 'PHONE_NUMBER';
  const isAccount = inputType === 'BANK_ACCOUNT';
  const isMessage = inputType === 'MESSAGE';
  const isPhishing = inputType === 'URL_PHISHING_SUSPECT';

  // Format Input Type Label
  const inputTypeLabel =
    presentationSummary.inputTypeLabel ||
    (isHomepage
      ? (lang === 'id' ? 'Beranda Situs Web / Media' : 'Website Homepage')
      : isPhone
      ? (lang === 'id' ? 'Nomor Telepon' : 'Phone Number')
      : isAccount
      ? (lang === 'id' ? 'Nomor Rekening' : 'Bank Account')
      : isMessage
      ? (lang === 'id' ? 'Pesan Chat / Scam' : 'Chat Message')
      : isPhishing
      ? (lang === 'id' ? 'Tautan Mencurigakan' : 'Suspect URL')
      : (lang === 'id' ? 'Artikel Berita' : 'News Article'));

  // Format Content Status
  const contentStatus =
    presentationSummary.contentStatus ||
    (isHomepage
      ? (lang === 'id' ? 'Beranda Terverifikasi' : 'Verified Homepage')
      : isUnavailable
      ? (lang === 'id' ? 'Belum Berhasil Dibaca' : 'Unavailable')
      : (lang === 'id' ? 'Berhasil Dibaca Lengkap' : 'Retrieved'));

  // Format Confidence Text
  const confidenceScore = confidence && typeof confidence.score === 'number' ? confidence.score : null;
  const confidenceDisplay = confidenceScore !== null ? `${confidenceScore}%` : 'N/A';

  // Format Result Label
  const resultLabel =
    presentationSummary.resultLabel ||
    (isHomepage
      ? (lang === 'id' ? 'SUMBER TERIDENTIFIKASI' : 'IDENTIFIED SOURCE')
      : verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE'
      ? (lang === 'id' ? 'BELUM TERBUKTI' : 'UNVERIFIED')
      : verdict === 'SUPPORTED'
      ? (lang === 'id' ? 'DIDUKUNG BUKTI' : 'SUPPORTED')
      : verdict === 'VERIFIED_TRUE' || verdict === 'FACT'
      ? (lang === 'id' ? 'FAKTA TERVERIFIKASI' : 'VERIFIED TRUE')
      : verdict === 'FALSE' || verdict === 'HOAX'
      ? (lang === 'id' ? 'SALAH / HOAKS' : 'FALSE')
      : verdict === 'MISLEADING'
      ? (lang === 'id' ? 'MENYESATKAN' : 'MISLEADING')
      : verdict === 'SOURCE_CONTENT_UNAVAILABLE'
      ? (lang === 'id' ? 'KONTEN BELUM TERSEDIA' : 'CONTENT UNAVAILABLE')
      : verdict || 'SELESAI');

  const getResultBadgeColor = () => {
    if (isHomepage) return { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' };
    if (verdict === 'VERIFIED_TRUE' || verdict === 'FACT') return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' };
    if (verdict === 'SUPPORTED') return { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-500/30' };
    if (verdict === 'MISLEADING') return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' };
    if (verdict === 'FALSE' || verdict === 'HOAX') return { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' };
    return { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/30' };
  };

  const badgeTheme = getResultBadgeColor();

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl border shadow-sm space-y-4 transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3.5" style={{ borderColor: 'var(--vf-border)' }}>
        <div className="flex items-center space-x-2">
          <ShieldIcon className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 font-mono">
            VERIFICATION EXECUTIVE SUMMARY (§31)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${badgeTheme.bg} ${badgeTheme.text} ${badgeTheme.border}`}>
            {resultLabel}
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 font-semibold">
            Confidence: {confidenceDisplay}
          </span>
        </div>
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Item 1: Input Type */}
        <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? '1. Jenis Masukan' : '1. Input Type'}
          </span>
          <span className="font-semibold block truncate" style={{ color: 'var(--vf-text)' }}>
            {inputTypeLabel}
          </span>
        </div>

        {/* Item 2: Source Publisher */}
        <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? '2. Identitas Sumber' : '2. Source / Publisher'}
          </span>
          <span className="font-semibold block truncate" style={{ color: 'var(--vf-text)' }}>
            {sourceAssessment.publisher || sourceAssessment.domain || 'Sumber Umum'}
          </span>
        </div>

        {/* Item 3: Content Status */}
        <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? '3. Pembacaan Isi' : '3. Content Status'}
          </span>
          <span className="font-semibold block truncate" style={{ color: 'var(--vf-text)' }}>
            {contentStatus}
          </span>
        </div>

        {/* Item 4: Evidence Count */}
        <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? '4. Bukti Faktual' : '4. Evidence Sources'}
          </span>
          <span className="font-semibold block" style={{ color: 'var(--vf-text)' }}>
            {evidence.length} {lang === 'id' ? 'Sumber' : 'Sources'}
          </span>
        </div>
      </div>

      {/* Second Row: Detailed Breakdown of Evidence & Claims */}
      {!isHomepage && (
        <div
          className="p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
          style={{
            backgroundColor: 'var(--vf-surface-muted)',
            borderColor: 'var(--vf-border)',
            color: 'var(--vf-text-secondary)',
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <span>
              Klaim Atomik: <strong style={{ color: 'var(--vf-text)' }}>{result.atomicClaims?.length || 0}</strong>
            </span>
            <span className="opacity-40">&bull;</span>
            <span>
              Sumber Resmi (Tier 1): <strong style={{ color: 'var(--vf-text)' }}>{stats.primaryCount ?? evidence.filter((e) => e.tier === 1).length}</strong>
            </span>
            <span className="opacity-40">&bull;</span>
            <span>
              Periksa Fakta (Tier 3): <strong style={{ color: 'var(--vf-text)' }}>{stats.factCheckCount ?? evidence.filter((e) => e.tier === 3 || e.sourceType === 'fact_check').length}</strong>
            </span>
            <span className="opacity-40">&bull;</span>
            <span>
              Kluster Independen: <strong style={{ color: 'var(--vf-text)' }}>{result.sourceClusters?.length || 0}</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Pipeline: 100% Selesai
          </div>
        </div>
      )}
    </div>
  );
}

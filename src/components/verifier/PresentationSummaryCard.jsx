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
  const aiAgent = result.geminiAgent;
  const hasAiAgent = Boolean(aiAgent && aiAgent.ok);

  // Format Confidence Text (Synthesize rule confidence with AI Agent confidence)
  const ruleConfidence = confidence && typeof confidence.score === 'number' ? confidence.score : null;
  const confidenceScore = ruleConfidence !== null ? ruleConfidence : (hasAiAgent ? aiAgent.confidenceScore : null);
  const confidenceDisplay =
    confidenceScore !== null
      ? (ruleConfidence !== null ? `${confidenceScore}%` : `${confidenceScore}% (AI Agent)`)
      : 'N/A';

  // Format Result Label
  let resultLabel = presentationSummary.resultLabel;
  if (!resultLabel) {
    if (isHomepage) {
      resultLabel = lang === 'id' ? 'SUMBER TERIDENTIFIKASI' : 'IDENTIFIED SOURCE';
    } else if (hasAiAgent && (verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE')) {
      if (aiAgent.agentVerdict === 'TERVERIFIKASI_FAKTUAL') {
        resultLabel = lang === 'id' ? 'FAKTUAL (AI AGENT)' : 'VERIFIED (AI AGENT)';
      } else if (aiAgent.agentVerdict === 'HOAKS_PALSU') {
        resultLabel = lang === 'id' ? 'HOAKS (AI AGENT)' : 'HOAX (AI AGENT)';
      } else if (aiAgent.agentVerdict === 'MENYESATKAN_MISLEADING') {
        resultLabel = lang === 'id' ? 'MENYESATKAN (AI AGENT)' : 'MISLEADING (AI AGENT)';
      } else {
        resultLabel = lang === 'id' ? 'BELUM TERBUKTI' : 'UNVERIFIED';
      }
    } else if (verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE') {
      resultLabel = lang === 'id' ? 'BELUM TERBUKTI' : 'UNVERIFIED';
    } else if (verdict === 'SUPPORTED') {
      resultLabel = lang === 'id' ? 'DIDUKUNG BUKTI' : 'SUPPORTED';
    } else if (verdict === 'VERIFIED_TRUE' || verdict === 'FACT') {
      resultLabel = lang === 'id' ? 'FAKTA TERVERIFIKASI' : 'VERIFIED TRUE';
    } else if (verdict === 'FALSE' || verdict === 'HOAX') {
      resultLabel = lang === 'id' ? 'SALAH / HOAKS' : 'FALSE';
    } else if (verdict === 'MISLEADING') {
      resultLabel = lang === 'id' ? 'MENYESATKAN' : 'MISLEADING';
    } else if (verdict === 'SOURCE_CONTENT_UNAVAILABLE') {
      resultLabel = lang === 'id' ? 'KONTEN BELUM TERSEDIA' : 'CONTENT UNAVAILABLE';
    } else {
      resultLabel = verdict || 'SELESAI';
    }
  }

  const getResultBadgeColor = () => {
    if (isHomepage) return { bg: 'bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30' };
    if (hasAiAgent && (verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE')) {
      if (aiAgent.agentVerdict === 'TERVERIFIKASI_FAKTUAL') {
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' };
      }
      if (aiAgent.agentVerdict === 'HOAKS_PALSU') {
        return { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' };
      }
      if (aiAgent.agentVerdict === 'MENYESATKAN_MISLEADING') {
        return { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' };
      }
    }
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
            VERIFACT ID 5.0 RESEARCH SUMMARY (§31 & §35)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {result.subType && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              {result.subType}
            </span>
          )}
          <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${badgeTheme.bg} ${badgeTheme.text} ${badgeTheme.border}`}>
            {resultLabel}
          </span>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/20 font-semibold">
            Confidence: {confidenceDisplay}
          </span>
        </div>
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Item 1: Input Type */}
        <div className="p-3 rounded-xl border space-y-1" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? '1. Klasifikasi Masukan' : '1. Input Classification'}
          </span>
          <span className="font-semibold block truncate" style={{ color: 'var(--vf-text)' }}>
            {result.subType ? `${inputTypeLabel} (${result.subType})` : inputTypeLabel}
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

      {/* SPECIAL HIGHLIGHT: GOOGLE AI STUDIO FORENSIC AGENT BLOCK */}
      {hasAiAgent && (
        <div
          className="p-4 rounded-xl border space-y-2.5 relative overflow-hidden"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--vf-primary) 6%, transparent)',
            borderColor: 'color-mix(in srgb, var(--vf-primary) 30%, transparent)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm">✨</span>
              <span className="font-bold text-xs uppercase tracking-wider text-cyan-400 font-mono">
                Google AI Studio Forensic Agent ({aiAgent.modelUsed || 'Gemini'})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                  aiAgent.agentVerdict === 'TERVERIFIKASI_FAKTUAL'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : aiAgent.agentVerdict === 'HOAKS_PALSU'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : aiAgent.agentVerdict === 'MENYESATKAN_MISLEADING'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {aiAgent.agentVerdict === 'TERVERIFIKASI_FAKTUAL'
                  ? 'TERVERIFIKASI FAKTUAL'
                  : aiAgent.agentVerdict === 'HOAKS_PALSU'
                  ? 'HOAKS / PALSU'
                  : aiAgent.agentVerdict === 'MENYESATKAN_MISLEADING'
                  ? 'MENYESATKAN (MISLEADING)'
                  : aiAgent.agentVerdict || 'ANALISIS AI SELESAI'}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
                Keyakinan ML: {aiAgent.confidenceScore}%
              </span>
            </div>
          </div>

          {aiAgent.verdictHeadline && (
            <p className="text-xs sm:text-sm font-semibold leading-relaxed" style={{ color: 'var(--vf-text)' }}>
              &ldquo;{aiAgent.verdictHeadline}&rdquo;
            </p>
          )}

          {aiAgent.executiveSummary && (
            <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
              {aiAgent.executiveSummary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono" style={{ color: 'var(--vf-text-muted)' }}>
            <span>
              Clickbait: <strong className="text-slate-200">{aiAgent.biasAndRhetoric?.clickbaitRating || 'Rendah'}</strong>
            </span>
            <span className="opacity-40">&bull;</span>
            <span>
              Kesesuaian Judul: <strong className="text-slate-200">{aiAgent.headlineAccuracy?.matchesContent ? 'Sesuai' : 'Perlu Diwaspadai'}</strong>
            </span>
            <span className="opacity-40">&bull;</span>
            <span>
              Manipulasi Emosi: <strong className="text-slate-200">{aiAgent.biasAndRhetoric?.emotionalManipulation || 'Netral'}</strong>
            </span>
          </div>
        </div>
      )}

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

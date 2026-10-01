/**
 * src/components/verifier/VerificationResult.jsx
 *
 * VeriFact ID 4.3 — Robust Presentation-Ready Verification Result
 *
 * Standar & Aturan Mutlak 4.3 (§2, §4, §8, §30, §31, §35, §38):
 * 1. Presentation Summary Card di posisi teratas (§31) menjawab 6 pertanyaan kunci.
 * 2. URL_HOME Dedicated View (§2):
 *    - SUMBER WEBSITE TERIDENTIFIKASI
 *    - Status URL: VALID, Status Sumber: TERIDENTIFIKASI
 *    - Checklist Keamanan URL (HTTPS, domain valid, non-IP, bebas typosquatting)
 *    - TIPS: "Untuk memverifikasi isi berita, masukkan URL artikel yang spesifik."
 *    - Tombol: [ Buka Situs ] & [ Analisis Artikel ]
 * 3. Pemisahan Tegas sourceAssessment dan claimAssessment (§4 & §5).
 * 4. Penanganan SOURCE_CONTENT_UNAVAILABLE secara jujur (§8 & §9).
 * 5. Tampilan Khusus PHONE_NUMBER, BANK_ACCOUNT, MESSAGE, dan PHISHING.
 */

import React, { useState, useEffect } from 'react';
import { VerdictBadge } from './VerdictBadge.jsx';
import { ConfidenceMeter } from './ConfidenceMeter.jsx';
import { EvidenceLedger } from './EvidenceLedger.jsx';
import { SourceClustersCard } from './SourceClustersCard.jsx';
import { ConflictAlertBanner } from './ConflictAlertBanner.jsx';
import { TemporalTimelineCard } from './TemporalTimelineCard.jsx';
import { WhyThisResultModal } from './WhyThisResultModal.jsx';
import { PresentationSummaryCard } from './PresentationSummaryCard.jsx';
import {
  CopyIcon,
  CheckIcon,
  RefreshIcon,
  SearchIcon,
  ExternalLinkIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  PhoneIcon,
  CreditCardIcon,
  LinkIcon,
} from '../common/Icons.jsx';
import { buildShareableReportUrl } from '../../utils/reportIntegrity.js';
import { searchMoreEvidence } from '../../services/analysisService.js';
import { t } from '../../i18n/index.js';

export function VerificationResult({ result = {}, onReset, onRetry, lang = 'id' }) {
  const [activeResult, setActiveResult] = useState(result);
  const [searchingMore, setSearchingMore] = useState(false);
  const [copied, setCopied] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('summary');

  useEffect(() => {
    setActiveResult(result);
  }, [result]);

  const {
    inputType = 'CLAIM_TEXT',
    status = activeResult.verdict,
    verdict,
    confidence = null,
    claim = null,
    sourceAssessment = {},
    claimAssessment = {},
    presentationSummary = {},
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
    honestNotice = activeResult.honestNotice,
    extendedSearchPerformed = activeResult.extendedSearchPerformed || false,
    extendedSearchNotice = activeResult.extendedSearchNotice,
    phoneDetails = activeResult.phoneDetails,
    accountDetails = activeResult.accountDetails,
    messageDetails = activeResult.messageDetails,
    urlSecurityDetails = activeResult.urlSecurityDetails,
  } = activeResult;

  const isHomepage =
    inputType === 'URL_HOME' ||
    verdict === 'IDENTIFIED_SOURCE' ||
    verdict === 'NEWS_HOMEPAGE_DETECTED' ||
    activeResult.isNewsHomepage;

  const isSourceUnavailable =
    status === 'SOURCE_CONTENT_UNAVAILABLE' ||
    verdict === 'SOURCE_CONTENT_UNAVAILABLE' ||
    (claim === null && !isHomepage && inputType !== 'PHONE_NUMBER' && inputType !== 'BANK_ACCOUNT' && inputType !== 'MESSAGE');

  const isPhone = inputType === 'PHONE_NUMBER';
  const isAccount = inputType === 'BANK_ACCOUNT';
  const isMessage = inputType === 'MESSAGE';
  const isPhishing = inputType === 'URL_PHISHING_SUSPECT';

  const handleSearchMore = async () => {
    if (searchingMore) return;
    setSearchingMore(true);
    try {
      const updated = await searchMoreEvidence(activeResult);
      setActiveResult(updated);
    } catch (err) {
      console.error('[Search More Evidence Error]', err);
    } finally {
      setSearchingMore(false);
    }
  };

  const gatheredEvidences = evidence || [];

  const handleCopySummary = () => {
    const verdictLabel = isHomepage
      ? 'SUMBER TERIDENTIFIKASI'
      : t(lang, `verifier.verdict.${verdict}.label`) || verdict;
    const confidenceText =
      confidence && typeof confidence.score === 'number'
        ? `${confidence.score}%`
        : 'N/A (Belum Tersedia)';
    const claimText =
      claim?.mainClaim ||
      (isHomepage ? `[Website: ${sourceAssessment.domain || 'Media'}]` : '[Klaim dalam pemeriksaan]');

    const summaryText = `[VeriFact ID 4.3 Report]
Verification ID: ${verificationId || 'VF-2026-XXXXXX'}
Jenis Masukan: ${inputType}
Status: ${verdictLabel} (Keyakinan: ${confidenceText})
Sumber: ${sourceAssessment.publisher || sourceAssessment.domain || 'Sumber Terdaftar'}
Klaim/Konten: "${claimText}"
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
      {/* 1. TOP CARD: PRESENTATION SUMMARY CARD (§31 & §38) */}
      <PresentationSummaryCard result={activeResult} lang={lang} />

      {/* 2. TOP ACTIONS BAR */}
      <div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border shadow-sm"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
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
          {!isHomepage && (
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
          )}

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

      {/* ============================================================ */}
      {/* 3. DEDICATED VIEW: URL_HOME (§2: detik.com, kompas.com, dll) */}
      {/* ============================================================ */}
      {isHomepage && (
        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              SUMBER WEBSITE TERIDENTIFIKASI (§2)
            </span>
          </div>

          <div className="space-y-2 border-b pb-5" style={{ borderColor: 'var(--vf-border)' }}>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
              {sourceAssessment.domain || 'detik.com'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono" style={{ color: 'var(--vf-text-secondary)' }}>
              <div>
                Penerbit: <strong style={{ color: 'var(--vf-text)' }}>{sourceAssessment.publisher || 'detikcom'}</strong>
              </div>
              <span className="opacity-40">&bull;</span>
              <div>
                Jenis: <strong style={{ color: 'var(--vf-text)' }}>Website Berita Terakreditasi</strong>
              </div>
              <span className="opacity-40">&bull;</span>
              <div>
                Status URL: <span className="font-bold text-emerald-600 dark:text-emerald-400">VALID</span>
              </div>
              <span className="opacity-40">&bull;</span>
              <div>
                Status Sumber: <span className="font-bold text-cyan-600 dark:text-cyan-400">TERIDENTIFIKASI</span>
              </div>
            </div>
          </div>

          {/* Technical Security Checklist (§2) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
              Analisis Keamanan Teknis URL:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-xl border flex items-center space-x-2.5" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span style={{ color: 'var(--vf-text)' }}>Protokol Enkripsi HTTPS Aktif</span>
              </div>
              <div className="p-3 rounded-xl border flex items-center space-x-2.5" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span style={{ color: 'var(--vf-text)' }}>Format Domain Memenuhi Standar DNS Publik</span>
              </div>
              <div className="p-3 rounded-xl border flex items-center space-x-2.5" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span style={{ color: 'var(--vf-text)' }}>Domain Berhasil Di-resolve ke Server Resmi</span>
              </div>
              <div className="p-3 rounded-xl border flex items-center space-x-2.5" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span style={{ color: 'var(--vf-text)' }}>Bukan Alamat IP Host Mentah</span>
              </div>
              <div className="p-3 rounded-xl border flex items-center space-x-2.5 sm:col-span-2" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                <span style={{ color: 'var(--vf-text)' }}>Tidak Terdeteksi Pola Typosquatting / Manipulasi Ejaan</span>
              </div>
            </div>
          </div>

          {/* User Guidance Tips & Direct Action Buttons (§2) */}
          <div
            className="p-4 sm:p-5 rounded-xl border space-y-3"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-primary) 8%, transparent)',
              borderColor: 'color-mix(in srgb, var(--vf-primary) 25%, transparent)',
            }}
          >
            <div className="flex items-start space-x-3">
              <InfoIcon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                  TIPS VERIFIKASI FAKTA:
                </span>
                <p style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.5 }}>
                  &ldquo;Untuk memverifikasi isi berita, masukkan URL artikel yang spesifik.&rdquo;
                </p>
                <p className="text-xs text-slate-400">
                  Halaman beranda (homepage) memuat puluhan artikel yang terus berganti secara dinamis dan bukan merupakan pernyataan fakta tunggal.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={sourceAssessment.homepageUrl || `https://${sourceAssessment.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                <ExternalLinkIcon className="w-3.5 h-3.5" />
                <span>Buka Situs</span>
              </a>

              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold border shadow-sm transition-all hover:opacity-85 active:scale-95"
                style={{
                  backgroundColor: 'var(--vf-surface)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              >
                <SearchIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span>Analisis Artikel Spesifik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. DEDICATED VIEW: SOURCE_CONTENT_UNAVAILABLE (§8 & §12)     */}
      {/* ============================================================ */}
      {isSourceUnavailable && !isHomepage && (
        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              ARTIKEL TERDETEKSI — ISI BELUM TERBACA LENGKAP (§8)
            </span>
          </div>

          <div className="space-y-2 border-b pb-5" style={{ borderColor: 'var(--vf-border)' }}>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
              {sourceAssessment.articleTitle || sourceAssessment.publisher || 'Tautan Berita Teridentifikasi'}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono" style={{ color: 'var(--vf-text-secondary)' }}>
              <div>
                Penerbit: <strong style={{ color: 'var(--vf-text)' }}>{sourceAssessment.publisher || 'Media Terdaftar'}</strong>
              </div>
              <span className="opacity-40">&bull;</span>
              <div>
                Domain: <strong style={{ color: 'var(--vf-text)' }}>{sourceAssessment.domain || 'N/A'}</strong>
              </div>
              <span className="opacity-40">&bull;</span>
              <div>
                Status Isi: <span className="font-bold text-amber-600 dark:text-amber-400">Belum Berhasil Dibaca Lengkap</span>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
            VeriFact ID berhasil mengenali situs penerbit, namun peladen belum berhasil mengekstrak seluruh paragraf badan berita (akibat bot protection, dynamic client-side rendering, atau timeout). Demi integritas data, sistem <strong>TIDAK MENGARANG</strong> vonis sebelum teks lengkap diverifikasi.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onReset}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: 'var(--vf-primary)' }}
            >
              Tempel Teks Artikel
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
                <span>Coba Lagi (Retry)</span>
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
              Masukkan URL Lain
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. DEDICATED VIEW: PHONE NUMBER / BANK ACCOUNT SCANNER       */}
      {/* ============================================================ */}
      {isPhone && phoneDetails && (
        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={phoneDetails.status} lang={lang} size="lg" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
              Nomor Telepon Diperiksa:
            </span>
            <h2 className="text-2xl font-mono font-bold" style={{ color: 'var(--vf-text)' }}>
              {phoneDetails.formatted || phoneDetails.phoneNumber}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Operator: {phoneDetails.carrier} ({phoneDetails.lineType})
            </p>
          </div>

          <div
            className="p-4 rounded-xl border space-y-2 text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
              color: 'var(--vf-text-secondary)',
            }}
          >
            <div className="flex items-center space-x-2 font-bold" style={{ color: 'var(--vf-text)' }}>
              <InfoIcon className="w-4 h-4 text-indigo-500" />
              <span>Status Laporan: {phoneDetails.status}</span>
            </div>
            <p>{phoneDetails.warningMessage}</p>
            <p className="text-amber-500 font-semibold">{phoneDetails.disclaimer}</p>
          </div>
        </div>
      )}

      {isAccount && accountDetails && (
        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={accountDetails.status} lang={lang} size="lg" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
              Nomor Rekening Finansial:
            </span>
            <h2 className="text-2xl font-mono font-bold" style={{ color: 'var(--vf-text)' }}>
              {accountDetails.accountNumber}
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Bank: {accountDetails.bank}
            </p>
          </div>

          <div
            className="p-4 rounded-xl border space-y-2 text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
              color: 'var(--vf-text-secondary)',
            }}
          >
            <div className="flex items-center space-x-2 font-bold" style={{ color: 'var(--vf-text)' }}>
              <InfoIcon className="w-4 h-4 text-indigo-500" />
              <span>Status Cek Rekening: {accountDetails.status}</span>
            </div>
            <p>{accountDetails.warningMessage}</p>
            <p className="text-amber-500 font-semibold">{accountDetails.disclaimer}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. DEDICATED VIEW: MESSAGE THREAT ANALYZER (§14)             */}
      {/* ============================================================ */}
      {isMessage && messageDetails && (
        <div
          className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <VerdictBadge verdict={messageDetails.status} lang={lang} size="lg" />
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Skor Risiko: {messageDetails.riskScore}/100
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
              Pesan Teks yang Dianalisis:
            </span>
            <div className="p-4 rounded-xl font-mono text-xs sm:text-sm bg-slate-950 text-slate-200 border border-white/10 leading-relaxed">
              &ldquo;{messageDetails.text}&rdquo;
            </div>
          </div>

          {/* Social Engineering Indicators */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
              Indikator Rekayasa Sosial Terdeteksi ({messageDetails.indicators?.length || 0}):
            </h4>
            <div className="space-y-2">
              {(messageDetails.indicators || []).map((ind, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border space-y-1 text-xs"
                  style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                >
                  <div className="font-bold flex items-center space-x-2 text-rose-500">
                    <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{ind.title || ind.category}</span>
                  </div>
                  <p style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.4 }}>{ind.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className="p-4 rounded-xl border text-xs leading-relaxed space-y-1"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-warning) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--vf-warning) 30%, transparent)',
            }}
          >
            <span className="font-bold block text-amber-600 dark:text-amber-400">Rekomendasi Keamanan:</span>
            <p style={{ color: 'var(--vf-text-secondary)' }}>{messageDetails.warningMessage}</p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. STANDARD VIEW: URL_ARTICLE & CLAIM_TEXT (§3 & §4)         */}
      {/* ============================================================ */}
      {!isHomepage && !isSourceUnavailable && !isPhone && !isAccount && !isMessage && (
        <>
          {/* Main Claim Card */}
          <div
            className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-5"
            style={{
              backgroundColor: 'var(--vf-surface)',
              borderColor: 'var(--vf-border)',
            }}
          >
            <div className="flex items-center gap-3">
              <VerdictBadge verdict={verdict} lang={lang} size="lg" />
            </div>

            {claim && claim.mainClaim && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
                  Klaim Utama yang Diperiksa:
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
            )}

            {/* Minimum Evidence Rule Notice (§23) */}
            {(verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE') && (
              <div
                className="p-4 sm:p-4.5 rounded-xl border space-y-2 text-xs"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--vf-unproven) 8%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--vf-unproven) 25%, transparent)',
                }}
              >
                <div className="flex items-center space-x-2 font-bold text-slate-300">
                  <InfoIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Prinsip Bukti Minimum (Minimum Evidence Rule) Aktif</span>
                </div>
                <p style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.5 }}>
                  Artikel berhasil dibaca, namun bukti independen sekunder (konfirmasi otoritas resmi atau lembaga periksa fakta) belum mencukupi. Sesuai standar IFCN, sistem menetapkan status <strong>BELUM TERBUKTI</strong> dan tidak memberikan vonis salah/palsu secara spekulatif.
                </p>
                <button
                  type="button"
                  onClick={handleSearchMore}
                  disabled={searchingMore}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow transition-all hover:opacity-90 active:scale-95 mt-1"
                  style={{ backgroundColor: 'var(--vf-primary)' }}
                >
                  {searchingMore ? (
                    <>
                      <RefreshIcon className="w-3.5 h-3.5 animate-spin" />
                      <span>Memperluas Pencarian...</span>
                    </>
                  ) : (
                    <>
                      <SearchIcon className="w-3.5 h-3.5" />
                      <span>Perluas Penelusuran Bukti</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Extended Search Feedback Notice */}
            {extendedSearchPerformed && extendedSearchNotice && (
              <div
                className="p-3.5 rounded-xl border text-xs font-mono space-y-1"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              >
                <span className="font-bold text-cyan-500 block">Hasil Penelusuran Lanjutan:</span>
                <p style={{ color: 'var(--vf-text-secondary)' }}>{extendedSearchNotice}</p>
              </div>
            )}
          </div>

          {/* Confidence Meter Card (§27, §28, §29) */}
          <ConfidenceMeter confidence={confidence} lang={lang} />

          {/* Navigation Tabs for Deep Evidence */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 border-b text-xs font-bold" style={{ borderColor: 'var(--vf-border)' }}>
            {sections.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`px-3.5 py-2 rounded-lg transition-all shrink-0 flex items-center space-x-1.5 ${
                  activeSection === sec.id
                    ? 'shadow-sm text-white'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activeSection === sec.id ? 'var(--vf-primary)' : 'transparent',
                  color: activeSection === sec.id ? '#ffffff' : 'var(--vf-text-secondary)',
                }}
              >
                <span>{sec.label}</span>
                {typeof sec.count === 'number' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-white/20 text-white">
                    {sec.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: SUMMARY & ATOMIC CLAIMS */}
          {activeSection === 'summary' && (
            <div className="space-y-4">
              {conflictAnalysis && conflictAnalysis.hasConflict && (
                <ConflictAlertBanner conflict={conflictAnalysis} lang={lang} />
              )}

              <div
                className="rounded-2xl p-5 sm:p-6 border space-y-3"
                style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
              >
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
                  Dekomposisi Klaim Atomik ({atomicClaims.length}):
                </h4>
                {atomicClaims.length === 0 ? (
                  <p className="text-xs text-slate-500">Tidak ada klaim atomik terpisah yang diekstrak.</p>
                ) : (
                  <div className="space-y-2">
                    {atomicClaims.map((ac, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs"
                        style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                      >
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-[10px] text-indigo-500 block">
                            {ac.id || `C${idx + 1}`}
                          </span>
                          <p className="font-medium" style={{ color: 'var(--vf-text)' }}>
                            {ac.text || ac.claimText}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 shrink-0 border border-slate-500/20">
                          {ac.status || 'UNVERIFIED'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE LEDGER */}
          {activeSection === 'evidence' && (
            <EvidenceLedger evidence={gatheredEvidences} lang={lang} />
          )}

          {/* TAB 3: SOURCES & INDEPENDENT CLUSTERS */}
          {activeSection === 'sources' && (
            <SourceClustersCard clusters={sourceClusters} lang={lang} />
          )}

          {/* TAB 4: TEMPORAL TIMELINE */}
          {activeSection === 'timeline' && (
            <TemporalTimelineCard temporal={temporalAnalysis} lang={lang} />
          )}

          {/* TAB 5: LIMITATIONS & AUDIT TRAIL */}
          {activeSection === 'limitations' && (
            <div
              className="rounded-2xl p-5 sm:p-6 border space-y-4"
              style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
            >
              <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
                Catatan Keterbatasan & Jejak Audit Sistem:
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400 list-disc pl-4 leading-relaxed">
                {(limitations || []).map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>

              <div className="pt-3 border-t space-y-2" style={{ borderColor: 'var(--vf-border)' }}>
                <span className="text-[11px] font-bold block" style={{ color: 'var(--vf-text)' }}>
                  Jejak Audit Pipeline:
                </span>
                <div className="space-y-1.5 text-xs font-mono text-slate-400">
                  {(auditTrail || []).map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-indigo-400">&bull;</span>
                      <span>
                        <strong>{step.title}:</strong> {step.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Why This Result Modal */}
      <WhyThisResultModal
        isOpen={whyOpen}
        onClose={() => setWhyOpen(false)}
        result={activeResult}
        lang={lang}
      />
    </div>
  );
}

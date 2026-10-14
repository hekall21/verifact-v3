/**
 * src/components/verifier/PresentationSummaryCard.jsx
 *
 * VeriFact ID 5.0 — Editorial Fact-Check Verdict Center
 * Desain Redaksi Digital (Newsroom Editorial) Berdasarkan Evaluasi:
 * - Menjadikan Verdict & Headline sebagai pusat halaman utama
 * - Menggunakan font serif editorial (Newsreader) untuk headline klaim
 * - Mengurangi 40-50% kotak/border internal yang saling bersaing
 * - Menampilkan alasan kesimpulan dalam 3 poin editorial bersih
 * - Accordion untuk laporan forensik semantik mendalam
 */

import React, { useState } from 'react';
import {
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  SparklesIcon,
  ExternalLinkIcon,
} from '../common/Icons.jsx';

export function PresentationSummaryCard({ result = {}, lang = 'id' }) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const {
    inputType = 'CLAIM_TEXT',
    sourceAssessment = {},
    claimAssessment = {},
    presentationSummary = {},
    verdict,
    confidence,
    evidence = [],
    stats = {},
    claim = null,
    timestamp,
  } = result;

  const isHomepage = inputType === 'URL_HOME' || verdict === 'IDENTIFIED_SOURCE' || verdict === 'NEWS_HOMEPAGE_DETECTED';
  const isUnavailable = verdict === 'SOURCE_CONTENT_UNAVAILABLE' || claimAssessment?.claim === null;
  const isPhone = inputType === 'PHONE_NUMBER';
  const isAccount = inputType === 'BANK_ACCOUNT';
  const isMessage = inputType === 'MESSAGE';
  const isPhishing = inputType === 'URL_PHISHING_SUSPECT';

  const aiAgent = result.geminiAgent;
  const hasAiAgent = Boolean(aiAgent && aiAgent.ok);

  // Confidence Synthesis
  const ruleConfidence = confidence && typeof confidence.score === 'number' ? confidence.score : null;
  const confidenceScore = ruleConfidence !== null ? ruleConfidence : (hasAiAgent ? aiAgent.confidenceScore : null);
  const confidenceDisplay =
    confidenceScore !== null
      ? `${confidenceScore}%`
      : 'N/A';

  // Format Result Label
  let resultLabel = presentationSummary.resultLabel;
  if (!resultLabel) {
    if (isHomepage) {
      resultLabel = lang === 'id' ? 'SUMBER TERIDENTIFIKASI' : 'IDENTIFIED SOURCE';
    } else if (hasAiAgent && (verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE')) {
      if (aiAgent.agentVerdict === 'TERVERIFIKASI_FAKTUAL') {
        resultLabel = lang === 'id' ? 'TERKONFIRMASI FAKTUAL' : 'VERIFIED TRUE';
      } else if (aiAgent.agentVerdict === 'HOAKS_PALSU') {
        resultLabel = lang === 'id' ? 'HOAKS / SALAH' : 'HOAX / FALSE';
      } else if (aiAgent.agentVerdict === 'MENYESATKAN_MISLEADING') {
        resultLabel = lang === 'id' ? 'MENYESATKAN' : 'MISLEADING';
      } else {
        resultLabel = lang === 'id' ? 'BELUM TERBUKTI' : 'UNVERIFIED';
      }
    } else if (verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE') {
      resultLabel = lang === 'id' ? 'BELUM TERBUKTI' : 'UNVERIFIED';
    } else if (verdict === 'SUPPORTED' || verdict === 'VERIFIED_TRUE' || verdict === 'FACT') {
      resultLabel = lang === 'id' ? 'TERKONFIRMASI FAKTUAL' : 'VERIFIED TRUE';
    } else if (verdict === 'FALSE' || verdict === 'HOAX') {
      resultLabel = lang === 'id' ? 'HOAKS / SALAH' : 'HOAX / FALSE';
    } else if (verdict === 'MISLEADING') {
      resultLabel = lang === 'id' ? 'MENYESATKAN' : 'MISLEADING';
    } else if (verdict === 'SOURCE_CONTENT_UNAVAILABLE') {
      resultLabel = lang === 'id' ? 'KONTEN BELUM TERSEDIA' : 'CONTENT UNAVAILABLE';
    } else {
      resultLabel = verdict || 'HASIL ANALISIS';
    }
  }

  // Warna Status Editorial (Teal / Brick Red / Amber / Slate)
  const getEditorialStatusStyle = () => {
    if (isHomepage) {
      return {
        badgeBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        dotBg: 'bg-emerald-400',
      };
    }
    if (hasAiAgent && (verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE')) {
      if (aiAgent.agentVerdict === 'TERVERIFIKASI_FAKTUAL') {
        return { badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30', dotBg: 'bg-teal-400' };
      }
      if (aiAgent.agentVerdict === 'HOAKS_PALSU') {
        return { badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dotBg: 'bg-rose-400' };
      }
      if (aiAgent.agentVerdict === 'MENYESATKAN_MISLEADING') {
        return { badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dotBg: 'bg-amber-400' };
      }
    }
    if (verdict === 'VERIFIED_TRUE' || verdict === 'FACT' || verdict === 'SUPPORTED') {
      return { badgeBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30', dotBg: 'bg-teal-400' };
    }
    if (verdict === 'MISLEADING') {
      return { badgeBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dotBg: 'bg-amber-400' };
    }
    if (verdict === 'FALSE' || verdict === 'HOAX') {
      return { badgeBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dotBg: 'bg-rose-400' };
    }
    return { badgeBg: 'bg-slate-500/15 text-slate-300 border-slate-500/30', dotBg: 'bg-slate-400' };
  };

  const statusStyle = getEditorialStatusStyle();

  // Headline klaim utama
  const claimHeadline =
    claim?.mainClaim ||
    sourceAssessment.title ||
    presentationSummary.headline ||
    (isHomepage ? `Portal Media Resmi: ${sourceAssessment.domain || 'Website Berita'}` : 'Pemeriksaan Pernyataan Publik');

  // Ringkasan keputusan editorial (1-2 kalimat)
  const decisionSummary =
    presentationSummary.executiveSummary ||
    (aiAgent?.executiveSummary) ||
    (isHomepage
      ? (lang === 'id'
          ? `Alamat URL yang dimasukkan merupakan beranda resmi ${sourceAssessment.publisher || sourceAssessment.domain || 'media terdaftar'}. Untuk memverifikasi isi klaim tertentu, masukkan tautan artikel yang spesifik.`
          : `The URL entered is the verified homepage of ${sourceAssessment.publisher || sourceAssessment.domain || 'a recognized news source'}. For article verification, enter the specific story link.`)
      : (lang === 'id'
          ? (verdict === 'VERIFIED_TRUE' || verdict === 'FACT' || verdict === 'SUPPORTED'
              ? 'Klaim tersebut didukung oleh pernyataan dan laporan dari sumber-sumber kredibel yang ditinjau VeriFact ID.'
              : verdict === 'FALSE' || verdict === 'HOAX'
              ? 'Klaim tersebut bertentangan dengan fakta resmi, data otoritatif, dan temuan lembaga cek fakta independen.'
              : verdict === 'MISLEADING'
              ? 'Sebagian informasi mengandung unsur fakta, namun dibingkai dengan konteks yang keliru atau judul yang memelintir peristiwa.'
              : 'Belum ditemukan bukti independen primer yang memadai untuk mengonfirmasi kebenaran klaim ini secara definitif.')
          : 'Evaluation based on independent verifiable reporting and official public documentation.'));

  // Tanggal format editorial
  const dateFormatted = new Date(timestamp || Date.now()).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="p-6 sm:p-8 rounded-2xl vf-card space-y-6 transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* 1. EDITORIAL VERDICT HEADER */}
      <div className="space-y-4">
        {/* Status Pill & Metadata Byline */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b" style={{ borderColor: 'var(--vf-border)' }}>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusStyle.badgeBg}`}>
              <span className={`w-2 h-2 rounded-full ${statusStyle.dotBg}`} />
              <span>{resultLabel}</span>
            </span>

            {result.subType && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 border border-slate-500/20">
                {result.subType}
              </span>
            )}
          </div>

          <div className="text-xs font-mono flex items-center space-x-2" style={{ color: 'var(--vf-text-muted)' }}>
            <span>Diperbarui {dateFormatted}</span>
            <span>&bull;</span>
            <span>Keyakinan: {confidenceDisplay}</span>
          </div>
        </div>

        {/* 2. THE MAIN EDITORIAL SERIF HEADLINE */}
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold tracking-tight leading-tight"
          style={{ color: 'var(--vf-text)' }}
        >
          {claimHeadline}
        </h2>

        {/* 3. EXECUTIVE DECISION SUMMARY (1-2 Sentences) */}
        <p
          className="text-base sm:text-lg leading-relaxed font-sans"
          style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.65 }}
        >
          {decisionSummary}
        </p>

        {/* 4. BYLINE SUMMARY STRIP */}
        <div
          className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-mono"
          style={{ color: 'var(--vf-text-muted)' }}
        >
          <span>Penerbit: <strong className="text-slate-200">{sourceAssessment.publisher || sourceAssessment.domain || 'Sumber Terbuka'}</strong></span>
          <span>&bull;</span>
          <span>{evidence.length} Sumber Bukti Terverifikasi</span>
          <span>&bull;</span>
          <span>{result.atomicClaims?.length || 1} Proposisi Klaim</span>
        </div>
      </div>

      {/* 5. MENGAPA KAMI MENYIMPULKAN INI (3 Poin Editorial Bersih - Tanpa Kotak Bertumpuk) */}
      <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--vf-border)' }}>
        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-400">
          Mengapa Kami Menyimpulkan Ini:
        </h4>

        <div className="space-y-2 text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
          <div className="flex items-start space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
            <p>
              {sourceAssessment.isRegistered
                ? `Sumber terafiliasi dengan penerbit terdaftar (${sourceAssessment.publisher || sourceAssessment.domain}) dengan rekam jejak jurnalistik kredibel.`
                : isHomepage
                ? `Domain ${sourceAssessment.domain} terverifikasi valid dengan sertifikat SSL aktif tanpa indikasi typosquatting.`
                : `Penelusuran multi-tier membandingkan narasi terhadap konsensus data lembaga berwenang.`}
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
            <p>
              {evidence.length > 0
                ? `Ditemukan ${evidence.length} rujukan independen yang konsisten mengenai substansi peristiwa.`
                : `Tidak ditemukan pengumuman resmi yang membenarkan informasi ini dari instansi berwenang.`}
            </p>
          </div>

          <div className="flex items-start space-x-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
            <p>
              Tingkat keyakinan sistem dinilai secara terbuka ({confidenceDisplay}) berdasarkan hierarki bukti dan independensi sumber.
            </p>
          </div>
        </div>
      </div>

      {/* 6. ACCORDION FORENSIK SEMANTIK & DETAIL TEKNIS (Deep Dive Saat Dibutuhkan) */}
      {hasAiAgent && (
        <div className="pt-3 border-t" style={{ borderColor: 'var(--vf-border)' }}>
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between py-2 text-xs font-mono font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span className="flex items-center space-x-2">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {showTechnicalDetails
                  ? (lang === 'id' ? 'Sembunyikan Laporan Forensik Semantik & Detail Teknis' : 'Hide Semantic Forensic & Technical Report')
                  : (lang === 'id' ? 'Lihat Laporan Forensik Semantik & Detail Teknis' : 'View Semantic Forensic & Technical Report')}
              </span>
            </span>
            <span>{showTechnicalDetails ? '▲' : '▼'}</span>
          </button>

          {showTechnicalDetails && (
            <div
              className="mt-3 p-4 rounded-xl border text-xs space-y-3 vf-fade-up font-sans"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--vf-border)' }}>
                <span className="font-mono font-bold text-slate-300">Model: {aiAgent.modelUsed || 'Gemini 2.5 Flash'}</span>
                <span className="font-mono text-emerald-400">Skor ML: {aiAgent.confidenceScore}%</span>
              </div>

              {aiAgent.verdictHeadline && (
                <div className="space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Fokus Investigasi Forensik:</span>
                  <p className="font-semibold text-slate-200">&ldquo;{aiAgent.verdictHeadline}&rdquo;</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-900/50 border border-white/5">
                  <span className="text-slate-400 block">Clickbait Rating:</span>
                  <strong className="text-slate-200">{aiAgent.biasAndRhetoric?.clickbaitRating || 'Rendah'}</strong>
                </div>
                <div className="p-2 rounded bg-slate-900/50 border border-white/5">
                  <span className="text-slate-400 block">Akurasi Judul:</span>
                  <strong className="text-slate-200">{aiAgent.headlineAccuracy?.matchesContent ? 'Sesuai' : 'Perlu Konteks'}</strong>
                </div>
                <div className="p-2 rounded bg-slate-900/50 border border-white/5">
                  <span className="text-slate-400 block">Manipulasi Emosi:</span>
                  <strong className="text-slate-200">{aiAgent.biasAndRhetoric?.emotionalManipulation || 'Netral'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PresentationSummaryCard;

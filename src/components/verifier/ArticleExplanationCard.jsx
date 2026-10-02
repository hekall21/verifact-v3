/**
 * src/components/verifier/ArticleExplanationCard.jsx
 *
 * VeriFact ID 5.0 — Source Summary & Article Explanation Card (§8, §9, §35)
 *
 * Menampilkan uraian mendalam:
 * 1. SOURCE SUMMARY (§8):
 *    - Judul asli, penerbit, tanggal publikasi
 *    - Isi singkat (2-5 kalimat)
 *    - Topik & entitas tokoh/lembaga terkait
 *    - Klaim utama
 *
 * 2. ARTICLE EXPLANATION (§9):
 *    - Penjelasan Sederhana
 *    - Konteks Peristiwa
 *    - Pernyataan Klaim Utama
 *    - Hal-hal Kritis yang Perlu Diperhatikan
 */

import React, { useState } from 'react';
import { FileTextIcon, BookOpenIcon, InfoIcon, CheckSquareIcon } from '../common/Icons.jsx';

export function ArticleExplanationCard({ sourceSummary, articleExplanation, lang = 'id' }) {
  const [activeTab, setActiveTab] = useState('explanation');

  if (!sourceSummary && !articleExplanation) {
    return null;
  }

  const {
    title,
    publisher,
    publishedAt,
    briefContent,
    topic,
    entities = [],
    mainClaim,
    domain,
  } = sourceSummary || {};

  const {
    simpleExplanation,
    context,
    mainClaim: expMainClaim,
    pointsToNote,
  } = articleExplanation || {};

  return (
    <div
      className="rounded-2xl p-6 sm:p-7 border shadow-sm space-y-6 transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Tab Header Selector */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('explanation')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'explanation' ? 'text-white shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'explanation' ? 'var(--vf-primary)' : 'var(--vf-surface-muted)',
              color: activeTab === 'explanation' ? '#ffffff' : 'var(--vf-text-secondary)',
            }}
          >
            <BookOpenIcon className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Uraian Isi Berita (§9)' : 'Article Explanation (§9)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'summary' ? 'text-white shadow-sm' : 'hover:opacity-80'
            }`}
            style={{
              backgroundColor: activeTab === 'summary' ? 'var(--vf-primary)' : 'var(--vf-surface-muted)',
              color: activeTab === 'summary' ? '#ffffff' : 'var(--vf-text-secondary)',
            }}
          >
            <FileTextIcon className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Ringkasan Sumber (§8)' : 'Source Summary (§8)'}</span>
          </button>
        </div>

        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hidden sm:inline-block"
        >
          {publisher || domain || 'MEDIA'}
        </span>
      </div>

      {/* TAB 1: ARTICLE EXPLANATION (§9) */}
      {activeTab === 'explanation' && (
        <div className="space-y-5">
          {/* 1. Penjelasan Sederhana */}
          <div className="space-y-1.5">
            <h4
              className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2"
              style={{ color: 'var(--vf-primary)' }}
            >
              <span>1. Penjelasan Sederhana</span>
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--vf-text)' }}>
              {simpleExplanation || briefContent || 'Artikel ini membahas perkembangan informasi terkini berdasarkan dokumen publik.'}
            </p>
          </div>

          {/* 2. Konteks Peristiwa */}
          <div className="space-y-1.5">
            <h4
              className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2"
              style={{ color: 'var(--vf-text-muted)' }}
            >
              <span>2. Konteks Peristiwa</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
              {context || `Diterbitkan oleh ${publisher || 'media'} dan diedarkan di ruang publik digital.`}
            </p>
          </div>

          {/* 3. Klaim Utama */}
          <div
            className="p-4 rounded-xl border space-y-1.5"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
            }}
          >
            <h4
              className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2 text-indigo-500"
            >
              <span>3. Pernyataan Klaim Utama</span>
            </h4>
            <p className="text-xs sm:text-sm font-semibold italic" style={{ color: 'var(--vf-text)' }}>
              &ldquo;{expMainClaim || mainClaim || 'Pernyataan klaim sedang diuji silang dengan sumber resmi.'}&rdquo;
            </p>
          </div>

          {/* 4. Hal yang Perlu Diperhatikan */}
          <div
            className="p-4 rounded-xl border space-y-1.5"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-warning) 8%, transparent)',
              borderColor: 'color-mix(in srgb, var(--vf-warning) 25%, transparent)',
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center space-x-2 text-amber-600 dark:text-amber-400">
              <InfoIcon className="w-4 h-4 shrink-0" />
              <span>4. Hal yang Perlu Diperhatikan</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
              {pointsToNote || 'Periksa apakah ada siaran pers resmi, tanggapan bantahan, atau ralat dari pihak terkait sebelum menyebarkannya.'}
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: SOURCE SUMMARY (§8) */}
      {activeTab === 'summary' && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
              <span className="text-slate-400 block text-[10px]">JUDUL ARTIKEL:</span>
              <span className="font-semibold text-xs" style={{ color: 'var(--vf-text)' }}>
                {title || 'Judul Sumber Asli'}
              </span>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
              <span className="text-slate-400 block text-[10px]">PENERBIT / MEDIA:</span>
              <span className="font-semibold text-xs text-indigo-500">
                {publisher || domain || 'Sumber Terverifikasi'}
              </span>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
              <span className="text-slate-400 block text-[10px]">TANGGAL PUBLIKASI:</span>
              <span className="font-semibold text-xs" style={{ color: 'var(--vf-text)' }}>
                {publishedAt ? new Date(publishedAt).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US') : 'Tercatat dalam Sistem'}
              </span>
            </div>

            <div className="p-3 rounded-xl border" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
              <span className="text-slate-400 block text-[10px]">TOPIK & BIDANG:</span>
              <span className="font-semibold text-xs text-emerald-500 uppercase">
                {topic || 'Berita / Informasi Publik'}
              </span>
            </div>
          </div>

          {/* Ringkasan Paragraf */}
          <div className="p-4 rounded-xl border space-y-1.5" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
            <span className="text-slate-400 block text-[10px] font-mono uppercase">ISI SINGKAT ARTIKEL:</span>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text)' }}>
              {briefContent || 'Ringkasan konten berhasil diekstrak dan siap diuji terhadap pangkalan data fakta.'}
            </p>
          </div>

          {/* Entitas Terkait */}
          {entities.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-slate-400 block text-[10px] font-mono uppercase">TOKOH / ORGANISASI TERKAIT:</span>
              <div className="flex flex-wrap gap-1.5">
                {entities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg border text-[11px] font-medium"
                    style={{
                      backgroundColor: 'var(--vf-surface-muted)',
                      borderColor: 'var(--vf-border)',
                      color: 'var(--vf-text)',
                    }}
                  >
                    {ent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

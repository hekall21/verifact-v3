/**
 * src/components/verifier/PerplexitySourcePanel.jsx
 *
 * VeriFact ID 5.0 — Digital Newsroom Verified Sources & Citation Ledger
 *
 * Dirombak dari grid kartu bergaya SaaS menjadi Editorial Ledger bergaya jurnalisme
 * investigasi (Reuters Fact Check / Bellingcat / NYT):
 * - Mengurangi border kartu berulang hingga 50%
 * - Tata letak baris ledger dengan garis pemisah tipis (hairline dividers)
 * - Tipografi editorial berwibawa dengan penomoran indeks sitasi formal [01], [02]
 * - Badge kategori sumber bersahaja (restrained muted tones) tanpa warna neon mencolok
 * - Metadata tanggal publikasi, domain rujukan, dan tautan langsung ke naskah asli
 */

import React, { useState } from 'react';
import { ExternalLinkIcon, GlobeIcon, FileTextIcon } from '../common/Icons.jsx';

const SOURCE_TYPE_CONFIG = {
  OFFICIAL: {
    label: 'Sumber Resmi',
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-500/20',
  },
  GOVERNMENT: {
    label: 'Pemerintah / Regulasi',
    bg: 'bg-sky-500/10 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-500/20',
  },
  NEWS_MEDIA: {
    label: 'Media Terakreditasi',
    bg: 'bg-indigo-500/10 dark:bg-indigo-950/30',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-500/20',
  },
  FACT_CHECK: {
    label: 'Lembaga Cek Fakta',
    bg: 'bg-purple-500/10 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-500/20',
  },
  SECURITY_ORGANIZATION: {
    label: 'Lembaga Keamanan',
    bg: 'bg-amber-500/10 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-500/20',
  },
  ACADEMIC: {
    label: 'Akademik / Riset',
    bg: 'bg-teal-500/10 dark:bg-teal-950/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-500/20',
  },
  COMMUNITY_REPORT: {
    label: 'Laporan Publik',
    bg: 'bg-rose-500/10 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-500/20',
  },
  SOCIAL_MEDIA: {
    label: 'Media Sosial',
    bg: 'bg-pink-500/10 dark:bg-pink-950/30',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-500/20',
  },
  BLOG: {
    label: 'Blog / Web Independen',
    bg: 'bg-slate-500/10 dark:bg-slate-900/40',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-500/20',
  },
  UNKNOWN: {
    label: 'Sumber Terbuka',
    bg: 'bg-slate-500/10 dark:bg-slate-900/40',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
  },
};

export function PerplexitySourcePanel({ sources = [], lang = 'id' }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Tampilkan maksimal 4 rujukan awal secara default
  const visibleSources = expanded ? sources : sources.slice(0, 4);

  return (
    <section
      aria-label="Daftar Sumber Rujukan"
      className="p-5 sm:p-6 rounded-2xl border transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Header Panel Editorial */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--vf-border)' }}>
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-primary) 12%, transparent)',
              color: 'var(--vf-primary)',
            }}
          >
            <GlobeIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-sm font-bold tracking-tight"
                style={{ color: 'var(--vf-text)', fontFamily: 'var(--font-display)' }}
              >
                {lang === 'id' ? 'Bibliografi & Dokumen Rujukan' : 'Verified Citations & Bibliography'}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border" style={{ borderColor: 'var(--vf-border)', color: 'var(--vf-text-muted)' }}>
                {sources.length} {lang === 'id' ? 'entri' : 'sources'}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--vf-text-muted)' }}>
              {lang === 'id'
                ? 'Sumber independen terakreditasi yang ditelusuri dan dicocokkan silang untuk menguji klaim'
                : 'Independent accredited sources cross-referenced to evaluate this claim'}
            </p>
          </div>
        </div>

        {sources.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-85"
            style={{
              borderColor: 'var(--vf-border)',
              backgroundColor: 'var(--vf-surface-muted)',
              color: 'var(--vf-text)',
            }}
          >
            {expanded
              ? (lang === 'id' ? 'Tampilkan Lebih Sedikit' : 'Show Less')
              : (lang === 'id' ? `Buka Seluruh Dokumen (${sources.length})` : `View All Entries (${sources.length})`)}
          </button>
        )}
      </div>

      {/* Editorial Ledger List: Menggantikan grid kartu dengan daftar elegan bebas nested borders */}
      <div className="divide-y" style={{ borderColor: 'var(--vf-border)' }}>
        {visibleSources.map((source, idx) => {
          const typeConfig = SOURCE_TYPE_CONFIG[source.sourceType] || SOURCE_TYPE_CONFIG.UNKNOWN;
          const domainLabel = source.domain || (source.url ? new URL(source.url).hostname : 'web');
          const publisherName = source.publisher || domainLabel;
          const citationNumber = String(idx + 1).padStart(2, '0');

          return (
            <div
              key={idx}
              className="group py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-4 transition-colors hover:bg-slate-500/5 rounded-lg px-2 -mx-2"
            >
              {/* Kolom Kiri: Nomor Sitasi + Info Penerbit & Judul */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Indeks Sitasi Berwibawa */}
                <span
                  className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded border shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'var(--vf-surface-muted)',
                    borderColor: 'var(--vf-border)',
                    color: 'var(--vf-text-muted)',
                  }}
                  title={`Sitasi #${idx + 1}`}
                >
                  [{citationNumber}]
                </span>

                <div className="space-y-1 min-w-0 flex-1">
                  {/* Meta Baris: Penerbit + Tipe Sumber */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold" style={{ color: 'var(--vf-text)' }}>
                      {publisherName}
                    </span>
                    <span className="text-[10px] opacity-40">&bull;</span>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
                    >
                      {typeConfig.label}
                    </span>
                    {source.publishedAt && (
                      <>
                        <span className="text-[10px] opacity-40">&bull;</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(source.publishedAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Judul Artikel / Rujukan */}
                  <div className="pt-0.5">
                    <a
                      href={source.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-medium leading-snug hover:underline inline-flex items-baseline gap-1 group-hover:text-indigo-400 transition-colors"
                      style={{ color: 'var(--vf-text-secondary)' }}
                    >
                      <span>{source.title || domainLabel}</span>
                      <ExternalLinkIcon className="w-3 h-3 inline-block shrink-0 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5 self-center" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Kolom Kanan: Domain Label & Akses URL */}
              <div className="sm:text-right shrink-0 pl-8 sm:pl-0">
                <span className="text-[11px] font-mono opacity-60 block truncate max-w-[180px]" style={{ color: 'var(--vf-text-muted)' }}>
                  {domainLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * src/components/verifier/PerplexitySourcePanel.jsx
 *
 * VeriFact ID 5.0 — Perplexity-Style Top Sources Discovery Panel (§4, §5, §35)
 *
 * Menampilkan kartu sumber horizontal/grid di bagian atas:
 * - Nomor kutipan sitasi terindeks [1], [2], [3]
 * - Badge tipe sumber terstandarisasi (OFFICIAL, GOVERNMENT, NEWS_MEDIA, FACT_CHECK, dll.)
 * - Nama penerbit dan favicon / inisial domain
 * - Judul sumber asli
 * - Tanggal publikasi / waktu penemuan
 * - Tautan langsung eksternal
 * - Status ketersediaan konten (Dibaca penuh vs Metadata)
 */

import React, { useState } from 'react';
import { ExternalLinkIcon, ShieldIcon, CheckCircleIcon, GlobeIcon, FileTextIcon } from '../common/Icons.jsx';

const SOURCE_TYPE_CONFIG = {
  OFFICIAL: {
    label: 'Sumber Resmi',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/25',
  },
  GOVERNMENT: {
    label: 'Pemerintah / Regulasi',
    bg: 'bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/25',
  },
  NEWS_MEDIA: {
    label: 'Media Terakreditasi',
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/25',
  },
  FACT_CHECK: {
    label: 'Lembaga Cek Fakta',
    bg: 'bg-purple-500/10',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/25',
  },
  SECURITY_ORGANIZATION: {
    label: 'Lembaga Keamanan',
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/25',
  },
  ACADEMIC: {
    label: 'Akademik / Riset',
    bg: 'bg-teal-500/10',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/25',
  },
  COMMUNITY_REPORT: {
    label: 'Laporan Publik',
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/25',
  },
  SOCIAL_MEDIA: {
    label: 'Media Sosial',
    bg: 'bg-pink-500/10',
    text: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-500/25',
  },
  BLOG: {
    label: 'Blog / Web Independen',
    bg: 'bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/25',
  },
  UNKNOWN: {
    label: 'Sumber Terbuka',
    bg: 'bg-slate-500/10',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-500/20',
  },
};

export function PerplexitySourcePanel({ sources = [], lang = 'id' }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Tampilkan maksimal 4 kartu awal jika tidak di-expand
  const visibleSources = expanded ? sources : sources.slice(0, 4);

  return (
    <div
      className="p-5 sm:p-6 rounded-2xl border shadow-sm space-y-4 transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-primary) 15%, transparent)',
              color: 'var(--vf-primary)',
            }}
          >
            <GlobeIcon className="w-4 h-4" />
          </div>
          <div>
            <h3
              className="text-sm font-bold tracking-tight"
              style={{ color: 'var(--vf-text)', fontFamily: 'var(--font-display)' }}
            >
              {lang === 'id' ? 'Sumber Terverifikasi & Rujukan' : 'Verified Sources & Citations'}
            </h3>
            <p className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
              {lang === 'id'
                ? `${sources.length} sumber independen ditelusuri untuk memverifikasi klaim ini`
                : `${sources.length} independent sources discovered to verify this claim`}
            </p>
          </div>
        </div>

        {sources.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all hover:opacity-80"
            style={{
              borderColor: 'var(--vf-border)',
              backgroundColor: 'var(--vf-surface-muted)',
              color: 'var(--vf-primary)',
            }}
          >
            {expanded
              ? (lang === 'id' ? 'Ciutkan' : 'Collapse')
              : (lang === 'id' ? `Lihat Semua (${sources.length})` : `View All (${sources.length})`)}
          </button>
        )}
      </div>

      {/* Grid Kartu Sumber Gaya Perplexity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {visibleSources.map((source, idx) => {
          const typeConfig = SOURCE_TYPE_CONFIG[source.sourceType] || SOURCE_TYPE_CONFIG.UNKNOWN;
          const domainLabel = source.domain || (source.url ? new URL(source.url).hostname : 'web');
          const publisherName = source.publisher || domainLabel;
          const citationNumber = idx + 1;

          return (
            <a
              key={idx}
              href={source.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div className="space-y-2">
                {/* Top Row: Citation Index & Type Badge */}
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-mono font-bold text-white shrink-0"
                    style={{ backgroundColor: 'var(--vf-primary)' }}
                  >
                    [{citationNumber}]
                  </span>
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border truncate ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}
                  >
                    {typeConfig.label}
                  </span>
                </div>

                {/* Publisher & Domain */}
                <div className="flex items-center space-x-1.5">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold uppercase shrink-0"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--vf-text) 10%, transparent)',
                      color: 'var(--vf-text)',
                    }}
                  >
                    {publisherName.charAt(0)}
                  </span>
                  <span
                    className="text-xs font-semibold truncate group-hover:text-indigo-500 transition-colors"
                    style={{ color: 'var(--vf-text)' }}
                  >
                    {publisherName}
                  </span>
                </div>

                {/* Title */}
                <h4
                  className="text-xs font-medium leading-snug line-clamp-2"
                  style={{ color: 'var(--vf-text-secondary)' }}
                  title={source.title}
                >
                  {source.title || domainLabel}
                </h4>
              </div>

              {/* Bottom Row: Date & External Link Icon */}
              <div className="pt-2 mt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--vf-border)' }}>
                <span className="text-slate-400 font-mono truncate">
                  {source.publishedAt
                    ? new Date(source.publishedAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : domainLabel}
                </span>
                <span className="flex items-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <ExternalLinkIcon className="w-3 h-3 ml-1" />
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

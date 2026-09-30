/**
 * TrendingFeed.jsx
 *
 * Umpan topik hoaks dan fakta terkonfirmasi yang sedang viral di Indonesia.
 * Mendukung pencarian instan, filter kategori, dan pengujian langsung ke mesin verifikasi.
 */

import React, { useState } from 'react';
import { SearchIcon, ExternalLinkIcon, ShieldIcon } from '../common/Icons.jsx';
import { VerdictBadge } from '../verifier/VerdictBadge.jsx';
import { mockHoaxDatabase } from '../../data/mockData.js';
import { t } from '../../i18n/index.js';

export function TrendingFeed({ lang = 'id', onInspectClaim }) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const items = mockHoaxDatabase[lang] || mockHoaxDatabase.id;

  const filtered = items.filter((item) => {
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.snippet.toLowerCase().includes(query.toLowerCase()) ||
      (item.tags || []).some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

    if (!matchesQuery) return false;

    if (activeFilter === 'HOAX') {
      return item.verdict === 'HOAX' || item.verdict === 'MISLEADING' || item.verdict === 'DISINFORMATION';
    }
    if (activeFilter === 'FACT') {
      return item.verdict === 'FACT' || item.verdict === 'PARTLY_TRUE';
    }
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 vf-fade-up">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          <ShieldIcon className="w-3.5 h-3.5" />
          <span>{t(lang, 'trending.title')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {t(lang, 'trending.title')}
        </h2>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto" style={{ color: 'var(--vf-text-muted)' }}>
          {t(lang, 'trending.subtitle')}
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--vf-text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(lang, 'trending.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none"
            style={{
              backgroundColor: 'var(--vf-surface)',
              borderColor: 'var(--vf-border)',
              color: 'var(--vf-text)',
            }}
          />
        </div>

        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'ALL' ? 'text-white shadow-sm' : 'hover:opacity-75'
            }`}
            style={{
              backgroundColor: activeFilter === 'ALL' ? 'var(--vf-primary)' : 'var(--vf-surface)',
              color: activeFilter === 'ALL' ? '#ffffff' : 'var(--vf-text-secondary)',
              border: '1px solid var(--vf-border)',
            }}
          >
            {t(lang, 'trending.filterAll')}
          </button>
          <button
            onClick={() => setActiveFilter('HOAX')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'HOAX' ? 'text-white shadow-sm' : 'hover:opacity-75'
            }`}
            style={{
              backgroundColor: activeFilter === 'HOAX' ? 'var(--vf-hoax)' : 'var(--vf-surface)',
              color: activeFilter === 'HOAX' ? '#ffffff' : 'var(--vf-text-secondary)',
              border: '1px solid var(--vf-border)',
            }}
          >
            {t(lang, 'trending.filterHoax')}
          </button>
          <button
            onClick={() => setActiveFilter('FACT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'FACT' ? 'text-white shadow-sm' : 'hover:opacity-75'
            }`}
            style={{
              backgroundColor: activeFilter === 'FACT' ? 'var(--vf-fact)' : 'var(--vf-surface)',
              color: activeFilter === 'FACT' ? '#ffffff' : 'var(--vf-text-secondary)',
              border: '1px solid var(--vf-border)',
            }}
          >
            {t(lang, 'trending.filterFact')}
          </button>
        </div>
      </div>

      {/* Feed List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-5 border flex flex-col justify-between transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--vf-surface)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <VerdictBadge verdict={item.verdict} lang={lang} size="sm" />
                  <span className="text-[11px] font-mono" style={{ color: 'var(--vf-text-muted)' }}>
                    {item.date}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold leading-snug mb-2" style={{ color: 'var(--vf-text)' }}>
                  {item.title}
                </h3>

                <p className="text-xs leading-relaxed line-clamp-3 mb-3" style={{ color: 'var(--vf-text-secondary)' }}>
                  {item.snippet}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(item.tags || []).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono font-medium"
                      style={{
                        backgroundColor: 'var(--vf-surface-muted)',
                        color: 'var(--vf-text-muted)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Source & Action */}
              <div className="pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--vf-border)' }}>
                <span className="font-semibold text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                  Sumber: {item.source}
                </span>

                <button
                  type="button"
                  onClick={() => onInspectClaim(item.title)}
                  className="px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1 hover:underline text-xs"
                  style={{ color: 'var(--vf-primary)' }}
                >
                  <span>Periksa di Mesin</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center text-xs" style={{ color: 'var(--vf-text-muted)' }}>
            {t(lang, 'trending.emptyMsg')}
          </div>
        )}
      </div>
    </div>
  );
}

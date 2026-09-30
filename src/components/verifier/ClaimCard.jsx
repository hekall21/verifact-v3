/**
 * ClaimCard.jsx
 *
 * Kartu rincian ekstraksi klaim, entitas yang disebutkan, angka, tanggal,
 * dan indikator gaya bahasa (urgensi, sensasionalisme, dll.).
 */

import React from 'react';
import { FileTextIcon, AlertTriangleIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function ClaimCard({ claim = {}, reasonCodes = [], sourceInaccessible = false, lang = 'id' }) {
  const {
    mainClaim = '',
    entities = [],
    amounts = [],
    dates = [],
    locations = [],
    styleMarkers = {},
  } = claim;

  return (
    <div className="rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Notice if source content was inaccessible */}
      {sourceInaccessible && (
        <div className="p-3.5 rounded-xl border flex items-start space-x-3 bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs">
          <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">{t(lang, 'verifier.urlInaccessible.title')}</p>
            <p className="mt-0.5 opacity-90">{t(lang, 'verifier.urlInaccessible.desc')}</p>
          </div>
        </div>
      )}

      {/* Main Claim Header */}
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--vf-text-muted)' }}>
          {t(lang, 'verifier.result.claimBoxTitle')}
        </span>
        <blockquote className="text-base sm:text-lg font-bold leading-snug pl-3 border-l-4 rounded-r"
          style={{
            borderColor: 'var(--vf-primary)',
            color: 'var(--vf-text)',
            backgroundColor: 'color-mix(in srgb, var(--vf-primary) 5%, transparent)',
          }}
        >
          &ldquo;{mainClaim}&rdquo;
        </blockquote>
      </div>

      {/* Reason Codes Explanation Badges */}
      {reasonCodes.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--vf-text-muted)' }}>
            Dasar Penilaian Teknis:
          </span>
          <div className="space-y-1.5">
            {reasonCodes.map((code, idx) => {
              const text = t(lang, `verifier.reasonCodes.${code}`) || code;
              return (
                <div key={idx} className="flex items-start space-x-2 text-xs p-2 rounded-lg"
                  style={{
                    backgroundColor: 'var(--vf-surface-muted)',
                    color: 'var(--vf-text-secondary)',
                  }}
                >
                  <span className="font-mono text-emerald-500 font-bold">&#10003;</span>
                  <span>{text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Extracted Structural Elements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t text-xs"
        style={{ borderColor: 'var(--vf-border)' }}
      >
        {/* Entities */}
        <div>
          <span className="font-bold block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
            {t(lang, 'verifier.result.entitiesLabel')}
          </span>
          <div className="flex flex-wrap gap-1">
            {entities.length > 0 ? (
              entities.slice(0, 5).map((e, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded font-mono text-[11px] border"
                  style={{
                    backgroundColor: 'var(--vf-surface-muted)',
                    borderColor: 'var(--vf-border)',
                    color: 'var(--vf-text)',
                  }}
                >
                  {e}
                </span>
              ))
            ) : (
              <span className="opacity-50">—</span>
            )}
          </div>
        </div>

        {/* Dates */}
        <div>
          <span className="font-bold block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
            {t(lang, 'verifier.result.datesLabel')}
          </span>
          <div className="flex flex-wrap gap-1">
            {dates.length > 0 ? (
              dates.map((d, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded font-mono text-[11px] border"
                  style={{
                    backgroundColor: 'var(--vf-surface-muted)',
                    borderColor: 'var(--vf-border)',
                    color: 'var(--vf-text)',
                  }}
                >
                  {d}
                </span>
              ))
            ) : (
              <span className="opacity-50">—</span>
            )}
          </div>
        </div>

        {/* Amounts */}
        <div>
          <span className="font-bold block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
            {t(lang, 'verifier.result.amountsLabel')}
          </span>
          <div className="flex flex-wrap gap-1">
            {amounts.length > 0 ? (
              amounts.map((a, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded font-mono text-[11px] text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-500/10">
                  {a}
                </span>
              ))
            ) : (
              <span className="opacity-50">—</span>
            )}
          </div>
        </div>

        {/* Locations */}
        <div>
          <span className="font-bold block mb-1" style={{ color: 'var(--vf-text-muted)' }}>
            {t(lang, 'verifier.result.locationsLabel')}
          </span>
          <div className="flex flex-wrap gap-1">
            {locations.length > 0 ? (
              locations.map((loc, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded font-mono text-[11px] border"
                  style={{
                    backgroundColor: 'var(--vf-surface-muted)',
                    borderColor: 'var(--vf-border)',
                    color: 'var(--vf-text)',
                  }}
                >
                  {loc}
                </span>
              ))
            ) : (
              <span className="opacity-50">—</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

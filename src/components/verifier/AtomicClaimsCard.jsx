/**
 * AtomicClaimsCard.jsx
 *
 * VeriFact ID 4.0 - Atomic Claim Decomposition Display
 * Menampilkan dekomposisi klaim majemuk menjadi klaim atomik mandiri dengan status terpisah:
 * [ ✓ Didukung ] [ ✕ Dibantah ] [ ⚠ Konteks Berubah ] [ ○ Belum Terbukti ]
 * Sesuai spesifikasi master prompt v4.txt §03 dan §04.
 */

import React from 'react';
import { CheckIcon, AlertTriangleIcon, XIcon, ShieldIcon } from '../common/Icons.jsx';

export function AtomicClaimsCard({ atomicClaims = [], lang = 'id' }) {
  if (!atomicClaims || !atomicClaims.length) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUPPORTED':
        return {
          label: lang === 'id' ? '✓ Didukung Bukti' : '✓ Supported by Evidence',
          className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          icon: <CheckIcon className="w-3.5 h-3.5" />,
        };
      case 'REFUTED':
        return {
          label: lang === 'id' ? '✕ Dibantah Sumber' : '✕ Refuted by Sources',
          className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          icon: <XIcon className="w-3.5 h-3.5" />,
        };
      case 'CONTEXT_CHANGED':
        return {
          label: lang === 'id' ? '⚠ Konteks Berubah' : '⚠ Context Changed',
          className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          icon: <AlertTriangleIcon className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: lang === 'id' ? '○ Belum Terbukti' : '○ Unproven',
          className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
          icon: <ShieldIcon className="w-3.5 h-3.5" />,
        };
    }
  };

  return (
    <div
      className="rounded-2xl p-6 border shadow-sm space-y-4"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
        <div>
          <h3 className="font-heading font-bold text-sm sm:text-base" style={{ color: 'var(--vf-text)' }}>
            {lang === 'id' ? '🧩 Dekomposisi Klaim Atomik (Atomic Claim Engine)' : '🧩 Atomic Claim Decomposition'}
          </h3>
          <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id'
              ? 'Sistem memecah pernyataan kompleks menjadi proposisi mandiri untuk diverifikasi per butir.'
              : 'The system decomposes complex statements into atomic claims to evaluate each proposition individually.'}
          </p>
        </div>
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: 'var(--vf-surface-muted)',
            borderColor: 'var(--vf-border)',
            color: 'var(--vf-primary)',
          }}
        >
          {atomicClaims.length} {lang === 'id' ? 'Klaim' : 'Claims'}
        </span>
      </div>

      <div className="space-y-3">
        {atomicClaims.map((claim) => {
          const badge = getStatusBadge(claim.status);

          return (
            <div
              key={claim.id}
              className="p-4 rounded-xl border transition-all space-y-2"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--vf-text-muted)' }}>
                  {lang === 'id' ? `PROPOSISI ${claim.index}` : `PROPOSITION ${claim.index}`}
                </span>

                <span
                  className={`inline-flex items-center space-x-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.className}`}
                >
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              <p className="text-sm font-semibold" style={{ color: 'var(--vf-text)' }}>
                "{claim.text}"
              </p>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                {claim.reasoning}
              </p>

              {(claim.amounts.length > 0 || claim.dates.length > 0) && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  {claim.amounts.map((amt, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono"
                    >
                      Nominal: {amt}
                    </span>
                  ))}
                  {claim.dates.map((dt, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono"
                    >
                      Waktu: {dt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * EvidenceLedger.jsx
 *
 * VeriFact ID 4.0 - Evidence Ledger Panel
 * Menampilkan buku besar bukti (Evidence Ledger) dengan klasifikasi sikap (Stance):
 *   [ + SUPPORTS ]   Bukti yang mendukung klaim
 *   [ − REFUTES ]    Bukti yang membantah / klarifikasi resmi
 *   [ ~ CONTEXT ]    Bukti konteks latar belakang / linimasa
 * Sesuai spesifikasi master prompt v4.txt §21.
 */

import React from 'react';
import { LinkIcon, ShieldIcon, CheckIcon, XIcon, AlertTriangleIcon } from '../common/Icons.jsx';

export function EvidenceLedger({ evidenceList = [], lang = 'id' }) {
  if (!evidenceList || !evidenceList.length) return null;

  const getStanceMeta = (stance) => {
    switch (stance) {
      case 'supports':
        return {
          sign: '+',
          title: lang === 'id' ? 'MENDUKUNG KLAIM (SUPPORTS)' : 'SUPPORTS CLAIM',
          className: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'refutes':
        return {
          sign: '−',
          title: lang === 'id' ? 'MEMBANTAH KLAIM (REFUTES)' : 'REFUTES CLAIM',
          className: 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400',
          badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
        };
      default:
        return {
          sign: '~',
          title: lang === 'id' ? 'KONTEKS TAMBAHAN (CONTEXT)' : 'BACKGROUND CONTEXT',
          className: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400',
          badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
        };
    }
  };

  const getTierLabel = (tier) => {
    if (tier === 1) return lang === 'id' ? 'Tier 1 • Sumber Primer Resmi' : 'Tier 1 • Primary Source';
    if (tier === 3) return lang === 'id' ? 'Tier 3 • Pemeriksa Fakta Terverifikasi' : 'Tier 3 • Fact Checker';
    return lang === 'id' ? 'Tier 2 • Laporan Media' : 'Tier 2 • News Media';
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
            {lang === 'id' ? '📋 Buku Besar Bukti (Evidence Ledger)' : '📋 Evidence Ledger'}
          </h3>
          <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id'
              ? 'Daftar bukti terverifikasi yang mendasari keputusan sistem secara transparan.'
              : 'The verified ledger of retrieved evidence justifying the system assessment.'}
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-500">
          {evidenceList.length} {lang === 'id' ? 'Bukti Ditemukan' : 'Evidences'}
        </span>
      </div>

      <div className="space-y-3">
        {evidenceList.map((item, idx) => {
          const meta = getStanceMeta(item.stance);

          return (
            <div
              key={item.id || idx}
              className={`p-4 rounded-xl border transition-all space-y-2.5 ${meta.className}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-extrabold border ${meta.badgeClass}`}>
                    {meta.sign} {meta.title}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--vf-text)' }}>
                    {item.publisher || item.domain}
                  </span>
                </div>

                <span className="text-[11px] font-mono" style={{ color: 'var(--vf-text-muted)' }}>
                  {getTierLabel(item.tier)}
                </span>
              </div>

              <h4 className="text-sm font-bold" style={{ color: 'var(--vf-text)' }}>
                {item.title}
              </h4>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                "{item.snippet || item.excerpt}"
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                <span className="font-mono text-[10px]" style={{ color: 'var(--vf-text-muted)' }}>
                  {item.domain}
                </span>

                {item.url && item.url !== '#' && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-semibold hover:underline"
                    style={{ color: 'var(--vf-primary)' }}
                  >
                    <span>{lang === 'id' ? 'Buka Bukti Asli' : 'Open Evidence'}</span>
                    <LinkIcon className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

export function EvidenceLedger({
  evidenceList,
  evidence,
  sources = [],
  lang = 'id',
  onSearchMore,
  searchingMore = false,
}) {
  const items =
    evidenceList && evidenceList.length > 0
      ? evidenceList
      : evidence && evidence.length > 0
      ? evidence
      : [];


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
          {items.length} {lang === 'id' ? 'Bukti Ditemukan' : 'Evidences'}
        </span>
      </div>

      {items.length === 0 ? (
        <div
          className="p-6 rounded-xl border text-center space-y-4"
          style={{
            backgroundColor: 'var(--vf-surface-muted)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 mx-auto flex items-center justify-center">
            <ShieldIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 max-w-lg mx-auto">
            <h4 className="text-sm font-bold" style={{ color: 'var(--vf-text)' }}>
              {lang === 'id'
                ? 'Belum Ada Bukti Sekunder / Terverifikasi Tambahan'
                : 'No Secondary Verified Evidence Retrieved Yet'}
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
              {lang === 'id'
                ? 'Sistem menerapkan Prinsip Bukti Minimum (Minimum Evidence Rule). Belum ditemukan bantahan tertulis atau konfirmasi resmi independen dari otoritas berwenang (Tier 1) atau lembaga periksa fakta (Tier 3). VeriFact ID mempertahankan standar etika IFCN dan tidak memberikan vonis spekulatif.'
                : 'The system enforces the Minimum Evidence Rule. No independent confirmation or rebuttal from primary authorities (Tier 1) or fact-checkers (Tier 3) was discovered. VeriFact ID adheres strictly to IFCN principles without issuing speculative verdicts.'}
            </p>
          </div>

          {onSearchMore && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onSearchMore}
                disabled={searchingMore}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow transition-all hover:opacity-90 active:scale-95"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                <span>
                  {searchingMore
                    ? (lang === 'id' ? 'Memperluas Pencarian...' : 'Searching...')
                    : (lang === 'id' ? '🔍 Perluas Penelusuran Bukti' : '🔍 Expand Evidence Search')}
                </span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
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
                  &ldquo;{item.snippet || item.excerpt || item.description}&rdquo;
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
      )}
    </div>
  );
}

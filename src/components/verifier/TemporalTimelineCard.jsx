/**
 * TemporalTimelineCard.jsx
 *
 * VeriFact ID 4.0 - Temporal Fact-Checking & Timeline Card
 * Menganalisis keabsahan waktu informasi: apakah berita lama didaur ulang (Recirculated),
 * atau apakah klaim berstatus "BENAR PADA SAAT ITU TAPI KEDALUWARSA SEKARANG (True At The Time)".
 * Sesuai spesifikasi master prompt v4.txt §12, §13, dan §14.
 */

import React from 'react';

export function TemporalTimelineCard({ temporalAnalysis = {}, lang = 'id' }) {
  if (!temporalAnalysis || !temporalAnalysis.timeline || !temporalAnalysis.timeline.length) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OUTDATED':
        return {
          label: lang === 'id' ? '⚠ Konten Lama / Didaur Ulang' : '⚠ Outdated / Recirculated Content',
          color: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
        };
      case 'SUPERSEDED':
        return {
          label: lang === 'id' ? '⚠ Regulasi Telah Diperbarui' : '⚠ Regulation Superseded',
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
        };
      case 'TRUE_AT_TIME':
        return {
          label: lang === 'id' ? '⏳ Benar pada Saat Diterbitkan' : '⏳ True at the Time',
          color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/30',
        };
      default:
        return {
          label: lang === 'id' ? '✓ Informasi Terkini (Current)' : '✓ Current Information',
          color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        };
    }
  };

  const badge = getStatusBadge(temporalAnalysis.status);

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
            {lang === 'id' ? '⏱️ Analisis Dimensi Waktu (Temporal Fact-Checking)' : '⏱️ Temporal Fact-Checking'}
          </h3>
          <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id'
              ? 'Memeriksa apakah klaim merupakan peristiwa lama yang kembali disebarkan di luar konteks aslinya.'
              : 'Audits whether the information is recirculated from an older event out of its original time context.'}
          </p>
        </div>

        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
        {temporalAnalysis.summary}
      </p>

      {/* Timeline Chain */}
      <div className="pt-2 space-y-3">
        {temporalAnalysis.timeline.map((item, idx) => (
          <div key={idx} className="flex items-start space-x-3 text-xs">
            <span
              className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-800 text-cyan-400 border border-white/10 flex-shrink-0"
            >
              {item.year}
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold" style={{ color: 'var(--vf-text)' }}>
                {item.event}
              </p>
              <span className="text-[10px] uppercase font-mono tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
                Status: {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

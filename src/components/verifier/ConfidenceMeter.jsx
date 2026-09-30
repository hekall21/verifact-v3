/**
 * ConfidenceMeter.jsx
 *
 * Pengukur tingkat keyakinan sistem (0-100%) yang transparan dan dapat diverifikasi.
 * Memenuhi master prompt §11: Menampilkan rincian faktor positif dan negatif
 * yang membentuk skor, bukan angka acak.
 */

import React, { useState } from 'react';
import { InfoIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function ConfidenceMeter({ confidence = {}, lang = 'id' }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { score = 20, band = 'low', factors = [] } = confidence;
  const bandLabel = t(lang, `verifier.confidenceBands.${band}`) || band;

  // Penentuan warna meter sesuai tingkat skor
  const getMeterColor = () => {
    if (score >= 70) return 'var(--vf-fact)';
    if (score >= 45) return 'var(--vf-primary)';
    if (score >= 30) return 'var(--vf-partly)';
    return 'var(--vf-hoax)';
  };

  return (
    <div className="rounded-xl p-4 border transition-colors shadow-sm"
      style={{
        backgroundColor: 'var(--vf-surface-muted)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-secondary)' }}>
            {t(lang, 'verifier.result.confidenceLabel')}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--vf-text)' }}>
            {bandLabel}
          </span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tight" style={{ color: getMeterColor() }}>
            {score}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full overflow-hidden mb-3" style={{ backgroundColor: 'var(--vf-border)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(5, Math.min(100, score))}%`,
            backgroundColor: getMeterColor(),
          }}
        />
      </div>

      {/* Breakdown Toggle */}
      <button
        type="button"
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="text-xs font-medium flex items-center space-x-1.5 hover:underline"
        style={{ color: 'var(--vf-primary)' }}
      >
        <InfoIcon className="w-3.5 h-3.5" />
        <span>{showBreakdown ? (lang === 'id' ? 'Sembunyikan Rincian Perhitungan' : 'Hide Calculation Factors') : (lang === 'id' ? 'Lihat Mengapa Skor Ini Terbentuk' : 'View Confidence Factor Breakdown')}</span>
      </button>

      {/* Transparent Factors List */}
      {showBreakdown && (
        <div className="mt-3 pt-3 border-t space-y-1.5 text-xs" style={{ borderColor: 'var(--vf-border)' }}>
          <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? 'Faktor Penentu Tingkat Keyakinan Sistem:' : 'Determining Confidence Factors:'}
          </p>
          {factors.map((f, i) => {
            const factorText = t(lang, `verifier.confidenceFactors.${f.code}`) || f.code;
            const isPositive = f.impact > 0;
            const isNeutral = f.impact === 0;

            return (
              <div key={i} className="flex items-center justify-between py-0.5">
                <span style={{ color: 'var(--vf-text-secondary)' }}>&bull; {factorText}</span>
                <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                  isPositive
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : isNeutral
                    ? 'text-slate-400 bg-slate-500/10'
                    : 'text-rose-500 bg-rose-500/10'
                }`}>
                  {isPositive ? `+${f.impact}%` : isNeutral ? '0%' : `${f.impact}%`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

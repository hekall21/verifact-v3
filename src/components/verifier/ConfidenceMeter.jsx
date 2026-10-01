/**
 * src/components/verifier/ConfidenceMeter.jsx
 *
 * VeriFact ID 4.2 — Transparent Confidence Meter
 *
 * Standar Desain & Integritas (§4 & §14):
 * - Label mutlak: "Tingkat Keyakinan Hasil" (BUKAN "Progress").
 * - Menjawab: "Seberapa kuat bukti yang berhasil dikumpulkan untuk mendukung hasil ini?"
 * - Menampilkan breakdown eksplisit faktor positif dan faktor negatif:
 *   + Sumber primer tersedia
 *   + Domain independen majemuk
 *   + Bukti konsisten
 *   - Sumber tidak dapat diakses / tidak lengkap
 */

import React, { useState } from 'react';
import { InfoIcon, ShieldIcon, CheckCircleIcon, AlertTriangleIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function ConfidenceMeter({ confidence = null, lang = 'id' }) {
  const [showBreakdown, setShowBreakdown] = useState(true);

  const isUnavailable = confidence === null || confidence?.score === null || confidence?.score === undefined;

  const score = isUnavailable ? null : (confidence.score ?? 0);
  const band = isUnavailable ? 'notAvailable' : (confidence.band || 'low');
  const factors = isUnavailable ? [] : (confidence.factors || []);
  const sourceCoverage = isUnavailable
    ? (lang === 'id' ? 'Belum Tersedia' : 'Not Available')
    : (confidence.sourceCoverage || 'Low');
  const primarySourcesCount = isUnavailable ? '—' : (confidence.primarySourcesCount ?? 0);
  const independentClustersCount = isUnavailable ? '—' : (confidence.independentClustersCount ?? 0);

  const bandLabel = t(lang, `verifier.confidenceBands.${band}`) || (isUnavailable ? (lang === 'id' ? 'Belum Tersedia' : 'Not Available') : band);

  const getMeterColor = () => {
    if (isUnavailable) return 'var(--vf-text-muted)';
    if (score >= 70) return 'var(--vf-fact)';
    if (score >= 45) return 'var(--vf-primary)';
    if (score >= 30) return 'var(--vf-partly)';
    return 'var(--vf-hoax)';
  };

  return (
    <div
      className="rounded-2xl p-5 sm:p-6 border shadow-sm transition-colors space-y-4"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-3"
        style={{ borderColor: 'var(--vf-border)' }}
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
              {lang === 'id' ? 'KUALITAS BUKTI PENDUKUNG' : 'EVIDENCE QUALITY SCORE'}
            </span>
          </div>
          <h4 className="text-base font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
            {lang === 'id' ? 'Tingkat Keyakinan Hasil' : 'Confidence in Result'}
          </h4>
          <p className="text-xs max-w-md leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
            {isUnavailable
              ? (lang === 'id'
                  ? 'Sistem belum memperoleh isi artikel sehingga belum dapat menghitung keyakinan terhadap klaim.'
                  : 'The system has not retrieved the article content, so confidence cannot be calculated.')
              : (lang === 'id'
                  ? 'Menilai kekuatan dan independensi bukti yang berhasil dikumpulkan, bukan persentase kebenaran klaim.'
                  : 'Assesses the strength and independence of gathered evidence, not claim probability.')}
          </p>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <div className="flex items-baseline space-x-1 sm:justify-end">
            <span className="text-3xl font-black font-mono tracking-tight" style={{ color: getMeterColor() }}>
              {isUnavailable ? 'N/A' : `${score}%`}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5"
            style={{
              backgroundColor: isUnavailable
                ? 'var(--vf-surface-muted)'
                : 'color-mix(in srgb, var(--vf-primary) 12%, transparent)',
              color: isUnavailable ? 'var(--vf-text-muted)' : 'var(--vf-primary)',
              border: isUnavailable ? '1px solid var(--vf-border)' : 'none',
            }}
          >
            {bandLabel}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div>
        <div className="w-full h-2.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: 'var(--vf-surface-muted)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: isUnavailable ? '0%' : `${Math.max(5, Math.min(100, score))}%`,
              backgroundColor: getMeterColor(),
            }}
          />
        </div>
        <div className="flex justify-between text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
          <span>0% Bukti Minim</span>
          <span>50% Cukup Moderat</span>
          <span>100% Bukti Sangat Kuat</span>
        </div>
      </div>

      {/* Evidence Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Cakupan Sumber</span>
          <span className="font-bold" style={{ color: 'var(--vf-text)' }}>{sourceCoverage}</span>
        </div>
        <div className="p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Sumber Primer</span>
          <span className="font-bold" style={{ color: 'var(--vf-text)' }}>{primarySourcesCount}{typeof primarySourcesCount === 'number' ? ' Instansi' : ''}</span>
        </div>
        <div className="p-2.5 rounded-xl border col-span-2 sm:col-span-1" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
          <span className="text-[10px] block" style={{ color: 'var(--vf-text-muted)' }}>Kluster Independen</span>
          <span className="font-bold" style={{ color: 'var(--vf-text)' }}>{independentClustersCount}{typeof independentClustersCount === 'number' ? ' Domain' : ''}</span>
        </div>
      </div>

      {/* Breakdown Factors Toggle */}
      <div className="pt-2 border-t" style={{ borderColor: 'var(--vf-border)' }}>
        <button
          type="button"
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="text-xs font-semibold flex items-center justify-between w-full hover:opacity-80 transition-opacity"
          style={{ color: 'var(--vf-primary)' }}
        >
          <span className="flex items-center space-x-1.5">
            <InfoIcon className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Rincian Faktor Pembentuk Keyakinan:' : 'Confidence Breakdown Factors:'}</span>
          </span>
          <span className="text-[11px] underline">
            {showBreakdown ? (lang === 'id' ? 'Tutup' : 'Collapse') : (lang === 'id' ? 'Buka' : 'Expand')}
          </span>
        </button>

        {showBreakdown && (
          <div className="mt-3 space-y-1.5 text-xs">
            {factors.length > 0 ? (
              factors.map((f, idx) => {
                const factorLabel = t(lang, `verifier.confidenceFactors.${f.code}`) || f.text || f.code;
                const isPositive = f.impact > 0;
                const isNeutral = f.impact === 0;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 px-2.5 rounded-lg"
                    style={{ backgroundColor: 'var(--vf-surface-muted)' }}
                  >
                    <span className="flex items-center space-x-2" style={{ color: 'var(--vf-text-secondary)' }}>
                      <span>{isPositive ? '➕' : isNeutral ? '⚪' : '➖'}</span>
                      <span>{factorLabel}</span>
                    </span>
                    <span
                      className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                        isPositive
                          ? 'text-emerald-500 bg-emerald-500/10'
                          : isNeutral
                          ? 'text-slate-400 bg-slate-500/10'
                          : 'text-rose-500 bg-rose-500/10'
                      }`}
                    >
                      {isPositive ? `+${f.impact}%` : isNeutral ? '0%' : `${f.impact}%`}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-xs italic py-1" style={{ color: 'var(--vf-text-muted)' }}>
                {isUnavailable
                  ? (lang === 'id' ? 'Faktor keyakinan akan dihitung secara transparan setelah isi sumber berhasil dianalisis.' : 'Confidence factors will be computed transparently after source content is retrieved.')
                  : (lang === 'id' ? 'Belum ada faktor tambahan.' : 'No additional factors.')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConfidenceMeter;

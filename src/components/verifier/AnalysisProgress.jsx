/**
 * src/components/verifier/AnalysisProgress.jsx
 *
 * VeriFact ID 5.0 — Pipeline State Machine Progress UI
 * Sleek Forensic Pipeline Stepper Design.
 */

import React from 'react';
import { RefreshIcon, CheckIcon } from '../common/Icons.jsx';

export function AnalysisProgress({ currentStep = 1, currentState = '', lang = 'id' }) {
  const steps = [
    { num: 1, key: 'classifying', label: lang === 'id' ? 'Mengenali format masukan' : 'Classifying input format' },
    { num: 2, key: 'retrieving-source', label: lang === 'id' ? 'Mengambil sumber / validasi tautan' : 'Retrieving source / validating URL' },
    { num: 3, key: 'extracting-content', label: lang === 'id' ? 'Membaca isi & metadata artikel' : 'Reading content & metadata' },
    { num: 4, key: 'extracting-claims', label: lang === 'id' ? 'Mengekstrak klaim atomik' : 'Extracting atomic claims' },
    { num: 5, key: 'searching-evidence', label: lang === 'id' ? 'Mencari bukti (Dukungan & Sanggahan)' : 'Searching evidence (Support & Refute)' },
    { num: 6, key: 'comparing-evidence', label: lang === 'id' ? 'Membandingkan bukti & kluster sumber' : 'Comparing evidence & clustering' },
    { num: 7, key: 'building-verdict', label: lang === 'id' ? 'Menyusun kesimpulan & keyakinan' : 'Synthesizing verdict & confidence' },
  ];

  const totalSteps = steps.length;
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <div
      className="w-full max-w-2xl mx-auto my-8 p-6 sm:p-7 rounded-2xl vf-card vf-fade-up"
    >
      {/* Header with explicit PIPELINE PROGRESS label */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider block text-indigo-500">
            {lang === 'id' ? 'PIPELINE AUDIT AKTIF' : 'ACTIVE PIPELINE AUDIT'}
          </span>
          <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
            {lang === 'id' ? 'Kemajuan Analisis Fakta' : 'Verification Pipeline Progress'}
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {progressPercent}%
          </span>
          <span className="text-[11px] font-mono block mt-0.5" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? `Tahap ${currentStep} / ${totalSteps}` : `Step ${currentStep} / ${totalSteps}`}
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 rounded-full overflow-hidden mb-6" style={{ backgroundColor: 'var(--vf-surface-muted)' }}>
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: 'var(--vf-primary)',
          }}
        />
      </div>

      {/* Pipeline Steps List */}
      <div className="space-y-2.5">
        {steps.map((st) => {
          const isDone = st.num < currentStep;
          const isCurrent = st.num === currentStep;

          return (
            <div
              key={st.num}
              className={`flex items-center space-x-3 text-xs transition-all ${
                isCurrent
                  ? 'font-bold opacity-100'
                  : isDone
                  ? 'opacity-85 text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'opacity-40'
              }`}
              style={{
                color: isCurrent ? 'var(--vf-text)' : undefined,
              }}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  isDone
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                    ? 'border-2 shadow-xs'
                    : 'border'
                }`}
                style={{
                  borderColor: isCurrent ? 'var(--vf-primary)' : 'var(--vf-border-strong)',
                  color: isCurrent ? 'var(--vf-primary)' : undefined,
                  backgroundColor: isCurrent ? 'color-mix(in srgb, var(--vf-primary) 12%, transparent)' : undefined,
                }}
              >
                {isDone ? (
                  <CheckIcon className="w-3 h-3" />
                ) : isCurrent ? (
                  <RefreshIcon className="w-2.5 h-2.5 vf-spin" />
                ) : (
                  <span className="font-mono text-[9px]">{st.num}</span>
                )}
              </div>
              <span className="flex-1">{st.label}</span>
              {isCurrent && (
                <span className="text-[10px] font-mono font-semibold text-indigo-400 uppercase tracking-wider animate-pulse">
                  {lang === 'id' ? 'Memproses...' : 'Processing...'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Clarity Note */}
      <div className="mt-6 pt-4 border-t text-[11px] leading-relaxed font-mono" style={{ borderColor: 'var(--vf-border)', color: 'var(--vf-text-muted)' }}>
        {lang === 'id'
          ? 'Catatan Audit: Persentase di atas menunjukkan kemajuan komputasi penelusuran bukti, bukan probabilitas kebenaran klaim.'
          : 'Audit Note: The percentage above indicates computation progress across evidence providers, not claim veracity score.'}
      </div>
    </div>
  );
}

export default AnalysisProgress;

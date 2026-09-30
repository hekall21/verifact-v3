/**
 * AnalysisProgress.jsx
 *
 * Komponen indikator progres penelusuran multi-tahap (1 s.d. 5).
 * Memenuhi spesifikasi master prompt §21: tidak menggunakan fake timeout statis,
 * melainkan menampilkan status kemajuan pipa verifikasi secara nyata.
 */

import React from 'react';
import { RefreshIcon, CheckIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function AnalysisProgress({ currentStep = 1, lang }) {
  const steps = [
    { num: 1, label: t(lang, 'verifier.progress.step1') },
    { num: 2, label: t(lang, 'verifier.progress.step2') },
    { num: 3, label: t(lang, 'verifier.progress.step3') },
    { num: 4, label: t(lang, 'verifier.progress.step4') },
    { num: 5, label: t(lang, 'verifier.progress.step5') },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl border shadow-lg vf-fade-up"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
          {t(lang, 'verifier.checkingButton')}
        </h3>
        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--vf-primary)' }}>
          Tahap {currentStep} / 5
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2 rounded-full overflow-hidden mb-6" style={{ backgroundColor: 'var(--vf-surface-muted)' }}>
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            width: `${(currentStep / 5) * 100}%`,
            backgroundColor: 'var(--vf-primary)',
          }}
        />
      </div>

      {/* Step Breakdown */}
      <div className="space-y-3">
        {steps.map((st) => {
          const isDone = st.num < currentStep;
          const isCurrent = st.num === currentStep;

          return (
            <div
              key={st.num}
              className={`flex items-center space-x-3 text-xs transition-opacity ${
                isCurrent ? 'font-semibold opacity-100' : isDone ? 'opacity-85 text-emerald-600 dark:text-emerald-400' : 'opacity-40'
              }`}
              style={{
                color: isCurrent ? 'var(--vf-text)' : undefined,
              }}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                  isDone ? 'bg-emerald-500 text-white' : isCurrent ? 'border-2' : 'border'
                }`}
                style={{
                  borderColor: isCurrent ? 'var(--vf-primary)' : 'var(--vf-border-strong)',
                  color: isCurrent ? 'var(--vf-primary)' : undefined,
                }}
              >
                {isDone ? <CheckIcon className="w-3 h-3" /> : isCurrent ? <RefreshIcon className="w-2.5 h-2.5 vf-spin" /> : st.num}
              </div>
              <span className="flex-1">{st.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * EvidenceTimeline.jsx
 *
 * Garis waktu penelusuran fakta dan observasi kontekstual pola kejahatan siber.
 */

import React from 'react';
import { AlertOctagonIcon, ShieldIcon, CheckCircleIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function EvidenceTimeline({
  matchedPatterns = [],
  evidenceList = [],
  lang = 'id',
}) {
  const topPattern = matchedPatterns[0];

  return (
    <div className="rounded-2xl p-5 sm:p-6 border shadow-sm space-y-4"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
          {t(lang, 'verifier.result.timelineTitle')}
        </h4>
        {topPattern && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Pola Modus: {topPattern.id}
          </span>
        )}
      </div>

      {/* Observasi Konteks & Tindakan Pencegahan */}
      {topPattern ? (
        <div className="space-y-3">
          <div className="rounded-xl p-3.5 border bg-rose-500/5 border-rose-500/15">
            <h5 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5 mb-2">
              <AlertOctagonIcon className="w-4 h-4 shrink-0" />
              <span>Indikator Modus Berulang Yang Terdeteksi:</span>
            </h5>
            <ul className="space-y-1.5 text-xs">
              {(topPattern.contextKeys || []).map((ck, i) => (
                <li key={i} className="flex items-start space-x-2" style={{ color: 'var(--vf-text-secondary)' }}>
                  <span className="text-rose-500 font-bold">&bull;</span>
                  <span>{t(lang, `verifier.contextNotes.${ck}`) || ck}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl p-3.5 border bg-emerald-500/5 border-emerald-500/15">
            <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5 mb-2">
              <ShieldIcon className="w-4 h-4 shrink-0" />
              <span>{t(lang, 'verifier.result.actionTitle')}:</span>
            </h5>
            <ul className="space-y-1.5 text-xs">
              {(topPattern.actionKeys || []).map((ak, i) => (
                <li key={i} className="flex items-start space-x-2" style={{ color: 'var(--vf-text-secondary)' }}>
                  <span className="text-emerald-500 font-bold">&#10003;</span>
                  <span>{t(lang, `verifier.actionNotes.${ak}`) || ak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-xs" style={{ color: 'var(--vf-text-muted)' }}>
          <p>Klaim ini dianalisis berdasarkan struktur bahasa, entitas faktual, dan verifikasi silang pangkalan data independen.</p>
        </div>
      )}
    </div>
  );
}

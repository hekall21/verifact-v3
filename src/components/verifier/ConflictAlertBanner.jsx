/**
 * ConflictAlertBanner.jsx
 *
 * VeriFact ID 4.0 - Conflict Detection Banner
 * Menampilkan peringatan transparan bila terdapat pertentangan antar sumber (Conflicting Evidence).
 * Sesuai spesifikasi master prompt v4.txt §22.
 */

import React from 'react';
import { AlertTriangleIcon } from '../common/Icons.jsx';

export function ConflictAlertBanner({ conflictAnalysis = {}, lang = 'id' }) {
  if (!conflictAnalysis || !conflictAnalysis.hasConflict) return null;

  return (
    <div
      className="rounded-2xl p-5 border shadow-sm space-y-3"
      style={{
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderColor: 'rgba(245, 158, 11, 0.3)',
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 flex-shrink-0">
          <AlertTriangleIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {lang === 'id' ? '⚠️ Terdeteksi Pertentangan Sumber (Conflicting Evidence)' : '⚠️ Conflicting Evidence Detected'}
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {conflictAnalysis.description}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-semibold">
              {conflictAnalysis.supportingCount} {lang === 'id' ? 'Mendukung' : 'Supporting'}
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-semibold">
              {conflictAnalysis.refutingCount} {lang === 'id' ? 'Membantah' : 'Refuting'}
            </span>
            <span className="text-[11px] text-slate-400 italic">
              {lang === 'id'
                ? 'Sistem tidak memaksakan kesimpulan sepihak saat bukti belum bulat.'
                : 'The system refrains from a forced one-sided verdict when evidence is divided.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

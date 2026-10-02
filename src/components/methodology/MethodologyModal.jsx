/**
 * MethodologyModal.jsx
 *
 * Modal panduan transparansi metodologi, rubrik 7 status,
 * formula tingkat keyakinan, dan etika standar IFCN.
 */

import React from 'react';
import { XIcon, CheckCircleIcon } from '../common/Icons.jsx';
import { VeriFactEmblem } from '../common/VeriFactLogo.jsx';
import { VERDICT_ORDER } from '../../utils/verdict.js';
import { VerdictBadge } from '../verifier/VerdictBadge.jsx';
import { t } from '../../i18n/index.js';

export function MethodologyModal({ isOpen, onClose, lang = 'id' }) {
  if (!isOpen) return null;

  const principles = [
    'Pemeriksaan Berbasis Bukti Nyata: VeriFact ID tidak pernah mengarang simpulan atau menghasilkan halusinasi AI fiktif.',
    'Diferensiasi Hierarki Sumber: Sumber primer kementerian/otoritas diposisikan pada tingkat tertinggi (Tier 1), diikuti media terakreditasi (Tier 2), dan basis cek fakta (Tier 3).',
    'Kejujuran Terhadap Ketiadaan Data: Jika konten tautan tidak dapat diakses atau bukti tidak ditemukan, sistem secara jujur menyatakan BELUM TERBUKTI atau TIDAK DAPAT DIVERIFIKASI.',
    'Perhitungan Keyakinan Terbuka: Skor persentase (0-100%) dihitung secara deterministik dari jumlah domain independen, ketersediaan sumber primer, dan konsistensi data.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm vf-fade-up">
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6"
        style={{
          backgroundColor: 'var(--vf-bg-elevated)',
          borderColor: 'var(--vf-border-strong)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1"
              style={{
                background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <VeriFactEmblem size={26} idSuffix="methodology" />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
                {t(lang, 'methodology.title')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {t(lang, 'methodology.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:opacity-75"
            style={{
              backgroundColor: 'var(--vf-surface)',
              color: 'var(--vf-text)',
            }}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Principles */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
            {t(lang, 'methodology.principlesTitle')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {principles.map((p, idx) => (
              <div key={idx} className="p-3 rounded-xl border flex items-start space-x-2"
                style={{
                  backgroundColor: 'var(--vf-surface)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Verdict Rubric */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-blue-500">
            {t(lang, 'methodology.rubricTitle')}
          </h4>
          <div className="space-y-2 text-xs">
            {VERDICT_ORDER.map((v) => (
              <div
                key={v}
                className="p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--vf-surface)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                <VerdictBadge verdict={v} lang={lang} size="sm" />
                <span className="text-[11px] sm:text-xs flex-1 sm:ml-4" style={{ color: 'var(--vf-text-secondary)' }}>
                  {t(lang, `verifier.verdict.${v}.summary`)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-4 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
            style={{ backgroundColor: 'var(--vf-primary)' }}
          >
            {t(lang, 'methodology.closeBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * WhyThisResultModal.jsx
 *
 * VeriFact ID 4.0 - Explainability & "Show Your Work" Modal
 * Membuka kotak hitam (Black Box) sistem dengan menyajikan audit trail 7 langkah:
 * Masukan -> Klaim -> Kueri Pencarian -> Sumber -> Klaster -> Konflik -> Sintesis.
 * Sesuai spesifikasi master prompt v4.txt §28, §29, dan §35.
 */

import React from 'react';
import { XIcon, CheckIcon, ShieldIcon } from '../common/Icons.jsx';

export function WhyThisResultModal({ isOpen, onClose, result = {}, lang = 'id' }) {
  if (!isOpen) return null;

  const { auditTrail = [], generatedQueries = [], verificationId, reportHash } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-2xl rounded-2xl border p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
          color: 'var(--vf-text)',
        }}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                {verificationId || 'VF-2026-AUDIT'}
              </span>
              <span className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {lang === 'id' ? 'Audit Jejak Pemeriksaan' : 'Verification Audit Trail'}
              </span>
            </div>
            <h3 className="text-lg font-bold font-heading mt-1" style={{ color: 'var(--vf-text)' }}>
              {lang === 'id' ? '🔍 Mengapa Hasil Ini Ditentukan? (Show Your Work)' : '🔍 Why This Result? (Show Your Work)'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:opacity-75 transition-opacity"
            style={{ color: 'var(--vf-text-muted)' }}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
          {lang === 'id'
            ? 'VeriFact ID tidak mengharapkan pengguna mempercayai AI secara buta. Berikut adalah rantai pembuktian logis yang dieksekusi sistem untuk memverifikasi informasi ini.'
            : 'VeriFact ID does not expect users to blindly trust AI. Below is the transparent chain of logic executed by the system.'}
        </p>

        {/* 7-Step Step-by-Step Audit Trail */}
        <div className="space-y-3">
          {auditTrail.map((step) => (
            <div
              key={step.step}
              className="p-3.5 rounded-xl border flex items-start space-x-3 text-xs"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-500 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                {step.step}
              </span>
              <div className="space-y-0.5">
                <h4 className="font-bold" style={{ color: 'var(--vf-text)' }}>
                  {step.title}
                </h4>
                <p style={{ color: 'var(--vf-text-secondary)' }}>
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Search Queries Transparency */}
        {generatedQueries && generatedQueries.length > 0 && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--vf-border)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-500">
              {lang === 'id' ? '🔎 Transparansi Kueri Pencarian Multi-Kanal:' : '🔎 Search Queries Transparency:'}
            </h4>
            <div className="space-y-1.5 text-xs font-mono">
              {generatedQueries.map((q) => (
                <div
                  key={q.id}
                  className="p-2 rounded-lg bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]"
                >
                  <span className="text-emerald-400">{q.query}</span>
                  <span className="text-[10px]" style={{ color: 'var(--vf-text-muted)' }}>
                    [{q.purpose}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Hash */}
        {reportHash && (
          <div className="p-3 rounded-lg bg-black/50 border border-white/5 text-[11px] font-mono space-y-1 text-slate-400">
            <span className="font-bold block text-slate-300">
              {lang === 'id' ? 'Integritas Laporan (Cryptographic Hash):' : 'Report Integrity Hash:'}
            </span>
            <span className="break-all text-cyan-400">{reportHash}</span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ backgroundColor: 'var(--vf-primary)' }}
          >
            {lang === 'id' ? 'Tutup Penjelasan' : 'Close Explanation'}
          </button>
        </div>
      </div>
    </div>
  );
}

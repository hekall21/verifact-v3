/**
 * src/components/verifier/ContextualEducationCard.jsx
 *
 * VeriFact ID 5.0 — Contextual Education & Official Complaint Hub (§25, §26, §27, §35)
 *
 * Menampilkan:
 * 1. Edukasi Kontekstual (§25):
 *    - Tips mandiri & langkah kritis sesuai jenis masukan
 * 2. Saluran & Tautan Pelaporan Resmi (§26, §27):
 *    - CekRekening.id, AduanNomor.id, PatroliSiber.id, AduanKonten.id, OJK 157, TurnBackHoax.id
 */

import React from 'react';
import { BookOpenIcon, ExternalLinkIcon, ShieldIcon, CheckCircleIcon, HelpCircleIcon } from '../common/Icons.jsx';

export function ContextualEducationCard({ education, reportResources = [], lang = 'id' }) {
  if (!education && (!reportResources || reportResources.length === 0)) {
    return null;
  }

  const {
    topic = 'Literasi Informasi',
    guideTitle = 'Panduan Memeriksa Fakta & Mencegah Penipuan',
    keyTips = [],
    verificationSteps = [],
  } = education || {};

  return (
    <div
      className="rounded-2xl p-6 sm:p-7 border shadow-sm space-y-6 transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--vf-primary) 15%, transparent)',
            color: 'var(--vf-primary)',
          }}
        >
          <BookOpenIcon className="w-4 h-4" />
        </div>
        <div>
          <h3
            className="text-sm sm:text-base font-bold tracking-tight"
            style={{ color: 'var(--vf-text)', fontFamily: 'var(--font-display)' }}
          >
            {guideTitle}
          </h3>
          <span className="text-[11px] font-mono text-indigo-500 uppercase tracking-wider block">
            EDUKASI & SALURAN PELAPORAN RESMI (§25 - §27)
          </span>
        </div>
      </div>

      {/* Part 1: Contextual Education Tips (§25) */}
      {keyTips.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Kaidah Kritis & Tips Cek Mandiri:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {keyTips.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border flex items-start space-x-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                <span className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.45 }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 2: Step by Step Verification Checklist */}
      {verificationSteps.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Langkah Verifikasi Selanjutnya:
          </h4>
          <div className="space-y-1.5">
            {verificationSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border flex items-center space-x-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Part 3: Official Complaint & Reporting Links Hub (§26, §27) */}
      {reportResources.length > 0 && (
        <div className="pt-2 border-t space-y-3" style={{ borderColor: 'var(--vf-border)' }}>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center space-x-1.5">
              <ShieldIcon className="w-4 h-4 shrink-0" />
              <span>Kanal Pelaporan Resmi Pemerintah & Otoritas:</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Tautan Resmi Terverifikasi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {reportResources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-3 rounded-xl border flex flex-col justify-between transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold group-hover:text-indigo-500 transition-colors" style={{ color: 'var(--vf-text)' }}>
                      {res.name}
                    </span>
                    <ExternalLinkIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 block">
                    {res.institution}
                  </span>
                  <p className="text-[11px] line-clamp-2" style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.35 }}>
                    {res.description}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t flex items-center justify-between text-[10px]" style={{ borderColor: 'var(--vf-border)' }}>
                  <span className="text-indigo-500 font-semibold group-hover:underline">Buka Portal &rarr;</span>
                  <span className="font-mono text-slate-400 uppercase text-[9px]">{res.type}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

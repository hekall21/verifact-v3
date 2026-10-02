/**
 * src/components/verifier/ScamAnalysisCard.jsx
 *
 * VeriFact ID 5.0 — Contextual Scam Analysis Card (§17, §29, §35)
 *
 * Menjawab struktur 5 pilar ancaman rekayasa sosial:
 * 1. Apa yang Ditawarkan / Isi Pesan
 * 2. Indikator Risiko (Triggers detected)
 * 3. Kenapa Berisiko (Deep threat explanation)
 * 4. Hal yang Perlu Diperiksa (Verification checklist)
 * 5. Rekomendasi Tindakan (Actionable steps)
 */

import React from 'react';
import { AlertTriangleIcon, CheckSquareIcon, ShieldIcon, AlertOctagonIcon, InfoIcon } from '../common/Icons.jsx';

const RISK_BADGES = {
  'CRITICAL RISK': {
    bg: 'bg-rose-500/15',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    label: 'RISIKO TINGGI / SANGAT BERBAHAYA',
  },
  'HIGH RISK': {
    bg: 'bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/25',
    label: 'RISIKO TINGGI',
  },
  'MEDIUM RISK': {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/25',
    label: 'PERLU WASPADA',
  },
  'LOW RISK': {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/25',
    label: 'RISIKO RENDAH',
  },
};

export function ScamAnalysisCard({ scamAnalysis, subType, maskedText, lang = 'id' }) {
  if (!scamAnalysis) return null;

  const {
    whatIsOffered,
    riskLevel = 'HIGH RISK',
    riskScore = 80,
    indicators = [],
    whyRisky,
    thingsToVerify = [],
    recommendedActions = [],
  } = scamAnalysis;

  const badgeConfig = RISK_BADGES[riskLevel] || RISK_BADGES['HIGH RISK'];

  return (
    <div
      className="rounded-2xl p-6 sm:p-7 border shadow-lg space-y-6 transition-all"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      {/* Top Header: Subtype & Risk Level */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
        <div className="flex items-center space-x-2">
          <span
            className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
          >
            {badgeConfig.label}
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Skor Risiko: {riskScore}/100
          </span>
        </div>

        {subType && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            SUBTIPE: {subType}
          </span>
        )}
      </div>

      {/* 1. APA YANG DITAWARKAN / ISI PESAN */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          1. Apa yang Ditawarkan / Isi Informasi:
        </h4>
        <div className="p-3.5 rounded-xl border text-xs sm:text-sm font-medium" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)', color: 'var(--vf-text)' }}>
          {whatIsOffered || 'Pesan berisi penawaran komersial, promosi akun, atau instruksi darurat.'}
        </div>
        {maskedText && (
          <div className="p-3 rounded-lg font-mono text-[11px] bg-slate-950 text-slate-300 border border-white/10 leading-relaxed overflow-x-auto">
            &ldquo;{maskedText}&rdquo;
          </div>
        )}
      </div>

      {/* 2. INDIKATOR RISIKO TERDETEKSI */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center space-x-2">
          <AlertTriangleIcon className="w-4 h-4 shrink-0" />
          <span>2. Indikator Risiko Terdeteksi ({indicators.length}):</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {indicators.map((ind, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border space-y-1 text-xs"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{ind.title || ind.category}</span>
              </div>
              <p style={{ color: 'var(--vf-text-secondary)', lineHeight: 1.4 }}>
                {ind.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. KENAPA BERISIKO */}
      <div
        className="p-4 sm:p-5 rounded-xl border space-y-2"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--vf-warning) 8%, transparent)',
          borderColor: 'color-mix(in srgb, var(--vf-warning) 25%, transparent)',
        }}
      >
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center space-x-2">
          <AlertOctagonIcon className="w-4 h-4 shrink-0" />
          <span>3. Kenapa Berisiko? (Analisis Ancaman Siber):</span>
        </h4>
        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
          {whyRisky || 'Modus ini memanfaatkan manipulasi psikologis korban untuk mentransfer uang atau membagikan kredensial rahasia tanpa perlindungan sistem transaksi resmi.'}
        </p>
      </div>

      {/* 4. HAL YANG PERLU DIPERIKSA */}
      {thingsToVerify.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
            <CheckSquareIcon className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>4. Hal yang Perlu Diperiksa (Verification Checklist):</span>
          </h4>
          <div className="space-y-1.5">
            {thingsToVerify.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl border flex items-center space-x-2.5 text-xs"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              >
                <div className="w-4 h-4 rounded border border-indigo-500/40 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-indigo-500">{idx + 1}</span>
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. REKOMENDASI TINDAKAN */}
      {recommendedActions.length > 0 && (
        <div
          className="p-4 sm:p-5 rounded-xl border space-y-2.5"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--vf-primary) 8%, transparent)',
            borderColor: 'color-mix(in srgb, var(--vf-primary) 25%, transparent)',
          }}
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-2">
            <ShieldIcon className="w-4 h-4 shrink-0" />
            <span>5. Rekomendasi Tindakan Keamanan:</span>
          </h4>
          <ul className="space-y-1.5 text-xs sm:text-sm list-disc pl-5" style={{ color: 'var(--vf-text-secondary)' }}>
            {recommendedActions.map((action, idx) => (
              <li key={idx} className="leading-snug">{action}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

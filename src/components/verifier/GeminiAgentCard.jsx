/**
 * src/components/verifier/GeminiAgentCard.jsx
 *
 * Komponen kartu AI Agent berbasis Google AI Studio (Gemini 2.5 Flash).
 * Memberikan analisis forensik machine learning mendalam untuk URL artikel,
 * dekonstruksi bias/retorika, kesesuaian judul vs isi, dan deteksi rekayasa sosial.
 */

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  BrainIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  RefreshIcon,
  ExternalLinkIcon,
} from '../common/Icons.jsx';
import {
  getGeminiModel,
  runGeminiAgentAnalysis,
} from '../../services/geminiAgentService.js';

export function GeminiAgentCard({
  initialResult = null,
  inputType,
  subType,
  text,
  url,
  articleMetadata,
  mainClaim,
  atomicClaims = [],
  existingVerdict,
  lang = 'id',
}) {
  const [activeModel, setActiveModel] = useState('gemini-flash-lite-latest');
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [agentResult, setAgentResult] = useState(initialResult);
  const [errorMsg, setErrorMsg] = useState(null);

  const steps = [
    lang === 'id' ? 'Membaca konten artikel & konteks sumber...' : 'Reading article content & context...',
    lang === 'id' ? 'Menganalisis bias retorika, clickbait, dan emosi...' : 'Analyzing rhetoric bias, clickbait & emotion...',
    lang === 'id' ? 'Menguji dekomposisi klaim atomik & plausibilitas...' : 'Cross-evaluating atomic claims plausibility...',
    lang === 'id' ? 'Menyusun laporan forensik kecerdasan buatan...' : 'Synthesizing forensic AI report...',
  ];

  useEffect(() => {
    setActiveModel(getGeminiModel());
    if (initialResult) {
      setAgentResult(initialResult);
    } else if (!agentResult && !loading) {
      handleRunAnalysis();
    }
  }, [initialResult]);

  const handleRunAnalysis = async () => {
    setLoading(true);
    setErrorMsg(null);
    setCurrentStepIndex(0);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await runGeminiAgentAnalysis({
        inputType,
        subType,
        text,
        url,
        articleMetadata,
        mainClaim,
        atomicClaims,
        existingVerdict,
        lang,
      });
      clearInterval(stepInterval);
      setAgentResult(res);
    } catch (err) {
      clearInterval(stepInterval);
      console.error('[GeminiAgentCard Error]', err);
      setErrorMsg(err.message || 'Gagal menjalankan analisis AI Agent.');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict) => {
    switch (verdict) {
      case 'TERVERIFIKASI_FAKTUAL':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          text: lang === 'id' ? 'TERVERIFIKASI FAKTUAL' : 'VERIFIED FACTUAL',
        };
      case 'HOAKS_PALSU':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          text: lang === 'id' ? 'HOAKS / PALSU' : 'FALSE / HOAX',
        };
      case 'MENYESATKAN_MISLEADING':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          text: lang === 'id' ? 'MENYESATKAN (MISLEADING)' : 'MISLEADING',
        };
      case 'POTENSI_SCAM_PHISHING':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          text: lang === 'id' ? 'POTENSI SCAM / PHISHING' : 'POTENTIAL SCAM / PHISHING',
        };
      default:
        return {
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          text: lang === 'id' ? 'BELUM TERBUKTI / BERKEMBANG' : 'UNVERIFIED / DEVELOPING',
        };
    }
  };

  // STATE: BELUM DIJALANKAN (STANDBY)
  if (!agentResult && !loading) {
    return (
      <div
        className="rounded-2xl p-6 border shadow-lg space-y-4 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                  ✨ Google AI Studio Agent Deep Analysis
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {activeModel}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {lang === 'id'
                  ? 'Audit forensik semantik multi-sudut pandang menggunakan model Gemini.'
                  : 'Multi-perspective semantic forensic audit powered by Gemini.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleRunAnalysis}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md shadow-cyan-500/20 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--vf-primary)' }}
            >
              <SparklesIcon className="w-4 h-4" />
              <span>{lang === 'id' ? 'Jalankan Analisis AI Agent' : 'Run AI Agent Analysis'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border bg-rose-500/10 border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertTriangleIcon className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    );
  }

  // 3. STATE: SEDANG BERJALAN (LOADING)
  if (loading) {
    return (
      <div
        className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-5"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center animate-spin">
            <RefreshIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
              {lang === 'id' ? 'AI Agent Sedang Menganalisis...' : 'AI Agent Analyzing...'}
            </h3>
            <p className="text-xs font-mono text-cyan-400">
              {steps[currentStepIndex]}
            </p>
          </div>
        </div>

        {/* Progress Bar Animation */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-1.5 transition-all duration-500 rounded-full"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  // 4. STATE: HASIL SUDAH TERSEDIA (COMPLETED)
  const verdictMeta = getVerdictBadge(agentResult.agentVerdict);

  return (
    <div
      className="rounded-2xl p-6 sm:p-7 border shadow-xl space-y-6 relative overflow-hidden"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                Google AI Studio Agent Report
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {agentResult.modelUsed || activeModel}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
              {lang === 'id' ? 'Forensik Semantik & Evaluasi Plausibilitas Klaim' : 'Semantic Forensics & Claim Plausibility Audit'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRunAnalysis}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border hover:opacity-80 transition-all"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
              color: 'var(--vf-text)',
            }}
          >
            <RefreshIcon className="w-3.5 h-3.5" />
            <span>{lang === 'id' ? 'Analisis Ulang' : 'Re-analyze'}</span>
          </button>
        </div>
      </div>

      {/* Agent Verdict & Confidence Headline */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`px-3 py-1 rounded-lg text-xs font-mono font-extrabold border ${verdictMeta.bg}`}>
            {verdictMeta.text}
          </span>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-200 border border-white/10">
            {lang === 'id' ? 'Keyakinan Model' : 'Confidence'}: {agentResult.confidenceScore}%
          </span>
        </div>

        {agentResult.verdictHeadline && (
          <h4 className="text-base sm:text-lg font-bold leading-snug" style={{ color: 'var(--vf-text)' }}>
            &ldquo;{agentResult.verdictHeadline}&rdquo;
          </h4>
        )}

        {agentResult.executiveSummary && (
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
            {agentResult.executiveSummary}
          </p>
        )}
      </div>

      {/* Grid: Radar Bias, Retorika & Kesesuaian Judul */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Radar Sensasionalisme & Clickbait */}
        <div
          className="p-4 rounded-xl border space-y-2.5 text-xs"
          style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
              Radar Sensasionalisme:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                agentResult.biasAndRhetoric?.clickbaitRating === 'Tinggi'
                  ? 'bg-rose-500/20 text-rose-400'
                  : agentResult.biasAndRhetoric?.clickbaitRating === 'Sedang'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              Clickbait: {agentResult.biasAndRhetoric?.clickbaitRating || 'Rendah'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold" style={{ color: 'var(--vf-text)' }}>
                Manipulasi Emosi:
              </span>
              <span style={{ color: 'var(--vf-text-secondary)' }}>
                {agentResult.biasAndRhetoric?.emotionalManipulation || 'Netral dan proporsional.'}
              </span>
            </div>
          </div>

          {agentResult.biasAndRhetoric?.fallaciesIdentified?.length > 0 && (
            <div className="space-y-1 pt-1 border-t border-white/5">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                Logical Fallacy Terdeteksi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {agentResult.biasAndRhetoric.fallaciesIdentified.map((f, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20"
                  >
                    ⚠️ {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 2: Kesesuaian Judul vs Isi Konten */}
        <div
          className="p-4 rounded-xl border space-y-2.5 text-xs"
          style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
              Kesesuaian Judul vs Isi:
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                agentResult.headlineAccuracy?.matchesContent
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {agentResult.headlineAccuracy?.matchesContent ? '✓ Akurat & Sesuai' : '⚠️ Judul Tidak Sesuai'}
            </span>
          </div>

          <p className="leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
            {agentResult.headlineAccuracy?.explanation ||
              'Judul mencerminkan peristiwa riil yang dilaporkan di dalam artikel tanpa distorsi fakta utama.'}
          </p>
        </div>
      </div>

      {/* Deep Claim Analysis Breakdown */}
      {agentResult.deepClaimAnalysis?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
            Evaluasi Klaim Spesifik oleh AI Agent ({agentResult.deepClaimAnalysis.length}):
          </h4>
          <div className="space-y-2.5">
            {agentResult.deepClaimAnalysis.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border space-y-1.5 text-xs"
                style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold" style={{ color: 'var(--vf-text)' }}>
                    &ldquo;{item.claim}&rdquo;
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0 self-start sm:self-auto">
                    {item.assessment}
                  </span>
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                  {item.reasoning}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Context Notice */}
      {agentResult.missingContext && (
        <div
          className="p-4 rounded-xl border text-xs leading-relaxed space-y-1"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--vf-unproven) 8%, transparent)',
            borderColor: 'color-mix(in srgb, var(--vf-unproven) 25%, transparent)',
          }}
        >
          <div className="flex items-center space-x-2 font-bold text-cyan-400">
            <BrainIcon className="w-4 h-4 shrink-0" />
            <span>Konteks Penting yang Perlu Diperhatikan:</span>
          </div>
          <p style={{ color: 'var(--vf-text-secondary)' }}>
            {agentResult.missingContext}
          </p>
        </div>
      )}

      {/* Actionable Guidance & Official Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {agentResult.officialCrossReference?.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
              Rujukan Resmi yang Disarankan:
            </span>
            <ul className="space-y-1 text-xs list-disc list-inside" style={{ color: 'var(--vf-text-secondary)' }}>
              {agentResult.officialCrossReference.map((ref, idx) => (
                <li key={idx}>{ref}</li>
              ))}
            </ul>
          </div>
        )}

        {agentResult.actionableGuidance?.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
              Langkah Perlindungan Pengguna:
            </span>
            <ul className="space-y-1 text-xs list-disc list-inside" style={{ color: 'var(--vf-text-secondary)' }}>
              {agentResult.actionableGuidance.map((act, idx) => (
                <li key={idx}>{act}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * src/components/verifier/VerifierInput.jsx
 *
 * VeriFact ID 5.0 — Smart Input & Direct AI Agent Controller Component
 *
 * Fitur (§33 & §34):
 * - Auto-detection terpadu:
 *   1. URL terdeteksi (https://... / domain)
 *   2. Nomor telepon terdeteksi (08xx / +62xx)
 *   3. Nomor rekening terdeteksi (digit perbankan 8-18 digit)
 *   4. Pesan / klaim terdeteksi (narasi teks panjang)
 * - AI Agent langsung terintegrasi di kolom pencarian / URL:
 *   - Status AI Agent (Gemini 2.5 Flash / 1.5 Flash / Pro) langsung tampak di kotak pencarian.
 *   - Form input API Key inline (tanpa harus buka navigasi / modal terpisah).
 *   - Auto-execute AI Agent bersamaan saat tombol "Analisis Sekarang (+ AI Agent)" ditekan.
 * - Quick examples: URL Berita, Pesan WhatsApp, URL Phishing, Klaim Viral.
 */

import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  LinkIcon,
  FileTextIcon,
  AlertTriangleIcon,
  RefreshIcon,
  XIcon,
  PhoneIcon,
  CreditCardIcon,
  SparklesIcon,
} from '../common/Icons.jsx';
import {
  getGeminiModel,
  setGeminiModel,
  GEMINI_MODELS,
} from '../../services/geminiAgentService.js';
import { classifyInput, isNewsHomepageUrl } from '../../utils/urlDetector.js';
import { t } from '../../i18n/index.js';

export function detectInputKind(text = '') {
  const clean = String(text || '').trim();
  if (!clean) return { kind: 'empty', label: 'Masukkan URL atau teks informasi' };

  // 1. Cek URL
  const urlClass = classifyInput(clean);
  if (urlClass.kind === 'url') {
    return {
      kind: 'url',
      label: urlClass.isNewsHomepage ? 'Halaman Utama Berita Terdeteksi' : 'URL Terdeteksi',
      icon: 'url',
      color: urlClass.isNewsHomepage ? 'amber' : 'emerald',
      detail: urlClass.domain,
    };
  }
  if (urlClass.kind === 'invalid-url') {
    return {
      kind: 'invalid-url',
      label: 'Format URL Tidak Lengkap / Tidak Valid',
      icon: 'warning',
      color: 'rose',
    };
  }

  // 2. Cek Nomor Telepon Indonesia (08xx / +62xx)
  const phoneNormalized = clean.replace(/[\s\-().+]+/g, '');
  if (/^(08|628)\d{7,12}$/.test(phoneNormalized)) {
    return {
      kind: 'phone',
      label: 'Nomor Telepon Terdeteksi',
      icon: 'phone',
      color: 'amber',
      detail: phoneNormalized,
    };
  }

  // 3. Cek Nomor Rekening (Digit murni 8-18 angka tanpa kata-kata)
  if (/^\d{8,18}$/.test(clean.replace(/[\s.-]+/g, '')) && !clean.includes(' ')) {
    return {
      kind: 'account',
      label: 'Nomor Rekening Terdeteksi',
      icon: 'account',
      color: 'emerald',
      detail: clean,
    };
  }

  // 4. Default: Teks Pesan / Narasi Klaim
  return {
    kind: 'text',
    label: clean.length > 80 ? 'Pesan / Narasi Terdeteksi' : 'Klaim Teks Terdeteksi',
    icon: 'text',
    color: 'blue',
  };
}

export function VerifierInput({
  input,
  setInput,
  onVerify,
  loading,
  lang = 'id',
  onClear,
}) {
  const [detection, setDetection] = useState({ kind: 'empty' });
  const [aiAgentEnabled, setAiAgentEnabled] = useState(() => {
    try {
      return localStorage.getItem('vf_ai_agent_enabled') !== 'false';
    } catch {
      return true;
    }
  });
  const [selectedModel, setSelectedModel] = useState(() => getGeminiModel());

  useEffect(() => {
    setDetection(detectInputKind(input));
  }, [input]);

  useEffect(() => {
    setSelectedModel(getGeminiModel());
  }, []);

  const quickExamples = [
    {
      label: lang === 'id' ? 'URL Berita' : 'News URL',
      value: 'https://news.detik.com/berita/d-7561234/menkes-pastikan-vaksinasi-baru-gratis-untuk-lansia',
    },
    {
      label: lang === 'id' ? 'Pesan WhatsApp' : 'WhatsApp Scam',
      value: 'Pemberitahuan! Rekening bank Anda akan diblokir dalam 24 jam. Segera verifikasi kode OTP Anda melalui link: https://login-bank-example.invalid/auth',
    },
    {
      label: lang === 'id' ? 'URL Phishing' : 'Phishing URL',
      value: 'https://login-bank-example.invalid/login.php',
    },
    {
      label: lang === 'id' ? 'Klaim Viral' : 'Viral Claim',
      value: 'BLT Rp5 juta akan diberikan kepada semua warga mulai Oktober',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onVerify(input);
  };

  const renderBadgeIcon = () => {
    switch (detection.icon) {
      case 'url':
        return <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'phone':
        return <PhoneIcon className="w-3.5 h-3.5 text-amber-500" />;
      case 'account':
        return <CreditCardIcon className="w-3.5 h-3.5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <FileTextIcon className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form
        onSubmit={handleSubmit}
        className="relative rounded-2xl p-3 transition-all shadow-lg border space-y-3"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        {/* 1. Dynamic Detection Bar */}
        <div
          className="flex items-center justify-between px-2 py-1 border-b"
          style={{ borderColor: 'var(--vf-border)' }}
        >
          <div className="flex items-center space-x-2 text-xs">
            {detection.kind !== 'empty' ? (
              <span className="flex items-center space-x-1.5 font-semibold" style={{ color: 'var(--vf-text)' }}>
                {renderBadgeIcon()}
                <span>{detection.label}</span>
                {detection.detail && (
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                    {detection.detail}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                {lang === 'id' ? 'Tempel URL atau ketik informasi yang ingin diperiksa' : 'Paste URL or type information to verify'}
              </span>
            )}
          </div>

          {input.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs px-2 py-0.5 rounded hover:opacity-75 flex items-center space-x-1 transition-opacity"
              style={{ color: 'var(--vf-text-muted)' }}
              title={t(lang, 'verifier.clearButton')}
            >
              <XIcon className="w-3.5 h-3.5" />
              <span>{t(lang, 'verifier.clearButton')}</span>
            </button>
          )}
        </div>

        {/* 2. Main Search Textarea */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={3}
            placeholder={
              lang === 'id'
                ? 'Tempel URL berita atau ketik teks/klaim untuk diverifikasi...'
                : 'Paste news URL or enter claim to verify...'
            }
            className="w-full bg-transparent px-3 py-2 text-sm sm:text-base resize-none focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            style={{
              color: 'var(--vf-text)',
              lineHeight: 1.5,
            }}
          />
        </div>

        {/* ============================================================ */}
        {/* 3. DIRECT EMBEDDED AI AGENT STATUS (SEAMLESS & SECURE)        */}
        {/* ============================================================ */}
        <div
          className="rounded-xl p-2.5 border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
          style={{
            backgroundColor: 'var(--vf-surface-muted)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-cyan-500/20">
              <SparklesIcon className="w-4 h-4" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-cyan-400 select-none">
                <input
                  type="checkbox"
                  checked={aiAgentEnabled}
                  onChange={(e) => {
                    setAiAgentEnabled(e.target.checked);
                    localStorage.setItem('vf_ai_agent_enabled', String(e.target.checked));
                  }}
                  className="rounded text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5"
                />
                <span>AI Agent Terintegrasi</span>
              </label>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Aktif Otomatis
              </span>

              <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                Model:
              </span>
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setGeminiModel(e.target.value);
                }}
                className="px-2 py-0.5 rounded-lg border text-[11px] font-mono focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--vf-bg)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name.split(' (')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[11px] flex items-center space-x-1.5" style={{ color: 'var(--vf-text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Forensik Machine Learning URL & Berita</span>
          </div>
        </div>

        {/* 4. Action Button & Shortcut */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 px-1">
          <div className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
            Tekan <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono bg-slate-500/10 border-slate-500/30">Enter ↵</kbd> untuk mulai analisis
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-98"
              style={{ backgroundColor: 'var(--vf-primary)' }}
            >
              {loading ? (
                <>
                  <RefreshIcon className="w-4 h-4 vf-spin" />
                  <span>
                    {aiAgentEnabled
                      ? (lang === 'id' ? 'Menganalisis Faktual + AI Agent...' : 'Analyzing Facts + AI Agent...')
                      : (lang === 'id' ? 'Menganalisis Bukti...' : 'Analyzing Evidence...')}
                  </span>
                </>
              ) : (
                <>
                  {aiAgentEnabled ? (
                    <SparklesIcon className="w-4 h-4 text-cyan-300" />
                  ) : (
                    <SearchIcon className="w-4 h-4" />
                  )}
                  <span>
                    {aiAgentEnabled
                      ? (lang === 'id' ? 'Analisis Sekarang (+ AI Agent)' : 'Analyze Now (+ AI Agent)')
                      : (lang === 'id' ? 'Analisis Sekarang' : 'Analyze Now')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* 5. Quick Examples (§33) */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold" style={{ color: 'var(--vf-text-muted)' }}>
          {lang === 'id' ? 'Contoh Cepat:' : 'Quick Examples:'}
        </span>
        {quickExamples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInput(ex.value)}
            className="text-xs px-3 py-1.5 rounded-xl border transition-all hover:border-indigo-400 active:scale-95"
            style={{
              backgroundColor: 'var(--vf-surface)',
              borderColor: 'var(--vf-border)',
              color: 'var(--vf-text-secondary)',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VerifierInput;

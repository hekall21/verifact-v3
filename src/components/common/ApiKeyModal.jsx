/**
 * src/components/common/ApiKeyModal.jsx
 *
 * Modal pengaturan Google AI Studio API Key & AI Agent.
 * Memungkinkan pengguna memasukkan kunci API Gemini gratis mereka
 * untuk mengaktifkan analisis machine learning mendalam pada URL & klaim.
 */

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  KeyIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  XIcon,
  RefreshIcon,
} from './Icons.jsx';
import {
  getGeminiApiKey,
  setGeminiApiKey,
  getGeminiModel,
  setGeminiModel,
  testGeminiConnection,
  GEMINI_MODELS,
} from '../../services/geminiAgentService.js';

export function ApiKeyModal({ isOpen, onClose, onApiKeyChanged, lang = 'id' }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getGeminiApiKey());
      setSelectedModel(getGeminiModel());
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult({ ok: false, message: 'Harap masukkan API Key terlebih dahulu.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testGeminiConnection(apiKey.trim());
      setTestResult(res);
    } catch (err) {
      setTestResult({ ok: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    setGeminiApiKey(apiKey.trim());
    setGeminiModel(selectedModel);
    setSaveSuccess(true);
    if (onApiKeyChanged) onApiKeyChanged(apiKey.trim());
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    setGeminiApiKey('');
    setApiKey('');
    setTestResult(null);
    if (onApiKeyChanged) onApiKeyChanged('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl p-6 sm:p-7 space-y-5 transition-all overflow-hidden"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold" style={{ color: 'var(--vf-text)' }}>
                {lang === 'id' ? 'Google AI Studio Agent' : 'Google AI Studio Agent'}
              </h3>
              <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {lang === 'id'
                  ? 'Machine Learning & Forensik Konten Berbasis Gemini'
                  : 'Deep ML & Content Forensics powered by Gemini'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div
          className="p-4 rounded-xl border text-xs leading-relaxed space-y-2"
          style={{
            backgroundColor: 'var(--vf-surface-muted)',
            borderColor: 'var(--vf-border)',
            color: 'var(--vf-text-secondary)',
          }}
        >
          <p>
            {lang === 'id'
              ? 'Gunakan Google AI Studio API Key gratis Anda untuk membuka fitur Analisis AI Agent: dekonstruksi retorika berita, deteksi bias clickbait, audit plausibilitas klaim, dan forensik phishing secara mandiri.'
              : 'Use your free Google AI Studio API key to enable AI Agent Analysis: news rhetoric deconstruction, clickbait bias detection, claim plausibility audits, and phishing forensics.'}
          </p>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-cyan-400 hover:underline"
          >
            <span>
              {lang === 'id'
                ? 'Dapatkan API Key Gratis di Google AI Studio'
                : 'Get Free API Key from Google AI Studio'}
            </span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Input API Key */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            Google AI Studio API Key (Gemini):
          </label>
          <div className="relative flex items-center">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              style={{
                backgroundColor: 'var(--vf-bg)',
                borderColor: 'var(--vf-border)',
                color: 'var(--vf-text)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 text-xs font-semibold px-1.5 py-0.5 rounded text-slate-400 hover:text-white"
            >
              {showKey ? 'Sembunyikan' : 'Lihat'}
            </button>
          </div>
        </div>

        {/* Model Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id' ? 'Pilih Model Gemini:' : 'Select Gemini Model:'}
          </label>
          <div className="space-y-1.5">
            {GEMINI_MODELS.map((m) => (
              <label
                key={m.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedModel === m.id
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/5 hover:border-white/20'
                }`}
                style={{
                  backgroundColor: selectedModel === m.id ? undefined : 'var(--vf-surface-muted)',
                }}
              >
                <div className="flex items-center space-x-2.5">
                  <input
                    type="radio"
                    name="geminiModel"
                    checked={selectedModel === m.id}
                    onChange={() => setSelectedModel(m.id)}
                    className="text-cyan-500 focus:ring-cyan-500"
                  />
                  <div>
                    <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>
                      {m.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                      Kecepatan: {m.speed} • {m.cost}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Test Result Indicator */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
              testResult.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {testResult.ok ? (
              <CheckCircleIcon className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangleIcon className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="leading-snug">{testResult.message}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircleIcon className="w-4 h-4 shrink-0" />
            <span>Konfigurasi AI Studio Agent berhasil disimpan!</span>
          </div>
        )}

        {/* Privacy Note */}
        <p className="text-[11px] leading-tight" style={{ color: 'var(--vf-text-muted)' }}>
          🔒 <strong>Privasi Terjamin:</strong> API Key disimpan secara eksklusif di LocalStorage browser perangkat Anda. Tidak ada API key yang dikirim ke server kami.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--vf-border)' }}>
          <div>
            {apiKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
              >
                Hapus Kunci
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !apiKey}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all hover:opacity-80 disabled:opacity-40"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
                color: 'var(--vf-text)',
              }}
            >
              {testing ? 'Menguji...' : 'Tes Koneksi'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--vf-primary)' }}
            >
              Simpan & Aktifkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

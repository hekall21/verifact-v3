/**
 * VerifierInput.jsx
 *
 * Kolom masukan utama dengan deteksi instan format (URL / teks klaim / pesan berantai),
 * penanganan invalid URL secara eksplisit, dan tombol contoh pengujian cepat.
 */

import React, { useState, useEffect } from 'react';
import { SearchIcon, LinkIcon, FileTextIcon, AlertTriangleIcon, RefreshIcon, XIcon } from '../common/Icons.jsx';
import { classifyInput } from '../../utils/urlDetector.js';
import { t } from '../../i18n/index.js';

export function VerifierInput({
  input,
  setInput,
  onVerify,
  loading,
  lang,
  onClear,
}) {
  const [detection, setDetection] = useState({ kind: 'empty' });

  useEffect(() => {
    const res = classifyInput(input);
    setDetection(res);
  }, [input]);

  const examples = [
    { label: lang === 'id' ? 'Tautan Berita' : 'News Link', value: 'https://kompas.com/read/2026/03/12/bansos-pkh-tahap-satu-cair' },
    { label: lang === 'id' ? 'Undangan APK' : 'APK Invite', value: 'Surat Undangan Pernikahan Digital.apk mohon diinstall dan dibuka' },
    { label: lang === 'id' ? 'Prediksi Gempa' : 'Earthquake Warning', value: 'BMKG memperingatkan gempa megathrust 9.0 SR akan melanda malam ini' },
    { label: lang === 'id' ? 'Akun Game & Rekber' : 'Game Account Escrow', value: 'Jual akun Mobile Legends spek sultan monsep all unbind rekber pulber murah' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onVerify(input);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative rounded-2xl p-2 transition-all shadow-lg"
        style={{
          backgroundColor: 'var(--vf-surface)',
          border: '1px solid var(--vf-border)',
        }}
      >
        {/* Dynamic Format Detection Badge */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b mb-2"
          style={{ borderColor: 'var(--vf-border)' }}
        >
          <div className="flex items-center space-x-2 text-xs">
            {detection.kind === 'url' && (
              <span className="flex items-center space-x-1.5 font-semibold text-emerald-500">
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{t(lang, 'verifier.detectedType.url')}</span>
                {detection.platform && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {detection.platform.label}
                  </span>
                )}
                {detection.isShortener && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    URL Shortener
                  </span>
                )}
              </span>
            )}
            {detection.kind === 'invalid-url' && (
              <span className="flex items-center space-x-1.5 font-semibold text-rose-500">
                <AlertTriangleIcon className="w-3.5 h-3.5" />
                <span>{t(lang, 'verifier.invalidUrlError.title')}</span>
              </span>
            )}
            {detection.kind === 'text' && (
              <span className="flex items-center space-x-1.5 font-semibold text-blue-500">
                <FileTextIcon className="w-3.5 h-3.5" />
                <span>{t(lang, 'verifier.detectedType.text')}</span>
              </span>
            )}
            {detection.kind === 'empty' && (
              <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                {t(lang, 'verifier.detectedType.empty')}
              </span>
            )}
          </div>

          {input.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs px-2 py-0.5 rounded hover:opacity-75 flex items-center space-x-1"
              style={{ color: 'var(--vf-text-muted)' }}
              title={t(lang, 'verifier.clearButton')}
            >
              <XIcon className="w-3.5 h-3.5" />
              <span>{t(lang, 'verifier.clearButton')}</span>
            </button>
          )}
        </div>

        {/* Text Area */}
        <textarea
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(lang, 'verifier.inputPlaceholder')}
          className="w-full px-3 py-2 bg-transparent text-sm md:text-base resize-none focus:outline-none placeholder:opacity-50"
          style={{ color: 'var(--vf-text)' }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleSubmit(e);
            }
          }}
        />

        {/* Invalid URL Warning Banner */}
        {detection.kind === 'invalid-url' && (
          <div className="mx-2 mb-2 p-2.5 rounded-lg text-xs flex items-start space-x-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangleIcon className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">{t(lang, 'verifier.invalidUrlError.title')}</p>
              <p className="opacity-90">{t(lang, 'verifier.invalidUrlError.desc')}</p>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between px-2 pt-1 border-t"
          style={{ borderColor: 'var(--vf-border)' }}
        >
          <span className="text-[11px] hidden sm:block" style={{ color: 'var(--vf-text-muted)' }}>
            Tekan <kbd className="px-1.5 py-0.5 rounded border text-[10px]" style={{ borderColor: 'var(--vf-border)' }}>Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded border text-[10px]" style={{ borderColor: 'var(--vf-border)' }}>Enter</kbd> untuk verifikasi instan
          </span>

          <button
            type="submit"
            disabled={!input.trim() || loading || detection.kind === 'invalid-url'}
            className="ml-auto px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white transition-all shadow-md flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-95"
            style={{
              backgroundColor: 'var(--vf-primary)',
            }}
          >
            {loading ? (
              <>
                <RefreshIcon className="w-4 h-4 vf-spin" />
                <span>{t(lang, 'verifier.checkingButton')}</span>
              </>
            ) : (
              <>
                <SearchIcon className="w-4 h-4" />
                <span>{t(lang, 'verifier.checkButton')}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Example Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold" style={{ color: 'var(--vf-text-secondary)' }}>
          {t(lang, 'verifier.exampleTitle')}
        </span>
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInput(ex.value)}
            className="text-xs px-2.5 py-1 rounded-lg transition-colors hover:opacity-85 font-medium"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              color: 'var(--vf-text-secondary)',
              border: '1px solid var(--vf-border)',
            }}
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}

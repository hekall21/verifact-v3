/**
 * ScamShield.jsx
 *
 * Modul pemeriksa mandiri sinyal penipuan finansial, kontak nomor telepon,
 * dan indikator URL berbahaya dengan prinsip "absence of evidence ≠ evidence of safety".
 */

import React, { useState } from 'react';
import { CreditCardIcon, PhoneIcon, LinkIcon, AlertTriangleIcon, ExternalLinkIcon, ShieldIcon } from '../common/Icons.jsx';
import { analyzeAccountNumber, analyzePhoneNumber, analyzeUrl } from '../../data/scamPatterns.js';
import { t } from '../../i18n/index.js';

export function ScamShield({ lang = 'id' }) {
  const [activeTab, setActiveTab] = useState('account');
  const [accountInput, setAccountInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [urlInput, setUrlInput] = useState('');

  const [accountResult, setAccountResult] = useState(null);
  const [phoneResult, setPhoneResult] = useState(null);
  const [urlResult, setUrlResult] = useState(null);

  const handleCheckAccount = (e) => {
    e.preventDefault();
    if (!accountInput.trim()) return;
    setAccountResult(analyzeAccountNumber(accountInput));
  };

  const handleCheckPhone = (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    setPhoneResult(analyzePhoneNumber(phoneInput));
  };

  const handleCheckUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUrlResult(analyzeUrl(urlInput));
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 vf-fade-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <ShieldIcon className="w-3.5 h-3.5" />
          <span>{t(lang, 'scamShield.title')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {t(lang, 'scamShield.title')}
        </h2>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto" style={{ color: 'var(--vf-text-muted)' }}>
          {t(lang, 'scamShield.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl p-1 border shadow-sm max-w-lg mx-auto"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        <button
          onClick={() => setActiveTab('account')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'account' ? 'shadow-sm text-white' : 'hover:opacity-75'
          }`}
          style={{
            backgroundColor: activeTab === 'account' ? 'var(--vf-primary)' : 'transparent',
            color: activeTab === 'account' ? '#ffffff' : 'var(--vf-text-secondary)',
          }}
        >
          <CreditCardIcon className="w-3.5 h-3.5" />
          <span>{t(lang, 'scamShield.tabs.account')}</span>
        </button>

        <button
          onClick={() => setActiveTab('phone')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'phone' ? 'shadow-sm text-white' : 'hover:opacity-75'
          }`}
          style={{
            backgroundColor: activeTab === 'phone' ? 'var(--vf-primary)' : 'transparent',
            color: activeTab === 'phone' ? '#ffffff' : 'var(--vf-text-secondary)',
          }}
        >
          <PhoneIcon className="w-3.5 h-3.5" />
          <span>{t(lang, 'scamShield.tabs.phone')}</span>
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeTab === 'url' ? 'shadow-sm text-white' : 'hover:opacity-75'
          }`}
          style={{
            backgroundColor: activeTab === 'url' ? 'var(--vf-primary)' : 'transparent',
            color: activeTab === 'url' ? '#ffffff' : 'var(--vf-text-secondary)',
          }}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{t(lang, 'scamShield.tabs.url')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl p-6 border shadow-lg"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        {/* Tab 1: Bank Account */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'scamShield.account.title')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {t(lang, 'scamShield.account.desc')}
              </p>
            </div>

            <form onSubmit={handleCheckAccount} className="flex gap-2">
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder={t(lang, 'scamShield.account.placeholder')}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {t(lang, 'scamShield.account.checkBtn')}
              </button>
            </form>

            {accountResult && (
              <div className="mt-4 p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                {accountResult.valid ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
                        Hasil Observasi Struktur:
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Format Valid ({accountResult.length} Digit)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="opacity-75 block">{t(lang, 'scamShield.account.bankHint')}</span>
                        <span className="font-bold text-sm" style={{ color: 'var(--vf-text)' }}>
                          {accountResult.bankHint || 'Bank Komersial / Umum'}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75 block">Status Registrasi:</span>
                        <span className="font-bold text-sm text-blue-500">Siap Diverifikasi Mandiri</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
                      <a
                        href={accountResult.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm"
                        style={{ backgroundColor: 'var(--vf-primary)' }}
                      >
                        <span>{t(lang, 'scamShield.account.officialBtn')}</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-500">
                    Format nomor rekening tidak valid. Pastikan nomor hanya berisi 6 s.d. 20 digit angka.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Phone */}
        {activeTab === 'phone' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'scamShield.phone.title')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {t(lang, 'scamShield.phone.desc')}
              </p>
            </div>

            <form onSubmit={handleCheckPhone} className="flex gap-2">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={t(lang, 'scamShield.phone.placeholder')}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {t(lang, 'scamShield.phone.checkBtn')}
              </button>
            </form>

            {phoneResult && (
              <div className="mt-4 p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                {phoneResult.valid ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
                        Hasil Observasi Nomor Kontak:
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Format Valid ({phoneResult.length} Digit)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="opacity-75 block">{t(lang, 'scamShield.phone.carrierHint')}</span>
                        <span className="font-bold text-sm" style={{ color: 'var(--vf-text)' }}>
                          {phoneResult.carrierHint || 'Operator Seluler Indonesia'}
                        </span>
                      </div>
                      <div>
                        <span className="opacity-75 block">Format Standar:</span>
                        <span className="font-mono font-bold text-sm" style={{ color: 'var(--vf-text)' }}>
                          {phoneResult.cleaned}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
                      <a
                        href={phoneResult.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm"
                        style={{ backgroundColor: 'var(--vf-primary)' }}
                      >
                        <span>{t(lang, 'scamShield.phone.officialBtn')}</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-500">
                    Format nomor telepon tidak valid. Pastikan nomor diawali 08xx atau 628xx dengan 9 s.d. 14 digit angka.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'scamShield.url.title')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                {t(lang, 'scamShield.url.desc')}
              </p>
            </div>

            <form onSubmit={handleCheckUrl} className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t(lang, 'scamShield.url.placeholder')}
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {t(lang, 'scamShield.url.checkBtn')}
              </button>
            </form>

            {urlResult && (
              <div className="mt-4 p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                {urlResult.valid ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
                        Hasil Observasi Domain:
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        {urlResult.domain}
                      </span>
                    </div>

                    {urlResult.riskIndicators && urlResult.riskIndicators.length > 0 ? (
                      <div className="space-y-1.5">
                        {urlResult.riskIndicators.map((ri, i) => (
                          <div key={i} className="p-2 rounded-lg text-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center space-x-2">
                            <AlertTriangleIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Indikator Risiko: {ri.detail}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        Tidak ditemukan penggunaan pemendek URL atau TLD mencurigakan pada tautan ini.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-500">
                    URL tidak valid. Pastikan alamat web menggunakan format yang benar (misal: https://...).
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Global Transparency Disclaimer */}
        <div className="mt-6 pt-4 border-t text-[11px] leading-relaxed flex items-start space-x-2"
          style={{
            borderColor: 'var(--vf-border)',
            color: 'var(--vf-text-muted)',
          }}
        >
          <AlertTriangleIcon className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
          <p>{t(lang, 'scamShield.disclaimer')}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * ScamShield.jsx
 *
 * VeriFact ID 4.1 — Threat Intelligence Architecture
 * Pemeriksa mandiri sinyal penipuan finansial, kontak nomor telepon,
 * dan indikator URL berbahaya dengan prinsip:
 * - "absence of evidence ≠ evidence of safety" ("Tidak ditemukan laporan" ≠ "AMAN")
 * - "HTTPS ≠ AMAN" (enkripsi transmisi bukan jaminan integritas situs)
 * - Transparansi sumber intelijen dan laporan aktif
 */

import React, { useState } from 'react';
import { CreditCardIcon, PhoneIcon, LinkIcon, AlertTriangleIcon, ExternalLinkIcon, ShieldIcon, CheckIcon } from '../common/Icons.jsx';
import { analyzeAccountNumber, analyzePhoneNumber, analyzeUrl } from '../../services/threatIntel/ThreatIntelProvider.js';
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

  const renderStatusBadge = (status, riskLevel) => {
    switch (status) {
      case 'CONFIRMED_REPORTED':
      case 'CONFIRMED_SCAM':
      case 'MALICIOUS':
      case 'PHISHING':
      case 'MALWARE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'REPORTED':
      case 'REPORTED_SCAM':
      case 'SUSPICIOUS':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'NO_REPORT_FOUND':
      case 'NO_THREAT_FOUND':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
            <CheckIcon className="w-3.5 h-3.5" />
            {status.replace('_', ' ')}
          </span>
        );
      case 'LOOKUP_UNAVAILABLE':
      case 'UNVERIFIED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-500/20 text-slate-400 border border-slate-500/30">
            {status.replace('_', ' ')}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-500/15 text-rose-400 border border-rose-500/30">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 vf-fade-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <ShieldIcon className="w-3.5 h-3.5" />
          <span>VeriFact ID 4.1 Threat Intelligence</span>
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
              <div className="mt-4 p-5 rounded-2xl border space-y-4"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                {accountResult.valid ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                          Hasil Analisis Intelijen Rekening:
                        </span>
                        <span className="font-mono text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                          {accountResult.accountNumber} ({accountResult.bank})
                        </span>
                      </div>
                      <div>
                        {renderStatusBadge(accountResult.status, accountResult.riskLevel)}
                      </div>
                    </div>

                    {/* Warning / Details Banner */}
                    <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                      accountResult.status === 'CONFIRMED_REPORTED' || accountResult.status === 'REPORTED'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                    }`}>
                      <p className="font-semibold mb-1">{accountResult.warningMessage}</p>
                      {accountResult.details && (
                        <p className="text-slate-300 text-xs mt-1">{accountResult.details}</p>
                      )}
                    </div>

                    {/* Honest Safety Warning */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                      <AlertTriangleIcon className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold block text-amber-300">Prinsip Integritas VeriFact:</span>
                        <p className="mt-0.5 text-slate-300 leading-relaxed">{accountResult.disclaimer}</p>
                      </div>
                    </div>

                    {/* Observations & Checked Sources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                          Observasi Struktural:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {accountResult.observations?.map((obs, i) => (
                            <li key={i}>{obs}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                          Basis Data Diperiksa:
                        </span>
                        <div className="space-y-1.5">
                          {accountResult.sourcesChecked?.map((src, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5">
                              <span className="text-slate-300">{src.name}</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-400">{src.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex flex-wrap items-center justify-end gap-2" style={{ borderColor: 'var(--vf-border)' }}>
                      {accountResult.reportUrl && (
                        <a
                          href={accountResult.reportUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 flex items-center space-x-1.5 transition-all"
                        >
                          <span>Lapor Penipuan</span>
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <a
                        href={accountResult.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm"
                        style={{ backgroundColor: 'var(--vf-primary)' }}
                      >
                        <span>{t(lang, 'scamShield.account.officialBtn')}</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-500">
                    {accountResult.warningMessage || 'Format nomor rekening tidak valid.'}
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
              <div className="mt-4 p-5 rounded-2xl border space-y-4"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                {phoneResult.valid ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                          Hasil Analisis Intelijen Kontak:
                        </span>
                        <span className="font-mono text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                          {phoneResult.formatted || phoneResult.phoneNumber} ({phoneResult.carrier})
                        </span>
                      </div>
                      <div>
                        {renderStatusBadge(phoneResult.status, phoneResult.riskLevel)}
                      </div>
                    </div>

                    {/* Threat Details Banner */}
                    <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                      phoneResult.status === 'CONFIRMED_SCAM' || phoneResult.status === 'REPORTED_SCAM'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : phoneResult.status === 'SUSPICIOUS'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                    }`}>
                      <p className="font-semibold mb-1">{phoneResult.warningMessage}</p>
                      {phoneResult.details && (
                        <p className="text-slate-300 text-xs mt-1">{phoneResult.details}</p>
                      )}
                      {phoneResult.tags && phoneResult.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {phoneResult.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Honest Safety Warning */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                      <AlertTriangleIcon className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold block text-amber-300">Prinsip Integritas VeriFact:</span>
                        <p className="mt-0.5 text-slate-300 leading-relaxed">{phoneResult.disclaimer}</p>
                      </div>
                    </div>

                    {/* Observations & Checked Sources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                          Observasi & Tipe Jaringan:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          <li>Tipe Jalur: <strong className="text-slate-200">{phoneResult.lineType}</strong></li>
                          {phoneResult.observations?.map((obs, i) => (
                            <li key={i}>{obs}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                          Basis Data Diperiksa:
                        </span>
                        <div className="space-y-1.5">
                          {phoneResult.sourcesChecked?.map((src, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5">
                              <span className="text-slate-300">{src.name}</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-400">{src.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
                      <a
                        href={phoneResult.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm"
                        style={{ backgroundColor: 'var(--vf-primary)' }}
                      >
                        <span>{t(lang, 'scamShield.phone.officialBtn')}</span>
                        <ExternalLinkIcon className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-500">
                    {phoneResult.warningMessage || 'Format nomor telepon tidak valid.'}
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
              <div className="mt-4 p-5 rounded-2xl border space-y-4"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                }}
              >
                {urlResult.valid ? (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                          Hasil Observasi Domain & URL:
                        </span>
                        <span className="font-mono text-base font-bold break-all" style={{ color: 'var(--vf-text)' }}>
                          {urlResult.domain || urlResult.url}
                        </span>
                      </div>
                      <div>
                        {renderStatusBadge(urlResult.status, urlResult.riskLevel)}
                      </div>
                    </div>

                    {/* Threat Warning Banner */}
                    <div className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                      urlResult.status === 'MALICIOUS' || urlResult.status === 'PHISHING' || urlResult.status === 'MALWARE'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : urlResult.status === 'SUSPICIOUS'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-sky-500/10 border-sky-500/30 text-sky-200'
                    }`}>
                      <p className="font-semibold mb-1">{urlResult.warningMessage}</p>
                      {urlResult.impersonatedBrand && (
                        <p className="text-amber-300 font-bold text-xs mt-1">
                          ⚠️ Terindikasi meniru identitas resmi: {urlResult.impersonatedBrand}
                        </p>
                      )}
                    </div>

                    {/* SSL / HTTPS Transparency Box */}
                    {urlResult.sslInfo && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs space-y-1">
                        <div className="flex items-center gap-2 font-bold text-slate-200">
                          <span>{urlResult.sslInfo.hasHttps ? '🔒' : '🔓'}</span>
                          <span>{urlResult.sslInfo.hasHttps ? 'HTTPS / SSL Aktif' : 'HTTP Tanpa Enkripsi'}</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                          {urlResult.sslInfo.explanation}
                        </p>
                      </div>
                    )}

                    {/* Honest Absence Warning */}
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start gap-2.5">
                      <AlertTriangleIcon className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <span className="font-bold block text-amber-300">Prinsip Integritas VeriFact:</span>
                        <p className="mt-0.5 text-slate-300 leading-relaxed">{urlResult.disclaimer}</p>
                      </div>
                    </div>

                    {/* Indicators & Checked Sources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                          Indikator & Temuan:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-300">
                          {urlResult.indicators?.map((ind, i) => (
                            <li key={i}>{ind}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>
                          Basis Data Diperiksa:
                        </span>
                        <div className="space-y-1.5">
                          {urlResult.sourcesChecked?.map((src, i) => (
                            <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-black/20 border border-white/5">
                              <span className="text-slate-300">{src.name}</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-400">{src.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {urlResult.verifyUrl && (
                      <div className="pt-3 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
                        <a
                          href={urlResult.verifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white flex items-center space-x-1.5 transition-all shadow-sm"
                          style={{ backgroundColor: 'var(--vf-primary)' }}
                        >
                          <span>Verifikasi Google Transparency</span>
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs font-semibold text-rose-500">
                    {urlResult.warningMessage || 'URL tidak valid.'}
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

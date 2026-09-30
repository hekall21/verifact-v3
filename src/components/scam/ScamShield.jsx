/**
 * src/components/scam/ScamShield.jsx
 *
 * VeriFact ID 4.2 — Threat Intelligence & Cyber Defense Engine
 *
 * 4 Engine Terpadu (§15, §18, §22, §23):
 * 1. PHONE SCANNER (Nomor Telepon & Kontak Seluler)
 * 2. ACCOUNT SCANNER (Nomor Rekening Bank & E-Wallet)
 * 3. URL SCANNER (Tautan Web, Phishing, & Distribusi Malware)
 * 4. MESSAGE SCANNER (Pesan Chat, SMS, WhatsApp, & Rekayasa Sosial)
 *
 * Mode Demo / Data Uji (§18):
 * - Memungkinkan pengujian antarmuka tanpa memakai nomor korban/rekening orang sungguhan.
 * - Menggunakan domain aman .invalid (RFC 2606).
 * - Dilengkapi badge tegas: "SIMULASI — BUKAN DATA PELAPORAN NYATA".
 */

import React, { useState } from 'react';
import {
  CreditCardIcon,
  PhoneIcon,
  LinkIcon,
  AlertTriangleIcon,
  ExternalLinkIcon,
  ShieldIcon,
  CheckIcon,
  FileTextIcon,
  RefreshIcon,
} from '../common/Icons.jsx';
import {
  analyzeAccountNumber,
  analyzePhoneNumber,
  analyzeUrl,
  analyzeMessageThreat,
  DEMO_FIXTURES,
} from '../../services/threatIntel/ThreatIntelProvider.js';
import { t } from '../../i18n/index.js';

export function ScamShield({ lang = 'id' }) {
  const [activeTab, setActiveTab] = useState('phone'); // 'phone' | 'account' | 'url' | 'message'
  const [phoneInput, setPhoneInput] = useState('');
  const [accountInput, setAccountInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const [phoneResult, setPhoneResult] = useState(null);
  const [accountResult, setAccountResult] = useState(null);
  const [urlResult, setUrlResult] = useState(null);
  const [messageResult, setMessageResult] = useState(null);

  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleCheckPhone = (e) => {
    e?.preventDefault();
    if (!phoneInput.trim()) return;
    setPhoneResult(analyzePhoneNumber(phoneInput));
  };

  const handleCheckAccount = (e) => {
    e?.preventDefault();
    if (!accountInput.trim()) return;
    setAccountResult(analyzeAccountNumber(accountInput));
  };

  const handleCheckUrl = (e) => {
    e?.preventDefault();
    if (!urlInput.trim()) return;
    setUrlResult(analyzeUrl(urlInput));
  };

  const handleCheckMessage = (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;
    setMessageResult(analyzeMessageThreat(messageInput));
  };

  const handleLoadDemo = (category, value) => {
    setActiveTab(category);
    if (category === 'phone') {
      setPhoneInput(value);
      setPhoneResult(analyzePhoneNumber(value));
    } else if (category === 'account') {
      setAccountInput(value);
      setAccountResult(analyzeAccountNumber(value));
    } else if (category === 'url') {
      setUrlInput(value);
      setUrlResult(analyzeUrl(value));
    } else if (category === 'message') {
      setMessageInput(value);
      setMessageResult(analyzeMessageThreat(value));
    }
    setShowDemoModal(false);
  };

  const renderStatusBadge = (statusCode, label) => {
    switch (statusCode) {
      case 'CRITICAL':
      case 'HIGH':
      case 'PHISHING':
      case 'MALWARE':
      case 'SIMULATED_THREAT':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {label || statusCode}
          </span>
        );
      case 'MEDIUM':
      case 'MEDIUM_HIGH':
      case 'SUSPICIOUS':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            {label || statusCode}
          </span>
        );
      case 'NO_REPORT_FOUND':
      case 'NO_THREAT_FOUND':
      case 'LOW':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-sky-500/15 text-sky-500 dark:text-sky-400 border border-sky-500/30 flex items-center gap-1.5 shadow-sm">
            <CheckIcon className="w-3.5 h-3.5" />
            {label || statusCode}
          </span>
        );
      case 'NEWS_WEBSITE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 flex items-center gap-1.5 shadow-sm">
            <ShieldIcon className="w-3.5 h-3.5" />
            {label || 'SITUS BERITA'}
          </span>
        );
      case 'LOOKUP_UNAVAILABLE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {label || 'DATA TIDAK TERSEDIA'}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-slate-500/15 text-slate-400 border border-slate-500/30">
            {label || statusCode}
          </span>
        );
    }
  };

  const renderSourcesChecked = (sources = []) => (
    <div className="pt-3 border-t space-y-1.5" style={{ borderColor: 'var(--vf-border)' }}>
      <span className="text-[11px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
        Status Sumber Pemeriksaan ({sources.length}):
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {sources.map((s, idx) => (
          <div
            key={idx}
            className="p-2 rounded-xl border flex items-center justify-between gap-2"
            style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
          >
            <span className="truncate" style={{ color: 'var(--vf-text)' }}>{s.name}</span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                s.status === 'LIVE_CHECKED'
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : s.status === 'MANUAL_REFERENCE'
                  ? 'bg-sky-500/15 text-sky-500 border border-sky-500/30'
                  : s.status === 'UNAVAILABLE'
                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
              }`}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 vf-fade-up">
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <ShieldIcon className="w-3.5 h-3.5" />
          <span>VeriFact ID 4.2 Threat Intelligence</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {lang === 'id' ? 'Scam & Threat Intelligence Shield' : 'Scam & Threat Intelligence Shield'}
        </h2>
        <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
          {lang === 'id'
            ? 'Deteksi dini indikasi penipuan siber: nomor telepon mencurigakan, rekening perantara, tautan phishing, dan teks rekayasa sosial.'
            : 'Early cyber threat detection: suspicious phone numbers, bank accounts, phishing links, and social engineering messages.'}
        </p>

        {/* Demo Mode Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowDemoModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm hover:scale-102"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-primary) 12%, transparent)',
              borderColor: 'color-mix(in srgb, var(--vf-primary) 30%, transparent)',
              color: 'var(--vf-primary)',
            }}
          >
            <span>🧪 {lang === 'id' ? 'Buka Mode Demo / Data Uji Coba' : 'Open Demo / Test Mode'}</span>
          </button>
        </div>
      </div>

      {/* Engine Switcher Tabs (§15) */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('phone')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'phone' ? 'shadow-md scale-102 text-white' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'phone' ? 'var(--vf-primary)' : 'var(--vf-surface)',
            color: activeTab === 'phone' ? '#FFFFFF' : 'var(--vf-text-secondary)',
            border: activeTab === 'phone' ? '1px solid var(--vf-primary)' : '1px solid var(--vf-border)',
          }}
        >
          <PhoneIcon className="w-4 h-4" />
          <span>{lang === 'id' ? 'Nomor Telepon' : 'Phone Scanner'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('account')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'account' ? 'shadow-md scale-102 text-white' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'account' ? 'var(--vf-primary)' : 'var(--vf-surface)',
            color: activeTab === 'account' ? '#FFFFFF' : 'var(--vf-text-secondary)',
            border: activeTab === 'account' ? '1px solid var(--vf-primary)' : '1px solid var(--vf-border)',
          }}
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>{lang === 'id' ? 'Nomor Rekening' : 'Bank Account'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'url' ? 'shadow-md scale-102 text-white' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'url' ? 'var(--vf-primary)' : 'var(--vf-surface)',
            color: activeTab === 'url' ? '#FFFFFF' : 'var(--vf-text-secondary)',
            border: activeTab === 'url' ? '1px solid var(--vf-primary)' : '1px solid var(--vf-border)',
          }}
        >
          <LinkIcon className="w-4 h-4" />
          <span>{lang === 'id' ? 'URL & Phishing' : 'URL & Phishing'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('message')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'message' ? 'shadow-md scale-102 text-white' : 'hover:opacity-80'
          }`}
          style={{
            backgroundColor: activeTab === 'message' ? 'var(--vf-primary)' : 'var(--vf-surface)',
            color: activeTab === 'message' ? '#FFFFFF' : 'var(--vf-text-secondary)',
            border: activeTab === 'message' ? '1px solid var(--vf-primary)' : '1px solid var(--vf-border)',
          }}
        >
          <FileTextIcon className="w-4 h-4" />
          <span>{lang === 'id' ? 'Pesan / Rekayasa Sosial' : 'Message Scanner'}</span>
        </button>
      </div>

      {/* ENGINE 1: PHONE SCANNER */}
      {activeTab === 'phone' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCheckPhone}
            className="rounded-2xl p-6 border shadow-sm space-y-4"
            style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
          >
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                  {lang === 'id' ? 'Pemeriksa Intelijen Nomor Telepon' : 'Phone Threat Analyzer'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  Periksa format seluler, operator, anomali panjang digit, dan catatan aduan publik.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="Contoh: 0812-3456-7890 atau +628123456789"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {lang === 'id' ? 'Periksa Nomor' : 'Check Phone'}
              </button>
            </div>
          </form>

          {phoneResult && (
            <div
              className="rounded-2xl p-6 border shadow-md space-y-4"
              style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
            >
              {phoneResult.isSimulation && (
                <div className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-2">
                  <span>🧪 {phoneResult.simulationBadge || 'SIMULASI / DATA UJI'}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                    Hasil Analisis Nomor:
                  </span>
                  <h4 className="text-xl font-bold font-mono tracking-tight" style={{ color: 'var(--vf-text)' }}>
                    {phoneResult.formatted || phoneResult.phoneNumber}
                  </h4>
                  <span className="text-xs font-medium" style={{ color: 'var(--vf-text-secondary)' }}>
                    {phoneResult.carrier} • {phoneResult.lineType}
                  </span>
                </div>

                <div>
                  {renderStatusBadge(phoneResult.statusCode || phoneResult.status, phoneResult.status)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border text-xs leading-relaxed" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <span className="font-semibold block mb-1" style={{ color: 'var(--vf-text)' }}>Peringatan Sistem:</span>
                <p style={{ color: 'var(--vf-text-secondary)' }}>{phoneResult.warningMessage}</p>
                <p className="mt-2 text-[11px] italic" style={{ color: 'var(--vf-text-muted)' }}>{phoneResult.disclaimer}</p>
              </div>

              {phoneResult.observations && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>Temuan & Observasi:</span>
                  <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--vf-text-secondary)' }}>
                    {phoneResult.observations.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}

              {renderSourcesChecked(phoneResult.sourcesChecked)}
            </div>
          )}
        </div>
      )}

      {/* ENGINE 2: ACCOUNT SCANNER */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCheckAccount}
            className="rounded-2xl p-6 border shadow-sm space-y-4"
            style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
          >
            <div className="flex items-center space-x-3">
              <CreditCardIcon className="w-5 h-5 text-emerald-500" />
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                  {lang === 'id' ? 'Pemeriksa Intelijen Rekening Bank & E-Wallet' : 'Bank Account Analyzer'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  Verifikasi struktur nomor rekening bank nasional Indonesia (BCA, BRI, Mandiri, BNI, Jago, dll.).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={accountInput}
                onChange={(e) => setAccountInput(e.target.value)}
                placeholder="Contoh: 1234567890 (BCA) atau 001234567890123 (BRI)"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {lang === 'id' ? 'Periksa Rekening' : 'Check Account'}
              </button>
            </div>
          </form>

          {accountResult && (
            <div
              className="rounded-2xl p-6 border shadow-md space-y-4"
              style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
            >
              {accountResult.isSimulation && (
                <div className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-2">
                  <span>🧪 {accountResult.simulationBadge || 'SIMULASI / DATA UJI'}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                    Hasil Analisis Rekening:
                  </span>
                  <h4 className="text-xl font-bold font-mono tracking-tight" style={{ color: 'var(--vf-text)' }}>
                    {accountResult.formatted || accountResult.accountNumber}
                  </h4>
                  <span className="text-xs font-medium" style={{ color: 'var(--vf-text-secondary)' }}>
                    Institusi: {accountResult.bank || 'Bank Nasional'}
                  </span>
                </div>

                <div>
                  {renderStatusBadge(accountResult.statusCode || accountResult.status, accountResult.status)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border text-xs leading-relaxed" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <span className="font-semibold block mb-1" style={{ color: 'var(--vf-text)' }}>Peringatan Sistem:</span>
                <p style={{ color: 'var(--vf-text-secondary)' }}>{accountResult.warningMessage}</p>
                <p className="mt-2 text-[11px] italic" style={{ color: 'var(--vf-text-muted)' }}>{accountResult.disclaimer}</p>
              </div>

              {renderSourcesChecked(accountResult.sourcesChecked)}
            </div>
          )}
        </div>
      )}

      {/* ENGINE 3: URL SCANNER */}
      {activeTab === 'url' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCheckUrl}
            className="rounded-2xl p-6 border shadow-sm space-y-4"
            style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
          >
            <div className="flex items-center space-x-3">
              <LinkIcon className="w-5 h-5 text-sky-500" />
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                  {lang === 'id' ? 'Pemeriksa Intelijen URL, Phishing & Malware' : 'URL & Phishing Analyzer'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  Analisis reputasi domain, sertifikat SSL (HTTPS ≠ AMAN), peniruan brand, dan unduhan file APK berbahaya.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Contoh: https://news.detik.com/... atau https://login-bank-example.invalid"
                className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {lang === 'id' ? 'Periksa URL' : 'Check URL'}
              </button>
            </div>
          </form>

          {urlResult && (
            <div
              className="rounded-2xl p-6 border shadow-md space-y-4"
              style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
            >
              {urlResult.isSimulation && (
                <div className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-2">
                  <span>🧪 {urlResult.simulationBadge || 'SIMULASI / DOMAIN .INVALID'}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                    Hasil Analisis URL:
                  </span>
                  <h4 className="text-lg font-bold font-mono tracking-tight truncate max-w-md" style={{ color: 'var(--vf-text)' }}>
                    {urlResult.domain || urlResult.url}
                  </h4>
                  {urlResult.domainType && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">
                      {urlResult.domainType}
                    </span>
                  )}
                </div>

                <div>
                  {renderStatusBadge(urlResult.statusCode || urlResult.status, urlResult.status)}
                </div>
              </div>

              {urlResult.sslInfo && (
                <div className="p-3 rounded-xl border text-xs" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                  <span className="font-bold block mb-1" style={{ color: 'var(--vf-text)' }}>
                    Status Enkripsi SSL/TLS: {urlResult.sslInfo.hasHttps ? '🔒 HTTPS Aktif' : '🔓 HTTP Tidak Terenkripsi'}
                  </span>
                  <p style={{ color: 'var(--vf-text-secondary)' }}>{urlResult.sslInfo.explanation}</p>
                </div>
              )}

              <div className="p-3.5 rounded-xl border text-xs leading-relaxed" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <span className="font-semibold block mb-1" style={{ color: 'var(--vf-text)' }}>Peringatan Sistem:</span>
                <p style={{ color: 'var(--vf-text-secondary)' }}>{urlResult.warningMessage}</p>
                <p className="mt-2 text-[11px] italic" style={{ color: 'var(--vf-text-muted)' }}>{urlResult.disclaimer}</p>
              </div>

              {urlResult.indicators && urlResult.indicators.length > 0 && (
                <div className="space-y-1 text-xs">
                  <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>Indikator Keamanan:</span>
                  <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--vf-text-secondary)' }}>
                    {urlResult.indicators.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              )}

              {renderSourcesChecked(urlResult.sourcesChecked)}
            </div>
          )}
        </div>
      )}

      {/* ENGINE 4: MESSAGE SCANNER (§22) */}
      {activeTab === 'message' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCheckMessage}
            className="rounded-2xl p-6 border shadow-sm space-y-4"
            style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
          >
            <div className="flex items-center space-x-3">
              <FileTextIcon className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                  {lang === 'id' ? 'Pemeriksa Intelijen Pesan & Rekayasa Sosial' : 'Message Threat Analyzer'}
                </h3>
                <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  Pindai teks pesan chat/SMS untuk mendeteksi manipulasi rasa panik (urgency), ancaman pemblokiran, permintaan OTP, atau APK.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                rows={4}
                placeholder="Tempel teks pesan WhatsApp, SMS penipuan, atau broadcast yang mencurigakan di sini..."
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none resize-none leading-relaxed"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {lang === 'id' ? 'Pindai Teks Pesan' : 'Scan Message Text'}
              </button>
            </div>
          </form>

          {messageResult && (
            <div
              className="rounded-2xl p-6 border shadow-md space-y-5"
              style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4" style={{ borderColor: 'var(--vf-border)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                    Hasil Analisis Rekayasa Sosial:
                  </span>
                  <h4 className="text-lg font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
                    Skor Ancaman: {messageResult.riskScore} / 100
                  </h4>
                </div>

                <div>
                  {renderStatusBadge(messageResult.statusCode, messageResult.status)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border text-xs leading-relaxed" style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}>
                <span className="font-semibold block mb-1" style={{ color: 'var(--vf-text)' }}>Peringatan Sistem:</span>
                <p style={{ color: 'var(--vf-text-secondary)' }}>{messageResult.warningMessage}</p>
                <p className="mt-2 text-[11px] italic" style={{ color: 'var(--vf-text-muted)' }}>{messageResult.disclaimer}</p>
              </div>

              {/* Detected Indicators List (§22) */}
              {messageResult.indicators && messageResult.indicators.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                    Indikator Manipulasi Terdeteksi ({messageResult.indicators.length}):
                  </span>
                  <div className="space-y-2">
                    {messageResult.indicators.map((ind, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border flex items-start gap-2.5 text-xs"
                        style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                      >
                        <span className="text-rose-500 font-bold shrink-0">⚠️</span>
                        <div>
                          <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>{ind.title}</span>
                          <span className="text-[11px] leading-relaxed block mt-0.5" style={{ color: 'var(--vf-text-secondary)' }}>
                            {ind.detail}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {renderSourcesChecked(messageResult.sourcesChecked)}
            </div>
          )}
        </div>
      )}

      {/* DEMO / TEST MODE MODAL (§18) */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-2xl p-6 border shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
              <div>
                <h3 className="text-lg font-bold" style={{ color: 'var(--vf-text)' }}>
                  🧪 Mode Demo / Data Uji Coba Keamanan
                </h3>
                <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  Pilih data uji coba aman di bawah ini untuk melihat bagaimana antarmuka merespons ancaman nyata.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-2.5 py-1 rounded-lg border text-xs"
                style={{ borderColor: 'var(--vf-border)', color: 'var(--vf-text)' }}
              >
                Tutup ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Phone Demos */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-2 text-amber-500">
                  📱 Simulasi Nomor Telepon
                </span>
                <div className="space-y-2">
                  {DEMO_FIXTURES.phone.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition-all"
                      style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                      onClick={() => handleLoadDemo('phone', f.value)}
                    >
                      <div>
                        <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>{f.label}</span>
                        <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>{f.description}</span>
                      </div>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold shrink-0">
                        Pilih ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Demos */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-2 text-emerald-500">
                  💳 Simulasi Rekening Bank
                </span>
                <div className="space-y-2">
                  {DEMO_FIXTURES.account.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-400 transition-all"
                      style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                      onClick={() => handleLoadDemo('account', f.value)}
                    >
                      <div>
                        <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>{f.label}</span>
                        <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>{f.description}</span>
                      </div>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold shrink-0">
                        Pilih ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* URL Demos */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-2 text-sky-500">
                  🌐 Simulasi URL Aman (.invalid)
                </span>
                <div className="space-y-2">
                  {DEMO_FIXTURES.url.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:border-sky-400 transition-all"
                      style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                      onClick={() => handleLoadDemo('url', f.value)}
                    >
                      <div>
                        <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>{f.label}</span>
                        <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>{f.description}</span>
                      </div>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-sky-500/10 text-sky-500 font-bold shrink-0">
                        Pilih ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Demos */}
              <div>
                <span className="font-bold uppercase tracking-wider block mb-2 text-indigo-500">
                  💬 Simulasi Pesan Rekayasa Sosial
                </span>
                <div className="space-y-2">
                  {DEMO_FIXTURES.message.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-400 transition-all"
                      style={{ backgroundColor: 'var(--vf-surface-muted)', borderColor: 'var(--vf-border)' }}
                      onClick={() => handleLoadDemo('message', f.value)}
                    >
                      <div>
                        <span className="font-bold block" style={{ color: 'var(--vf-text)' }}>{f.label}</span>
                        <span className="text-[11px]" style={{ color: 'var(--vf-text-muted)' }}>{f.description}</span>
                      </div>
                      <span className="font-mono text-xs px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 font-bold shrink-0">
                        Pilih ➔
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScamShield;

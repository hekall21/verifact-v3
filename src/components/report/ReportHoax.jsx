/**
 * ReportHoax.jsx
 *
 * Formulir partisipasi publik untuk melaporkan pesan berantai palsu,
 * tautan penipuan, atau ancaman siber baru.
 */

import React, { useState } from 'react';
import { ShieldIcon, CheckCircleIcon, FileTextIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function ReportHoax({ lang = 'id' }) {
  const [claimTitle, setClaimTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('hoax');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!claimTitle.trim() || !description.trim()) return;

    // Simpan laporan ke localStorage sebagai audit partisipasi publik
    try {
      const existing = JSON.parse(localStorage.getItem('vf_community_reports') || '[]');
      existing.unshift({
        claimTitle,
        url,
        category,
        description,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('vf_community_reports', JSON.stringify(existing.slice(0, 50)));
    } catch {
      // Local storage fallback
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setClaimTitle('');
    setUrl('');
    setDescription('');
    setSubmitted(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 vf-fade-up">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <span>Partisipasi Publik</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {t(lang, 'report.title')}
        </h2>
        <p className="text-xs sm:text-sm max-w-xl mx-auto" style={{ color: 'var(--vf-text-muted)' }}>
          {t(lang, 'report.subtitle')}
        </p>
      </div>

      <div className="rounded-2xl p-6 sm:p-8 border shadow-lg"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--vf-text)' }}>
              {t(lang, 'report.successMsg')}
            </h3>
            <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--vf-text-secondary)' }}>
              Laporan Anda berkontribusi memperkaya deteksi dini penyebaran disinformasi dan penipuan siber generasi muda di Indonesia.
            </p>
            <button
              onClick={handleReset}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: 'var(--vf-primary)' }}
            >
              Kirim Laporan Lainnya
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="font-bold block mb-1.5" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'report.claimLabel')} *
              </label>
              <input
                type="text"
                required
                value={claimTitle}
                onChange={(e) => setClaimTitle(e.target.value)}
                placeholder={t(lang, 'report.claimPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
            </div>

            <div>
              <label className="font-bold block mb-1.5" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'report.urlLabel')}
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t(lang, 'report.urlPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
            </div>

            <div>
              <label className="font-bold block mb-1.5" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'report.categoryLabel')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              >
                <option value="hoax">{t(lang, 'report.categories.hoax')}</option>
                <option value="scam">{t(lang, 'report.categories.scam')}</option>
                <option value="phishing">{t(lang, 'report.categories.phishing')}</option>
                <option value="health">{t(lang, 'report.categories.health')}</option>
                <option value="other">{t(lang, 'report.categories.other')}</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1.5" style={{ color: 'var(--vf-text)' }}>
                {t(lang, 'report.descriptionLabel')} *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(lang, 'report.descriptionPlaceholder')}
                className="w-full px-4 py-2.5 rounded-xl border focus:outline-none resize-none"
                style={{
                  backgroundColor: 'var(--vf-surface-muted)',
                  borderColor: 'var(--vf-border)',
                  color: 'var(--vf-text)',
                }}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-white transition-opacity hover:opacity-90 shadow-md text-xs sm:text-sm"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {t(lang, 'report.submitBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

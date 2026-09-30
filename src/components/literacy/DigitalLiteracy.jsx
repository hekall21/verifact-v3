/**
 * DigitalLiteracy.jsx
 *
 * Panduan kritis 5 langkah literasi digital dan fact-checking mandiri.
 */

import React from 'react';
import { ShieldIcon, LinkIcon, AlertTriangleIcon, SearchIcon, CreditCardIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function DigitalLiteracy({ lang = 'id' }) {
  const steps = [
    {
      num: 1,
      title: t(lang, 'literacy.step1Title'),
      desc: t(lang, 'literacy.step1Desc'),
      icon: <LinkIcon className="w-5 h-5 text-blue-500" />,
    },
    {
      num: 2,
      title: t(lang, 'literacy.step2Title'),
      desc: t(lang, 'literacy.step2Desc'),
      icon: <AlertTriangleIcon className="w-5 h-5 text-amber-500" />,
    },
    {
      num: 3,
      title: t(lang, 'literacy.step3Title'),
      desc: t(lang, 'literacy.step3Desc'),
      icon: <ShieldIcon className="w-5 h-5 text-rose-500" />,
    },
    {
      num: 4,
      title: t(lang, 'literacy.step4Title'),
      desc: t(lang, 'literacy.step4Desc'),
      icon: <SearchIcon className="w-5 h-5 text-emerald-500" />,
    },
    {
      num: 5,
      title: t(lang, 'literacy.step5Title'),
      desc: t(lang, 'literacy.step5Desc'),
      icon: <CreditCardIcon className="w-5 h-5 text-purple-500" />,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 vf-fade-up">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span>Panduan Terstandarisasi</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {t(lang, 'literacy.title')}
        </h2>
        <p className="text-xs sm:text-sm max-w-2xl mx-auto" style={{ color: 'var(--vf-text-muted)' }}>
          {t(lang, 'literacy.subtitle')}
        </p>
      </div>

      {/* 5 Steps Grid */}
      <div className="space-y-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="rounded-2xl p-5 border flex items-start space-x-4 shadow-sm transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--vf-surface)',
              borderColor: 'var(--vf-border)',
            }}
          >
            <div className="p-3 rounded-xl border shrink-0"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
              }}
            >
              {s.icon}
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold" style={{ color: 'var(--vf-text)' }}>
                {s.title}
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

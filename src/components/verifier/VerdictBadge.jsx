/**
 * VerdictBadge.jsx
 *
 * VeriFact ID 4.3 — Lencana Status Pemeriksaan Lintas Kategori
 * Kontras tinggi, token warna semantik, dan ikon pendukung.
 */

import React from 'react';
import {
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertOctagonIcon,
  HelpCircleIcon,
  InfoIcon,
  ShieldIcon,
} from '../common/Icons.jsx';
import { VERDICT, VERDICT_TONE } from '../../utils/verdict.js';
import { t } from '../../i18n/index.js';

export function VerdictBadge({ verdict = VERDICT.UNPROVEN, lang = 'id', size = 'md' }) {
  const tone = VERDICT_TONE[verdict] || 'unproven';

  const label = t(lang, `verifier.verdict.${verdict}.label`) || (
    verdict === 'IDENTIFIED_SOURCE' || verdict === 'NEWS_HOMEPAGE_DETECTED'
      ? (lang === 'id' ? 'SUMBER WEBSITE TERIDENTIFIKASI' : 'IDENTIFIED WEBSITE SOURCE')
      : verdict === 'SOURCE_CONTENT_UNAVAILABLE'
      ? (lang === 'id' ? 'KONTEN BELUM TERSEDIA' : 'SOURCE CONTENT UNAVAILABLE')
      : verdict === 'NO_REPORT_FOUND'
      ? (lang === 'id' ? 'BELUM DITEMUKAN LAPORAN' : 'NO REPORT FOUND')
      : verdict === 'SUSPICIOUS'
      ? (lang === 'id' ? 'TERINDIKASI MENCURIGAKAN' : 'SUSPICIOUS INDICATORS')
      : verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE'
      ? (lang === 'id' ? 'BELUM TERBUKTI' : 'UNVERIFIED')
      : verdict
  );

  const tagline = t(lang, `verifier.verdict.${verdict}.tagline`) || (
    verdict === 'IDENTIFIED_SOURCE' || verdict === 'NEWS_HOMEPAGE_DETECTED'
      ? (lang === 'id' ? 'Portal Berita Terverifikasi' : 'Verified Publisher Homepage')
      : verdict === 'SOURCE_CONTENT_UNAVAILABLE'
      ? (lang === 'id' ? 'Isi Halaman Belum Berhasil Dibaca' : 'Page Content Could Not Be Retrieved')
      : verdict === 'NO_REPORT_FOUND'
      ? (lang === 'id' ? 'Tidak Ada Riwayat Aduan Pada Basis Data' : 'No Public Scam Reports')
      : verdict === 'SUSPICIOUS'
      ? (lang === 'id' ? 'Terdeteksi Karakteristik Berisiko' : 'Risk Indicators Present')
      : verdict === 'UNVERIFIED' || verdict === 'INSUFFICIENT_EVIDENCE'
      ? (lang === 'id' ? 'Bukti Independen Belum Mencukupi' : 'Insufficient Independent Evidence')
      : ''
  );

  const toneStyles = {
    fact: {
      bg: 'color-mix(in srgb, var(--vf-fact) 14%, transparent)',
      border: 'color-mix(in srgb, var(--vf-fact) 45%, transparent)',
      color: 'var(--vf-fact)',
    },
    partly: {
      bg: 'color-mix(in srgb, var(--vf-partly) 14%, transparent)',
      border: 'color-mix(in srgb, var(--vf-partly) 45%, transparent)',
      color: 'var(--vf-partly)',
    },
    misleading: {
      bg: 'color-mix(in srgb, var(--vf-misleading) 14%, transparent)',
      border: 'color-mix(in srgb, var(--vf-misleading) 45%, transparent)',
      color: 'var(--vf-misleading)',
    },
    hoax: {
      bg: 'color-mix(in srgb, var(--vf-hoax) 14%, transparent)',
      border: 'color-mix(in srgb, var(--vf-hoax) 45%, transparent)',
      color: 'var(--vf-hoax)',
    },
    unproven: {
      bg: 'color-mix(in srgb, var(--vf-unproven) 14%, transparent)',
      border: 'color-mix(in srgb, var(--vf-unproven) 40%, transparent)',
      color: 'var(--vf-unproven)',
    },
  };

  const currentStyle = toneStyles[tone] || toneStyles.unproven;

  const renderIcon = () => {
    switch (verdict) {
      case VERDICT.VERIFIED_TRUE:
      case VERDICT.FACT:
        return <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-500" />;
      case VERDICT.SUPPORTED:
      case VERDICT.PARTLY_TRUE:
        return <CheckCircleIcon className="w-5 h-5 shrink-0 text-indigo-400" />;
      case VERDICT.MISLEADING:
      case 'SUSPICIOUS':
        return <AlertTriangleIcon className="w-5 h-5 shrink-0 text-amber-500" />;
      case VERDICT.FALSE:
      case VERDICT.HOAX:
      case VERDICT.DISINFORMATION:
        return <AlertOctagonIcon className="w-5 h-5 shrink-0 text-rose-500" />;
      case 'SOURCE_CONTENT_UNAVAILABLE':
      case VERDICT.SOURCE_CONTENT_UNAVAILABLE:
        return <AlertTriangleIcon className="w-5 h-5 shrink-0 text-amber-500" />;
      case 'IDENTIFIED_SOURCE':
      case VERDICT.IDENTIFIED_SOURCE:
      case 'NEWS_HOMEPAGE_DETECTED':
      case VERDICT.NEWS_HOMEPAGE_DETECTED:
        return <CheckCircleIcon className="w-5 h-5 shrink-0 text-cyan-500" />;
      case 'NO_REPORT_FOUND':
        return <InfoIcon className="w-5 h-5 shrink-0 text-slate-400" />;
      default:
        return <HelpCircleIcon className="w-5 h-5 shrink-0 text-slate-400" />;
    }
  };

  if (size === 'sm') {
    return (
      <span
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm"
        style={{
          backgroundColor: currentStyle.bg,
          borderColor: currentStyle.border,
          color: currentStyle.color,
        }}
      >
        {renderIcon()}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <div
      className="inline-flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 px-4 py-2.5 rounded-xl border shadow-md transition-transform"
      style={{
        backgroundColor: currentStyle.bg,
        borderColor: currentStyle.border,
        color: currentStyle.color,
      }}
    >
      <div className="flex items-center space-x-2">
        {renderIcon()}
        <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)' }}>
          {label}
        </span>
      </div>
      {tagline && (
        <>
          <span className="hidden sm:inline opacity-40">|</span>
          <span className="text-xs font-medium opacity-90">
            {tagline}
          </span>
        </>
      )}
    </div>
  );
}

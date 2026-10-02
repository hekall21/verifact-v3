/**
 * src/components/common/VeriFactLogo.jsx
 *
 * Official Vector Brand Identity Component for VeriFact ID 5.0.
 *
 * Konsep Desain:
 * - Shield (Perlindungan & Cybersecurity Threat Intelligence)
 * - Dynamic Monogram 'V' + Checkmark '✓' (Verifikasi Faktual & Akurasi Bukti)
 * - Prism Nexus & Light Sparkle (Transparansi Sumber & AI Machine Learning)
 * - Modern Cyan-to-Indigo-to-Violet Spectrum Gradient
 *
 * Mendukung varian:
 * - 'icon': Emblem logo SVG murni, skalabel tanpa batas.
 * - 'badge': Emblem dalam squircle kontur bergradien halus dan glassmorphism.
 * - 'full': Logo lengkap horizontal (Emblem + Tipografi Brand + Lencana 'ID' + Tag Versi).
 */

import React from 'react';

export function VeriFactEmblem({ size = 36, className = '', idSuffix = 'main' }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  const gradLeft = `vf-emblem-left-${idSuffix}`;
  const gradRight = `vf-emblem-right-${idSuffix}`;
  const gradCheck = `vf-emblem-check-${idSuffix}`;
  const gradStroke = `vf-emblem-stroke-${idSuffix}`;
  const gradGlow = `vf-emblem-glow-${idSuffix}`;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="VeriFact ID Logo"
    >
      <defs>
        {/* Left Wing Gradient (Cyan to Indigo) */}
        <linearGradient id={gradLeft} x1="15%" y1="20%" x2="55%" y2="85%">
          <stop offset="0%" stopColor="#22D3EE" />
          <stop offset="50%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Right Wing Gradient (Indigo to Purple) */}
        <linearGradient id={gradRight} x1="85%" y1="20%" x2="45%" y2="85%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>

        {/* Truth Checkmark & Beam Gradient (Emerald to Cyan) */}
        <linearGradient id={gradCheck} x1="20%" y1="30%" x2="90%" y2="70%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="60%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        {/* Outline Contour Gradient */}
        <linearGradient id={gradStroke} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#818CF8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.4" />
        </linearGradient>

        {/* Ambient Glow Filter */}
        <filter id={gradGlow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Hex-Shield Subtle Protective Shell */}
      <path
        d="M50 6 L86 21 C86 58 50 94 50 94 C50 94 14 58 14 21 Z"
        fill="#090A0F"
        fillOpacity="0.65"
        stroke={`url(#${gradStroke})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Internal Geometry: Left Facet (Shield Wing) */}
      <path
        d="M50 14 L22 26 C22 55 50 84 50 84 L50 48 Z"
        fill={`url(#${gradLeft})`}
        fillOpacity="0.9"
      />

      {/* Internal Geometry: Right Facet (Shield Wing) */}
      <path
        d="M50 14 L78 26 C78 55 50 84 50 84 L50 48 Z"
        fill={`url(#${gradRight})`}
        fillOpacity="0.8"
      />

      {/* The Central Dynamic "V" Cutout & Shadow */}
      <path
        d="M50 18 L68 30 L50 68 L32 30 Z"
        fill="#0B0E17"
        fillOpacity="0.75"
      />

      {/* The Truth Checkmark (Bold, Precision Angle) */}
      <path
        d="M34 50 L46 62 L74 32 L68 26 L46 51 L40 45 Z"
        fill={`url(#${gradCheck})`}
        filter={`url(#${gradGlow})`}
      />

      {/* Apex Truth Star / Forensic Lens Glint */}
      <circle cx="50" cy="14" r="3" fill="#FFFFFF" />
      <circle cx="50" cy="14" r="6" fill="#38BDF8" fillOpacity="0.5" />
    </svg>
  );
}

export function VeriFactLogo({
  variant = 'full', // 'icon' | 'badge' | 'full'
  size = 36,
  showTagline = true,
  className = '',
  onClick,
}) {
  if (variant === 'icon') {
    return <VeriFactEmblem size={size} className={className} idSuffix="icon" />;
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center p-2 rounded-2xl border shadow-lg transition-transform hover:scale-105 ${
          onClick ? 'cursor-pointer' : ''
        } ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          boxShadow: '0 8px 24px -4px rgba(6, 182, 212, 0.15), 0 2px 6px -1px rgba(99, 102, 241, 0.2)',
        }}
      >
        <VeriFactEmblem size={size} idSuffix="badge" />
      </div>
    );
  }

  // Variant: 'full' (Emblem + Typography + Brand Badge + Version)
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center space-x-3 select-none ${
        onClick ? 'cursor-pointer group' : ''
      } ${className}`}
    >
      {/* Emblem with glow container */}
      <div
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 4px 16px -2px rgba(6, 182, 212, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
        <VeriFactEmblem size={32} idSuffix="navbar" />
      </div>

      {/* Brand Text & Metadata */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span
            className="font-black text-lg sm:text-xl tracking-tight leading-none transition-colors"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}
          >
            VeriFact
            <span
              className="ml-0.5 px-1.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider text-white shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #06B6D4 0%, #6366F1 100%)',
              }}
            >
              ID
            </span>
          </span>

          <span
            className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider hidden sm:inline-block"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--vf-primary) 15%, transparent)',
              color: 'var(--vf-primary)',
              border: '1px solid color-mix(in srgb, var(--vf-primary) 30%, transparent)',
            }}
          >
            v5.0
          </span>
        </div>

        {showTagline && (
          <p
            className="text-[10px] sm:text-[11px] leading-tight font-medium mt-1 hidden sm:block tracking-wide"
            style={{ color: 'var(--vf-text-muted)' }}
          >
            Research &bull; Fact Check &bull; Scam Shield &bull; AI Agent
          </p>
        )}
      </div>
    </div>
  );
}

export default VeriFactLogo;

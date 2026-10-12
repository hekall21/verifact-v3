/**
 * src/components/common/VeriFactLogo.jsx
 *
 * Official Vector Brand Identity Component for VeriFact ID 5.0.
 * Refined Minimalist Enterprise Design (Perplexity / Linear Aesthetic)
 */

import React from 'react';

export function VeriFactEmblem({ size = 36, className = '', idSuffix = 'main' }) {
  const s = typeof size === 'number' ? `${size}px` : size;
  const gradA = `vf-grad-a-${idSuffix}`;
  const gradB = `vf-grad-b-${idSuffix}`;
  const gradCheck = `vf-grad-c-${idSuffix}`;

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${className}`}
      aria-label="VeriFact ID Logo Emblem"
    >
      <defs>
        {/* Modern Indigo-Cobalt Linear Gradient */}
        <linearGradient id={gradA} x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="60%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>

        {/* Sky / Cyan Precision Accent Gradient */}
        <linearGradient id={gradB} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Crisp Emerald Truth Checkmark */}
        <linearGradient id={gradCheck} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Hex-Shield Geometric Base */}
      <path
        d="M50 8 L85 22 C85 55 50 88 50 88 C50 88 15 55 15 22 Z"
        fill="#0B0E17"
        stroke={`url(#${gradA})`}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Internal Left Geometric Wing */}
      <path
        d="M50 16 L23 27 C23 52 50 78 50 78 L50 48 Z"
        fill={`url(#${gradA})`}
        fillOpacity="0.85"
      />

      {/* Internal Right Geometric Wing */}
      <path
        d="M50 16 L77 27 C77 52 50 78 50 78 L50 48 Z"
        fill={`url(#${gradB})`}
        fillOpacity="0.7"
      />

      {/* Precision Central Monogram 'V' Cutout */}
      <path
        d="M50 20 L66 31 L50 64 L34 31 Z"
        fill="#090A0F"
        fillOpacity="0.95"
      />

      {/* The Central Verification Checkmark */}
      <path
        d="M36 48 L46 58 L72 32 L66 26 L46 47 L42 43 Z"
        fill={`url(#${gradCheck})`}
      />

      {/* Precision Focal Lens Spark */}
      <circle cx="50" cy="16" r="2.5" fill="#FFFFFF" />
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
        className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all duration-200 hover:border-indigo-500/50 ${
          onClick ? 'cursor-pointer active:scale-95' : ''
        } ${className}`}
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
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
      {/* Emblem with clean container */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:border-indigo-500/40 border shadow-sm relative shrink-0"
        style={{
          backgroundColor: 'var(--vf-surface)',
          borderColor: 'var(--vf-border)',
        }}
      >
        <VeriFactEmblem size={28} idSuffix="navbar" />
      </div>

      {/* Brand Text & Metadata */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span
            className="font-bold text-lg sm:text-xl tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}
          >
            Veri<span className="font-extrabold text-indigo-500">Fact</span>
          </span>

          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider text-white bg-indigo-600 shadow-sm"
          >
            ID
          </span>

          <span
            className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded tracking-wider hidden sm:inline-block border"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
              color: 'var(--vf-text-muted)',
            }}
          >
            v5.0
          </span>
        </div>

        {showTagline && (
          <p
            className="text-[11px] leading-tight font-medium mt-1 hidden sm:block tracking-normal"
            style={{ color: 'var(--vf-text-muted)' }}
          >
            Evidence Intelligence &bull; Fact Verification &bull; Scam Shield
          </p>
        )}
      </div>
    </div>
  );
}

export default VeriFactLogo;

/**
 * Navbar.jsx
 *
 * Header navigasi adaptif dengan dukungan penuh tema (Dark/Light),
 * penukar bahasa reaktif (ID/EN), dan pembuka modal metodologi.
 */

import React, { useState } from 'react';
import { ShieldIcon, SunIcon, MoonIcon, GlobeIcon, FileTextIcon } from './Icons.jsx';
import { t } from '../../i18n/index.js';

export function Navbar({
  activeTab,
  onSelectTab,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  onOpenMethodology,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'verifier', label: t(lang, 'nav.verifier') },
    { key: 'scamShield', label: t(lang, 'nav.scamShield') },
    { key: 'trending', label: t(lang, 'nav.trending') },
    { key: 'quiz', label: t(lang, 'nav.quiz') },
    { key: 'literacy', label: t(lang, 'nav.literacy') },
    { key: 'report', label: t(lang, 'nav.report') },
  ];

  const handleNavClick = (key) => {
    onSelectTab(key);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--vf-bg) 85%, transparent)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('verifier')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
              style={{
                backgroundColor: 'var(--vf-surface)',
                border: '1px solid var(--vf-border-strong)',
                color: 'var(--vf-primary)',
              }}
            >
              <ShieldIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
                  VeriFact<span style={{ color: 'var(--vf-primary)' }}>ID</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--vf-primary) 15%, transparent)',
                    color: 'var(--vf-primary)',
                    border: '1px solid color-mix(in srgb, var(--vf-primary) 30%, transparent)',
                  }}
                >
                  v4.2 Pro
                </span>
              </div>
              <p className="text-[11px] leading-none hidden sm:block" style={{ color: 'var(--vf-text-muted)' }}>
                {t(lang, 'app.tagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive ? 'shadow-sm' : 'hover:opacity-80'
                  }`}
                  style={{
                    backgroundColor: isActive
                      ? 'color-mix(in srgb, var(--vf-primary) 12%, transparent)'
                      : 'transparent',
                    color: isActive ? 'var(--vf-primary)' : 'var(--vf-text-secondary)',
                    border: isActive
                      ? '1px solid color-mix(in srgb, var(--vf-primary) 35%, transparent)'
                      : '1px solid transparent',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Controls: Methodology, Lang, Theme */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenMethodology}
              title={t(lang, 'nav.methodology')}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: 'var(--vf-surface-muted)',
                color: 'var(--vf-text-secondary)',
                border: '1px solid var(--vf-border)',
              }}
            >
              <FileTextIcon className="w-3.5 h-3.5" />
              <span>{t(lang, 'nav.methodology')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text)',
                border: '1px solid var(--vf-border)',
              }}
              title={t(lang, 'lang.switch')}
            >
              <GlobeIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang.toUpperCase()}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-xs transition-all shadow-sm"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text)',
                border: '1px solid var(--vf-border)',
              }}
              title={t(lang, 'theme.toggle')}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-4 h-4 text-amber-400" />
              ) : (
                <MoonIcon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-xs transition-colors"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text)',
                border: '1px solid var(--vf-border)',
              }}
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1 shadow-lg"
          style={{
            backgroundColor: 'var(--vf-bg-elevated)',
            borderColor: 'var(--vf-border)',
          }}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isActive
                    ? 'color-mix(in srgb, var(--vf-primary) 12%, transparent)'
                    : 'transparent',
                  color: isActive ? 'var(--vf-primary)' : 'var(--vf-text)',
                }}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 border-t mt-2" style={{ borderColor: 'var(--vf-border)' }}>
            <button
              onClick={() => {
                onOpenMethodology();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
              style={{ color: 'var(--vf-text-secondary)' }}
            >
              <FileTextIcon className="w-4 h-4" />
              <span>{t(lang, 'nav.methodology')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

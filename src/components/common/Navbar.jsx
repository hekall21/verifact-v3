/**
 * src/components/common/Navbar.jsx
 *
 * Header navigasi adaptif dengan dukungan penuh tema (Dark/Light),
 * penukar bahasa reaktif (ID/EN), dan pembuka modal metodologi.
 * Linear / Perplexity Minimalist Style.
 */

import React, { useState } from 'react';
import { SunIcon, MoonIcon, GlobeIcon, FileTextIcon } from './Icons.jsx';
import { VeriFactLogo } from './VeriFactLogo.jsx';
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
    <header
      className="sticky top-0 z-40 vf-glass transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <VeriFactLogo
            variant="full"
            onClick={() => handleNavClick('verifier')}
            className="cursor-pointer"
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center p-1 rounded-xl border"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
            }}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavClick(item.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'shadow-sm text-white'
                      : 'hover:text-[var(--vf-text)]'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--vf-primary)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'var(--vf-text-secondary)',
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
              className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border hover:border-indigo-500/40"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text-secondary)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <FileTextIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t(lang, 'nav.methodology')}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-xs hover:border-indigo-500/40"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text)',
                borderColor: 'var(--vf-border)',
              }}
              title={t(lang, 'lang.switch')}
            >
              <GlobeIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono">{lang.toUpperCase()}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-xs transition-all border shadow-xs hover:border-indigo-500/40"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text)',
                borderColor: 'var(--vf-border)',
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
              className="md:hidden p-2 rounded-lg text-xs transition-colors border"
              style={{
                backgroundColor: 'var(--vf-surface)',
                color: 'var(--vf-text)',
                borderColor: 'var(--vf-border)',
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
        <div
          className="md:hidden border-t px-4 py-3 space-y-1 shadow-xl vf-fade-up"
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
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-between"
                style={{
                  backgroundColor: isActive ? 'var(--vf-primary)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--vf-text)',
                }}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
          <div className="pt-2 border-t mt-2" style={{ borderColor: 'var(--vf-border)' }}>
            <button
              onClick={() => {
                onOpenMethodology();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium flex items-center space-x-2"
              style={{ color: 'var(--vf-text-secondary)' }}
            >
              <FileTextIcon className="w-4 h-4 text-indigo-500" />
              <span>{t(lang, 'nav.methodology')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;

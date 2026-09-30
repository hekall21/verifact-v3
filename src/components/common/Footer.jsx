/**
 * Footer.jsx
 *
 * Footer transparansi dengan tautan ke kanal resmi pemerintah,
 * prinsip standar IFCN, dan penegasan privasi pengguna.
 */

import React from 'react';
import { ShieldIcon, ExternalLinkIcon } from './Icons.jsx';
import { t } from '../../i18n/index.js';

export function Footer({ lang, onOpenMethodology }) {
  return (
    <footer className="mt-20 border-t transition-colors"
      style={{
        backgroundColor: 'var(--vf-bg-elevated)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--vf-primary) 15%, transparent)',
                  color: 'var(--vf-primary)',
                }}
              >
                <ShieldIcon className="w-5 h-5" />
              </div>
              <span className="font-bold text-base tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
                VeriFact<span style={{ color: 'var(--vf-primary)' }}>ID</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed max-w-md" style={{ color: 'var(--vf-text-muted)' }}>
              {t(lang, 'app.subtitle')}
            </p>
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={onOpenMethodology}
                className="text-xs font-semibold hover:underline flex items-center space-x-1"
                style={{ color: 'var(--vf-primary)' }}
              >
                <span>{t(lang, 'nav.methodology')}</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Official Verification Channels */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--vf-text)' }}>
              Kanal Resmi Otoritas
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--vf-text-muted)' }}>
              <li>
                <a href="https://cekrekening.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>CekRekening.id (Komdigi)</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://aduannomor.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>AduanNomor.id (Komdigi)</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://cekbansos.kemensos.go.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>Cek Bansos (Kemensos)</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.bmkg.go.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>Peringatan Dini BMKG</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Fact Check Communities */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--vf-text)' }}>
              Pemeriksa Fakta Mitra
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--vf-text-muted)' }}>
              <li>
                <a href="https://turnbackhoax.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>TurnBackHoax (Mafindo)</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://cekfakta.com" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>CekFakta.com</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://lapor.go.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>LAPOR! SP4N</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://ojk.go.id" target="_blank" rel="noreferrer" className="hover:underline flex items-center justify-between">
                  <span>Kontak OJK 157</span>
                  <ExternalLinkIcon className="w-3 h-3 opacity-60" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] gap-2"
          style={{
            borderColor: 'var(--vf-border)',
            color: 'var(--vf-text-muted)',
          }}
        >
          <p>© 2026 VeriFact ID. {t(lang, 'footer.rights')}</p>
          <p className="text-center md:text-right">{t(lang, 'footer.ethics')}</p>
        </div>
      </div>
    </footer>
  );
}

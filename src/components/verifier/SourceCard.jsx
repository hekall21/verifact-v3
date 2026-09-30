/**
 * SourceCard.jsx
 *
 * Menampilkan basis sumber rujukan, tingkat otoritas (Tier 1, 2, 3),
 * dan tautan penelusuran mandiri bagi pengguna.
 */

import React from 'react';
import { ExternalLinkIcon, CheckCircleIcon, ShieldIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export function SourceCard({
  officialChannels = [],
  searchLinks = [],
  lang = 'id',
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
            {t(lang, 'verifier.result.sourceCardsTitle')}
          </h4>
          <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
            {t(lang, 'verifier.result.evidenceSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Official Authority Channels */}
        {officialChannels.map((ch, idx) => {
          const publisher = t(lang, `verifier.publishers.${ch.publisherKey}`) || ch.publisherKey;
          const desc = t(lang, `verifier.channelDescriptions.${ch.descKey}`) || ch.domain;

          return (
            <div
              key={idx}
              className="rounded-xl p-4 border flex flex-col justify-between transition-all hover:shadow-md"
              style={{
                backgroundColor: 'var(--vf-surface)',
                borderColor: 'var(--vf-border)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Tier 1 &bull; Otoritas Resmi
                  </span>
                  <span className="text-xs font-mono opacity-60">{ch.domain}</span>
                </div>
                <h5 className="text-xs font-bold leading-tight" style={{ color: 'var(--vf-text)' }}>
                  {publisher}
                </h5>
                <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--vf-text-muted)' }}>
                  {desc}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
                <a
                  href={ch.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold flex items-center space-x-1 hover:underline"
                  style={{ color: 'var(--vf-primary)' }}
                >
                  <span>Buka Kanal Resmi</span>
                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}

        {/* Live Fact Check Search Links */}
        {searchLinks.map((lk, idx) => (
          <div
            key={`search-${idx}`}
            className="rounded-xl p-4 border flex flex-col justify-between transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--vf-surface)',
              borderColor: 'var(--vf-border)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Tier 3 &bull; Cek Fakta Independen
                </span>
                <span className="text-xs font-mono opacity-60">{lk.domain}</span>
              </div>
              <h5 className="text-xs font-bold leading-tight" style={{ color: 'var(--vf-text)' }}>
                {lk.name}
              </h5>
              <p className="text-[11px] mt-1" style={{ color: 'var(--vf-text-muted)' }}>
                Cari arsip pemeriksaan klaim ini secara langsung di database {lk.name}.
              </p>
            </div>

            <div className="mt-3 pt-2 border-t flex justify-end" style={{ borderColor: 'var(--vf-border)' }}>
              <a
                href={lk.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold flex items-center space-x-1 hover:underline"
                style={{ color: 'var(--vf-primary)' }}
              >
                <span>Cari di {lk.name}</span>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

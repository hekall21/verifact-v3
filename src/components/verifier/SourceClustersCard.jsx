/**
 * SourceClustersCard.jsx
 *
 * VeriFact ID 4.0 - Source Independence & Clustering Card
 * Menampilkan analisis independensi sumber: mencegah ilusi "banyak berita"
 * yang sebenarnya hanya mengutip satu rilis pers atau laporan tunggal.
 * Sesuai spesifikasi master prompt v4.txt §09, §10, dan §34.
 */

import React from 'react';
import { ShieldIcon, LinkIcon } from '../common/Icons.jsx';

export function SourceClustersCard({ sourceClusters = [], lang = 'id' }) {
  if (!sourceClusters || !sourceClusters.length) return null;

  return (
    <div
      className="rounded-2xl p-6 border shadow-sm space-y-4"
      style={{
        backgroundColor: 'var(--vf-surface)',
        borderColor: 'var(--vf-border)',
      }}
    >
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
        <div>
          <h3 className="font-heading font-bold text-sm sm:text-base" style={{ color: 'var(--vf-text)' }}>
            {lang === 'id' ? '🏢 Klaster Independensi Sumber (Source Clusters)' : '🏢 Source Independence Clusters'}
          </h3>
          <p className="text-xs" style={{ color: 'var(--vf-text-muted)' }}>
            {lang === 'id'
              ? 'Artikel yang mengutip rilis atau narasumber yang sama dikelompokkan agar tidak dihitung sebagai bukti ganda.'
              : 'Articles quoting the same press release or single source are grouped into 1 independent evidence cluster.'}
          </p>
        </div>

        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border text-indigo-500"
          style={{
            backgroundColor: 'var(--vf-surface-muted)',
            borderColor: 'var(--vf-border)',
          }}
        >
          {sourceClusters.length} {lang === 'id' ? 'Kluster Independen' : 'Independent Clusters'}
        </span>
      </div>

      <div className="space-y-3">
        {sourceClusters.map((cluster) => (
          <div
            key={cluster.clusterId}
            className="p-4 rounded-xl border space-y-2.5"
            style={{
              backgroundColor: 'var(--vf-surface-muted)',
              borderColor: 'var(--vf-border)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h4 className="text-sm font-bold" style={{ color: 'var(--vf-text)' }}>
                  {cluster.primaryOrigin}
                </h4>
              </div>

              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                {cluster.articleCount} {lang === 'id' ? 'Laporan / Artikel' : 'Articles'}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
              {cluster.explanation}
            </p>

            <div className="pt-2 border-t border-white/5 space-y-1.5">
              <span className="text-[11px] font-bold block" style={{ color: 'var(--vf-text-muted)' }}>
                {lang === 'id' ? 'Publikasi Terkait dalam Kluster:' : 'Associated Publications in Cluster:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {cluster.sources.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--vf-surface)',
                      borderColor: 'var(--vf-border)',
                      color: 'var(--vf-text)',
                    }}
                  >
                    <span>{s.publisher || s.domain}</span>
                    {s.similarityWithClusterLeader && (
                      <span className="text-[10px] font-mono text-cyan-500">
                        ({s.similarityWithClusterLeader}% similar)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

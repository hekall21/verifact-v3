/**
 * src/components/report/OfficialReportingHub.jsx
 *
 * VeriFact ID 4.2 — Official Reporting Hub
 *
 * Portal Resmi Penghubung Kanal Pengaduan Negara RI:
 * - Tidak menyimpan laporan ke localStorage.
 * - Tidak membuat tiket pelaporan palsu (fake ticket/id).
 * - Tidak mengklaim keterhubungan otomatis ke sistem pemerintah tanpa API nyata.
 * - Mengarahkan masyarakat langsung ke 5 kanal otoritas resmi:
 *   1. AduanKonten.id (Komdigi) — Konten Internet Negatif / Ilegal
 *   2. Indonesia Anti-Scam Centre (IASC - OJK) — Penipuan Finansial
 *   3. SP4N-LAPOR! — Pengaduan Pelayanan Publik Pemerintah
 *   4. AduanNomor.id (Komdigi) — Aduan Nomor Telepon & SMS Penipuan
 *   5. CekRekening.id (Komdigi) — Verifikasi & Pelaporan Rekening Bank
 */

import React, { useState } from 'react';
import { ExternalLinkIcon, ShieldIcon, CheckCircleIcon, FileTextIcon, PhoneIcon, CreditCardIcon, AlertTriangleIcon } from '../common/Icons.jsx';
import { t } from '../../i18n/index.js';

export const OFFICIAL_PORTALS = [
  {
    id: 'aduan-konten',
    category: 'Konten',
    name: 'AduanKonten.id',
    authority: 'Kementerian Komunikasi dan Digital (Komdigi RI)',
    description: 'Kanal resmi penanganan konten internet negatif: hoaks, pornografi, ujaran kebencian, perjudian online, phishing URL, dan akun media sosial palsu.',
    url: 'https://aduankonten.id/',
    buttonText: 'Buka AduanKonten.id',
    badge: 'Kanal Resmi Komdigi',
    badgeColor: 'sky',
    iconType: 'content',
  },
  {
    id: 'iasc-ojk',
    category: 'Penipuan Keuangan',
    name: 'Indonesia Anti-Scam Centre (IASC) — OJK',
    authority: 'Otoritas Jasa Keuangan (OJK RI)',
    description: 'Pusat penanganan terpadu penipuan sektor jasa keuangan: investasi bodong, pinjol ilegal, transfer rekening paksa, dan pencurian saldo rekening perbankan.',
    url: 'https://iasc.ojk.go.id/',
    buttonText: 'Lapor ke IASC OJK',
    badge: 'Otoritas Jasa Keuangan',
    badgeColor: 'rose',
    iconType: 'finance',
  },
  {
    id: 'aduan-nomor',
    category: 'Nomor',
    name: 'AduanNomor.id',
    authority: 'Kementerian Komunikasi dan Digital (Komdigi RI)',
    description: 'Portal khusus pelaporan nomor seluler/telepon yang digunakan untuk penipuan, penawaran pinjol ilegal melalui SMS, atau spam teror yang meresahkan.',
    url: 'https://aduannomor.id/',
    buttonText: 'Cek / Laporkan Nomor',
    badge: 'Telekomunikasi RI',
    badgeColor: 'amber',
    iconType: 'phone',
  },
  {
    id: 'cek-rekening',
    category: 'Rekening',
    name: 'CekRekening.id',
    authority: 'Kementerian Komunikasi dan Digital (Komdigi RI)',
    description: 'Pangkalan data resmi untuk memeriksa dan melaporkan nomor rekening bank atau dompet digital (e-wallet) yang terindikasi tindak pidana penipuan.',
    url: 'https://cekrekening.id/',
    buttonText: 'Buka CekRekening.id',
    badge: 'Basis Data Rekening',
    badgeColor: 'emerald',
    iconType: 'account',
  },
  {
    id: 'span-lapor',
    category: 'Layanan Pemerintah',
    name: 'SP4N-LAPOR!',
    authority: 'KemenPAN-RB • Kemendagri • Kantor Staf Presiden (KSP)',
    description: 'Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional untuk menyampaikan aspirasi dan laporan maladministrasi instansi kementerian/lembaga/pemda.',
    url: 'https://www.lapor.go.id/',
    buttonText: 'Buka SP4N-LAPOR!',
    badge: 'Layanan Publik Nasional',
    badgeColor: 'indigo',
    iconType: 'gov',
  },
];

export function OfficialReportingHub({ lang = 'id' }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const categories = ['Semua', 'Konten', 'Penipuan Keuangan', 'Nomor', 'Rekening', 'Layanan Pemerintah'];

  const filteredPortals = selectedCategory === 'Semua'
    ? OFFICIAL_PORTALS
    : OFFICIAL_PORTALS.filter((p) => p.category === selectedCategory);

  const renderIcon = (type) => {
    switch (type) {
      case 'phone':
        return <PhoneIcon className="w-5 h-5 text-amber-500" />;
      case 'account':
        return <CreditCardIcon className="w-5 h-5 text-emerald-500" />;
      case 'finance':
        return <AlertTriangleIcon className="w-5 h-5 text-rose-500" />;
      case 'gov':
        return <FileTextIcon className="w-5 h-5 text-indigo-500" />;
      default:
        return <ShieldIcon className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 vf-fade-up">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <ShieldIcon className="w-3.5 h-3.5" />
          <span>Kanal Pelaporan Otoritas Resmi</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {lang === 'id' ? 'Pusat Pelaporan Resmi Pemerintah' : 'Official Government Reporting Hub'}
        </h2>
        <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
          {lang === 'id'
            ? 'Akses langsung ke kanal pelaporan berwenang di Indonesia untuk konten ilegal, penipuan transaksi, nomor spam, rekening mencurigakan, dan layanan publik.'
            : 'Direct access to official authorized reporting portals in Indonesia for cyber crime, financial scams, spam calls, and public services.'}
        </p>
      </div>

      {/* Mandatory Transparency Notice Banner */}
      <div className="rounded-2xl p-4 sm:p-5 border bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0 mt-0.5">ℹ️</span>
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <h4 className="font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Pernyataan Integritas & Transparansi
            </h4>
            <p style={{ color: 'var(--vf-text-secondary)' }}>
              <strong>VeriFact ID tidak mengirim laporan atas nama Anda.</strong> Kami mengarahkan Anda langsung ke portal resmi kementerian dan otoritas negara agar laporan diverifikasi secara sah, memiliki nomor registrasi hukum yang valid, dan segera ditindaklanjuti oleh instansi berwenang.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'shadow-md scale-102' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--vf-primary)' : 'var(--vf-surface)',
                color: isActive ? '#FFFFFF' : 'var(--vf-text-secondary)',
                border: isActive ? '1px solid var(--vf-primary)' : '1px solid var(--vf-border)',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Portals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPortals.map((portal) => (
          <div
            key={portal.id}
            className="rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
            style={{
              backgroundColor: 'var(--vf-surface)',
              borderColor: 'var(--vf-border)',
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border"
                    style={{
                      backgroundColor: 'var(--vf-surface-muted)',
                      borderColor: 'var(--vf-border)',
                    }}
                  >
                    {renderIcon(portal.iconType)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--vf-text-muted)' }}>
                      {portal.category}
                    </span>
                    <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--vf-text)' }}>
                      {portal.name}
                    </h3>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-500/10 text-slate-400 border-slate-500/20">
                  {portal.badge}
                </span>
              </div>

              <div className="text-xs font-medium" style={{ color: 'var(--vf-primary)' }}>
                {portal.authority}
              </div>

              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                {portal.description}
              </p>
            </div>

            <div className="pt-6 border-t mt-6 flex items-center justify-between gap-3" style={{ borderColor: 'var(--vf-border)' }}>
              <span className="text-[11px] font-mono truncate max-w-[200px]" style={{ color: 'var(--vf-text-muted)' }}>
                {portal.url.replace('https://', '')}
              </span>

              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90 shadow-sm shrink-0"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                <span>{portal.buttonText}</span>
                <ExternalLinkIcon className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OfficialReportingHub;

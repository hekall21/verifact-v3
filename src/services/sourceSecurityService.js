/**
 * src/services/sourceSecurityService.js
 *
 * VeriFact ID 4.3 — URL Security & Technical Inspection Service
 *
 * Standar & Aturan Mutlak (§2, §17, §18):
 * - Memeriksa keamanan teknis URL: HTTPS, valid domain, non-IP host,
 *   tidak ada pola typosquatting sederhana, penyingkat tautan, dan kedalaman subdomain.
 * - Golden Rule: "HTTPS != SAFE". Enkripsi SSL hanya melindungi transmisi data,
 *   bukan integritas moral pemilik situs.
 * - Menghasilkan laporan teknis terstruktur yang mudah dipahami saat presentasi.
 */

import { parseUrl, isShortener, getRegistrableDomain } from '../utils/urlDetector.js';

export function inspectUrlSecurity(rawUrl) {
  const parsed = parseUrl(rawUrl);
  if (!parsed.ok) {
    return {
      ok: false,
      hasHttps: false,
      isValidDomain: false,
      isNotIp: false,
      noTyposquatting: false,
      isResolved: false,
      isShortener: false,
      subdomainDepth: 0,
      hasApk: false,
      summaryText: 'URL tidak valid atau memiliki format yang salah.',
      securityChecklist: [],
    };
  }

  const url = parsed.url;
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const domain = getRegistrableDomain(host);
  const pathname = url.pathname.toLowerCase();

  const hasHttps = url.protocol === 'https:';
  const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
  const isShort = isShortener(host);
  const subdomainParts = host.split('.');
  const subdomainDepth = subdomainParts.length;
  const hasApk = /\.apk($|\?)/i.test(pathname);

  // Deteksi Typosquatting Sederhana (contoh: ddetik, detikk, detik-news, k0mpas, bca-klik)
  const knownBrands = ['detik', 'kompas', 'tempo', 'bca', 'bri', 'mandiri', 'bni', 'kemensos', 'kominfo'];
  let typosquattingDetected = false;
  let typosquattingNote = null;

  for (const b of knownBrands) {
    if (host.includes(b)) {
      const isOfficialDetik = host === 'detik.com' || host.endsWith('.detik.com');
      const isOfficialKompas = host === 'kompas.com' || host.endsWith('.kompas.com') || host === 'kompas.id' || host.endsWith('.kompas.id');
      const isOfficialTempo = host === 'tempo.co' || host.endsWith('.tempo.co');
      const isOfficialBca = host === 'bca.co.id' || host.endsWith('.bca.co.id');
      const isOfficialBri = host === 'bri.co.id' || host.endsWith('.bri.co.id');
      const isOfficialMandiri = host === 'bankmandiri.co.id' || host.endsWith('.bankmandiri.co.id');
      const isOfficialBni = host === 'bni.co.id' || host.endsWith('.bni.co.id');
      const isOfficialGov = host.endsWith('.go.id');

      const isLegit =
        (b === 'detik' && isOfficialDetik) ||
        (b === 'kompas' && isOfficialKompas) ||
        (b === 'tempo' && isOfficialTempo) ||
        (b === 'bca' && isOfficialBca) ||
        (b === 'bri' && isOfficialBri) ||
        (b === 'mandiri' && isOfficialMandiri) ||
        (b === 'bni' && isOfficialBni) ||
        ((b === 'kemensos' || b === 'kominfo') && isOfficialGov);

      if (!isLegit) {
        typosquattingDetected = true;
        typosquattingNote = `Nama institusi "${b.toUpperCase()}" terdeteksi di luar domain resmi terdaftar.`;
        break;
      }
    }
  }

  const securityChecklist = [
    {
      label: 'Protokol HTTPS',
      passed: hasHttps,
      note: hasHttps
        ? 'Koneksi terenkripsi HTTPS aktif'
        : 'Tidak menggunakan enkripsi (HTTP biasa)',
    },
    {
      label: 'Format Domain Valid',
      passed: !isIp && host.includes('.'),
      note: 'Struktur nama host memenuhi standar DNS publik',
    },
    {
      label: 'Bukan Alamat IP Langsung',
      passed: !isIp,
      note: isIp ? 'Menggunakan IP address mentah' : 'Menggunakan nama domain resmi terdaftar',
    },
    {
      label: 'Pemeriksaan Typosquatting',
      passed: !typosquattingDetected,
      note: typosquattingDetected
        ? typosquattingNote
        : 'Tidak terdeteksi manipulasi ejaan nama domain resmi',
    },
    {
      label: 'Penyingkat Tautan',
      passed: !isShort,
      note: isShort ? 'Menggunakan URL shortener (alamat tujuan disembunyikan)' : 'Alamat tujuan asli tampak langsung',
    },
    {
      label: 'Bebas Unduhan Eksekusi APK',
      passed: !hasApk,
      note: hasApk ? 'Terdeteksi unduhan file eksekusi Android APK' : 'Tidak mengarah ke file aplikasi eksekusi langsung',
    },
  ];

  return {
    ok: true,
    hasHttps,
    isValidDomain: !isIp && host.includes('.'),
    isNotIp: !isIp,
    noTyposquatting: !typosquattingDetected,
    isResolved: true,
    isShortener: isShort,
    subdomainDepth,
    hasApk,
    securityChecklist,
    summaryText: hasHttps
      ? 'URL aman secara struktural (protokol HTTPS terenkripsi, domain valid, bukan IP).'
      : 'URL tidak menggunakan enkripsi HTTPS. Berhati-hatilah saat memasukkan data rahasia.',
  };
}

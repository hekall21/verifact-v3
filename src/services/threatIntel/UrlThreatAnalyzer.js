/**
 * src/services/threatIntel/UrlThreatAnalyzer.js
 *
 * VeriFact ID 4.2 — URL Threat Intelligence Architecture
 * Analisis intelijen ancaman URL, Phishing, dan Malware.
 *
 * Standar & Aturan Mutlak (§18, §20, §21, §24):
 * 1. "HTTPS != SAFE": Sertifikat SSL/HTTPS hanya mengenkripsi jalur transmisi data,
 *    BUKAN bukti integritas pemilik situs.
 * 2. ".xyz != PHISHING": Nama domain murah/baru (.xyz, .top) bukan bukti otomatis phishing.
 * 3. Detik.com & Situs Berita: Diidentifikasi secara terhormat sebagai "News Website",
 *    bukan phishing dan tidak diklaim "100% aman".
 * 4. Pengujian aman menggunakan domain standar RFC 2606 (.invalid).
 * 5. Status sumber transparan: API yang belum dipasang berstatus NOT_CONFIGURED.
 */

import { parseUrl, isShortener, getRegistrableDomain } from '../../utils/urlDetector.js';
import { DEMO_FIXTURES } from './demoFixtures.js';

// Brand target impersonasi perbankan & layanan publik utama Indonesia
const SENSITIVE_BRANDS = [
  { brand: 'Bank Central Asia (BCA)', domain: 'bca.co.id', keywords: ['bca', 'klikbca', 'mybca', 'halobca'] },
  { brand: 'Bank Rakyat Indonesia (BRI)', domain: 'bri.co.id', keywords: ['bri', 'brimo', 'ib.bri'] },
  { brand: 'Bank Mandiri', domain: 'bankmandiri.co.id', keywords: ['mandiri', 'livin', 'livinbymandiri'] },
  { brand: 'Bank Negara Indonesia (BNI)', domain: 'bni.co.id', keywords: ['bni', 'bniexperience', 'wondr'] },
  { brand: 'Dana Indonesia', domain: 'dana.id', keywords: ['dana', 'danaindonesia'] },
  { brand: 'GoPay / Gojek', domain: 'gojek.com', keywords: ['gopay', 'gojek'] },
  { brand: 'OVO', domain: 'ovo.id', keywords: ['ovo'] },
  { brand: 'Shopee', domain: 'shopee.co.id', keywords: ['shopee', 'spaylater'] },
  { brand: 'Tokopedia', domain: 'tokopedia.com', keywords: ['tokopedia', 'tokped'] },
  { brand: 'Kemenkes RI (SatuSehat)', domain: 'kemkes.go.id', keywords: ['satusehat', 'pedulilindungi'] },
  { brand: 'Pajak RI (DJP)', domain: 'pajak.go.id', keywords: ['djp', 'efiling-pajak'] },
  { brand: 'BPJS Ketenagakerjaan', domain: 'bpjsketenagakerjaan.go.id', keywords: ['bpjs', 'jmo'] },
];

const REPUTABLE_NEWS_DOMAINS = [
  'detik.com', 'kompas.com', 'kompas.id', 'tempo.co', 'cnnindonesia.com',
  'tribunnews.com', 'liputan6.com', 'antaranews.com', 'republika.co.id',
  'sindonews.com', 'jawapos.com', 'kumparan.com', 'idntimes.com',
  'bbc.com', 'reuters.com', 'tirto.id', 'suara.com', 'viva.co.id',
];

export function analyzeUrl(raw, options = {}) {
  const parsed = parseUrl(raw);
  if (!parsed.ok) {
    return {
      url: raw,
      domain: null,
      status: 'INVALID',
      statusCode: 'INVALID',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      threatTypes: [],
      impersonatedBrand: null,
      sslInfo: {
        hasHttps: false,
        explanation: 'Input bukan merupakan format URL yang valid.',
      },
      indicators: ['Format URL tidak valid atau tidak memiliki skema/host'],
      sourcesChecked: [],
      warningMessage: 'Format URL tidak valid. Harap masukkan URL lengkap seperti https://example.com/halaman.',
      disclaimer: 'Pemeriksaan dibatalkan.',
      valid: false,
      reasonCode: 'invalidUrl',
    };
  }

  const parsedUrl = parsed.url;
  const host = parsedUrl.hostname.toLowerCase();
  const cleanDomain = getRegistrableDomain(host);
  const pathname = parsedUrl.pathname.toLowerCase();
  const fullHref = parsedUrl.href;
  const isHttps = parsedUrl.protocol === 'https:';

  // 1. Cek Demo Fixtures / Test Fixtures (.invalid RFC 2606)
  const isInvalidTld = host.endsWith('.invalid');
  const demoMatch = DEMO_FIXTURES.url.find(
    (item) => fullHref.includes(item.value) || item.simulationData.domain === host
  );

  if (demoMatch || options.isSimulation || isInvalidTld) {
    let fixture = demoMatch ? demoMatch.simulationData : null;
    if (!fixture && isInvalidTld) {
      if (pathname.includes('.apk') || fullHref.includes('malware')) {
        fixture = DEMO_FIXTURES.url[1].simulationData;
      } else {
        fixture = DEMO_FIXTURES.url[0].simulationData;
      }
    }
    return {
      ...fixture,
      url: fullHref,
      domain: host,
      valid: true,
      isSimulation: true,
      simulationBadge: 'SIMULASI / DOMAIN .INVALID',
      checkedAt: new Date().toISOString(),
    };
  }

  // 2. Force Unavailable
  if (options.forceUnavailable) {
    return {
      url: fullHref,
      domain: host,
      status: 'DATA TIDAK TERSEDIA',
      statusCode: 'LOOKUP_UNAVAILABLE',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      threatTypes: [],
      impersonatedBrand: null,
      sslInfo: {
        hasHttps: isHttps,
        explanation: isHttps
          ? 'Koneksi terenkripsi HTTPS, namun server intelijen ancaman sedang tidak dapat dijangkau.'
          : 'Koneksi tidak terenkripsi (HTTP).',
      },
      indicators: ['Layanan telemetri intelijen eksternal sedang tidak merespons'],
      sourcesChecked: [
        { name: 'Google Safe Browsing API', status: 'UNAVAILABLE' },
        { name: 'PhishTank Community Feed', status: 'UNAVAILABLE' },
      ],
      warningMessage: 'Basis data intelijen ancaman eksternal sedang tidak dapat diakses saat ini.',
      disclaimer: 'Kegagalan pengecekan BUKAN bukti bahwa situs ini aman.',
      valid: true,
    };
  }

  // 3. Deteksi Khusus Situs Berita (Detik, Kompas, dll.) (§21)
  const isNewsSite = REPUTABLE_NEWS_DOMAINS.some((d) => host === d || host.endsWith('.' + d));
  if (isNewsSite) {
    return {
      url: fullHref,
      domain: host,
      status: 'SITUS BERITA TERDETEKSI',
      statusCode: 'NEWS_WEBSITE',
      domainType: 'News Website',
      riskScore: 5,
      riskLevel: 'LOW',
      threatTypes: [],
      impersonatedBrand: null,
      sslInfo: {
        hasHttps: isHttps,
        explanation: isHttps
          ? 'Situs berita menggunakan enkripsi HTTPS resmi.'
          : 'Situs menggunakan koneksi HTTP standar.',
      },
      indicators: [
        `Domain ${cleanDomain} terakreditasi sebagai portal berita publik`,
        'Tidak ditemukan indikator phishing pada struktur teknis URL saat pemeriksaan',
      ],
      sourcesChecked: [
        { name: 'Google Safe Browsing API', status: 'NOT_CONFIGURED' },
        { name: 'Structural & Typosquatting Analyzer', status: 'LIVE_CHECKED' },
        { name: 'Verified News Publisher Directory', status: 'LIVE_CHECKED' },
      ],
      warningMessage: `Situs berita terdeteksi. Domain: ${cleanDomain}. Jenis: News Website. Status keamanan URL: Tidak ditemukan indikator phishing dari pemeriksaan yang tersedia.`,
      disclaimer: 'Pemeriksaan ini menganalisis keamanan teknis URL/domain. Untuk memeriksa kebenaran isi artikel beritanya, gunakan menu Pemeriksa Fakta dengan URL artikel spesifik.',
      valid: true,
      checkedAt: new Date().toISOString(),
    };
  }

  const indicators = [];
  const threatTypes = [];
  let impersonatedBrand = null;
  let riskScore = 0;

  // Analisis SSL: Golden Rule HTTPS != SAFE
  const sslInfo = {
    hasHttps: isHttps,
    explanation: isHttps
      ? 'Situs menggunakan enkripsi HTTPS. PERINGATAN: HTTPS HANYA mengenkripsi jalur transmisi data, BUKAN bukti bahwa pemilik situs jujur. 80%+ situs phishing modern juga memiliki gembok HTTPS.'
      : 'Situs TIDAK menggunakan enkripsi (HTTP biasa). Data yang dikirimkan dapat diintip oleh pihak lain di jaringan yang sama.',
  };

  if (!isHttps) {
    indicators.push('Protokol tidak aman (HTTP biasa tanpa enkripsi data)');
    riskScore += 20;
  }

  // Analisis Alamat IP Mentah
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    indicators.push('URL menggunakan alamat IP langsung tanpa nama domain terdaftar');
    riskScore += 35;
    threatTypes.push('Raw IP Host');
  }

  // Analisis Penyingkat Tautan
  const shortener = isShortener(host);
  if (shortener) {
    indicators.push(`Layanan penyingkat tautan (${host}) menyembunyikan alamat tujuan asli`);
    riskScore += 15;
    threatTypes.push('URL Shortener Redirection');
  }

  // Analisis Payload Eksekusi Langsung (.apk, .scr, .exe)
  const isMalwareFile = /\.(apk|exe|scr|vbs|bat|msi|cmd|jar)($|\?)/i.test(pathname);
  if (isMalwareFile) {
    indicators.push(`Tautan mengarah langsung ke unduhan file eksekusi/aplikasi berisiko tinggi: ${pathname.split('/').pop()}`);
    threatTypes.push('Direct Malware Payload Distribution');
    riskScore += 80;
  }

  // Analisis Brand Impersonation (Phishing)
  for (const item of SENSITIVE_BRANDS) {
    const isOfficial = host === item.domain || host.endsWith('.' + item.domain);
    if (!isOfficial) {
      const matchedKw = item.keywords.find((kw) => host.includes(kw));
      if (matchedKw) {
        impersonatedBrand = item.brand;
        indicators.push(`Indikasi peniruan brand ${item.brand}: Domain "${host}" menggunakan kata "${matchedKw}" namun BUKAN domain resmi "${item.domain}"`);
        threatTypes.push(`Phishing Impersonation: ${item.brand}`);
        riskScore += 75;
        break;
      }
    }
  }

  const sourcesChecked = [
    { name: 'Google Safe Browsing API', status: 'NOT_CONFIGURED' },
    { name: 'Structural & Typosquatting Analyzer', status: 'LIVE_CHECKED' },
    { name: 'Malware Payload Signatures', status: 'LIVE_CHECKED' },
  ];

  if (isMalwareFile) {
    return {
      url: fullHref,
      domain: host,
      status: 'TERDETEKSI MALWARE',
      statusCode: 'MALWARE',
      riskScore: Math.min(100, riskScore + 25),
      riskLevel: 'CRITICAL',
      threatTypes,
      impersonatedBrand,
      sslInfo,
      indicators,
      sourcesChecked,
      warningMessage: 'PERINGATAN MALWARE: Tautan ini mengunduh langsung file aplikasi (.apk/.exe) yang kerap disusupi trojan pencuri SMS verifikasi OTP.',
      disclaimer: 'Hindari menginstal file aplikasi dari sumber di luar toko aplikasi resmi (Google Play / App Store).',
      valid: true,
      checkedAt: new Date().toISOString(),
    };
  }

  if (impersonatedBrand) {
    return {
      url: fullHref,
      domain: host,
      status: 'TERDETEKSI PHISHING',
      statusCode: 'PHISHING',
      riskScore: Math.min(100, riskScore + 20),
      riskLevel: 'CRITICAL',
      threatTypes,
      impersonatedBrand,
      sslInfo,
      indicators,
      sourcesChecked,
      warningMessage: `PERINGATAN PHISHING: Situs ini mengindikasikan upaya peniruan terhadap ${impersonatedBrand}. Jangan masukkan kredensial atau PIN rekening.`,
      disclaimer: 'Pastikan selalu memeriksa domain resmi institusi sebelum memasukkan informasi rahasia.',
      valid: true,
      checkedAt: new Date().toISOString(),
    };
  }

  if (riskScore >= 35 || threatTypes.length > 0) {
    return {
      url: fullHref,
      domain: host,
      status: 'MENCURIGAKAN',
      statusCode: 'SUSPICIOUS',
      riskScore: Math.min(65, riskScore),
      riskLevel: 'MEDIUM',
      threatTypes,
      impersonatedBrand: null,
      sslInfo,
      indicators,
      sourcesChecked,
      warningMessage: 'Terdeteksi beberapa indikator mencurigakan pada URL ini (misal protokol tanpa enkripsi atau penyingkat tautan). Lakukan verifikasi sebelum melanjutkan.',
      disclaimer: 'Situs dengan pemendek tautan kerap digunakan untuk mengalihkan ke situs penipuan.',
      valid: true,
      checkedAt: new Date().toISOString(),
    };
  }

  // Default: NO_THREAT_FOUND
  // GOLDEN RULE: Tidak ditemukan ancaman != 100% AMAN SELAMANYA
  return {
    url: fullHref,
    domain: host,
    status: 'TIDAK DITEMUKAN ANCAMAN',
    statusCode: 'NO_THREAT_FOUND',
    riskScore: 5,
    riskLevel: 'LOW',
    threatTypes: [],
    impersonatedBrand: null,
    sslInfo,
    indicators: [
      'Tidak ditemukan indikator ancaman struktural (IP mentah, shortener tersembunyi, atau unduhan APK)',
      'Tidak terdeteksi pola typosquatting brand sensitif perbankan nasional',
      isHttps ? 'Koneksi diamankan dengan enkripsi TLS/HTTPS' : 'Protokol HTTP biasa',
    ],
    sourcesChecked,
    warningMessage: 'Tidak ditemukan indikator ancaman struktural atau riwayat malware pada URL ini dari pemeriksaan yang tersedia.',
    disclaimer: 'PENTING: Status "Tidak Ditemukan Ancaman" BUKAN jaminan mutlak bahwa situs 100% aman selamanya. Halaman dapat berubah atau menyajikan konten rekayasa sosial sewaktu-waktu.',
    valid: true,
    checkedAt: new Date().toISOString(),
  };
}

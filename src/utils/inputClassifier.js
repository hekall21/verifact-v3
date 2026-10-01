/**
 * src/utils/inputClassifier.js
 *
 * VeriFact ID 4.3 — Mandatory Input Classification Engine
 *
 * Standar & Aturan Mutlak (§1 & §2):
 * JANGAN PERNAH MEMAKSA SEMUA INPUT MENJADI "FAKTA / HOAX / UNVERIFIED".
 * Setiap input harus diklasifikasikan ke dalam tipe semantik yang tepat SEBELUM
 * pipeline verifikasi dijalankan:
 *
 *   1. URL_HOME            (Halaman Utama Beranda Media / Situs Web)
 *   2. URL_ARTICLE         (Tautan Artikel Berita Spesifik)
 *   3. URL_SOCIAL          (Tautan Platform Media Sosial Tertutup)
 *   4. URL_PHISHING_SUSPECT(URL Mengandung Pola Ancaman / Phishing / APK)
 *   5. PHONE_NUMBER        (Nomor Telepon / Kontak Seluler)
 *   6. BANK_ACCOUNT        (Nomor Rekening Bank / E-Wallet)
 *   7. MESSAGE             (Pesan Chat / SMS Rekayasa Sosial / Scam)
 *   8. CLAIM_TEXT          (Klaim Pernyataan Teks / Berita Biasa)
 *   9. INVALID_URL         (Upaya URL dengan Sintaks Rusak)
 *  10. UNKNOWN             (Masukan Kosong atau Tidak Dikenali)
 */

import { parseUrl, isShortener, getRegistrableDomain, looksLikeUrlAttempt } from './urlDetector.js';
import { getPublisherRecord } from '../data/publisherRegistry.js';

export const INPUT_TYPE = {
  URL_HOME: 'URL_HOME',
  URL_ARTICLE: 'URL_ARTICLE',
  URL_SOCIAL: 'URL_SOCIAL',
  URL_PHISHING_SUSPECT: 'URL_PHISHING_SUSPECT',
  PHONE_NUMBER: 'PHONE_NUMBER',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  MESSAGE: 'MESSAGE',
  CLAIM_TEXT: 'CLAIM_TEXT',
  INVALID_URL: 'INVALID_URL',
  UNKNOWN: 'UNKNOWN',
};

const SOCIAL_HOSTS = [
  'instagram.com',
  'facebook.com',
  'fb.com',
  'fb.watch',
  'twitter.com',
  'x.com',
  't.co',
  'tiktok.com',
  'youtube.com',
  'youtu.be',
  'threads.net',
  'threads.com',
  't.me',
  'telegram.me',
  'whatsapp.com',
  'wa.me',
];

const SUSPICIOUS_TLDS = ['.xyz', '.top', '.icu', '.click', '.link', '.rest', '.cfd', '.sbs', '.quest', '.tk', '.ml'];

const PHISHING_KEYWORDS = [
  'login', 'masuk', 'verifikasi', 'otp', 'password', 'pin', 'bca', 'bri', 'brimo',
  'mandiri', 'livin', 'bni', 'dana', 'ovo', 'gopay', 'bansos', 'kemensos', 'blt',
  'kominfo', 'komdigi', 'pajak', 'djp', 'bpjs', 'kuota-gratis', 'saldo-gratis',
];

const SOCIAL_ENGINEERING_TRIGGERS = [
  'selamat anda', 'pemenang undian', 'gebyar', 'hadiah', 'klaim hadiah', 'saldo gratis',
  'dana kaget', 'diblokir', 'pemblokiran', 'penonaktifan', 'sanksi hukum', 'denda',
  'kode otp', 'kode verifikasi', 'kirim otp', 'pin atm', 'password', 'user id',
  'biaya administrasi', 'biaya ongkir', 'uang jaminan', 'transfer ke rekening',
  'unduh aplikasi', 'surat undangan.apk', 'paket.apk', 'resi.apk', 'surat tilang.apk',
  'segera konfirmasi', 'dalam 24 jam', '1x24 jam', 'batas waktu', 'sebelum terlambat',
];

/**
 * Mendeteksi apakah URL adalah beranda situs / portal berita atau artikel spesifik.
 *
 * @param {URL} urlObj
 * @param {object|null} publisherInfo
 * @returns {boolean}
 */
export function isHomepagePath(urlObj, publisherInfo = null) {
  const pathname = (urlObj.pathname || '').trim().replace(/\/+$/, '') || '/';

  // 1. Root murni
  if (pathname === '/' || pathname === '' || pathname === '/index' || pathname === '/index.html' || pathname === '/home') {
    return true;
  }

  // 2. Kategori portal berita tanpa slug spesifik (misal: /berita, /news, /nasional, /ekonomi, /sport)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 1) {
    const singleSegment = segments[0].toLowerCase();
    const commonSectionNames = [
      'news', 'berita', 'nasional', 'internasional', 'ekonomi', 'bisnis', 'finance',
      'olahraga', 'sport', 'bola', 'teknologi', 'tekno', 'inet', 'otomotif', 'oto',
      'health', 'kesehatan', 'lifestyle', 'gaya-hidup', 'hiburan', 'hot', 'seleb',
      'metro', 'regional', 'edukasi', 'pendidikan', 'travel', 'food', 'kuliner', 'opini',
    ];
    if (commonSectionNames.includes(singleSegment)) {
      return true;
    }
  }

  // 3. Jika URL memuat pola artikel nyata: d-8686957, /read/2026/..., .html, slug panjang
  const hasArticleIdPattern = /\/d-\d+/i.test(pathname);
  const hasDatePath = /\/\d{4}\/\d{1,2}\/\d{1,2}\//.test(pathname);
  const hasHtmlExt = /\.html?$/i.test(pathname);
  const hasLongSlug = segments.some((seg) => (seg.match(/-/g) || []).length >= 3);
  const hasNumericArticleId = segments.some((seg) => /^\d{5,}$/.test(seg));

  if (hasArticleIdPattern || hasDatePath || hasHtmlExt || hasLongSlug || hasNumericArticleId) {
    return false;
  }

  // Jika domain terdaftar sebagai publisher dan path hanya 1 segment tanpa ID
  if (publisherInfo && segments.length <= 1) {
    return true;
  }

  return false;
}

/**
 * Mengklasifikasikan masukan pengguna secara ketat dan akurat (§1).
 *
 * @param {string} rawInput
 * @returns {object}
 */
export function classifyInputDetail(rawInput = '') {
  const text = String(rawInput ?? '').trim();

  if (!text) {
    return {
      inputType: INPUT_TYPE.UNKNOWN,
      raw: text,
      reason: 'empty',
      label: 'Masukan Kosong',
    };
  }

  // 1. CEK NOMOR TELEPON
  // Ciri: Diawali 08, +62, 628, atau telepon lokal (021, 022, 031), panjang 9-15 digit
  const cleanPhoneCandidate = text.replace(/[\s\-().+]+/g, '');
  const isAllDigitsCandidate = /^\d+$/.test(cleanPhoneCandidate);

  if (isAllDigitsCandidate) {
    const isIndonesianMobile =
      (cleanPhoneCandidate.startsWith('08') && cleanPhoneCandidate.length >= 10 && cleanPhoneCandidate.length <= 14) ||
      (cleanPhoneCandidate.startsWith('628') && cleanPhoneCandidate.length >= 11 && cleanPhoneCandidate.length <= 15);
    const isIndonesianPstn =
      (cleanPhoneCandidate.startsWith('02') || cleanPhoneCandidate.startsWith('03')) &&
      cleanPhoneCandidate.length >= 9 &&
      cleanPhoneCandidate.length <= 12;

    if (isIndonesianMobile || isIndonesianPstn) {
      return {
        inputType: INPUT_TYPE.PHONE_NUMBER,
        raw: text,
        normalized: cleanPhoneCandidate.startsWith('62') ? `0${cleanPhoneCandidate.slice(2)}` : cleanPhoneCandidate,
        label: 'Nomor Telepon / Kontak Seluler',
      };
    }
  }

  // 2. CEK NOMOR REKENING BANK
  // Ciri: Pure angka 8 s.d. 18 digit, TIDAK diawali 08 (agar tidak bentrok dengan no HP)
  if (isAllDigitsCandidate && cleanPhoneCandidate.length >= 8 && cleanPhoneCandidate.length <= 18) {
    if (!cleanPhoneCandidate.startsWith('08') && !cleanPhoneCandidate.startsWith('628')) {
      return {
        inputType: INPUT_TYPE.BANK_ACCOUNT,
        raw: text,
        accountNumber: cleanPhoneCandidate,
        label: 'Nomor Rekening Bank / Finansial',
      };
    }
  }

  // 3. CEK FORMAT URL
  const attempted = looksLikeUrlAttempt(text);
  const parsed = parseUrl(text);

  if (parsed.ok) {
    const url = parsed.url;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = url.pathname.toLowerCase();
    const publisher = getPublisherRecord(url);

    // 3A. Cek apakah ini Social Media Platform
    const isSocial = SOCIAL_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`));
    if (isSocial) {
      return {
        inputType: INPUT_TYPE.URL_SOCIAL,
        raw: text,
        url: url.href,
        hostname,
        platform: hostname.split('.')[0],
        label: 'Tautan Media Sosial',
      };
    }

    // 3B. Cek apakah ini URL Phishing Suspect
    const isIpHost = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    const hasApkDownload = /\.apk($|\?)/i.test(pathname);
    const isLowTrustTld = SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld));
    const hasPhishKeyword = PHISHING_KEYWORDS.some((kw) => hostname.includes(kw) || pathname.includes(kw));
    const isSuspiciousImpersonation = isLowTrustTld && hasPhishKeyword;
    const isSimulatedPhish = hostname.endsWith('.invalid') && (hasPhishKeyword || hasApkDownload || pathname.includes('verify') || pathname.includes('auth') || pathname.includes('login'));

    if (isIpHost || hasApkDownload || isSuspiciousImpersonation || isSimulatedPhish) {
      return {
        inputType: INPUT_TYPE.URL_PHISHING_SUSPECT,
        raw: text,
        url: url.href,
        hostname,
        publisher,
        reasons: [
          isIpHost ? 'Menggunakan IP address langsung tanpa domain resmi' : null,
          hasApkDownload ? 'Tautan unduhan langsung file aplikasi Android APK' : null,
          isSuspiciousImpersonation ? 'Mencatut nama institusi pada TLD berbiaya rendah' : null,
          isSimulatedPhish ? 'Domain simulasi pengujian .invalid' : null,
        ].filter(Boolean),
        label: 'Tautan Mencurigakan / Phishing Suspect',
      };
    }

    // 3C. Cek apakah ini Homepage Media / Website Root
    const isHomepage = isHomepagePath(url, publisher);
    if (isHomepage) {
      return {
        inputType: INPUT_TYPE.URL_HOME,
        raw: text,
        url: url.href,
        hostname,
        publisher,
        domain: publisher?.domain || getRegistrableDomain(hostname),
        label: 'Halaman Utama Situs Web / Beranda Berita',
      };
    }

    // 3D. Jika bukan homepage, ini adalah URL Artikel Berita Spesifik
    return {
      inputType: INPUT_TYPE.URL_ARTICLE,
      raw: text,
      url: url.href,
      hostname,
      publisher,
      domain: publisher?.domain || getRegistrableDomain(hostname),
      label: 'Tautan Artikel Berita Spesifik',
    };
  }

  // Jika tampak seperti URL tetapi sintaksnya cacat
  if (attempted) {
    return {
      inputType: INPUT_TYPE.INVALID_URL,
      raw: text,
      reason: parsed.reason || 'malformed_url_syntax',
      label: 'Format URL Tidak Valid',
    };
  }

  // 4. CEK PESAN SCAM / SOCIAL ENGINEERING MESSAGE
  const textLower = text.toLowerCase();
  const triggerMatches = SOCIAL_ENGINEERING_TRIGGERS.filter((tr) => textLower.includes(tr));

  if (triggerMatches.length >= 2 || (triggerMatches.length === 1 && text.length > 50)) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      raw: text,
      triggerMatches,
      label: 'Pesan Percakapan / Rekayasa Sosial',
    };
  }

  // 5. TEKS BIASA / KLAIM BERITA UMUM
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    return {
      inputType: INPUT_TYPE.CLAIM_TEXT,
      raw: text,
      wordsCount: words.length,
      label: 'Pernyataan / Teks Berita',
    };
  }

  return {
    inputType: INPUT_TYPE.UNKNOWN,
    raw: text,
    label: 'Teks Pendek Tidak Dikenal',
  };
}

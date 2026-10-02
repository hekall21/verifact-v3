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

/**
 * VeriFact ID 5.0 Semantic Sub-types (§2)
 */
export const INPUT_SUBTYPE = {
  URL_HOME: 'URL_HOME',
  URL_ARTICLE: 'URL_ARTICLE',
  URL_SOCIAL: 'URL_SOCIAL',
  URL_PHISHING_SUSPECT: 'URL_PHISHING_SUSPECT',
  PHONE_NUMBER: 'PHONE_NUMBER',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  INVALID_URL: 'INVALID_URL',
  SOCIAL_POST: 'SOCIAL_POST',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  SCAM_MESSAGE: 'SCAM_MESSAGE',
  PHISHING_MESSAGE: 'PHISHING_MESSAGE',
  NEWS_CLAIM: 'NEWS_CLAIM',
  PRODUCT_OFFER: 'PRODUCT_OFFER',
  JOB_OFFER: 'JOB_OFFER',
  INVESTMENT_OFFER: 'INVESTMENT_OFFER',
  ACCOUNT_SALE: 'ACCOUNT_SALE',
  MARKETPLACE_MESSAGE: 'MARKETPLACE_MESSAGE',
  CLAIM_TEXT: 'CLAIM_TEXT',
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
  'palsu', 'fake', 'phish', 'scam', 'klaim', 'hadiah', 'undian',
];

const SOCIAL_ENGINEERING_TRIGGERS = [
  'selamat anda', 'pemenang undian', 'gebyar', 'hadiah', 'klaim hadiah', 'saldo gratis',
  'dana kaget', 'diblokir', 'pemblokiran', 'penonaktifan', 'sanksi hukum', 'denda',
  'kode otp', 'kode verifikasi', 'kirim otp', 'pin atm', 'password', 'user id',
  'biaya administrasi', 'biaya ongkir', 'uang jaminan', 'transfer ke rekening',
  'unduh aplikasi', 'surat undangan.apk', 'paket.apk', 'resi.apk', 'surat tilang.apk',
  'segera konfirmasi', 'dalam 24 jam', '1x24 jam', 'batas waktu', 'sebelum terlambat',
  'transfer sekarang', 'lagi butuh',
];

const ACCOUNT_SALE_TRIGGERS = [
  'jual akun', 'beli akun', 'akun ml', 'mobile legends', 'akun ff', 'free fire',
  'transfer dulu', 'jual murah', 'akun pubg', 'akun genshin', 'akun ig',
  'take all akun', 'rekber pulsa', 'jual char', 'akun pes', 'akun efootball',
];

const INVESTMENT_TRIGGERS = [
  'titip dana', 'investasi slot', 'profit harian', 'trading kilat', 'keuntungan pasti',
  'investasi crypto', 'garansi modal', 'bagi hasil', 'investasi amanah', 'robot trading',
  'depo minimal', 'profit 50%', 'profit 100%',
];

const JOB_OFFER_TRIGGERS = [
  'lowongan kerja', 'loker', 'tugas like', 'follow instagram dapat', 'follow ig dapat',
  'paruh waktu online', 'gaji harian jutaan', 'part time online', 'komisi like',
  'pekerjaan sampingan online', 'tugas subscribe',
];

const PRODUCT_OFFER_TRIGGERS = [
  'cuci gudang iphone', 'promo iphone', 'harga miring transfer', 'lelang sitaan',
  'barang sitaan bea cukai', 'flash sale transfer', 'diskon cuci gudang',
];

const MARKETPLACE_TRIGGERS = [
  'transaksi luar tokopedia', 'transaksi luar shopee', 'transaksi di luar aplikasi',
  'chat wa aja', 'japri wa', 'direct transfer', 'transaksi via wa',
];

const NEWS_CLAIM_TRIGGERS = [
  'presiden', 'menteri', 'pemerintah', 'dpr', 'kpk', 'menkes', 'kebijakan',
  'mengumumkan', 'resmi menyatakan', 'terjadi ledakan', 'gempa bumi',
  'meninggal dunia', 'operasi tangkap tangan', 'ott', 'vaksin', 'bansos cair',
  'anggaran', 'resmi meluncurkan', 'peristiwa', 'kapolri', 'kejaksaan',
];

const CHAT_MESSAGE_TRIGGERS = [
  'halo', 'hai', 'besok kita', 'nanti sore', 'apa kabar', 'kerja kelompok',
  'jam berapa', 'tugas kuliahan', 'lagi dimana', 'udah makan', 'ketemuan',
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
      subType: INPUT_SUBTYPE.UNKNOWN,
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
        subType: INPUT_SUBTYPE.PHONE_NUMBER,
        raw: text,
        normalized: cleanPhoneCandidate.startsWith('62') ? `0${cleanPhoneCandidate.slice(2)}` : cleanPhoneCandidate,
        label: 'Nomor Telepon / Kontak Seluler',
      };
    }
  }

  // 2. CEK NOMOR REKENING BANK
  // Ciri A: Format teks dengan nama bank, e.g. "BCA 1234567890", "rekening BRI 123456789012"
  const bankPrefixMatch = text.match(/^(?:no\.?\s*rek(?:ening)?\s+)?(bca|bri|bni|mandiri|cimb|danamon|permata|bsi|btpn|jago|jenius|seabank|dana|ovo|gopay|shopeepay)\s*[:#-]?\s*(\d{8,18})$/i);
  if (bankPrefixMatch) {
    return {
      inputType: INPUT_TYPE.BANK_ACCOUNT,
      subType: INPUT_SUBTYPE.BANK_ACCOUNT,
      raw: text,
      accountNumber: bankPrefixMatch[2],
      bank: bankPrefixMatch[1].toUpperCase(),
      label: `Nomor Rekening Bank ${bankPrefixMatch[1].toUpperCase()}`,
    };
  }

  // Ciri B: Pure angka 8 s.d. 18 digit, TIDAK diawali 08 (agar tidak bentrok dengan no HP)
  if (isAllDigitsCandidate && cleanPhoneCandidate.length >= 8 && cleanPhoneCandidate.length <= 18) {
    if (!cleanPhoneCandidate.startsWith('08') && !cleanPhoneCandidate.startsWith('628')) {
      return {
        inputType: INPUT_TYPE.BANK_ACCOUNT,
        subType: INPUT_SUBTYPE.BANK_ACCOUNT,
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
        subType: INPUT_SUBTYPE.SOCIAL_POST,
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
    const hasExplicitFakeFlag = hostname.includes('palsu') || hostname.includes('fake') || hostname.includes('scam') || hostname.startsWith('login-') || hostname.includes('-login');
    const isSuspiciousImpersonation = (isLowTrustTld && hasPhishKeyword) || hasExplicitFakeFlag;
    const isSimulatedPhish = hostname.endsWith('.invalid') && (hasPhishKeyword || hasApkDownload || pathname.includes('verify') || pathname.includes('auth') || pathname.includes('login'));

    if (isIpHost || hasApkDownload || isSuspiciousImpersonation || isSimulatedPhish) {
      return {
        inputType: INPUT_TYPE.URL_PHISHING_SUSPECT,
        subType: INPUT_SUBTYPE.URL_PHISHING_SUSPECT,
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
        subType: INPUT_SUBTYPE.URL_HOME,
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
      subType: INPUT_SUBTYPE.URL_ARTICLE,
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
      subType: INPUT_SUBTYPE.INVALID_URL,
      raw: text,
      reason: parsed.reason || 'malformed_url_syntax',
      label: 'Format URL Tidak Valid',
    };
  }

  // 4. CEK PESAN PENAWARAN & REKAYASA SOSIAL (VeriFact ID 5.0 §2)
  const textLower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);

  // 4A. JUAL BELI AKUN GAME / SOSMED (ACCOUNT_SALE)
  const accountSaleMatches = ACCOUNT_SALE_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (accountSaleMatches.length >= 1 && (textLower.includes('jual') || textLower.includes('akun') || textLower.includes('transfer') || textLower.includes('beli'))) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.ACCOUNT_SALE,
      raw: text,
      triggerMatches: accountSaleMatches,
      isScamMessage: true,
      label: 'Penawaran Jual Beli Akun Game / Media Sosial',
    };
  }

  // 4B. TAWAN INVESTASI BODONG (INVESTMENT_OFFER)
  const investmentMatches = INVESTMENT_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (investmentMatches.length >= 1) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.INVESTMENT_OFFER,
      raw: text,
      triggerMatches: investmentMatches,
      isScamMessage: true,
      label: 'Tawaran Investasi Berisiko Tinggi / Titip Dana',
    };
  }

  // 4C. TAWAN LOWONGAN KERJA PALSU (JOB_OFFER)
  const jobMatches = JOB_OFFER_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (jobMatches.length >= 1) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.JOB_OFFER,
      raw: text,
      triggerMatches: jobMatches,
      isScamMessage: true,
      label: 'Tawaran Lowongan Kerja / Tugas Komisi',
    };
  }

  // 4D. PENAWARAN PRODUK MURAH / LELANG SITAAN (PRODUCT_OFFER)
  const productMatches = PRODUCT_OFFER_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (productMatches.length >= 1) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.PRODUCT_OFFER,
      raw: text,
      triggerMatches: productMatches,
      isScamMessage: true,
      label: 'Penawaran Produk Miring / Lelang Sitaan',
    };
  }

  // 4E. TRANSAKSI MARKETPLACE DI LUAR SISTEM (MARKETPLACE_MESSAGE)
  const marketplaceMatches = MARKETPLACE_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (marketplaceMatches.length >= 1) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.MARKETPLACE_MESSAGE,
      raw: text,
      triggerMatches: marketplaceMatches,
      isScamMessage: true,
      label: 'Pesan Marketplace Di Luar Sistem Transaksi Resmi',
    };
  }

  // 4F. PHISHING MESSAGE DENGAN LINK UMUR
  const hasPhishLinkPrompt = /https?:\/\/[^\s]+/i.test(text) || textLower.includes('klik link') || textLower.includes('buka link') || textLower.includes('link ini');
  const hasPhishContext = ['hadiah', 'undian', 'verifikasi', 'otp', 'saldo', 'kuota', 'subsidi', 'bansos', 'klaim', 'pemenang', 'bantuan'].some((kw) => textLower.includes(kw));
  if (hasPhishLinkPrompt && hasPhishContext) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.PHISHING_MESSAGE,
      raw: text,
      isScamMessage: true,
      label: 'Pesan Pengelabuan Tautan / Phishing Message',
    };
  }

  // 4G. SCAM MESSAGE UMUM (URGENCY, PEMBLOKIRAN, UNDIAN)
  const triggerMatches = SOCIAL_ENGINEERING_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (triggerMatches.length >= 2 || (triggerMatches.length === 1 && (text.length > 30 || textLower.includes('selamat') || textLower.includes('diblokir')))) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.SCAM_MESSAGE,
      raw: text,
      triggerMatches,
      isScamMessage: true,
      label: 'Pesan Rekayasa Sosial / Scam Message',
    };
  }

  // 4H. PESAN PERCAKAPAN BIASA (CHAT_MESSAGE)
  const chatMatches = CHAT_MESSAGE_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (chatMatches.length >= 1 && triggerMatches.length === 0) {
    return {
      inputType: INPUT_TYPE.MESSAGE,
      subType: INPUT_SUBTYPE.CHAT_MESSAGE,
      raw: text,
      chatMatches,
      label: 'Pesan Percakapan Biasa',
    };
  }

  // 5. KLAIM BERITA UMUM / NEWS CLAIM (VeriFact ID 5.0 §2 & §45 Test 8)
  const newsMatches = NEWS_CLAIM_TRIGGERS.filter((tr) => textLower.includes(tr));
  if (newsMatches.length >= 1 && words.length >= 3) {
    return {
      inputType: INPUT_TYPE.CLAIM_TEXT,
      subType: INPUT_SUBTYPE.NEWS_CLAIM,
      raw: text,
      wordsCount: words.length,
      newsMatches,
      label: 'Klaim Berita / Pernyataan Kebijakan',
    };
  }

  // 6. TEKS PERNYATAAN BIASA
  if (words.length >= 3) {
    return {
      inputType: INPUT_TYPE.CLAIM_TEXT,
      subType: INPUT_SUBTYPE.CLAIM_TEXT,
      raw: text,
      wordsCount: words.length,
      label: 'Pernyataan / Teks Berita',
    };
  }

  return {
    inputType: INPUT_TYPE.UNKNOWN,
    subType: INPUT_SUBTYPE.UNKNOWN,
    raw: text,
    label: 'Teks Pendek Tidak Dikenal',
  };
}

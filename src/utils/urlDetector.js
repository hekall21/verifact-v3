/**
 * urlDetector.js
 *
 * Deteksi dan validasi input. Tidak ada network access di sini — modul ini
 * murni analisis string sehingga bisa diuji tanpa backend.
 *
 * Kontrak utama:
 *   classifyInput(raw) -> { kind, ...detail }
 *   kind: 'empty' | 'url' | 'invalid-url' | 'text'
 *
 * Aturan penting dari master prompt:
 *   - Input yang berupa URL TIDAK BOLEH diperlakukan sebagai keyword query.
 *   - Sesuatu yang "terlihat seperti URL" tetapi tidak valid harus menghasilkan
 *     error eksplisit, bukan diam-diam jatuh ke text analysis.
 */

const PLATFORM_RULES = [
  { id: 'instagram', label: 'Instagram', hosts: ['instagram.com'], readable: false },
  { id: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com', 'fb.watch', 'm.facebook.com'], readable: false },
  { id: 'x', label: 'X (Twitter)', hosts: ['x.com', 'twitter.com', 't.co'], readable: false },
  { id: 'tiktok', label: 'TikTok', hosts: ['tiktok.com', 'vt.tiktok.com'], readable: false },
  { id: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'youtu.be', 'm.youtube.com'], readable: false },
  { id: 'threads', label: 'Threads', hosts: ['threads.net', 'threads.com'], readable: false },
  { id: 'telegram', label: 'Telegram', hosts: ['t.me', 'telegram.me'], readable: false },
  { id: 'whatsapp', label: 'WhatsApp', hosts: ['chat.whatsapp.com', 'wa.me', 'api.whatsapp.com'], readable: false },
];

/** Pemendek URL: tujuan akhir tidak diketahui tanpa mengikuti redirect. */
const SHORTENER_HOSTS = [
  'bit.ly', 'tinyurl.com', 's.id', 'cutt.ly', 'ow.ly', 'rebrand.ly',
  'shorturl.at', 'linktr.ee', 'is.gd', 'buff.ly', 'rb.gy', 'tiny.cc',
];

/** TLD yang sering dipakai kampanye phishing berbiaya rendah. */
const LOW_TRUST_TLDS = ['.xyz', '.top', '.icu', '.click', '.link', '.rest', '.cfd', '.sbs', '.quest'];

const IP_HOST_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Apakah string ini "berniat" menjadi URL? Dipakai untuk membedakan
 * typo URL (harus error) dari klaim teks biasa (harus dianalisis).
 */
export function looksLikeUrlAttempt(raw) {
  const s = String(raw || '').trim();
  if (!s || /\s/.test(s)) {
    // Ada spasi: kemungkinan besar kalimat, bukan URL.
    return /^(https?|ftp|www)\b/i.test(s);
  }
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return true;
  if (/^(https?|htp|htps|hxxp)[:/]/i.test(s)) return true;
  if (/^www\./i.test(s)) return true;
  // host.tld/path atau host.tld tanpa spasi
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$|\?|#|:)/i.test(s)) return true;
  return false;
}

/** Normalisasi ringan: tambah https:// bila skema hilang. */
function withScheme(s) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;
  return `https://${s}`;
}

export function isValidUrl(raw) {
  return parseUrl(raw).ok;
}

/**
 * Parse URL secara defensif. Hanya http/https diterima — skema lain
 * (javascript:, data:, file:) ditolak sebagai masalah keamanan.
 */
export function parseUrl(raw) {
  const s = String(raw || '').trim();
  if (!s) return { ok: false, reason: 'empty' };
  if (/\s/.test(s)) return { ok: false, reason: 'whitespace' };

  let u;
  try {
    u = new URL(withScheme(s));
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  const scheme = u.protocol.replace(':', '').toLowerCase();
  if (scheme !== 'http' && scheme !== 'https') {
    return { ok: false, reason: 'unsupported-scheme', scheme };
  }

  const host = u.hostname.toLowerCase();
  if (!host) return { ok: false, reason: 'malformed' };
  if (host === 'localhost' || IP_HOST_RE.test(host)) {
    // Bukan sumber publik yang bisa diverifikasi pembaca.
    return { ok: false, reason: 'non-public-host', host };
  }
  // Host publik wajib punya titik dan TLD alfabetis minimal 2 huruf.
  if (!host.includes('.')) return { ok: false, reason: 'malformed' };
  const tld = host.split('.').pop();
  if (!/^[a-z]{2,}$/.test(tld)) return { ok: false, reason: 'malformed' };

  return { ok: true, url: u };
}

export function getRegistrableDomain(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^www\./, '');
  const parts = host.split('.').filter(Boolean);
  if (parts.length <= 2) return host;
  // Tangani suffix dua tingkat seperti .go.id, .co.uk, .ac.id, .co.id
  const twoLevel = new Set(['go', 'co', 'ac', 'or', 'sch', 'mil', 'net', 'web', 'my', 'com']);
  const last = parts[parts.length - 1];
  const second = parts[parts.length - 2];
  if (last.length === 2 && twoLevel.has(second)) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

export function detectPlatform(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^www\./, '');
  for (const rule of PLATFORM_RULES) {
    if (rule.hosts.some((h) => host === h || host.endsWith(`.${h}`))) {
      return { id: rule.id, label: rule.label, readable: rule.readable, isSocial: true };
    }
  }
  return { id: 'web', label: null, readable: true, isSocial: false };
}

export function isShortener(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^www\./, '');
  return SHORTENER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}

/**
 * Sinyal struktural URL. Ini BUKAN verdict — hanya observasi yang
 * bisa dibuktikan sendiri oleh pengguna dengan melihat URL-nya.
 */
export function inspectUrl(url) {
  const host = url.hostname.toLowerCase();
  const domain = getRegistrableDomain(host);
  const signals = [];

  if (url.protocol === 'http:') signals.push('no-https');
  if (isShortener(host)) signals.push('shortener');
  if (LOW_TRUST_TLDS.some((t) => host.endsWith(t))) signals.push('low-trust-tld');
  if (domain.endsWith('.go.id')) signals.push('gov-domain');
  if (domain.endsWith('.ac.id') || domain.endsWith('.edu')) signals.push('academic-domain');
  if ((host.match(/-/g) || []).length >= 3) signals.push('many-hyphens');
  if (host.split('.').length >= 5) signals.push('deep-subdomain');
  if (/\.apk($|\?)/i.test(url.pathname)) signals.push('apk-download');

  // Nama institusi dipakai di subdomain/path, tapi domain induknya bukan resmi.
  const impersonationWords = ['bansos', 'kemensos', 'kominfo', 'komdigi', 'bri', 'bca', 'mandiri', 'dana', 'ovo', 'gopay', 'bpjs', 'pajak', 'samsat'];
  const haystack = `${host}${url.pathname}`.toLowerCase();
  if (!domain.endsWith('.go.id') && impersonationWords.some((w) => haystack.includes(w))) {
    signals.push('institution-name-outside-official-domain');
  }

  return { host, domain, signals };
}

/**
 * Titik masuk utama.
 */
export function isNewsHomepageUrl(urlObj) {
  if (!urlObj || !urlObj.hostname) return false;
  const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
  const pathname = urlObj.pathname.trim().replace(/\/+$/, '') || '/';

  const KNOWN_NEWS_DOMAINS = [
    'detik.com',
    'news.detik.com',
    'finance.detik.com',
    'inet.detik.com',
    'hot.detik.com',
    'sport.detik.com',
    'oto.detik.com',
    'kompas.com',
    'kompas.id',
    'tempo.co',
    'cnnindonesia.com',
    'tribunnews.com',
    'liputan6.com',
    'antaranews.com',
    'republika.co.id',
    'sindonews.com',
    'jawapos.com',
    'kumparan.com',
    'idntimes.com',
    'merdeka.com',
    'tirto.id',
    'suara.com',
    'viva.co.id',
    'okezone.com',
    'cnbcindonesia.com',
  ];

  const isNewsDomain = KNOWN_NEWS_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith('.' + d)
  );

  if (!isNewsDomain) return false;

  const homepagePaths = ['', '/', '/index', '/index.html', '/index.php', '/home', '/berita'];
  if (homepagePaths.includes(pathname)) return true;

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return true;
  if (segments.length === 1 && ['news', 'berita', 'nasional', 'internasional', 'ekonomi', 'olahraga', 'politik', 'metro'].includes(segments[0])) {
    return true;
  }

  return false;
}

export function classifyInput(raw) {
  const text = String(raw ?? '').trim();
  if (!text) return { kind: 'empty', raw: text };

  const attempted = looksLikeUrlAttempt(text);
  const parsed = parseUrl(text);

  if (parsed.ok) {
    const url = parsed.url;
    const platform = detectPlatform(url.hostname);
    const inspection = inspectUrl(url);
    const isHomepage = isNewsHomepageUrl(url);
    return {
      kind: 'url',
      raw: text,
      url: url.toString(),
      href: url.toString(),
      host: inspection.host,
      domain: inspection.domain,
      path: url.pathname,
      scheme: url.protocol.replace(':', ''),
      platform,
      signals: inspection.signals,
      isNewsHomepage: isHomepage,
    };
  }

  if (attempted) {
    return { kind: 'invalid-url', raw: text, reason: parsed.reason || 'malformed' };
  }

  return { kind: 'text', raw: text, length: text.length };
}


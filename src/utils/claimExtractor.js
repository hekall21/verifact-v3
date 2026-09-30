/**
 * claimExtractor.js
 *
 * Mengubah teks bebas (atau isi artikel) menjadi struktur klaim yang dapat
 * diperiksa: klaim utama, klaim pendukung, entitas, angka, tanggal, lokasi.
 *
 * Modul ini deterministik dan tidak memanggil jaringan. Semua yang
 * dihasilkan di sini adalah hasil observasi tekstual — bukan verdict.
 */

import { cleanText } from './sanitize.js';

const MONTHS_ID = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
const MONTHS_EN = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const RELATIVE_TIME = [
  'hari ini', 'besok', 'kemarin', 'malam ini', 'minggu ini', 'bulan ini',
  'tahun ini', 'pekan depan', 'bulan depan', 'tahun depan', 'mulai',
  'today', 'tomorrow', 'yesterday', 'tonight', 'this week', 'next week', 'next month',
];

/** Organisasi & institusi yang sering muncul dalam klaim di Indonesia. */
const ORG_PATTERNS = [
  'kementerian kesehatan', 'kementerian sosial', 'kementerian keuangan', 'kementerian pendidikan',
  'kementerian agama', 'kementerian dalam negeri', 'kementerian luar negeri', 'kementerian',
  'kemenkes', 'kemensos', 'kemendikbud', 'kemenkeu', 'kemendagri', 'kemenag',
  'komdigi', 'kominfo', 'bssn', 'bmkg', 'bnpb', 'basarnas', 'ojk', 'bpjs', 'bpom',
  'polri', 'polda', 'polres', 'korlantas', 'kejaksaan', 'kpk', 'tni', 'dpr', 'mpr', 'dpd',
  'mahkamah konstitusi', 'mahkamah agung', 'bank indonesia', 'pemerintah', 'presiden',
  'gubernur', 'bupati', 'wali kota', 'walikota', 'pemprov', 'pemkot', 'pemkab',
  'who', 'unicef', 'pbb', 'mafindo', 'turnbackhoax', 'cekfakta',
  'bca', 'bri', 'bni', 'mandiri', 'btn', 'dana', 'ovo', 'gopay', 'shopeepay', 'linkaja',
  'moonton', 'garena', 'google', 'meta', 'whatsapp', 'telegram', 'instagram', 'tiktok',
  'ministry of health', 'ministry of social affairs', 'government', 'president', 'world health organization',
];

/** Daftar lokasi untuk deteksi tempat. */
const LOCATIONS = [
  'indonesia', 'jakarta', 'jabodetabek', 'bogor', 'depok', 'tangerang', 'bekasi',
  'bandung', 'semarang', 'surabaya', 'yogyakarta', 'solo', 'medan', 'palembang',
  'makassar', 'denpasar', 'bali', 'lombok', 'padang', 'pekanbaru', 'banjarmasin',
  'balikpapan', 'samarinda', 'pontianak', 'manado', 'ambon', 'jayapura', 'kupang',
  'aceh', 'riau', 'jambi', 'lampung', 'banten', 'jawa barat', 'jawa tengah',
  'jawa timur', 'sumatera', 'sumatra', 'kalimantan', 'sulawesi', 'papua', 'maluku',
  'nusa tenggara', 'batam', 'cirebon', 'malang', 'sidoarjo', 'bantul', 'sleman',
];

/**
 * Penanda gaya bahasa yang sering menyertai pesan berantai.
 * Ini adalah OBSERVASI BAHASA, bukan bukti bahwa klaim salah.
 */
const STYLE_MARKERS = {
  spreadCall: ['sebarkan', 'viralkan', 'share ke', 'broadcast', 'teruskan ke', 'forward ke', 'bagikan sebelum', 'please share', 'spread this'],
  urgency: ['sebelum dihapus', 'segera', 'buruan', 'hari ini saja', 'terbatas', 'jangan sampai terlewat', 'act now', 'before it is deleted', 'before deleted', 'urgent'],
  secrecy: ['rahasia', 'tidak diberitakan media', 'media tutup mulut', 'dibungkam', 'they don\'t want you to know', 'hidden truth'],
  authorityClaim: ['info dari orang dalam', 'kata dokter', 'menurut ahli', 'sumber terpercaya mengatakan', 'insider info', 'doctors say'],
  emotional: ['mengerikan', 'astaga', 'waspada!!!', 'gawat', 'heboh', 'mengejutkan', 'shocking', 'terrifying'],
  allCapsShout: [],
};

const CLAIM_VERBS = [
  'akan', 'telah', 'sudah', 'mengumumkan', 'menyatakan', 'memutuskan', 'menetapkan',
  'melarang', 'mewajibkan', 'menaikkan', 'menurunkan', 'membagikan', 'memberikan',
  'terjadi', 'ditemukan', 'terbukti', 'menyebabkan', 'dapat', 'bisa', 'diklaim',
  'announced', 'declared', 'banned', 'will', 'has', 'causes', 'proven', 'found',
];

const STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'pada', 'ini', 'itu',
  'adalah', 'akan', 'sudah', 'telah', 'atau', 'juga', 'agar', 'oleh', 'dalam',
  'tidak', 'bukan', 'para', 'bagi', 'karena', 'saat', 'ada', 'lebih', 'kami',
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
  'has', 'have', 'will', 'not', 'but', 'you', 'they', '其',
]);

function splitSentences(text) {
  return String(text || '')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Ekstraksi nominal uang: Rp5 juta, Rp 2.500.000, 50 ribu, $3, USD 100. */
export function extractAmounts(text) {
  const out = [];
  const seen = new Set();
  const push = (v) => {
    const k = v.toLowerCase().replace(/\s+/g, ' ');
    if (!seen.has(k)) {
      seen.add(k);
      out.push(v.trim());
    }
  };

  const rupiahScale = /\bRp\.?\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\s?(?:ribu|juta|miliar|milyar|triliun|t|jt|rb|k)?\b/gi;
  for (const m of String(text).matchAll(rupiahScale)) push(m[0]);

  const bareScale = /\b\d{1,4}(?:[.,]\d+)?\s?(?:ribu|juta|miliar|milyar|triliun)\b/gi;
  for (const m of String(text).matchAll(bareScale)) push(m[0]);

  const foreign = /\b(?:usd|us\$|\$|eur|€|sgd|myr)\s?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?\b/gi;
  for (const m of String(text).matchAll(foreign)) push(m[0]);

  const percent = /\b\d{1,3}(?:[.,]\d+)?\s?%/g;
  for (const m of String(text).matchAll(percent)) push(m[0]);

  return out.slice(0, 8);
}

/** Ekstraksi penanda waktu: tanggal eksplisit, nama bulan, waktu relatif. */
export function extractDates(text) {
  const lower = String(text).toLowerCase();
  const out = [];
  const seen = new Set();
  const push = (v) => {
    const k = v.toLowerCase().trim();
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(v.trim());
    }
  };

  const numeric = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
  for (const m of String(text).matchAll(numeric)) push(m[0]);

  const monthNames = [...MONTHS_ID, ...MONTHS_EN].join('|');
  const withMonth = new RegExp(`\\b(\\d{1,2}\\s+)?(${monthNames})(\\s+\\d{4})?\\b`, 'gi');
  for (const m of String(text).matchAll(withMonth)) push(m[0]);

  for (const rel of RELATIVE_TIME) {
    if (lower.includes(rel)) push(rel);
  }

  const year = /\b(?:19|20)\d{2}\b/g;
  for (const m of String(text).matchAll(year)) push(m[0]);

  return out.slice(0, 8);
}

export function extractLocations(text) {
  const lower = String(text).toLowerCase();
  const found = [];
  for (const loc of LOCATIONS) {
    const re = new RegExp(`\\b${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(lower)) found.push(loc.split(' ').map(titleCase).join(' '));
  }
  return [...new Set(found)].slice(0, 6);
}

export function extractOrganizations(text) {
  const lower = String(text).toLowerCase();
  const found = [];
  for (const org of ORG_PATTERNS) {
    const re = new RegExp(`\\b${org.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (re.test(lower)) found.push(org.split(' ').map(titleCase).join(' '));
  }
  // Buang entri yang sudah tercakup entri lebih panjang (mis. "Kementerian" vs "Kementerian Kesehatan").
  const sorted = [...new Set(found)].sort((a, b) => b.length - a.length);
  const kept = [];
  for (const item of sorted) {
    if (!kept.some((k) => k.toLowerCase().includes(item.toLowerCase()) && k !== item)) kept.push(item);
  }
  return kept.slice(0, 6);
}

/** Nama orang: heuristik kata berkapital berurutan yang bukan awal kalimat. */
export function extractPeople(text) {
  const sentences = splitSentences(text);
  const candidates = new Set();
  for (const sentence of sentences) {
    const words = sentence.split(/\s+/);
    let buffer = [];
    words.forEach((word, index) => {
      const clean = word.replace(/[^A-Za-zÀ-ÿ'-]/g, '');
      const isCap = /^[A-Z][a-zÀ-ÿ'-]{1,}$/.test(clean);
      const isSentenceStart = index === 0;
      if (isCap && !isSentenceStart && !STOPWORDS.has(clean.toLowerCase())) {
        buffer.push(clean);
      } else {
        if (buffer.length >= 2) candidates.add(buffer.join(' '));
        buffer = [];
      }
    });
    if (buffer.length >= 2) candidates.add(buffer.join(' '));
  }
  const orgLower = ORG_PATTERNS.map((o) => o.toLowerCase());
  return [...candidates]
    .filter((name) => !orgLower.some((o) => name.toLowerCase().includes(o)))
    .slice(0, 5);
}

/** Kata kunci untuk pencarian bukti (stopword dibuang). */
export function extractKeywords(text, limit = 12) {
  const words = String(text)
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, ' ')
    .split(/[^a-z0-9àâçéèêëîïôûùüÿñæœ.]+/i)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));

  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, limit)
    .map(([w]) => w);
}

/**
 * Penanda gaya bahasa. Dikembalikan sebagai daftar kode agar bisa
 * diterjemahkan lewat i18n, bukan string bahasa Indonesia yang di-hardcode.
 */
export function detectStyleMarkers(text) {
  const raw = String(text || '');
  const lower = raw.toLowerCase();
  const markers = [];

  for (const [code, phrases] of Object.entries(STYLE_MARKERS)) {
    if (phrases.some((p) => lower.includes(p))) markers.push(code);
  }

  const letters = raw.replace(/[^A-Za-z]/g, '');
  if (letters.length >= 20) {
    const upper = raw.replace(/[^A-Z]/g, '').length;
    if (upper / letters.length > 0.6) markers.push('allCapsShout');
  }
  if (/[!?]{3,}/.test(raw)) markers.push('excessivePunctuation');
  if (/\b(?:wa|whatsapp|telegram)\b/i.test(raw) && /\b(?:grup|group|berantai|chain)\b/i.test(raw)) {
    markers.push('chainMessageContext');
  }

  return [...new Set(markers)];
}

/** Pilih kalimat yang paling mungkin merupakan klaim utama. */
function scoreSentenceAsClaim(sentence) {
  const lower = sentence.toLowerCase();
  let score = 0;
  const words = sentence.split(/\s+/).length;

  if (words >= 6 && words <= 45) score += 3;
  else if (words > 45) score -= 1;

  if (CLAIM_VERBS.some((v) => new RegExp(`\\b${v}\\b`, 'i').test(lower))) score += 3;
  if (extractAmounts(sentence).length) score += 2;
  if (extractDates(sentence).length) score += 2;
  if (extractOrganizations(sentence).length) score += 2;
  if (/\?$/.test(sentence.trim())) score -= 2;
  if (/^(sebarkan|viralkan|share|broadcast)/i.test(sentence.trim())) score -= 1;

  return score;
}

/**
 * Titik masuk utama.
 *
 * @param {string} rawText  teks klaim atau isi artikel
 * @param {object} options  { title } judul artikel bila tersedia
 * @returns {{
 *   mainClaim: string,
 *   supportingClaims: string[],
 *   entities: { organizations: string[], people: string[], locations: string[] },
 *   amounts: string[],
 *   dates: string[],
 *   keywords: string[],
 *   styleMarkers: string[],
 *   sentenceCount: number,
 *   hasCheckableSpecifics: boolean
 * }}
 */
export function extractClaim(rawText, options = {}) {
  const text = cleanText(rawText, 8000);
  const title = options.title ? cleanText(options.title, 300) : '';
  const sentences = splitSentences(text);

  let mainClaim = '';
  if (title && scoreSentenceAsClaim(title) >= 3) {
    // Judul artikel biasanya merupakan klaim utama yang paling padat.
    mainClaim = title;
  }

  const ranked = sentences
    .map((s) => ({ s, score: scoreSentenceAsClaim(s) }))
    .sort((a, b) => b.score - a.score);

  if (!mainClaim) {
    mainClaim = ranked.length ? ranked[0].s : text;
  }

  const supportingClaims = ranked
    .map((r) => r.s)
    .filter((s) => s !== mainClaim && s.split(/\s+/).length >= 5)
    .slice(0, 3);

  const scope = `${title} ${text}`;
  const organizations = extractOrganizations(scope);
  const amounts = extractAmounts(scope);
  const dates = extractDates(scope);
  const locations = extractLocations(scope);

  return {
    mainClaim: mainClaim || text,
    supportingClaims,
    entities: {
      organizations,
      people: extractPeople(scope),
      locations,
    },
    amounts,
    dates,
    keywords: extractKeywords(`${title} ${text}`),
    styleMarkers: detectStyleMarkers(text),
    sentenceCount: sentences.length,
    // Klaim dengan angka/tanggal/institusi lebih mudah dilacak ke sumber primer.
    hasCheckableSpecifics: Boolean(organizations.length || amounts.length || dates.length || locations.length),
  };
}

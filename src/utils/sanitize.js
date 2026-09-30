/**
 * sanitize.js
 *
 * Semua teks yang berasal dari luar (input pengguna, konten artikel hasil
 * retrieval, respons backend) harus melewati modul ini sebelum ditampilkan.
 *
 * Catatan: aplikasi ini TIDAK PERNAH merender HTML mentah dari sumber
 * eksternal. React sudah meng-escape teks secara default, dan kita tidak
 * memakai dangerouslySetInnerHTML sama sekali. Fungsi di sini bertugas
 * membersihkan/membatasi teks, bukan mengizinkan HTML.
 */

/** Buang tag HTML, entity, dan karakter kontrol dari teks eksternal. */
export function stripHtml(input) {
  return String(input ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ' ');
}

/** Normalisasi spasi berlebih dan batasi panjang teks. */
export function cleanText(input, maxLength = 4000) {
  const cleaned = stripHtml(input).replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Hanya izinkan http/https untuk atribut href.
 * Mencegah javascript:, data:, vbscript:, file: masuk ke DOM.
 */
export function safeHref(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString();
    return null;
  } catch {
    return null;
  }
}

/** Potong teks pada batas kata terdekat. */
export function truncateWords(input, maxChars) {
  const s = cleanText(input, maxChars * 4);
  if (s.length <= maxChars) return s;
  const cut = s.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

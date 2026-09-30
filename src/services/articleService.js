/**
 * articleService.js
 *
 * Layanan penanganan URL dan ekstraksi artikel.
 * Menjamin prinsip master prompt §4 & §5:
 *   - Tidak pernah mengarang isi artikel bila tidak berhasil diakses.
 *   - Mengenali platform medsos dan pemendek URL.
 *   - Menyajikan status aksesibilitas secara jujur dan transparan.
 */

import { parseUrl, inspectUrl, detectPlatform, isShortener, getRegistrableDomain } from '../utils/urlDetector.js';

export async function fetchAndExtractArticle(rawUrl, options = {}) {
  const parsed = parseUrl(rawUrl);
  if (!parsed.ok) {
    return {
      ok: false,
      reason: parsed.reason,
      url: rawUrl,
      isUrl: false,
    };
  }

  const { url } = parsed;
  const inspection = inspectUrl(url);
  const platform = detectPlatform(url.hostname);

  // Jika platform medsos, tandai bahwa konten dinamis memerlukan login / API resmi
  if (platform.isSocial) {
    return {
      ok: true,
      url: url.href,
      domain: inspection.domain,
      host: inspection.host,
      platform,
      isSocial: true,
      isShortener: inspection.isShortener,
      contentRetrieved: false,
      reason: 'socialPlatformRequiresAuth',
      inaccessibleNotice: true,
    };
  }

  // Jika tautan adalah pemendek URL, beri catatan bahwa tujuan akhir tertutup
  if (inspection.isShortener) {
    return {
      ok: true,
      url: url.href,
      domain: inspection.domain,
      host: inspection.host,
      isShortener: true,
      contentRetrieved: false,
      reason: 'urlShortenerMasked',
      inaccessibleNotice: true,
    };
  }

  // Pada lingkungan browser murni tanpa backend proxy perayap (web scraper),
  // permintaan lintas domain (CORS) dibatasi demi keamanan peramban.
  // VeriFact ID secara jujur menyatakan konten belum dapat dibaca langsung.
  return {
    ok: true,
    url: url.href,
    domain: inspection.domain,
    host: inspection.host,
    signals: inspection.signals,
    contentRetrieved: false,
    reason: 'browserCorsRestricted',
    inaccessibleNotice: true,
    title: null,
    content: null,
  };
}

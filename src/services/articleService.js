/**
 * src/services/articleService.js
 *
 * VeriFact ID 4.1 — Article Retrieval Service
 *
 * Mengikuti aturan mutlak §Part 1 & §Part 2:
 * 1. Frontend TIDAK BOLEH scraping eksternal langsung (CORS/SSRF risk).
 * 2. Memanggil Backend Article Fetcher (POST /api/v1/article).
 * 3. Jika artikel tidak dapat diakses, JANGAN MENGARANG dan JANGAN gunakan URL sebagai claim.
 *    Laporkan status: SOURCE_CONTENT_UNAVAILABLE secara jujur.
 */

import { parseUrl, inspectUrl, detectPlatform } from '../utils/urlDetector.js';

const BACKEND_ARTICLE_URL = typeof window !== 'undefined'
  ? (window.__VERIFACT_API_URL__ || '/api/v1/article')
  : 'http://127.0.0.1:8787/api/v1/article';

export async function fetchAndExtractArticle(rawUrl, options = {}) {
  const parsed = parseUrl(rawUrl);
  if (!parsed.ok) {
    return {
      ok: false,
      status: 'INVALID_URL',
      reason: parsed.reason,
      url: rawUrl,
      isUrl: false,
    };
  }

  const { url } = parsed;
  const inspection = inspectUrl(url);
  const platform = detectPlatform(url.hostname);

  // Jika platform medsos tertutup yang memerlukan autentikasi login pengguna
  if (platform.isSocial) {
    return {
      ok: false,
      status: 'SOURCE_CONTENT_UNAVAILABLE',
      reason: 'socialPlatformRequiresAuth',
      url: url.href,
      domain: inspection.domain,
      host: inspection.host,
      platform,
      isSocial: true,
      message: 'Platform media sosial membatasi perayapan publik tanpa login.',
      content: null,
    };
  }

  // Panggil Backend Article Fetcher
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 9000);

    // Coba endpoint relative terlebih dahulu, lalu fallback ke port lokal jika gagal
    let res;
    try {
      res = await fetch(BACKEND_ARTICLE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.href }),
        signal: controller.signal,
      });
    } catch (netErr) {
      // Jika relative fetch gagal (misal Vite dev server port 5173 tanpa proxy), coba direct ke backend port 8787
      if (typeof window !== 'undefined' && BACKEND_ARTICLE_URL.startsWith('/')) {
        res = await fetch('http://127.0.0.1:8787/api/v1/article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.href }),
          signal: controller.signal,
        });
      } else {
        throw netErr;
      }
    }

    clearTimeout(timeout);

    if (res && res.ok) {
      const data = await res.json();
      if (data.ok && data.content?.text) {
        return {
          ok: true,
          status: 'SUCCESS',
          source: {
            url: data.source?.url || url.href,
            canonicalUrl: data.source?.canonicalUrl || url.href,
            domain: data.source?.domain || inspection.domain,
            publisher: data.source?.publisher || inspection.domain,
            title: data.source?.title || '',
            author: data.source?.author || null,
            publishedAt: data.source?.publishedAt || null,
            updatedAt: data.source?.updatedAt || null,
            description: data.source?.description || '',
          },
          content: {
            text: data.content.text,
            wordCount: data.content.wordCount || data.content.text.split(/\s+/).length,
          },
          retrieval: {
            retrievedAt: data.retrieval?.retrievedAt || new Date().toISOString(),
            status: 'SUCCESS',
            method: data.retrieval?.method || 'backend_article_fetcher',
          },
          contentRetrieved: true,
        };
      } else {
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: data.reason || 'article_extraction_failed',
          url: url.href,
          domain: inspection.domain,
          content: null,
          contentRetrieved: false,
          source: data.source || { url: url.href, domain: inspection.domain },
        };
      }
    }
  } catch (err) {
    // Backend offline / network error / timeout
    // VERIFACT PRINCIPLE: JANGAN MENGARANG ISI ARTIKEL
  }

  // Jika backend tidak dapat diakses atau gagal
  return {
    ok: false,
    status: 'SOURCE_CONTENT_UNAVAILABLE',
    reason: 'network_or_backend_unreachable',
    url: url.href,
    domain: inspection.domain,
    host: inspection.host,
    signals: inspection.signals,
    contentRetrieved: false,
    content: null,
  };
}

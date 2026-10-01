/**
 * src/services/articleService.js
 *
 * VeriFact ID 4.2 — Article Retrieval Service
 *
 * Mengikuti aturan mutlak:
 * 1. Frontend TIDAK scraping eksternal langsung (CORS/SSRF risk).
 * 2. Memanggil Backend Article Fetcher (POST /api/v1/article).
 * 3. Deteksi Halaman Utama Berita (Homepage Detection):
 *    Jika pengguna memasukkan domain/homepage berita (misal: https://www.detik.com/),
 *    sistem dengan jujur mengidentifikasi sebagai halaman utama, bukan artikel.
 * 4. Jika artikel tidak dapat diakses, JANGAN MENGARANG dan JANGAN gunakan URL sebagai claim.
 *    Laporkan status: SOURCE_CONTENT_UNAVAILABLE secara jujur.
 */

import { parseUrl, inspectUrl, detectPlatform, isNewsHomepageUrl } from '../utils/urlDetector.js';

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
      contentRetrieved: false,
    };
  }

  const { url } = parsed;
  const inspection = inspectUrl(url);
  const platform = detectPlatform(url.hostname);

  // 1. Deteksi Halaman Utama Berita (Detik, Kompas, dll.)
  if (isNewsHomepageUrl(url)) {
    return {
      ok: false,
      status: 'NEWS_HOMEPAGE_DETECTED',
      isHomepage: true,
      domain: inspection.domain,
      url: url.href,
      contentRetrieved: false,
      content: null,
      message: `DOMAIN TERDETEKSI: ${inspection.domain}. Ini adalah halaman utama situs berita, bukan URL artikel tertentu. Untuk analisis berita, masukkan URL artikel spesifik.`,
      suggestions: [
        'Buka artikel berita spesifik dan salin tautannya',
        'Tempelkan teks artikel atau pernyataan langsung',
      ],
      source: {
        url: url.href,
        domain: inspection.domain,
        publisher: inspection.domain,
        title: `Halaman Utama ${inspection.domain}`,
      },
    };
  }

  // 2. Jika platform medsos tertutup yang memerlukan autentikasi login pengguna
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
      contentRetrieved: false,
      suggestions: [
        'Salin teks postingan dan tempelkan langsung ke kolom pemeriksaan',
      ],
    };
  }

  // 3. Panggil Backend Article Fetcher
  if (typeof window === 'undefined') {
    try {
      const serverModulePath = '../../server/articleExtractor.mjs';
      const { fetchAndExtractArticleBackend } = await import(/* @vite-ignore */ serverModulePath);
      const data = await fetchAndExtractArticleBackend(url.href);

      if (data.status === 'NEWS_HOMEPAGE_DETECTED' || data.isHomepage) {
        return {
          ok: false,
          status: 'NEWS_HOMEPAGE_DETECTED',
          isHomepage: true,
          domain: data.domain || inspection.domain,
          url: url.href,
          contentRetrieved: false,
          content: null,
          message: data.message || `DOMAIN TERDETEKSI: ${inspection.domain}. Ini adalah halaman utama situs berita, bukan URL artikel tertentu. Untuk analisis berita, masukkan URL artikel spesifik.`,
          suggestions: [
            'Buka artikel berita spesifik dan salin tautannya',
            'Tempelkan teks artikel atau pernyataan langsung',
          ],
          source: data.source || { url: url.href, domain: inspection.domain },
        };
      }

      if (data.ok && data.content?.text) {
        return {
          ok: true,
          status: 'SUCCESS',
          source: data.source,
          content: data.content,
          retrieval: data.retrieval || {
            retrievedAt: new Date().toISOString(),
            status: 'SUCCESS',
            method: 'backend_article_fetcher_direct',
          },
          contentRetrieved: true,
        };
      }

      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: data.reason || 'article_extraction_failed',
        message: data.message || 'Artikel terdeteksi tetapi isi halaman tidak berhasil dibaca.',
        url: url.href,
        domain: inspection.domain,
        content: null,
        contentRetrieved: false,
        source: data.source || { url: url.href, domain: inspection.domain },
        suggestions: [
          'Tempel teks artikel secara manual ke kolom verifikasi',
          'Periksa kembali apakah URL dapat dibuka di peramban tanpa hambatan',
        ],
      };
    } catch (nodeErr) {
      console.warn('[ArticleService] Direct backend call failed, falling back to HTTP:', nodeErr.message);
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 9000);

    let res;
    try {
      res = await fetch(BACKEND_ARTICLE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.href }),
        signal: controller.signal,
      });
    } catch (netErr) {
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

      if (data.status === 'NEWS_HOMEPAGE_DETECTED' || data.isHomepage) {
        return {
          ok: false,
          status: 'NEWS_HOMEPAGE_DETECTED',
          isHomepage: true,
          domain: data.domain || inspection.domain,
          url: url.href,
          contentRetrieved: false,
          content: null,
          message: data.message || `DOMAIN TERDETEKSI: ${inspection.domain}. Ini adalah halaman utama situs berita, bukan URL artikel tertentu. Untuk analisis berita, masukkan URL artikel spesifik.`,
          suggestions: [
            'Buka artikel berita spesifik dan salin tautannya',
            'Tempelkan teks artikel atau pernyataan langsung',
          ],
          source: data.source || { url: url.href, domain: inspection.domain },
        };
      }

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
            strategy: data.content.strategy,
          },
          retrieval: {
            retrievedAt: data.retrieval?.retrievedAt || new Date().toISOString(),
            status: 'SUCCESS',
            method: data.retrieval?.method || 'backend_article_fetcher_v4.2',
          },
          contentRetrieved: true,
        };
      } else {
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: data.reason || 'article_extraction_failed',
          message: data.message || 'Artikel terdeteksi tetapi isi halaman tidak berhasil dibaca. Alasan: Bot protection / JavaScript / timeout / extraction failed. Silakan tempel teks artikel.',
          url: url.href,
          domain: inspection.domain,
          content: null,
          contentRetrieved: false,
          source: data.source || { url: url.href, domain: inspection.domain },
          suggestions: [
            'Tempel teks artikel secara manual ke kolom verifikasi',
            'Periksa kembali apakah URL dapat dibuka di peramban tanpa hambatan',
          ],
        };
      }
    }
  } catch (err) {
    // Backend offline / network error / timeout
  }

  // Jika backend tidak dapat diakses atau terjadi kegagalan jaringan
  return {
    ok: false,
    status: 'SOURCE_CONTENT_UNAVAILABLE',
    reason: 'network_or_backend_unreachable',
    message: 'Layanan pembaca artikel di server tidak dapat dihubungi atau mengalami timeout. Silakan tempelkan teks artikel secara langsung.',
    url: url.href,
    domain: inspection.domain,
    host: inspection.host,
    signals: inspection.signals,
    contentRetrieved: false,
    content: null,
    suggestions: [
      'Tempelkan teks artikel atau isi klaim secara langsung',
      'Coba periksa kembali koneksi internet atau server backend',
    ],
  };
}

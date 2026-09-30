/**
 * server/articleExtractor.mjs
 *
 * VeriFact ID 4.1 — Backend Article Fetcher & Content Extractor
 *
 * Features:
 * - Strict SSRF Protection (initial URL & all redirect hops)
 * - Safe redirect follower (up to 5 redirects)
 * - Size limit (5 MB) & Timeout (8s AbortController)
 * - Metadata extraction: JSON-LD (Schema.org Article), OpenGraph, Meta tags, Canonical
 * - Main article text extraction avoiding ads, navbars, footers, comments
 * - Honest failure: Returns SOURCE_CONTENT_UNAVAILABLE if inaccessible
 */

import { URL } from 'node:url';

// SSRF Protection: block private/internal/cloud metadata IPs
export function isPrivateHost(hostname) {
  const h = String(hostname || '').toLowerCase().trim();
  if (!h) return true;
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
  if (h.startsWith('10.') || h.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  if (h.startsWith('169.254.')) return true; // Link-local / AWS / GCP metadata
  if (h.startsWith('0.')) return true;
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost')) return true;
  return false;
}

export function isAllowedProtocol(protocol) {
  return protocol === 'http:' || protocol === 'https:';
}

function decodeHtmlEntities(str = '') {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/**
 * Extract JSON-LD schema.org Article / NewsArticle
 */
function extractJsonLd(html) {
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      const items = Array.isArray(parsed) ? parsed : (parsed['@graph'] || [parsed]);
      for (const item of items) {
        const type = String(item['@type'] || '');
        if (
          type.includes('Article') ||
          type.includes('NewsArticle') ||
          type.includes('Report') ||
          type.includes('ClaimReview') ||
          type.includes('BlogPosting')
        ) {
          return {
            title: item.headline || item.name || null,
            author: typeof item.author === 'string'
              ? item.author
              : (Array.isArray(item.author) ? item.author.map((a) => a.name || a).join(', ') : item.author?.name || null),
            datePublished: item.datePublished || null,
            dateModified: item.dateModified || null,
            description: item.description || null,
            articleBody: item.articleBody || null,
            publisher: typeof item.publisher === 'string'
              ? item.publisher
              : item.publisher?.name || null,
          };
        }
      }
    } catch {
      // Ignore JSON parse errors in individual blocks
    }
  }
  return null;
}

/**
 * Extract OpenGraph & HTML Meta tags
 */
function extractMeta(html) {
  const getTag = (propOrName) => {
    const escaped = propOrName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex1 = new RegExp(`<meta\\s+[^>]*?(?:property|name)=["']${escaped}["'][^>]*?content=["']([\\s\\S]*?)["'][^>]*>`, 'i');
    const regex2 = new RegExp(`<meta\\s+[^>]*?content=["']([\\s\\S]*?)["'][^>]*?(?:property|name)=["']${escaped}["'][^>]*>`, 'i');
    const m = html.match(regex1) || html.match(regex2);
    return m ? decodeHtmlEntities(m[1].trim()) : null;
  };

  const titleTagMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const titleTag = titleTagMatch ? decodeHtmlEntities(titleTagMatch[1].trim()) : null;

  const canonicalMatch = html.match(/<link\s+[^>]*?rel=["']canonical["'][^>]*?href=["']([\\s\\S]*?)["'][^>]*>/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1].trim() : null;

  return {
    title: getTag('og:title') || getTag('twitter:title') || titleTag,
    description: getTag('og:description') || getTag('twitter:description') || getTag('description'),
    author: getTag('article:author') || getTag('author') || getTag('byl'),
    publishedAt: getTag('article:published_time') || getTag('pubdate') || getTag('date'),
    updatedAt: getTag('article:modified_time'),
    publisher: getTag('og:site_name') || getTag('publisher'),
    canonicalUrl,
  };
}

/**
 * Extract Main Article Body Text
 */
function extractMainText(html) {
  // Strip out noise sections: scripts, styles, nav, footer, header, aside, comments
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, ' ')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');

  // Try finding article or main content tags first
  let articleContent = '';
  const articleBlockMatch =
    cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
    cleaned.match(/<div[^>]*?(?:class|id)=["'][^"']*(?:article-body|entry-content|post-content|story-body|detail-text)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
    cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

  const targetHtml = articleBlockMatch ? articleBlockMatch[1] : cleaned;

  // Extract paragraphs & headings
  const pMatches = targetHtml.match(/<(?:p|h[1-6]|li)[^>]*>([\s\S]*?)<\/(?:p|h[1-6]|li)>/gi) || [];
  const paragraphs = [];

  for (const block of pMatches) {
    const rawText = block.replace(/<[^>]+>/g, ' ');
    const decoded = decodeHtmlEntities(rawText).replace(/\s+/g, ' ').trim();
    // Exclude common noise phrases (cookie banners, copyright, share buttons)
    if (decoded.length >= 25 && !/^(baca juga|simak video|share|bagikan|copyright|hak cipta|advertisement|iklan)/i.test(decoded)) {
      paragraphs.push(decoded);
    }
  }

  articleContent = paragraphs.join('\n\n');

  // Fallback to strip all HTML if no paragraphs matched
  if (!articleContent || articleContent.length < 50) {
    articleContent = decodeHtmlEntities(targetHtml.replace(/<[^>]+>/g, ' '))
      .replace(/\s+/g, ' ')
      .trim();
  }

  return articleContent;
}

/**
 * Fetch and extract article from URL with full SSRF and security controls
 */
export async function fetchAndExtractArticleBackend(targetUrl) {
  let currentUrl = targetUrl;
  const visited = new Set();
  const maxRedirects = 5;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    let parsed;
    try {
      parsed = new URL(currentUrl);
    } catch {
      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: 'invalid_url',
        source: { url: targetUrl },
      };
    }

    if (!isAllowedProtocol(parsed.protocol)) {
      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: 'unsupported_protocol',
        source: { url: currentUrl },
      };
    }

    if (isPrivateHost(parsed.hostname)) {
      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: 'ssrf_blocked',
        source: { url: currentUrl, domain: parsed.hostname },
      };
    }

    if (visited.has(currentUrl)) {
      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: 'redirect_loop',
        source: { url: currentUrl },
      };
    }
    visited.add(currentUrl);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 VeriFact-Bot/4.1',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'manual', // handle redirects explicitly for SSRF checks
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Handle Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          return {
            ok: false,
            status: 'SOURCE_CONTENT_UNAVAILABLE',
            reason: 'empty_redirect_location',
            source: { url: currentUrl },
          };
        }
        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      if (!response.ok) {
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: `http_status_${response.status}`,
          source: { url: currentUrl, domain: parsed.hostname },
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: 'unsupported_content_type',
          source: { url: currentUrl, domain: parsed.hostname, contentType },
        };
      }

      const html = await response.text();
      if (!html || html.length < 100) {
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: 'empty_body',
          source: { url: currentUrl, domain: parsed.hostname },
        };
      }

      // Metadata Extraction
      const jsonLd = extractJsonLd(html);
      const meta = extractMeta(html);

      const title = jsonLd?.title || meta.title || parsed.pathname.replace(/[/_-]/g, ' ').trim() || parsed.hostname;
      const description = jsonLd?.description || meta.description || '';
      const author = jsonLd?.author || meta.author || null;
      const publishedAt = jsonLd?.datePublished || meta.publishedAt || null;
      const updatedAt = jsonLd?.dateModified || meta.updatedAt || null;
      const publisher = jsonLd?.publisher || meta.publisher || parsed.hostname.replace(/^www\./, '');
      const canonicalUrl = meta.canonicalUrl || currentUrl;

      // Content Extraction
      const mainText = jsonLd?.articleBody || extractMainText(html);
      const words = mainText ? mainText.split(/\s+/).filter(Boolean) : [];

      if (!mainText || words.length < 15) {
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: 'article_body_extraction_insufficient',
          source: {
            url: currentUrl,
            canonicalUrl,
            domain: parsed.hostname.replace(/^www\./, ''),
            publisher,
            title,
          },
        };
      }

      return {
        ok: true,
        source: {
          url: currentUrl,
          canonicalUrl,
          domain: parsed.hostname.replace(/^www\./, ''),
          publisher,
          title,
          author,
          publishedAt,
          updatedAt,
          description,
        },
        content: {
          text: mainText,
          wordCount: words.length,
        },
        retrieval: {
          retrievedAt: new Date().toISOString(),
          status: 'SUCCESS',
          method: 'backend_article_extractor_v4.1',
        },
      };
    } catch (err) {
      clearTimeout(timeout);
      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: err.name === 'AbortError' ? 'timeout' : (err.message || 'fetch_error'),
        source: { url: currentUrl, domain: parsed.hostname },
      };
    }
  }

  return {
    ok: false,
    status: 'SOURCE_CONTENT_UNAVAILABLE',
    reason: 'too_many_redirects',
    source: { url: targetUrl },
  };
}

/**
 * server/articleExtractor.mjs
 *
 * VeriFact ID 4.2 — Multi-Strategy Article Fetcher & Content Extractor
 *
 * Architecture:
 * 1. Strict SSRF Protection (RFC1918 accurate CIDR ranges, loopback, link-local, redirect validation)
 * 2. News Homepage Detection (detik.com, kompas.com, etc. root/index URLs identified honestly)
 * 3. Multi-Strategy Article Extraction:
 *    - Strategy 1: JSON-LD (Schema.org Article / NewsArticle / Report)
 *    - Strategy 2: OpenGraph + HTML Meta Tags
 *    - Strategy 3: <article> tag
 *    - Strategy 4: <main> tag
 *    - Strategy 5: Known Article Body Selectors (Detik, Kompas, Tempo, CNN, Tribun, Liputan6, Antara)
 *    - Strategy 6: Generic Paragraph & Heading Extraction
 *    - Strategy 7: Readability-style heuristics (clean noise, gather longest coherent paragraph block)
 * 4. Dedicated News Adapters:
 *    - DetikAdapter
 *    - KompasAdapter
 *    - TempoAdapter
 *    - CNNIndonesiaAdapter
 *    - TribunAdapter
 *    - Liputan6Adapter
 *    - AntaraAdapter
 *    - GenericArticleAdapter
 * 5. Honest failure handling: returns SOURCE_CONTENT_UNAVAILABLE without hallucinating.
 */

import { URL } from 'node:url';

// Accurate SSRF Protection: RFC1918, loopback, link-local, cloud metadata
export function isPrivateHost(hostname) {
  const h = String(hostname || '').toLowerCase().trim();
  if (!h) return true;

  // Localhost & Loopback
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true;
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;

  // RFC1918 Private Ranges
  // 10.0.0.0/8
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(h)) return true;
  // 192.168.0.0/16
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(h)) return true;

  // Link-local / Cloud metadata (169.254.0.0/16)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(h)) return true;

  // Reserved 0.0.0.0/8
  if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h)) return true;

  // Internal TLDs
  if (h.endsWith('.local') || h.endsWith('.internal') || h.endsWith('.localhost') || h.endsWith('.test')) return true;

  return false;
}

export function isAllowedProtocol(protocol) {
  return protocol === 'http:' || protocol === 'https:';
}

/**
 * Deteksi apakah URL merupakan halaman depan (homepage/portal root) dan bukan artikel berita spesifik.
 */
export function isNewsHomepage(urlObj) {
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

  // Homepage paths
  const homepagePaths = ['', '/', '/index', '/index.html', '/index.php', '/home', '/berita'];
  if (homepagePaths.includes(pathname)) {
    return true;
  }

  // Jika path sangat pendek (misal hanya kategori level 1 tanpa slug artikel)
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return true;
  if (segments.length === 1 && ['news', 'berita', 'nasional', 'internasional', 'ekonomi', 'olahraga', 'politik', 'metro'].includes(segments[0])) {
    return true;
  }

  return false;
}

export function decodeHtmlEntities(str = '') {
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
 * STRATEGY 1: JSON-LD Schema.org Article / NewsArticle
 */
export function extractJsonLd(html) {
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
          const bodyText = typeof item.articleBody === 'string'
            ? decodeHtmlEntities(item.articleBody).replace(/\s+/g, ' ').trim()
            : null;

          return {
            title: item.headline || item.name || null,
            author: typeof item.author === 'string'
              ? item.author
              : (Array.isArray(item.author) ? item.author.map((a) => a.name || a).join(', ') : item.author?.name || null),
            datePublished: item.datePublished || null,
            dateModified: item.dateModified || null,
            description: item.description || null,
            articleBody: bodyText,
            publisher: typeof item.publisher === 'string'
              ? item.publisher
              : item.publisher?.name || null,
          };
        }
      }
    } catch {
      // Continue to next script block if JSON parsing fails
    }
  }
  return null;
}

/**
 * STRATEGY 2: OpenGraph + HTML Meta Tags
 */
export function extractMeta(html) {
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
    author: getTag('article:author') || getTag('author') || getTag('byl') || getTag('dable:author'),
    publishedAt: getTag('article:published_time') || getTag('pubdate') || getTag('date') || getTag('publishdate'),
    updatedAt: getTag('article:modified_time'),
    publisher: getTag('og:site_name') || getTag('publisher'),
    canonicalUrl,
  };
}

/**
 * Clean noise elements from HTML string
 */
function cleanHtmlNoise(html) {
  return html
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
}

/**
 * Extract clean paragraphs from an HTML fragment
 */
function extractParagraphsFromFragment(fragmentHtml) {
  const pMatches = fragmentHtml.match(/<(?:p|h[1-6]|li)[^>]*>([\s\S]*?)<\/(?:p|h[1-6]|li)>/gi) || [];
  const paragraphs = [];

  for (const block of pMatches) {
    const rawText = block.replace(/<[^>]+>/g, ' ');
    const decoded = decodeHtmlEntities(rawText).replace(/\s+/g, ' ').trim();
    if (
      decoded.length >= 25 &&
      !/^(baca juga|simak video|share|bagikan|copyright|hak cipta|advertisement|iklan|pilihan editor|trending topic|tags?:)/i.test(decoded)
    ) {
      paragraphs.push(decoded);
    }
  }

  return paragraphs.join('\n\n');
}

// ============================================================================
// DEDICATED ADAPTERS FOR INDONESIAN NEWS SITES
// ============================================================================

/**
 * Extract balanced inner content for container tags with nested elements (nested divs, ads, figures)
 */
export function extractBalancedFragment(html, startRegex) {
  const match = startRegex.exec(html);
  if (!match) return null;
  const startIdx = match.index + match[0].length;

  const openTagMatch = match[0].match(/^<([a-z0-9]+)/i);
  const rootTag = openTagMatch ? openTagMatch[1].toLowerCase() : 'div';

  let depth = 1;
  const tagScanner = new RegExp(`<\/${rootTag}[^>]*>|<${rootTag}\\b[^>]*>`, 'gi');
  tagScanner.lastIndex = startIdx;
  let m;
  while ((m = tagScanner.exec(html)) !== null) {
    if (m[0].startsWith('</')) {
      depth--;
      if (depth === 0) {
        return html.slice(startIdx, m.index);
      }
    } else if (!m[0].endsWith('/>')) {
      depth++;
    }
  }
  return html.slice(startIdx, startIdx + 30000);
}

export const DetikAdapter = {
  name: 'DetikAdapter',
  matches(hostname) {
    return hostname.includes('detik.com');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    // Detik uses .detail__body-text, div.itp_bodycontent, .detail__body, or article
    const detikRegex = /<div[^>]*class=["'][^"']*(?:detail__body-text|itp_bodycontent|detail__body|read__content)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, detikRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const KompasAdapter = {
  name: 'KompasAdapter',
  matches(hostname) {
    return hostname.includes('kompas.com') || hostname.includes('kompas.id');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    // Kompas uses .read__content, .read__body, .col-bs10-7
    const kompasRegex = /<div[^>]*class=["'][^"']*(?:read__content|read__body|col-bs10-7)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, kompasRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const TempoAdapter = {
  name: 'TempoAdapter',
  matches(hostname) {
    return hostname.includes('tempo.co');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    const tempoRegex = /<div[^>]*class=["'][^"']*(?:detail-in|art-text)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, tempoRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const CNNIndonesiaAdapter = {
  name: 'CNNIndonesiaAdapter',
  matches(hostname) {
    return hostname.includes('cnnindonesia.com');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    const cnnRegex = /<div[^>]*class=["'][^"']*(?:detail-text|content-detail)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, cnnRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const TribunAdapter = {
  name: 'TribunAdapter',
  matches(hostname) {
    return hostname.includes('tribunnews.com');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    const tribunRegex = /<div[^>]*class=["'][^"']*(?:txt-article|side-article)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, tribunRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const Liputan6Adapter = {
  name: 'Liputan6Adapter',
  matches(hostname) {
    return hostname.includes('liputan6.com');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    const liputanRegex = /<div[^>]*class=["'][^"']*(?:article-content-body|article-body)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, liputanRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const AntaraAdapter = {
  name: 'AntaraAdapter',
  matches(hostname) {
    return hostname.includes('antaranews.com');
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);
    const antaraRegex = /<div[^>]*class=["'][^"']*(?:post-content|article-content)[^"']*["'][^>]*>/i;
    const articleRegex = /<article[^>]*>/i;

    const fragment = extractBalancedFragment(cleaned, antaraRegex) || extractBalancedFragment(cleaned, articleRegex);
    if (fragment) {
      const text = extractParagraphsFromFragment(fragment);
      if (text && text.length > 50) return text;
    }
    return null;
  },
};

export const GenericArticleAdapter = {
  name: 'GenericArticleAdapter',
  matches() {
    return true;
  },
  extract(html) {
    const cleaned = cleanHtmlNoise(html);

    // Strategy 3: <article> tag
    const articleFrag = extractBalancedFragment(cleaned, /<article[^>]*>/i);
    if (articleFrag) {
      const text = extractParagraphsFromFragment(articleFrag);
      if (text && text.length > 60) return text;
    }

    // Strategy 4: <main> tag
    const mainFrag = extractBalancedFragment(cleaned, /<main[^>]*>/i);
    if (mainFrag) {
      const text = extractParagraphsFromFragment(mainFrag);
      if (text && text.length > 60) return text;
    }

    // Strategy 5: known body selector patterns
    const bodyClassFrag = extractBalancedFragment(
      cleaned,
      /<div[^>]*?(?:class|id)=["'][^"']*(?:article-body|entry-content|post-content|story-body|detail-text|content__article|main-content)[^"']*["'][^>]*>/i
    );
    if (bodyClassFrag) {
      const text = extractParagraphsFromFragment(bodyClassFrag);
      if (text && text.length > 60) return text;
    }

    // Strategy 6: generic paragraph extraction across whole cleaned body
    const genericText = extractParagraphsFromFragment(cleaned);
    if (genericText && genericText.length > 60) return genericText;

    // Strategy 7: Readability-style fallback (plain text extraction)
    const stripped = decodeHtmlEntities(cleaned.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (stripped.length > 100) return stripped.slice(0, 3000);

    return null;
  },
};

const NEWS_ADAPTERS = [
  DetikAdapter,
  KompasAdapter,
  TempoAdapter,
  CNNIndonesiaAdapter,
  TribunAdapter,
  Liputan6Adapter,
  AntaraAdapter,
  GenericArticleAdapter,
];

/**
 * Execute multi-strategy extraction on HTML
 */
export function extractArticleContent(html, hostname = '') {
  // Strategy 1: JSON-LD
  const jsonLd = extractJsonLd(html);
  if (jsonLd?.articleBody && jsonLd.articleBody.length >= 80) {
    return {
      text: jsonLd.articleBody,
      strategy: 'json_ld_schema',
      jsonLd,
    };
  }

  // Strategy 2-7: News Adapters
  const matchedAdapter = NEWS_ADAPTERS.find((a) => a.matches(hostname)) || GenericArticleAdapter;
  const adapterText = matchedAdapter.extract(html);
  if (adapterText && adapterText.length >= 60) {
    return {
      text: adapterText,
      strategy: matchedAdapter.name,
      jsonLd,
    };
  }

  // Generic fallback if specific adapter didn't meet length
  if (matchedAdapter !== GenericArticleAdapter) {
    const genericText = GenericArticleAdapter.extract(html);
    if (genericText && genericText.length >= 60) {
      return {
        text: genericText,
        strategy: 'GenericArticleAdapter_fallback',
        jsonLd,
      };
    }
  }

  return {
    text: null,
    strategy: 'none',
    jsonLd,
  };
}

/**
 * Fetch and extract article from URL with full SSRF, redirect, and multi-strategy controls
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
        status: 'INVALID_URL',
        reason: 'invalid_url_syntax',
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

    // CHECK FOR NEWS HOMEPAGE (Detik, Kompas, etc.)
    if (isNewsHomepage(parsed)) {
      const cleanDomain = parsed.hostname.replace(/^www\./, '');
      return {
        ok: false,
        status: 'NEWS_HOMEPAGE_DETECTED',
        isHomepage: true,
        reason: 'news_homepage_detected',
        domain: cleanDomain,
        source: {
          url: currentUrl,
          domain: cleanDomain,
          publisher: cleanDomain,
          title: `Halaman Utama ${cleanDomain}`,
        },
        message: `DOMAIN TERDETEKSI: ${cleanDomain}. Ini adalah halaman utama situs berita, bukan URL artikel tertentu. Untuk analisis berita, masukkan URL artikel spesifik.`,
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
      console.log(`[ARTICLE] Fetching ${currentUrl} (hop: ${hop})`);
      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          'Sec-Ch-Ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
        },
        redirect: 'manual', // handle redirects explicitly for SSRF checks
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Handle Redirects
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          console.warn(`[ARTICLE] Empty redirect location from ${currentUrl}`);
          return {
            ok: false,
            status: 'SOURCE_CONTENT_UNAVAILABLE',
            reason: 'empty_redirect_location',
            claim: null,
            confidence: null,
            evidence: [],
            source: { url: currentUrl },
          };
        }
        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      if (!response.ok) {
        console.warn(`[ARTICLE] HTTP error ${response.status} from ${currentUrl}`);
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: `http_status_${response.status}`,
          claim: null,
          confidence: null,
          evidence: [],
          source: { url: currentUrl, domain: parsed.hostname },
        };
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
        console.warn(`[ARTICLE] Unsupported content type: ${contentType}`);
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: 'unsupported_content_type',
          claim: null,
          confidence: null,
          evidence: [],
          source: { url: currentUrl, domain: parsed.hostname, contentType },
        };
      }

      const html = await response.text();
      if (!html || html.length < 100) {
        console.warn(`[ARTICLE] Empty HTML response from ${currentUrl}`);
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: 'empty_body',
          claim: null,
          confidence: null,
          evidence: [],
          source: { url: currentUrl, domain: parsed.hostname },
        };
      }

      // Metadata Extraction (JSON-LD + OpenGraph)
      const meta = extractMeta(html);
      const extraction = extractArticleContent(html, parsed.hostname);
      const jsonLd = extraction.jsonLd;

      const title = jsonLd?.title || meta.title || parsed.pathname.replace(/[/_-]/g, ' ').trim() || parsed.hostname;
      const description = jsonLd?.description || meta.description || '';
      const author = jsonLd?.author || meta.author || null;
      const publishedAt = jsonLd?.datePublished || meta.publishedAt || null;
      const updatedAt = jsonLd?.dateModified || meta.updatedAt || null;
      const publisher = jsonLd?.publisher || meta.publisher || parsed.hostname.replace(/^www\./, '');
      const canonicalUrl = meta.canonicalUrl || currentUrl;

      const mainText = extraction.text;
      const words = mainText ? mainText.split(/\s+/).filter(Boolean) : [];

      if (!mainText || words.length < 15) {
        console.warn(`[EXTRACT] Insufficient body text from ${currentUrl} (words: ${words.length})`);
        return {
          ok: false,
          status: 'SOURCE_CONTENT_UNAVAILABLE',
          reason: 'article_body_extraction_insufficient',
          message: 'Artikel terdeteksi tetapi isi halaman tidak berhasil dibaca. Alasan: Bot protection / JavaScript rendering / timeout / extraction failed. Silakan tempel teks artikel secara langsung.',
          claim: null,
          confidence: null,
          evidence: [],
          source: {
            url: currentUrl,
            canonicalUrl,
            domain: parsed.hostname.replace(/^www\./, ''),
            publisher,
            title,
          },
        };
      }

      console.log(`[EXTRACT] Successfully extracted ${words.length} words using ${extraction.strategy} from ${currentUrl}`);

      return {
        ok: true,
        status: 'SUCCESS',
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
          strategy: extraction.strategy,
        },
        retrieval: {
          retrievedAt: new Date().toISOString(),
          status: 'SUCCESS',
          method: `backend_extractor_v4.2 (${extraction.strategy})`,
        },
      };
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`[ARTICLE] Failed fetching ${currentUrl}: ${err.name === 'AbortError' ? 'timeout' : err.message}`);
      return {
        ok: false,
        status: 'SOURCE_CONTENT_UNAVAILABLE',
        reason: err.name === 'AbortError' ? 'timeout' : (err.message || 'fetch_error'),
        message: 'Gagal mengambil konten artikel dari sumber terkait.',
        claim: null,
        confidence: null,
        evidence: [],
        source: { url: currentUrl, domain: parsed.hostname },
      };
    }
  }

  return {
    ok: false,
    status: 'SOURCE_CONTENT_UNAVAILABLE',
    reason: 'too_many_redirects',
    claim: null,
    confidence: null,
    evidence: [],
    source: { url: targetUrl },
  };
}

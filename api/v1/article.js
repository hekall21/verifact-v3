/**
 * api/v1/article.js
 *
 * Vercel Serverless Function — Article Retrieval & Content Extraction
 * Provides server-side scraping without client CORS / SSRF risks.
 */

import { fetchAndExtractArticleBackend } from '../../server/articleExtractor.mjs';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        // use as string
      }
    }

    const targetUrl = body?.url || body?.input || '';
    if (!targetUrl || typeof targetUrl !== 'string') {
      res.status(400).json({ ok: false, error: 'URL parameter is required' });
      return;
    }

    const result = await fetchAndExtractArticleBackend(targetUrl);
    res.status(200).json(result);
  } catch (err) {
    console.error('[API Article Error]', err);
    res.status(500).json({
      ok: false,
      status: 'SOURCE_CONTENT_UNAVAILABLE',
      error: err.message || 'Article extraction failed',
      claim: null,
      confidence: null,
      evidence: [],
    });
  }
}

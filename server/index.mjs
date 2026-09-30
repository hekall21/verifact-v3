/**
 * server/index.mjs
 *
 * VeriFact ID 4.1 — Evidence Intelligence & Threat Intelligence Platform
 * Backend server Node.js dengan:
 * - Backend Article Fetcher (POST /api/v1/article, POST /api/v4/article)
 * - SSRF Protection (block private IPs, localhost, redirect abuse)
 * - Rate limiting per IP
 * - Structured logging
 * - API endpoints v4.1
 */

import http from 'node:http';
import { runVerification } from '../src/services/analysisService.js';
import { fetchAndExtractArticleBackend, isPrivateHost } from './articleExtractor.mjs';

const PORT = process.env.PORT || 8787;

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // max 60 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  record.count++;
  return record.count > RATE_LIMIT_MAX;
}

function log(level, event, data = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  console.log(JSON.stringify(entry));
}

const server = http.createServer(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Rate limiting check
  if (isRateLimited(clientIp)) {
    log('warn', 'rate_limit_exceeded', { ip: clientIp });
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Rate limit exceeded. Please try again later.' }));
    return;
  }

  // Health check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'VeriFact ID 4.1 — Evidence & Threat Intelligence Platform',
      version: '4.1.0',
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Helper to read JSON request body
  const readJsonBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });

  // POST /api/v1/article | /api/v4/article | /api/article
  if (
    (url.pathname === '/api/v1/article' || url.pathname === '/api/v4/article' || url.pathname === '/api/article') &&
    req.method === 'POST'
  ) {
    try {
      const payload = await readJsonBody();
      const targetUrl = payload.url || payload.input || '';

      if (!targetUrl || typeof targetUrl !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'URL parameter is required and must be a string' }));
        return;
      }

      log('info', 'article_fetch_started', { ip: clientIp, url: targetUrl });
      const articleResult = await fetchAndExtractArticleBackend(targetUrl);
      log('info', 'article_fetch_completed', {
        ip: clientIp,
        url: targetUrl,
        ok: articleResult.ok,
        status: articleResult.status,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(articleResult));
    } catch (err) {
      log('error', 'article_fetch_error', { ip: clientIp, error: err.message });
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message || 'Failed to process article request' }));
    }
    return;
  }

  // POST /api/analyze | /api/v4/verify
  if ((url.pathname === '/api/analyze' || url.pathname === '/api/v4/verify') && req.method === 'POST') {
    try {
      const payload = await readJsonBody();
      const input = payload.input || payload.claimText || '';
      const options = {
        claimId: payload.claimId,
        existingVerification: payload.existingVerification,
      };

      if (!input || typeof input !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid input: must be a non-empty string' }));
        return;
      }

      log('info', 'verification_started', { ip: clientIp, inputLength: input.length, claimId: options.claimId });

      const result = await runVerification(input, null, options);

      log('info', 'verification_completed', {
        ip: clientIp,
        verificationId: result.verificationId,
        verdict: result.verdict,
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      log('error', 'verification_failed', { ip: clientIp, error: err.message });
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message || 'Invalid request' }));
    }
    return;
  }

  // Verification report by ID
  if (url.pathname.startsWith('/api/verifications/') && req.method === 'GET') {
    const verificationId = url.pathname.split('/').pop();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      verificationId,
      url: `/verifications/${verificationId}`,
      version: '4.1.0',
      note: 'Report ID recognized by VeriFact ID Evidence Registry.',
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  log('info', 'server_started', { port: PORT, version: '4.1.0' });
});

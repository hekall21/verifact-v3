/**
 * server/index.mjs
 *
 * VeriFact ID 4.0 — Evidence Intelligence Platform
 * Backend server Node.js dengan:
 * - SSRF Protection (block private IPs, localhost, redirect abuse)
 * - Rate limiting per IP
 * - Structured logging
 * - API endpoints v4
 */

import http from 'node:http';
import { runVerification } from '../src/services/analysisService.js';

const PORT = process.env.PORT || 8787;

// Simple in-memory rate limiter
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max 30 requests per minute per IP

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

// SSRF Protection: block private/internal IPs
function isPrivateHost(hostname) {
  const h = String(hostname).toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true;
  if (h.startsWith('10.') || h.startsWith('192.168.') || h.startsWith('172.')) return true;
  if (h.startsWith('169.254.')) return true; // link-local
  if (h.startsWith('0.')) return true;
  return false;
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'VeriFact ID 4.0 — Evidence Intelligence Platform',
      version: '4.0.0',
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Analyze endpoint
  if (url.pathname === '/api/analyze' && req.method === 'POST') {
    // Rate limiting
    if (isRateLimited(clientIp)) {
      log('warn', 'rate_limit_exceeded', { ip: clientIp });
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Rate limit exceeded. Please try again later.' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const input = payload.input || '';

        if (!input || typeof input !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid input: must be a non-empty string' }));
          return;
        }

        // SSRF check for URL inputs
        if (input.startsWith('http://') || input.startsWith('https://')) {
          try {
            const parsed = new URL(input);
            if (isPrivateHost(parsed.hostname)) {
              log('warn', 'ssrf_blocked', { ip: clientIp, host: parsed.hostname });
              res.writeHead(403, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ ok: false, error: 'Access to private/internal hosts is not allowed' }));
              return;
            }
          } catch {
            // Invalid URL — let the analysis service handle it
          }
        }

        log('info', 'verification_started', { ip: clientIp, inputLength: input.length });

        const result = await runVerification(input);

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
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON request' }));
      }
    });
    return;
  }

  // Verification report by ID
  if (url.pathname.startsWith('/api/verifications/') && req.method === 'GET') {
    const verificationId = url.pathname.split('/').pop();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      verificationId,
      url: `/verifications/${verificationId}`,
      note: 'Full report retrieval requires persistent storage backend.',
    }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  log('info', 'server_started', { port: PORT, version: '4.0.0' });
});

/**
 * server/index.mjs
 *
 * Backend server stub murni Node.js (tanpa dependensi eksternal)
 * Port: 8787 (sesuai target proxy vite.config.js)
 * Endpoint:
 *   GET  /api/health   -> { status: 'ok', version: '3.0.0' }
 *   POST /api/analyze  -> Menerima { input: string }, mengembalikan hasil analisis terstruktur
 */

import http from 'node:http';
import { runVerification } from '../src/services/analysisService.js';

const PORT = process.env.PORT || 8787;

const server = http.createServer(async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'VeriFact ID API', version: '3.0.0' }));
    return;
  }

  if (url.pathname === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Batasi ukuran request 1MB demi pertahanan DoS
      if (body.length > 1024 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const input = payload.input || '';

        const result = await runVerification(input);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON request' }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[VeriFact ID Server] Running at http://127.0.0.1:${PORT}`);
});

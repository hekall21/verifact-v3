/**
 * api/analyze.js
 *
 * Vercel Serverless Function — Verification & Analysis Endpoint
 */

import { runVerification } from '../src/services/analysisService.js';

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

    const input = body?.input || body?.claimText || '';
    if (!input || typeof input !== 'string') {
      res.status(400).json({ ok: false, error: 'Input is required' });
      return;
    }

    const result = await runVerification(input, null, {
      claimId: body?.claimId,
      existingVerification: body?.existingVerification,
    });
    res.status(200).json(result);
  } catch (err) {
    console.error('[API Analyze Error]', err);
    res.status(500).json({
      ok: false,
      error: err.message || 'Verification failed',
    });
  }
}

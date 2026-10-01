/**
 * api/health.js
 *
 * Vercel Serverless Function — Health Check
 */

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    service: 'VeriFact ID 4.2 Serverless',
    timestamp: new Date().toISOString(),
  });
}

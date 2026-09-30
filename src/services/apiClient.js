/**
 * src/services/apiClient.js
 *
 * VeriFact ID 4.2 — Defensive API Client
 *
 * Kebijakan Fallback Mutlak:
 * - TEXT INPUT: Fallback lokal diizinkan (analisis klaim teks, entitas, dan korpus).
 * - URL INPUT: DILARANG fake fallback! Jika backend retrieval gagal, laporkan
 *   SOURCE_RETRIEVAL_UNAVAILABLE secara jujur agar pengguna tidak tertipu
 *   seolah-olah artikel telah berhasil diverifikasi.
 */

import { parseUrl } from '../utils/urlDetector.js';

export async function postAnalyze(payload, options = {}) {
  const { signal, timeoutMs = 8000 } = options;
  const rawInput = payload?.input || payload?.claimText || '';
  const isUrlInput = parseUrl(rawInput).ok;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const mergedSignal = signal
    ? composeSignals(signal, controller.signal)
    : controller.signal;

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: mergedSignal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `Server responded with ${res.status}`,
        // URL input tidak boleh diam-diam fallback lokal seolah artikel terbaca
        fallbackToLocal: !isUrlInput,
        sourceRetrievalUnavailable: isUrlInput,
      };
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      ok: false,
      isTimeout: err.name === 'AbortError',
      error: err.message,
      // URL input tidak boleh pura-pura lolos verifikasi jika backend retrieval down
      fallbackToLocal: !isUrlInput,
      sourceRetrievalUnavailable: isUrlInput,
    };
  }
}

function composeSignals(s1, s2) {
  const c = new AbortController();
  const onAbort = () => c.abort();
  if (s1.aborted || s2.aborted) {
    c.abort();
    return c.signal;
  }
  s1.addEventListener('abort', onAbort, { once: true });
  s2.addEventListener('abort', onAbort, { once: true });
  return c.signal;
}

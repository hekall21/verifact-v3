/**
 * apiClient.js
 *
 * Client HTTP defensif untuk berkomunikasi dengan backend /api/analyze.
 * Memiliki timeout, penanganan pembatalan (AbortController), dan fallback mulus
 * jika backend offline tanpa membuat aplikasi macet.
 */

export async function postAnalyze(payload, options = {}) {
  const { signal, timeoutMs = 8000 } = options;

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
        fallbackToLocal: true,
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
      fallbackToLocal: true,
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

/**
 * i18n/index.js
 *
 * Helper terpusat untuk lokalisasi VeriFact ID 3.0.
 * Menyediakan akses kamus id & en, helper resolve dot notation, dan fallback aman.
 */

import id from './id.js';
import en from './en.js';

export const DICTIONARIES = { id, en };

export const DEFAULT_LANG = 'id';

/**
 * Mengambil teks berdasarkan path bertitik (mis. 'verifier.result.title').
 * Mendukung interpolasi parameter {key}.
 */
export function translate(lang = DEFAULT_LANG, path = '', params = {}) {
  const activeDict = DICTIONARIES[lang] || DICTIONARIES[DEFAULT_LANG];
  const fallbackDict = DICTIONARIES[DEFAULT_LANG];

  const keys = String(path).split('.');
  let val = activeDict;
  let fallbackVal = fallbackDict;

  for (const k of keys) {
    if (val && typeof val === 'object' && k in val) {
      val = val[k];
    } else {
      val = undefined;
    }

    if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
      fallbackVal = fallbackVal[k];
    } else {
      fallbackVal = undefined;
    }
  }

  const result = val !== undefined ? val : fallbackVal;

  if (typeof result !== 'string') {
    return result !== undefined ? result : path;
  }

  // Interpolasi {key} -> params[key]
  return result.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

/**
 * Alias singkat
 */
export const t = translate;

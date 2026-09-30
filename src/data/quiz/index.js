/**
 * src/data/quiz/index.js
 *
 * VeriFact ID 4.1 — Quiz Engine
 * Bank soal literasi siber 100+ pertanyaan (105 pertanyaan ID & 105 pertanyaan EN).
 * Menyediakan sesi kuis 5 soal acak per sesi menggunakan algoritma Fisher-Yates shuffle.
 * Mencegah duplikasi soal dalam satu sesi, masing-masing soal bernilai 20 poin (maks 100).
 */

import { phishingQuestions as phishingId } from './id/phishing.js';
import { scamQuestions as scamId } from './id/scam.js';
import { misinformationQuestions as misinformationId } from './id/misinformation.js';
import { cybersecurityQuestions as cybersecurityId } from './id/cybersecurity.js';
import { socialMediaQuestions as socialMediaId } from './id/socialMedia.js';
import { deepfakeQuestions as deepfakeId } from './id/deepfake.js';
import { criticalThinkingQuestions as criticalThinkingId } from './id/criticalThinking.js';

import { phishingQuestions as phishingEn } from './en/phishing.js';
import { scamQuestions as scamEn } from './en/scam.js';
import { misinformationQuestions as misinformationEn } from './en/misinformation.js';
import { cybersecurityQuestions as cybersecurityEn } from './en/cybersecurity.js';
import { socialMediaQuestions as socialMediaEn } from './en/socialMedia.js';
import { deepfakeQuestions as deepfakeEn } from './en/deepfake.js';
import { criticalThinkingQuestions as criticalThinkingEn } from './en/criticalThinking.js';

// Kumpulan seluruh soal bahasa Indonesia (105 soal)
export const questionsId = [
  ...phishingId,
  ...scamId,
  ...misinformationId,
  ...cybersecurityId,
  ...socialMediaId,
  ...deepfakeId,
  ...criticalThinkingId,
];

// Kumpulan seluruh soal bahasa Inggris (105 soal)
export const questionsEn = [
  ...phishingEn,
  ...scamEn,
  ...misinformationEn,
  ...cybersecurityEn,
  ...socialMediaEn,
  ...deepfakeEn,
  ...criticalThinkingEn,
];

/**
 * Mendapatkan seluruh daftar soal dalam bahasa tertentu.
 * @param {string} lang - 'id' atau 'en'
 * @returns {Array} Daftar seluruh pertanyaan
 */
export function getAllQuestions(lang = 'id') {
  return lang === 'en' ? questionsEn : questionsId;
}

/**
 * Algoritma Fisher-Yates Shuffle untuk pengacakan tanpa bias (unbiased permutation).
 * @param {Array} array - Array yang akan diacak
 * @returns {Array} Array baru yang telah diacak
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Membuat sesi kuis baru dengan 5 soal acak tanpa duplikasi.
 * Setiap soal bernilai 20 poin (total nilai maksimal 100).
 *
 * @param {string} lang - 'id' atau 'en'
 * @param {number} count - Jumlah soal per sesi (default: 5)
 * @returns {Array} Daftar soal untuk sesi kuis aktif
 */
export function createQuizSession(lang = 'id', count = 5) {
  const pool = getAllQuestions(lang);
  const shuffled = shuffleArray(pool);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Pastikan setiap opsi pilihan dalam soal juga diacak urutannya agar tidak statis
  return selected.map((q) => ({
    ...q,
    points: 20,
    options: shuffleArray(q.options),
  }));
}

// Objek kompatibilitas mundur
export const quizQuestions = {
  id: questionsId,
  en: questionsEn,
};

export default {
  getAllQuestions,
  createQuizSession,
  quizQuestions,
};

/**
 * LiteracyQuiz.jsx
 *
 * Kuis gamifikasi literasi siber 5 studi kasus riil (APK, Deepfake, Bansos Phishing, dsb.).
 * Dilengkapi pembahasan edukatif setelah setiap jawaban dipilih.
 */

import React, { useState } from 'react';
import { CheckCircleIcon, AlertOctagonIcon, RefreshIcon, AwardIcon } from '../common/Icons.jsx';
import { quizQuestions } from '../../data/mockData.js';
import { t } from '../../i18n/index.js';

export function LiteracyQuiz({ lang = 'id' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const questions = quizQuestions[lang] || quizQuestions.id;
  const currentQ = questions[currentIndex];

  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);
    if (opt.isCorrect) {
      setScore((prev) => prev + 20);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 vf-fade-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <span>Kuis Interaktif</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}>
          {t(lang, 'quiz.title')}
        </h2>
        <p className="text-xs sm:text-sm max-w-xl mx-auto" style={{ color: 'var(--vf-text-muted)' }}>
          {t(lang, 'quiz.subtitle')}
        </p>
      </div>

      {!isFinished ? (
        <div className="rounded-2xl p-6 sm:p-8 border shadow-lg space-y-6"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--vf-border)' }}>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
              {t(lang, 'quiz.questionCounter', { current: currentIndex + 1, total: questions.length })}
            </span>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Skor: {score} / 100
            </span>
          </div>

          {/* Question Title */}
          <h3 className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: 'var(--vf-text)' }}>
            {currentQ.q}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption === opt;
              let btnStyle = {
                backgroundColor: 'var(--vf-surface-muted)',
                borderColor: 'var(--vf-border)',
                color: 'var(--vf-text)',
              };

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnStyle = {
                    backgroundColor: 'color-mix(in srgb, var(--vf-fact) 15%, transparent)',
                    borderColor: 'var(--vf-fact)',
                    color: 'var(--vf-fact)',
                  };
                } else if (isSelected && !opt.isCorrect) {
                  btnStyle = {
                    backgroundColor: 'color-mix(in srgb, var(--vf-hoax) 15%, transparent)',
                    borderColor: 'var(--vf-hoax)',
                    color: 'var(--vf-hoax)',
                  };
                }
              }

              return (
                <button
                  key={opt.key}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 ${
                    !isAnswered ? 'hover:scale-[1.01] hover:shadow-sm' : ''
                  }`}
                  style={btnStyle}
                >
                  <span className="font-mono font-bold w-5 shrink-0">{opt.key}.</span>
                  <span className="flex-1">{opt.text}</span>
                  {isAnswered && opt.isCorrect && <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />}
                  {isAnswered && isSelected && !opt.isCorrect && <AlertOctagonIcon className="w-4 h-4 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="p-4 rounded-xl border bg-blue-500/5 border-blue-500/20 text-xs space-y-1.5 vf-fade-up">
              <span className="font-bold text-blue-600 dark:text-blue-400 block">
                {t(lang, 'quiz.explanationTitle')}
              </span>
              <p className="leading-relaxed" style={{ color: 'var(--vf-text-secondary)' }}>
                {currentQ.expl}
              </p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md hover:opacity-95"
                style={{ backgroundColor: 'var(--vf-primary)' }}
              >
                {currentIndex + 1 < questions.length ? t(lang, 'quiz.nextBtn') : 'Lihat Hasil Akhir'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Finished Results Screen */
        <div className="rounded-2xl p-8 border shadow-lg text-center space-y-4 vf-fade-up"
          style={{
            backgroundColor: 'var(--vf-surface)',
            borderColor: 'var(--vf-border)',
          }}
        >
          <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-emerald-500/10 text-emerald-500">
            <CheckCircleIcon className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold" style={{ color: 'var(--vf-text)' }}>
            {t(lang, 'quiz.congratsTitle')}
          </h3>

          <div className="py-2">
            <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--vf-text-muted)' }}>
              {t(lang, 'quiz.scoreLabel')}
            </span>
            <div className="text-4xl font-black font-mono mt-1" style={{ color: 'var(--vf-primary)' }}>
              {score} / 100
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white inline-flex items-center space-x-2 transition-all shadow-md hover:opacity-95"
            style={{ backgroundColor: 'var(--vf-primary)' }}
          >
            <RefreshIcon className="w-4 h-4" />
            <span>{t(lang, 'quiz.retryBtn')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

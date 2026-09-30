/**
 * App.jsx
 *
 * Shell aplikasi utama VeriFact ID 3.0.
 * Menghubungkan tema (Dark/Light), bahasa reaktif (ID/EN), tab navigasi,
 * orkestrasi verifikasi fakta, dan fitur pertahanan siber pendukung.
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar.jsx';
import { Footer } from './components/common/Footer.jsx';
import { VerifierInput } from './components/verifier/VerifierInput.jsx';
import { AnalysisProgress } from './components/verifier/AnalysisProgress.jsx';
import { VerificationResult } from './components/verifier/VerificationResult.jsx';
import { ScamShield } from './components/scam/ScamShield.jsx';
import { TrendingFeed } from './components/trending/TrendingFeed.jsx';
import { LiteracyQuiz } from './components/quiz/LiteracyQuiz.jsx';
import { DigitalLiteracy } from './components/literacy/DigitalLiteracy.jsx';
import { ReportHoax } from './components/report/ReportHoax.jsx';
import { MethodologyModal } from './components/methodology/MethodologyModal.jsx';
import { ShieldIcon, CheckCircleIcon, LinkIcon } from './components/common/Icons.jsx';
import { runVerification } from './services/analysisService.js';
import { t } from './i18n/index.js';

export function App() {
  const [activeTab, setActiveTab] = useState('verifier');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vf_theme') || 'dark';
  });
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('vf_lang') || 'id';
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [result, setResult] = useState(null);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Sinkronisasi kelas dark/light ke root HTML
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('vf_theme', theme);
  }, [theme]);

  // Simpan preferensi bahasa
  useEffect(() => {
    localStorage.setItem('vf_lang', lang);
  }, [lang]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'id' ? 'en' : 'id'));
  };

  const handleVerify = async (queryText, options = {}) => {
    const text = (queryText || input).trim();
    if (!text) return;

    setLoading(true);
    setResult(null);
    setCurrentStep(1);

    try {
      // Jalankan verifikasi dengan pembaruan progres bertahap dan opsi klaim bersama
      const res = await runVerification(text, (step) => {
        setCurrentStep(step);
      }, options);

      // Beri sedikit jeda visual pada langkah terakhir agar transisi terasa alami
      setTimeout(() => {
        setResult(res);
        setLoading(false);
      }, 350);
    } catch (err) {
      console.error('[Verification Error]', err);
      setLoading(false);
    }
  };

  const handleInspectClaim = (claimPayload) => {
    setActiveTab('verifier');
    const claimText = typeof claimPayload === 'string' ? claimPayload : claimPayload.claimText;
    const claimOptions = typeof claimPayload === 'object' ? claimPayload : {};
    setInput(claimText);
    handleVerify(claimText, claimOptions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setInput('');
    setResult(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200"
      style={{
        backgroundColor: 'var(--vf-bg)',
        color: 'var(--vf-text)',
      }}
    >
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenMethodology={() => setMethodologyOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {activeTab === 'verifier' && (
          <div className="space-y-8">
            {/* Hero Banner (hanya tampil saat belum ada hasil) */}
            {!result && !loading && (
              <div className="text-center space-y-4 max-w-3xl mx-auto py-6 sm:py-10 vf-fade-up">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--vf-primary) 12%, transparent)',
                    color: 'var(--vf-primary)',
                    border: '1px solid color-mix(in srgb, var(--vf-primary) 28%, transparent)',
                  }}
                >
                  <ShieldIcon className="w-3.5 h-3.5" />
                  <span>{t(lang, 'app.badge')}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)' }}
                >
                  {lang === 'id' ? (
                    <>
                      Periksa Informasi Sebelum <span style={{ color: 'var(--vf-primary)' }}>Percaya</span>
                    </>
                  ) : (
                    <>
                      Verify Information Before You <span style={{ color: 'var(--vf-primary)' }}>Trust</span>
                    </>
                  )}
                </h1>

                <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--vf-text-secondary)' }}>
                  {t(lang, 'verifier.subtitle')}
                </p>

                {/* Feature Value Highlights */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span>7 Kategori Status Transparan</span>
                  </span>
                  <span className="opacity-40">&bull;</span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span>Hierarki Otoritas Tier 1-3</span>
                  </span>
                  <span className="opacity-40">&bull;</span>
                  <span className="flex items-center space-x-1.5 font-medium">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    <span>Tingkat Keyakinan Terhitung</span>
                  </span>
                </div>
              </div>
            )}

            {/* Input Component */}
            <VerifierInput
              input={input}
              setInput={setInput}
              onVerify={handleVerify}
              loading={loading}
              lang={lang}
              onClear={handleClear}
            />

            {/* Loading Progress State */}
            {loading && (
              <AnalysisProgress currentStep={currentStep} lang={lang} />
            )}

            {/* Verification Result Report */}
            {result && !loading && (
              <VerificationResult
                result={result}
                onReset={handleClear}
                lang={lang}
              />
            )}
          </div>
        )}

        {/* Tab 2: Scam Shield */}
        {activeTab === 'scamShield' && (
          <ScamShield lang={lang} />
        )}

        {/* Tab 3: Trending Feed */}
        {activeTab === 'trending' && (
          <TrendingFeed lang={lang} onInspectClaim={handleInspectClaim} />
        )}

        {/* Tab 4: Literacy Quiz */}
        {activeTab === 'quiz' && (
          <LiteracyQuiz lang={lang} />
        )}

        {/* Tab 5: Critical Digital Literacy Guide */}
        {activeTab === 'literacy' && (
          <DigitalLiteracy lang={lang} />
        )}

        {/* Tab 6: Report Hoax Form */}
        {activeTab === 'report' && (
          <ReportHoax lang={lang} />
        )}
      </main>

      {/* Footer */}
      <Footer lang={lang} onOpenMethodology={() => setMethodologyOpen(true)} />

      {/* Methodology & Ethics Modal */}
      <MethodologyModal
        isOpen={methodologyOpen}
        onClose={() => setMethodologyOpen(false)}
        lang={lang}
      />
    </div>
  );
}
export default App;

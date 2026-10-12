/**
 * src/App.jsx
 *
 * Shell aplikasi utama VeriFact ID 5.0.
 * Research + Fact Verification + Scam Analysis + Source Intelligence + Security Education Engine.
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
import { OfficialReportingHub } from './components/report/OfficialReportingHub.jsx';
import { MethodologyModal } from './components/methodology/MethodologyModal.jsx';
import { VeriFactLogo, VeriFactEmblem } from './components/common/VeriFactLogo.jsx';
import { ShieldIcon, CheckCircleIcon } from './components/common/Icons.jsx';
import { runVerification } from './services/analysisService.js';
import { getGeminiApiKey, runGeminiAgentAnalysis } from './services/geminiAgentService.js';
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
  const [currentState, setCurrentState] = useState('');
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
    setCurrentState('classifying');

    try {
      const res = await runVerification(
        text,
        (step, stateObj) => {
          setCurrentStep(step);
          if (stateObj?.state) setCurrentState(stateObj.state);
        },
        options
      );

      // Jika API Key Google AI Studio tersedia & AI Agent aktif: jalankan analisis mendalam otomatis
      const apiKey = getGeminiApiKey();
      const aiEnabled = localStorage.getItem('vf_ai_agent_enabled') !== 'false';
      if (apiKey && aiEnabled && res && res.ok && res.verdict !== 'NEWS_HOMEPAGE_DETECTED' && res.verdict !== 'IDENTIFIED_SOURCE') {
        try {
          setCurrentStep(
            lang === 'id'
              ? 'Sedang menjalankan analisis forensik semantik mendalam...'
              : 'Running deep semantic forensic analysis...'
          );
          const aiResult = await runGeminiAgentAnalysis({
            inputType: res.inputType,
            subType: res.subType,
            text: res.textToAnalyze || res.claim?.mainClaim || text,
            url: res.sourceAssessment?.url || res.url,
            articleMetadata: {
              title: res.claim?.mainClaim || res.sourceAssessment?.title,
              publisher: res.sourceAssessment?.publisher || res.sourceAssessment?.domain,
              domain: res.sourceAssessment?.domain,
              author: res.sourceAssessment?.author,
              publishedAt: res.sourceAssessment?.publishedAt,
            },
            mainClaim: res.claim?.mainClaim,
            atomicClaims: res.atomicClaims || [],
            existingVerdict: res.verdict,
            lang,
          });
          if (aiResult && aiResult.ok) {
            res.geminiAgent = aiResult;
            res.presentationSummary = {
              ...(res.presentationSummary || {}),
              aiVerdict: aiResult.agentVerdict,
              aiConfidence: aiResult.confidenceScore,
              aiHeadline: aiResult.verdictHeadline,
              aiSummary: aiResult.executiveSummary,
              aiModel: aiResult.modelUsed,
            };
          }
        } catch (aiErr) {
          console.warn('[App] Auto Gemini Agent analysis skipped or failed:', aiErr);
        }
      }

      // Jeda visual halus agar transisi tahap selesai terasa mulus
      setTimeout(() => {
        setResult(res);
        setLoading(false);
      }, 300);
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
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-200 vf-grid-bg"
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
            {/* Hero Section */}
            {!result && !loading && (
              <div className="text-center space-y-5 max-w-3xl mx-auto py-8 sm:py-12 vf-fade-up">
                {/* Hero Minimal Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold border shadow-xs"
                  style={{
                    backgroundColor: 'var(--vf-surface)',
                    borderColor: 'var(--vf-border)',
                    color: 'var(--vf-text-secondary)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] uppercase tracking-wider">
                    {t(lang, 'app.badge')} &bull; Evidence Intelligence Engine
                  </span>
                </div>

                <h1
                  className="text-4xl sm:text-6xl font-extrabold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--vf-text)', lineHeight: 1.1 }}
                >
                  {lang === 'id' ? (
                    <>
                      Verifikasi Informasi. <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-400">
                        Sebelum Percaya.
                      </span>
                    </>
                  ) : (
                    <>
                      Verify Information. <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-400">
                        Before You Trust.
                      </span>
                    </>
                  )}
                </h1>

                <p
                  className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
                  style={{ color: 'var(--vf-text-secondary)' }}
                >
                  {lang === 'id'
                    ? 'Periksa artikel berita, tautan digital, pesan berantai, dan ancaman penipuan online dengan bukti fakta terbuka yang objektif dan terverifikasi.'
                    : 'Audit news articles, digital links, scam messages, and cyber fraud indicators objectively with verified open-source evidence.'}
                </p>

                {/* Trust Highlights */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs" style={{ color: 'var(--vf-text-muted)' }}>
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg border"
                    style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Hierarki Otoritas Tier 1-3</span>
                  </span>
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg border"
                    style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Multi-Strategy Extractor</span>
                  </span>
                  <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg border"
                    style={{ backgroundColor: 'var(--vf-surface)', borderColor: 'var(--vf-border)' }}
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5 text-sky-500" />
                    <span>Keyakinan Terhitung Transparan</span>
                  </span>
                </div>
              </div>
            )}

            {/* Input Component (§34) */}
            <VerifierInput
              input={input}
              setInput={setInput}
              onVerify={handleVerify}
              loading={loading}
              lang={lang}
              onClear={handleClear}
            />

            {/* Loading Pipeline State (§5) */}
            {loading && (
              <AnalysisProgress currentStep={currentStep} currentState={currentState} lang={lang} />
            )}

            {/* Verification Result Report (§35) */}
            {result && !loading && (
              <VerificationResult
                result={result}
                onReset={handleClear}
                onRetry={() => handleVerify(input)}
                lang={lang}
              />
            )}
          </div>
        )}

        {/* Tab 2: Scam Shield (4 Engines + Demo Mode) */}
        {activeTab === 'scamShield' && (
          <ScamShield lang={lang} />
        )}

        {/* Tab 3: Trending Claims Feed */}
        {activeTab === 'trending' && (
          <TrendingFeed lang={lang} onInspectClaim={handleInspectClaim} />
        )}

        {/* Tab 4: Literacy Quiz (5 Unique per Session) */}
        {activeTab === 'quiz' && (
          <LiteracyQuiz lang={lang} />
        )}

        {/* Tab 5: Critical Digital Literacy Guide */}
        {activeTab === 'literacy' && (
          <DigitalLiteracy lang={lang} />
        )}

        {/* Tab 6: Official Reporting Hub (§2 & §29) */}
        {activeTab === 'report' && (
          <OfficialReportingHub lang={lang} />
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

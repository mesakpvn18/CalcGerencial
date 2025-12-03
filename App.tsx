
import React, { useState, useEffect, useRef } from 'react';
import { FinancialInputs, CalculationMode, CalculationResult, HistoryItem, Language } from './types';
import { calculateFinancials } from './utils/calculations';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import HistoryModal from './components/HistoryModal';
import EducationalGuide from './components/EducationalGuide';
import CurrencyTicker from './components/CurrencyTicker';
import AuthModal from './components/AuthModal';
// NOVOS MODAIS
import UpgradeModal from './components/UpgradeModal';
import ScenarioComparison from './components/ScenarioComparison';
import GoalSeekModal from './components/GoalSeekModal';

import { Moon, Sun, Clock, Share2, Check, BookOpen, DownloadCloud, DollarSign, Globe, LogIn, Settings, ChevronDown, User, Crown } from 'lucide-react';
import { translations } from './utils/translations';
import { getUser, signOut, saveSimulation, getSimulations, deleteSimulation } from './services/supabase';

const DEFAULT_INPUTS: FinancialInputs = {
  CP: 25.00,
  TxF: 1.50,
  TxP: 4.99,
  CF: 1500.00,
  Marketing: 0, 
  Churn: 0,     
  PVS: 89.90,
  Meta: 100,
  MLL_D: 20
};

const MAX_HISTORY_ITEMS = 50; 

function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('theme') === 'dark' || 
               (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      } catch {
        return false;
      }
    }
    return false;
  });

  // Currency & Language State
  const [currency, setCurrency] = useState<string>('BRL');
  const [language, setLanguage] = useState<Language>('pt');
  
  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Load translations based on current language
  const t = translations[language];

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isPro, setIsPro] = useState(false); // NOVO
  
  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false); // NOVO
  const [isCompareOpen, setIsCompareOpen] = useState(false); // NOVO
  const [isGoalOpen, setIsGoalOpen] = useState(false); // NOVO
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('calc_history');
        const parsed = saved && saved !== "undefined" ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY_ITEMS) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // App State - Initialize from URL or Default
  const [mode, setMode] = useState<CalculationMode>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.protocol === 'blob:') return CalculationMode.DIRECT;
        const params = new URLSearchParams(window.location.search);
        const urlMode = params.get('mode');
        if (urlMode && Object.values(CalculationMode).includes(urlMode as CalculationMode)) {
          return urlMode as CalculationMode;
        }
      } catch (e) {
        return CalculationMode.DIRECT;
      }
    }
    return CalculationMode.DIRECT;
  });

  const [inputs, setInputs] = useState<FinancialInputs>(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.protocol === 'blob:') return DEFAULT_INPUTS;
        const params = new URLSearchParams(window.location.search);
        if (params.has('CP') || params.has('PVS')) {
          const safeParse = (val: string | null) => val ? parseFloat(val) : 0;
          return {
            CP: safeParse(params.get('CP')),
            TxF: safeParse(params.get('TxF')),
            TxP: safeParse(params.get('TxP')),
            CF: safeParse(params.get('CF')),
            Marketing: safeParse(params.get('Marketing')),
            Churn: safeParse(params.get('Churn')),
            PVS: safeParse(params.get('PVS')),
            Meta: safeParse(params.get('Meta')),
            MLL_D: safeParse(params.get('MLL_D')),
          };
        }
      } catch (e) {
        return DEFAULT_INPUTS;
      }
    }
    return DEFAULT_INPUTS;
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Check User Session on Mount
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = await getUser();
      if (currentUser) {
        setUser(currentUser);
        setIsPro(!!currentUser.is_pro); // Carrega status PRO
        loadCloudHistory(currentUser.id);
      }
    };
    checkUser();
  }, []);

  const loadCloudHistory = async (userId: string) => {
    try {
      const cloudData = await getSimulations(userId);
      setHistory(cloudData);
    } catch (e) {
      console.error("Erro ao carregar histórico da nuvem", e);
    }
  };

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {}
  }, [isDarkMode]);

  // Click outside to close settings
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Sync LocalStorage only if NOT logged in
  useEffect(() => {
    if (!user) {
      const timeoutId = setTimeout(() => {
        try {
          localStorage.setItem('calc_history', JSON.stringify(history));
        } catch (e) {
          console.warn("Não foi possível salvar histórico local.");
        }
      }, 800); 
      return () => clearTimeout(timeoutId);
    }
  }, [history, user]);

  useEffect(() => {
    try {
      const calc = calculateFinancials(mode, inputs);
      setResult(calc);
    } catch (e) {
      console.error("Erro crítico no cálculo:", e);
    }

    try {
      if (typeof window !== 'undefined' && window.location.protocol === 'blob:') {
        return;
      }
      const params = new URLSearchParams();
      params.set('mode', mode);
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !isNaN(Number(value))) {
          params.set(key, value.toString());
        }
      });
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e) {}
  }, [inputs, mode]);

  const handleReset = () => {
    setInputs({ CP: undefined, TxF: undefined, TxP: undefined, CF: undefined, Marketing: undefined, Churn: undefined, PVS: undefined, Meta: undefined, MLL_D: undefined });
    setMode(CalculationMode.DIRECT);
  };

  const handleShare = () => {
    try {
      const params = new URLSearchParams();
      params.set('mode', mode);
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null && !isNaN(Number(value))) {
          params.set(key, value.toString());
        }
      });
      let baseUrl = window.location.href.split('?')[0];
      if (window.location.protocol === 'blob:') {
        baseUrl = window.location.origin + window.location.pathname;
      }
      const shareUrl = `${baseUrl}?${params.toString()}`;
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      alert("Não foi possível copiar o link automaticamente.");
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleSaveHistory = async () => {
    if (result && result.isValid) {
      let newItem: HistoryItem = {
        id: Date.now().toString(), // Temp ID
        timestamp: Date.now(),
        mode,
        inputs: { ...inputs },
        result: { ...result },
        currency: currency,
        language: language,
        isCloud: !!user
      };

      if (user) {
        try {
          const savedData = await saveSimulation(newItem, user.id);
          if (savedData) {
            newItem = { ...newItem, id: savedData.id, isCloud: true };
          }
        } catch (e) {
          console.error("Erro ao salvar na nuvem:", e);
          alert("Erro ao salvar na nuvem.");
          newItem.isCloud = false;
        }
      } 

      setHistory(prev => {
        const updatedHistory = [newItem, ...prev];
        return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
      });
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setInputs(item.inputs);
    setMode(item.mode);
    if(item.currency) setCurrency(item.currency);
    if(item.language) setLanguage(item.language);
  };

  const handleDeleteHistory = async (id: string) => {
    if (user) {
      try {
        await deleteSimulation(id);
      } catch (e) {
        console.error("Erro ao deletar da nuvem", e);
      }
    }
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setIsPro(false);
    setHistory([]); 
  };

  // Helper para controlar recursos Pro
  const handleProAction = (action: () => void) => {
    if (!isPro) {
      setIsUpgradeOpen(true);
    } else {
      action();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 print:bg-white print:block overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm/50 transition-colors no-print print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="bg-[#1C3A5B] dark:bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-[#1C3A5B]/20 dark:shadow-blue-900/30 transition-colors">
               <DollarSign size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none whitespace-nowrap">
                FinCalc <span className="text-[#1C3A5B] dark:text-blue-400 hidden xs:inline">Digital</span>
                {isPro && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 uppercase font-bold align-top">PRO</span>}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5 hidden md:block">{t.app.subtitle}</p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-1.5 sm:gap-3">
             
             {/* Botão Upgrade (Se não for Pro) */}
             {!isPro && (
                <button 
                  onClick={() => setIsUpgradeOpen(true)}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-200 to-yellow-400 text-amber-900 text-xs font-bold rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105"
                >
                  <Crown size={14} fill="currentColor" /> Upgrade
                </button>
             )}

             {/* Settings Dropdown (Language & Currency) */}
             <div className="relative" ref={settingsRef}>
               <button 
                 onClick={() => setShowSettings(!showSettings)}
                 className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${showSettings ? 'bg-slate-100 dark:bg-slate-800 text-[#1C3A5B]' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                 title="Ajustes (Idioma/Moeda)"
               >
                 <Settings size={20} />
                 {/* Mostra info apenas em telas maiores */}
                 <span className="text-[10px] font-bold hidden sm:inline-block">{language.toUpperCase()} / {currency}</span>
               </button>

               {/* Dropdown Menu */}
               {showSettings && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Idioma</p>
                      <div className="flex gap-1 mb-4">
                        <button onClick={() => { setLanguage('pt'); setShowSettings(false); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${language === 'pt' ? 'bg-[#1C3A5B] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>PT</button>
                        <button onClick={() => { setLanguage('en'); setShowSettings(false); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${language === 'en' ? 'bg-[#1C3A5B] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>EN</button>
                      </div>
                      
                      <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-3"></div>

                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Moeda</p>
                      <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => { setCurrency('BRL'); setShowSettings(false); }} className={`py-1.5 text-xs font-bold rounded-md ${currency === 'BRL' ? 'bg-[#1C3A5B] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>R$</button>
                        <button onClick={() => { setCurrency('USD'); setShowSettings(false); }} className={`py-1.5 text-xs font-bold rounded-md ${currency === 'USD' ? 'bg-[#1C3A5B] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>$</button>
                        <button onClick={() => { setCurrency('EUR'); setShowSettings(false); }} className={`py-1.5 text-xs font-bold rounded-md ${currency === 'EUR' ? 'bg-[#1C3A5B] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>€</button>
                      </div>
                    </div>
                 </div>
               )}
             </div>

             <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>

             {/* Action Buttons */}
             {deferredPrompt && (
               <button onClick={handleInstallClick} className="p-2 text-[#1C3A5B] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title={t.app.install}>
                 <DownloadCloud size={20} />
               </button>
             )}

             <button onClick={() => setIsGuideOpen(true)} className="p-2 text-[#1C3A5B] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title={t.app.guide}>
               <BookOpen size={20} />
             </button>

             <button onClick={handleShare} className={`p-2 rounded-lg transition-all ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`} title={t.app.share}>
               {isCopied ? <Check size={20} /> : <Share2 size={20} />}
             </button>

             <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" title={t.app.history}>
               <Clock size={20} />
               {history.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>}
             </button>
             
             {/* Auth & Theme */}
             {user ? (
               <button onClick={handleLogout} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Sair">
                 <LogIn size={20} className="rotate-180" />
               </button>
             ) : (
                <button onClick={() => setIsAuthOpen(true)} className="p-2 text-[#1C3A5B] hover:bg-blue-50 rounded-lg transition-colors" title="Entrar">
                  <LogIn size={20} />
                </button>
             )}

             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block" title="Tema">
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
          </div>
        </div>
      </header>

      {/* Currency Ticker */}
      <CurrencyTicker language={language} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:w-full print:max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start print:block">
          
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-36 z-30 no-print print:hidden">
             <InputSection 
               inputs={inputs} 
               setInputs={setInputs} 
               mode={mode} 
               setMode={setMode} 
               onReset={handleReset}
               currency={currency}
               language={language}
               isPro={isPro}
               onCompare={() => handleProAction(() => setIsCompareOpen(true))}
               onGoalSeek={() => handleProAction(() => setIsGoalOpen(true))}
             />
          </div>

          <div className="lg:col-span-8 xl:col-span-9 w-full print:w-full">
            {result ? (
              <ResultsSection 
                result={result} 
                inputs={inputs}
                mode={mode}
                onSaveHistory={handleSaveHistory}
                isDarkMode={isDarkMode}
                currency={currency}
                language={language}
                user={user}
                isPro={isPro}
                onOpenAuth={() => setIsAuthOpen(true)}
                onOpenUpgrade={() => setIsUpgradeOpen(true)}
              />
            ) : (
              <div className="h-96 flex items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                {t.app.loading}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="py-8 mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors no-print print:hidden">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 dark:text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} FinCalc Digital. <span className="opacity-60">{t.app.footer}</span></p>
         </div>
      </footer>

      <HistoryModal 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onLoad={handleLoadHistory}
        onDelete={handleDeleteHistory}
        onClearAll={() => setHistory([])}
        language={language}
      />

      <EducationalGuide 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)}
        language={language}
      />

      <AuthModal 
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => { setUser(u); loadCloudHistory(u.id); setIsPro(!!u.is_pro); }}
        language={language}
      />

      {/* NOVOS MODAIS */}
      <UpgradeModal 
        isOpen={isUpgradeOpen} 
        onClose={() => setIsUpgradeOpen(false)} 
        userId={user?.id}
        onUpgradeSuccess={() => setIsPro(true)}
        language={language}
      />
      
      <ScenarioComparison 
        isOpen={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)} 
        currentInputs={inputs}
        currency={currency}
        language={language === 'pt' ? 'pt-BR' : 'en-US'}
      />

      <GoalSeekModal 
        isOpen={isGoalOpen} 
        onClose={() => setIsGoalOpen(false)} 
        currentInputs={inputs}
        currency={currency}
        language={language === 'pt' ? 'pt-BR' : 'en-US'}
      />

    </div>
  );
}

export default App;

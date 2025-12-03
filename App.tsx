import React, { useState, useEffect } from 'react';
import { FinancialInputs, CalculationMode, CalculationResult, HistoryItem, Language } from './types';
import { calculateFinancials } from './utils/calculations';
import InputSection from './components/InputSection';
import ResultsSection from './components/ResultsSection';
import HistoryModal from './components/HistoryModal';
import EducationalGuide from './components/EducationalGuide';
import CurrencyTicker from './components/CurrencyTicker';
import AuthModal from './components/AuthModal';
import { Moon, Sun, Clock, Share2, Check, BookOpen, DownloadCloud, DollarSign, Globe, LogIn } from 'lucide-react';
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

  // Load translations based on current language
  const t = translations[language];

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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
        // Load cloud history
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

      // Se logado, salva no Supabase
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
      // Não salva localmente se não estiver logado (bloqueado na UI, mas proteção extra aqui)
      // A UI deve impedir chegar aqui sem user, mas se chegar, salvamos localmente como fallback
      // ou retornamos. Como a UI bloqueia, assumimos aqui a lógica de inserção no estado.

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
    setHistory([]); // Limpa histórico da tela
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 print:bg-white print:block">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm/50 transition-colors no-print print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#1C3A5B] dark:bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-[#1C3A5B]/20 dark:shadow-blue-900/30 transition-colors">
               <DollarSign size={20} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">FinCalc <span className="text-[#1C3A5B] dark:text-blue-400">Digital</span></h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5 hidden sm:block">{t.app.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             {/* Language & Currency Toggles */}
             <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-1 gap-1">
                {/* Language Toggle */}
                <button
                   onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                   className="px-2 py-1 text-[10px] font-bold rounded-md transition-all text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1 min-w-[40px] justify-center"
                   title="Mudar Idioma / Change Language"
                >
                   <Globe size={12} /> {language.toUpperCase()}
                </button>
                <div className="w-px h-3 bg-slate-300 dark:bg-slate-600"></div>
                {/* Currency Toggle */}
                <button
                    onClick={() => setCurrency('BRL')}
                    className={`px-1.5 py-1 text-[10px] font-bold rounded-md transition-all ${currency === 'BRL' ? 'bg-white dark:bg-slate-600 text-[#1C3A5B] dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    R$
                  </button>
                  <button
                    onClick={() => setCurrency('USD')}
                    className={`px-1.5 py-1 text-[10px] font-bold rounded-md transition-all ${currency === 'USD' ? 'bg-white dark:bg-slate-600 text-[#1C3A5B] dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    $
                  </button>
                   <button
                    onClick={() => setCurrency('EUR')}
                    className={`px-1.5 py-1 text-[10px] font-bold rounded-md transition-all ${currency === 'EUR' ? 'bg-white dark:bg-slate-600 text-[#1C3A5B] dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  >
                    €
                  </button>
             </div>

             {deferredPrompt && (
               <button onClick={handleInstallClick} className="p-2 text-[#1C3A5B] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-2 group animate-in fade-in" title={t.app.install}>
                 <DownloadCloud size={20} />
                 <span className="hidden lg:inline text-xs font-bold">{t.app.install}</span>
               </button>
             )}

             <button onClick={() => setIsGuideOpen(true)} className="p-2 text-[#1C3A5B] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors flex items-center gap-2 group" title={t.app.guide}>
               <BookOpen size={20} />
               <span className="hidden lg:inline text-xs font-bold">{t.app.guide}</span>
             </button>

             <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

             <button onClick={handleShare} className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isCopied ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`} title={t.app.share}>
               {isCopied ? <Check size={18} /> : <Share2 size={18} />}
               <span className="hidden lg:inline">{isCopied ? t.app.copied : t.app.share}</span>
             </button>

             <button onClick={() => setIsHistoryOpen(true)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative" title={t.app.history}>
               <Clock size={20} />
               {history.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>}
             </button>
             
             {/* User Auth Button */}
             {user ? (
               <div className="flex items-center gap-2">
                 <button onClick={handleLogout} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-xs font-bold">
                   Sair
                 </button>
               </div>
             ) : (
                <button onClick={() => setIsAuthOpen(true)} className="p-2 text-[#1C3A5B] hover:bg-blue-50 rounded-lg transition-colors" title="Entrar / Criar Conta">
                  <LogIn size={20} />
                </button>
             )}

             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title={isDarkMode ? "Modo Claro" : "Modo Escuro"}>
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
                onOpenAuth={() => setIsAuthOpen(true)}
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
        onLoginSuccess={(u) => { setUser(u); loadCloudHistory(u.id); }}
        language={language}
      />
    </div>
  );
}

export default App;
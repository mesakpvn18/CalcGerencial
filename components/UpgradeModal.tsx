
import React, { useState } from 'react';
import { X, Check, Zap, Star, ShieldCheck, TrendingUp, BrainCircuit } from 'lucide-react';
import { upgradeUserToPro } from '../services/supabase';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onUpgradeSuccess: () => void;
  language: Language;
}

const UpgradeModal: React.FC<Props> = ({ isOpen, onClose, userId, onUpgradeSuccess, language }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!userId) {
        alert("Faça login primeiro.");
        return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await upgradeUserToPro(userId);
      onUpgradeSuccess();
      onClose();
    } catch (e) {
      alert("Erro ao processar upgrade.");
    } finally {
      setLoading(false);
    }
  };

  const t = language === 'pt' ? {
    title: "Desbloqueie o Poder Total",
    subtitle: "Tome decisões financeiras com precisão profissional.",
    free: "Grátis",
    pro: "PRO",
    month: "/mês",
    popular: "MAIS POPULAR",
    features: {
      ai: "Análise de IA Avançada",
      compare: "Comparador de Cenários A/B",
      goals: "Buscador de Metas (Goal Seek)",
      cloud: "Salvar na Nuvem",
      noAds: "Sem Anúncios"
    },
    btnFree: "Plano Atual",
    btnPro: "Assinar Agora"
  } : {
    title: "Unlock Full Power",
    subtitle: "Make financial decisions with professional precision.",
    free: "Free",
    pro: "PRO",
    month: "/mo",
    popular: "MOST POPULAR",
    features: {
      ai: "Advanced AI Analysis",
      compare: "A/B Scenario Comparison",
      goals: "Goal Seeker",
      cloud: "Cloud Save",
      noAds: "No Ads"
    },
    btnFree: "Current Plan",
    btnPro: "Upgrade Now"
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-pulse duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10">
          <X size={24} />
        </button>

        <div className="md:w-2/5 bg-[#1C3A5B] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 text-yellow-400">
              <Star size={28} fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold mb-4">{t.title}</h2>
            <p className="text-blue-100 leading-relaxed">{t.subtitle}</p>
          </div>
        </div>

        <div className="md:w-3/5 p-8 bg-slate-50 dark:bg-slate-950 overflow-y-auto max-h-[80vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white dark:bg-slate-900 flex flex-col">
              <h3 className="text-lg font-bold text-slate-500">{t.free}</h3>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">R$ 0</div>
              <button disabled className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-lg cursor-default">
                {t.btnFree}
              </button>
            </div>
            <div className="border-2 border-[#1C3A5B] dark:border-blue-500 rounded-xl p-6 bg-white dark:bg-slate-900 flex flex-col relative shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1C3A5B] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">
                {t.popular}
              </div>
              <h3 className="text-lg font-bold text-[#1C3A5B] dark:text-blue-400">{t.pro}</h3>
              <div className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                R$ 29,90<span className="text-sm font-medium text-slate-400">{t.month}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300 flex-1">
                <li className="flex items-center gap-2 font-semibold"><BrainCircuit size={16} className="text-indigo-500" /> {t.features.ai}</li>
                <li className="flex items-center gap-2 font-semibold"><TrendingUp size={16} className="text-emerald-500" /> {t.features.compare}</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-[#1C3A5B]" /> {t.features.goals}</li>
                <li className="flex items-center gap-2"><Check size={16} className="text-[#1C3A5B]" /> {t.features.cloud}</li>
                <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#1C3A5B]" /> {t.features.noAds}</li>
              </ul>
              <button 
                onClick={handleUpgrade}
                disabled={loading}
                className="mt-6 w-full py-2 bg-[#1C3A5B] hover:bg-blue-800 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Zap size={16} className="animate-spin"/> : <Zap size={16} fill="currentColor"/>}
                {loading ? 'Processando...' : t.btnPro}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

export default UpgradeModal;

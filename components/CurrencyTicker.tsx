
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, RefreshCcw, DollarSign, Euro } from 'lucide-react';
import { Language } from '../types';

interface Rate {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

interface APIResponse {
  USDBRL: Rate;
  EURBRL: Rate;
  EURUSD: Rate;
}

interface Props {
  language: Language;
}

const CurrencyTicker: React.FC<Props> = ({ language }) => {
  const [rates, setRates] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRates = async () => {
    try {
      setLoading(true);
      // Busca Dólar-Real, Euro-Real e Euro-Dólar
      const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,EUR-USD');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const data: APIResponse = await response.json();
      setRates(data);
      setLastUpdate(new Date());
      setError(false);
    } catch (err) {
      console.error("Erro ao buscar cotações:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    // Atualiza a cada 60 segundos
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  if (error) return null; // Se der erro, simplesmente não mostra a barra para não poluir

  // Helper para renderizar um item de cotação
  const renderRateItem = (rate: Rate | undefined, label: string, icon: React.ReactNode) => {
    if (!rate) return null;
    
    const value = parseFloat(rate.bid);
    const variation = parseFloat(rate.pctChange);
    const isPositive = variation >= 0;

    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-800/50 rounded-lg border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm min-w-[140px] justify-between">
        <div className="flex items-center gap-2">
          <div className="text-slate-500 dark:text-slate-400">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-none">{label}</span>
            <span className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {value.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>
        </div>
        <div className={`flex items-center text-xs font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {isPositive ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
          {Math.abs(variation).toFixed(2)}%
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
        
        {loading && !rates ? (
          <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
            <RefreshCcw size={12} className="animate-spin" />
            {language === 'pt' ? 'Atualizando cotações...' : 'Updating rates...'}
          </div>
        ) : (
          <div className="flex items-center gap-2 w-full overflow-x-auto scrollbar-hide py-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-2 whitespace-nowrap hidden sm:inline-block">
               {language === 'pt' ? 'Mercado Agora:' : 'Market Now:'}
            </span>
            
            {/* USD / BRL */}
            {renderRateItem(rates?.USDBRL, 'USD/BRL', <DollarSign size={14} />)}
            
            {/* EUR / BRL */}
            {renderRateItem(rates?.EURBRL, 'EUR/BRL', <Euro size={14} />)}
            
            {/* EUR / USD (Paridade) */}
            {renderRateItem(rates?.EURUSD, 'EUR/USD', <div className="flex text-[10px]"><Euro size={10} /><DollarSign size={10} /></div>)}

            {lastUpdate && (
               <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap hidden lg:block">
                 {language === 'pt' ? 'Atualizado:' : 'Updated:'} {lastUpdate.toLocaleTimeString()}
               </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyTicker;

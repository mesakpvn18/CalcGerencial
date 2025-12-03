
import React, { useState } from 'react';
import { FinancialInputs, CalculationMode } from '../types';
import { calculateFinancials, formatCurrency } from '../utils/calculations';
import { X, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: FinancialInputs;
  currency: string;
  language: string;
}

const GoalSeekModal: React.FC<Props> = ({ isOpen, onClose, currentInputs, currency, language }) => {
  const [targetProfit, setTargetProfit] = useState<number>(10000);
  const [seekMode, setSeekMode] = useState<'price' | 'volume'>('volume');
  
  if (!isOpen) return null;

  const calculateGoal = () => {
    const CF_Total = (currentInputs.CF || 0) + (currentInputs.Marketing || 0);
    const TotalNeeded = targetProfit + CF_Total; 

    if (seekMode === 'volume') {
      const result = calculateFinancials(CalculationMode.DIRECT, currentInputs);
      const MC_Unit = result.MC_Real;
      if (MC_Unit <= 0) return { error: "Margem de contribuição atual é zero ou negativa." };
      const requiredVolume = Math.ceil(TotalNeeded / MC_Unit);
      return { required: requiredVolume, label: "Vendas Necessárias", unit: "unidades" };
    } else {
      const volume = currentInputs.Meta || 1;
      const requiredMC = TotalNeeded / volume;
      const CP = currentInputs.CP || 0;
      const TxF = currentInputs.TxF || 0;
      const TxP = (currentInputs.TxP || 0) / 100;
      const denominator = 1 - TxP;
      if (denominator <= 0) return { error: "Taxas variáveis excedem 100%." };
      const requiredPrice = (requiredMC + CP + TxF) / denominator;
      return { required: requiredPrice, label: "Preço Necessário", unit: currency };
    }
  };

  const result = calculateGoal();
  const fmt = (val: number) => formatCurrency(val, currency, language);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-pulse">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Target className="text-white" /> Buscador de Metas</h2>
          <button onClick={onClose}><X className="text-white/70 hover:text-white" /></button>
        </div>
        <div className="p-6 space-y-6">
           <div>
             <label className="block text-sm font-bold text-slate-500 mb-2">Quanto você quer lucrar (Líquido)?</label>
             <div className="relative">
               <input type="number" value={targetProfit} onChange={e => setTargetProfit(parseFloat(e.target.value))} className="w-full p-3 pl-10 rounded-xl border-2 border-indigo-100 dark:border-slate-700 dark:bg-slate-800 text-xl font-bold text-indigo-600 focus:border-indigo-500 outline-none" />
               <span className="absolute left-3 top-3.5 text-indigo-300 font-bold text-lg">{currency === 'BRL' ? 'R$' : '$'}</span>
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">O que devemos ajustar?</label>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
               <button onClick={() => setSeekMode('volume')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${seekMode === 'volume' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Volume de Vendas</button>
               <button onClick={() => setSeekMode('price')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${seekMode === 'price' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Preço de Venda</button>
             </div>
           </div>
           <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-800">
              {/* @ts-ignore */}
              {result.error ? <p className="text-red-500 font-bold">{result.error}</p> : <><p className="text-xs text-slate-400 uppercase font-bold mb-1">{result.label}</p><p className="text-3xl font-extrabold text-slate-800 dark:text-white">{/* @ts-ignore */}{seekMode === 'price' ? fmt(result.required) : Math.ceil(result.required)}<span className="text-sm text-slate-400 ml-1 font-normal">{result.unit}</span></p></>}
           </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSeekModal;

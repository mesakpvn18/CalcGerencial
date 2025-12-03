
import React, { useState, useEffect } from 'react';
import { FinancialInputs, CalculationMode } from '../types';
import { calculateFinancials, formatCurrency, formatPercent } from '../utils/calculations';
import { X, Target, ArrowRight, Check, AlertCircle, Percent, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: FinancialInputs;
  onApply: (newInputs: FinancialInputs) => void;
  currency: string;
  language: string;
}

const GoalSeekModal: React.FC<Props> = ({ isOpen, onClose, currentInputs, onApply, currency, language }) => {
  const [targetType, setTargetType] = useState<'value' | 'percent'>('value'); // Meta em Valor ($) ou Margem (%)
  const [targetValue, setTargetValue] = useState<number>(10000); // Valor numérico alvo
  const [seekMode, setSeekMode] = useState<'price' | 'volume'>('volume'); // O que ajustar?
  
  // Resetar valores ao abrir
  useEffect(() => {
    if (isOpen) {
       // Tentar estimar um valor razoável para começar
       const result = calculateFinancials(CalculationMode.DIRECT, currentInputs);
       if (targetType === 'value') {
          setTargetValue(result.LL > 0 ? Math.ceil(result.LL * 1.2) : 1000);
       } else {
          setTargetValue(Math.ceil((result.MLL_Real || 10) + 5));
       }
    }
  }, [isOpen, targetType]);

  if (!isOpen) return null;

  const calculateGoal = () => {
    const CP = currentInputs.CP || 0;
    const TxF = currentInputs.TxF || 0;
    const TxP = (currentInputs.TxP || 0) / 100;
    const CF_Total = (currentInputs.CF || 0) + (currentInputs.Marketing || 0);

    let required = 0;
    let delta = 0;
    let error = '';

    try {
        if (targetType === 'value') {
             // META: VALOR MONETÁRIO (LUCRO LÍQUIDO)
             const TargetLL = targetValue;
             const TotalNeeded = TargetLL + CF_Total; // Receita - CustosVar

             if (seekMode === 'volume') {
                // Buscar VOLUME para atingir Lucro $
                const result = calculateFinancials(CalculationMode.DIRECT, currentInputs);
                const MC_Unit = result.MC_Real;
                if (MC_Unit <= 0) throw "Margem de contribuição atual é zero ou negativa. Aumente o preço.";
                
                required = Math.ceil(TotalNeeded / MC_Unit);
                delta = required - (currentInputs.Meta || 0);
             } else {
                // Buscar PREÇO para atingir Lucro $ (com Volume fixo)
                const volume = currentInputs.Meta || 1;
                // LL = (P * Q) - (CV_Un * Q) - CF_Total
                // LL + CF_Total = Q * (P - (CP + TxF + P*TxP))
                // (LL + CF_Total) / Q = P * (1 - TxP) - (CP + TxF)
                // P * (1 - TxP) = ((LL + CF_Total) / Q) + (CP + TxF)
                // P = (((LL + CF_Total) / Q) + (CP + TxF)) / (1 - TxP)
                
                const numerator = (TotalNeeded / volume) + (CP + TxF);
                const denominator = 1 - TxP;
                if (denominator <= 0) throw "Taxas variáveis excedem 100%.";
                
                required = numerator / denominator;
                delta = required - (currentInputs.PVS || 0);
             }

        } else {
            // META: MARGEM LÍQUIDA (%)
            const TargetMargin = targetValue / 100;
            if (TargetMargin >= (1 - TxP)) throw "Margem impossível com as taxas atuais.";

            if (seekMode === 'volume') {
               // Buscar VOLUME para atingir Margem %
               // LL / Revenue = Margin
               // (Revenue - VarCosts - FixCosts) / Revenue = Margin
               // 1 - (VarCosts/Rev) - (FixCosts/Rev) = Margin
               // FixCosts/Rev = 1 - (VarCosts/Rev) - Margin
               // Rev = FixCosts / (1 - (VarCosts/Rev) - Margin)
               // Rev = P * Q.   VarCosts/Rev = (CV_Un * Q) / (P * Q) = CV_Un / P ??? Não, CV varia com preço se tem taxa %
               
               // MC_Relativa = (P - CP - TxF - P*TxP) / P  = 1 - TxP - ((CP+TxF)/P)
               // Margin = MC_Relativa - (CF_Total / Revenue)
               // Margin = (1 - TxP - (CP+TxF)/P) - (CF_Total / (P*Q))
               // CF_Total / (P*Q) = 1 - TxP - (CP+TxF)/P - Margin
               // Q = CF_Total / (P * (1 - TxP - Margin) - (CP + TxF))
               
               const P = currentInputs.PVS || 0;
               if (P <= 0) throw "Defina um preço inicial maior que zero.";
               
               const denominator = P * (1 - TxP - TargetMargin) - (CP + TxF);
               if (denominator <= 0) throw "Margem inatingível com este preço. O custo variável unitário é muito alto.";
               
               required = Math.ceil(CF_Total / denominator);
               delta = required - (currentInputs.Meta || 0);

            } else {
                // Buscar PREÇO para atingir Margem % (com Volume fixo)
                // P = (Costs + Profit)
                // Profit = P * Q * Margin
                // Rev = TotalCosts / (1 - Margin) ?? Mais complexo com taxas
                // LL = Revenue * Margin
                // Rev * Margin = Rev - VarCosts - FixCosts
                // Rev * (1 - Margin) = VarCosts + FixCosts
                // P*Q * (1 - Margin) = (Q * (CP + TxF + P*TxP)) + CF_Total
                // P*Q*(1-Margin) - P*Q*TxP = Q*(CP+TxF) + CF_Total
                // P * Q * (1 - Margin - TxP) = Q*(CP+TxF) + CF_Total
                // P = (Q*(CP+TxF) + CF_Total) / (Q * (1 - Margin - TxP))
                
                const volume = currentInputs.Meta || 1;
                const numerator = (volume * (CP + TxF)) + CF_Total;
                const denominator = volume * (1 - TxP - TargetMargin);
                
                if (denominator <= 0) throw "Margem impossível. A soma de Taxas + Margem Desejada excede 100%.";
                
                required = numerator / denominator;
                delta = required - (currentInputs.PVS || 0);
            }
        }
    } catch (e: any) {
        error = typeof e === 'string' ? e : "Erro no cálculo.";
    }

    return { required, delta, error };
  };

  const result = calculateGoal();
  const fmt = (val: number) => formatCurrency(val, currency, language);
  const fmtP = (val: number) => formatPercent(val, language);

  const handleApply = () => {
     if (result.error) return;
     
     const updates: FinancialInputs = {};
     if (seekMode === 'volume') {
         updates.Meta = result.required;
     } else {
         updates.PVS = result.required;
     }
     onApply(updates);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-indigo-600">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="text-white" /> Buscador de Metas
            </h2>
            <p className="text-xs text-indigo-100 opacity-80 mt-0.5">Defina onde quer chegar e descubra o caminho.</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           
           {/* Step 1: Define Target Type */}
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">1. Qual é o seu objetivo?</label>
             <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg mb-3">
               <button onClick={() => setTargetType('value')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${targetType === 'value' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}><DollarSign size={14}/> Lucro Monetário</button>
               <button onClick={() => setTargetType('percent')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2 ${targetType === 'percent' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}><Percent size={14}/> Margem (%)</button>
             </div>
             
             <div className="relative">
               <input 
                 type="number" 
                 value={targetValue} 
                 onChange={e => setTargetValue(parseFloat(e.target.value))} 
                 className="w-full p-4 pl-12 rounded-xl border-2 border-indigo-100 dark:border-slate-700 dark:bg-slate-950 text-2xl font-bold text-indigo-600 dark:text-indigo-400 focus:border-indigo-500 outline-none transition-colors" 
               />
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300">
                  {targetType === 'value' ? <span className="font-bold text-xl">{currency === 'BRL' ? 'R$' : '$'}</span> : <Percent size={20} />}
               </div>
             </div>
           </div>

           {/* Step 2: Define Variable */}
           <div>
             <label className="block text-xs font-bold text-slate-400 uppercase mb-2">2. O que podemos ajustar?</label>
             <div className="grid grid-cols-2 gap-3">
               <button 
                  onClick={() => setSeekMode('volume')} 
                  className={`p-3 rounded-xl border-2 text-left transition-all ${seekMode === 'volume' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'}`}
               >
                  <span className={`block text-xs font-bold mb-1 ${seekMode === 'volume' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Volume de Vendas</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Calcular Meta (Qtd)</span>
               </button>
               
               <button 
                  onClick={() => setSeekMode('price')} 
                  className={`p-3 rounded-xl border-2 text-left transition-all ${seekMode === 'price' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300'}`}
               >
                  <span className={`block text-xs font-bold mb-1 ${seekMode === 'price' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>Preço de Venda</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Calcular Preço (PVS)</span>
               </button>
             </div>
           </div>

           {/* Result Area */}
           <div className={`p-6 rounded-2xl text-center border transition-all ${result.error ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
              {result.error ? (
                  <div className="flex flex-col items-center text-red-500 dark:text-red-400">
                     <AlertCircle size={32} className="mb-2" />
                     <p className="font-bold text-sm">{result.error}</p>
                  </div>
              ) : (
                  <>
                     <p className="text-xs text-slate-400 uppercase font-bold mb-2">
                        {seekMode === 'volume' ? 'Você precisará vender' : 'Seu preço deve ser'}
                     </p>
                     
                     <div className="text-4xl font-extrabold text-slate-800 dark:text-white mb-2 tracking-tight">
                        {seekMode === 'price' ? fmt(result.required) : Math.ceil(result.required)}
                        <span className="text-lg text-slate-400 ml-1 font-medium">{seekMode === 'volume' ? 'un' : ''}</span>
                     </div>

                     {/* Delta / Diferença */}
                     <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${result.delta > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {result.delta > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {result.delta > 0 ? '+' : ''}{seekMode === 'price' ? fmt(result.delta) : Math.ceil(result.delta)} {seekMode === 'volume' ? 'un' : ''} 
                        <span className="opacity-70 ml-1">vs atual</span>
                     </div>
                  </>
              )}
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button 
             onClick={handleApply}
             disabled={!!result.error}
             className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <Check size={18} /> Aplicar ao Simulador
          </button>
        </div>

      </div>
    </div>
  );
};

export default GoalSeekModal;

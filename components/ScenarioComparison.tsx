
import React, { useState } from 'react';
import { FinancialInputs, CalculationMode } from '../types';
import { calculateFinancials, formatCurrency } from '../utils/calculations';
import { X, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentInputs: FinancialInputs;
  currency: string;
  language: string;
}

const ScenarioComparison: React.FC<Props> = ({ isOpen, onClose, currentInputs, currency, language }) => {
  if (!isOpen) return null;

  const [inputsB, setInputsB] = useState<FinancialInputs>({ ...currentInputs });
  
  const resultA = calculateFinancials(CalculationMode.DIRECT, currentInputs);
  const resultB = calculateFinancials(CalculationMode.DIRECT, inputsB);

  const diff = resultB.LL - resultA.LL;
  const diffPercent = resultA.LL !== 0 ? (diff / Math.abs(resultA.LL)) * 100 : 0;

  const handleChangeB = (name: keyof FinancialInputs, val: number) => {
    setInputsB(prev => ({ ...prev, [name]: val }));
  };

  const fmt = (val: number) => formatCurrency(val, currency, language);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-pulse">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="text-indigo-500" /> Comparador de Cenários
            </h2>
            <p className="text-sm text-slate-500">Simule alterações e veja o impacto no lucro lado a lado.</p>
          </div>
          <button onClick={onClose}><X className="text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4 opacity-70 pointer-events-none">
              <h3 className="font-bold text-slate-500 uppercase text-xs tracking-wider border-b pb-2">Cenário A (Atual)</h3>
              <DisplayField label="Preço (PVS)" value={fmt(resultA.PVS)} />
              <DisplayField label="Volume (Meta)" value={resultA.Meta} />
              <DisplayField label="Custo Produto" value={fmt(currentInputs.CP || 0)} />
              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <span className="text-xs text-slate-500 block">Lucro Líquido A</span>
                <span className="text-xl font-bold text-slate-800 dark:text-white">{fmt(resultA.LL)}</span>
              </div>
            </div>

            <div className="space-y-4 border-x border-slate-100 dark:border-slate-800 px-4 md:px-8">
              <h3 className="font-bold text-indigo-500 uppercase text-xs tracking-wider border-b pb-2">Cenário B (Simulado)</h3>
              <InputField label="Preço (PVS)" value={inputsB.PVS} onChange={v => handleChangeB('PVS', v)} currency={currency} />
              <InputField label="Volume (Meta)" value={inputsB.Meta} onChange={v => handleChangeB('Meta', v)} />
              <InputField label="Custo Produto" value={inputsB.CP} onChange={v => handleChangeB('CP', v)} currency={currency} />
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <span className="text-xs text-indigo-600 dark:text-indigo-400 block">Lucro Líquido B</span>
                <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{fmt(resultB.LL)}</span>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center text-center space-y-6">
               <h3 className="font-bold text-slate-800 dark:text-white uppercase text-xs tracking-wider">Veredito</h3>
               <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 ${diff >= 0 ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-red-100 bg-red-50 text-red-600'}`}>
                  <div>
                    {diff >= 0 ? <TrendingUp size={32} className="mx-auto mb-1"/> : <TrendingDown size={32} className="mx-auto mb-1"/>}
                    <span className="font-bold text-xl">{diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(1)}%</span>
                  </div>
               </div>
               <div>
                 <p className="text-sm text-slate-500">Diferença Financeira</p>
                 <p className={`text-2xl font-bold ${diff >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{diff > 0 ? '+' : ''}{fmt(diff)}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DisplayField = ({ label, value }: any) => (
  <div className="flex justify-between text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-bold text-slate-700 dark:text-slate-300">{value}</span>
  </div>
);

const InputField = ({ label, value, onChange, currency }: any) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
    <div className="relative">
      <input type="number" value={value || ''} onChange={e => onChange(parseFloat(e.target.value))} className="w-full p-2 pl-8 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"/>
      {currency && <span className="absolute left-2 top-2 text-xs font-bold text-slate-400">{currency === 'BRL' ? 'R$' : '$'}</span>}
    </div>
  </div>
);

export default ScenarioComparison;

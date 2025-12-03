
import React, { useState } from 'react';
import { FinancialInputs, CalculationMode, Language, Period } from '../types';
import { Calculator, Target, BarChart2, Info, DollarSign, Percent, Hash, Briefcase, RotateCcw, AlertCircle, TrendingDown, Megaphone, FolderOpen, Zap, Euro, ArrowRightLeft, Lock, CalendarClock } from 'lucide-react';
import { translations } from '../utils/translations';
import AdUnit from './AdUnit';

interface Props {
  inputs: FinancialInputs;
  setInputs: React.Dispatch<React.SetStateAction<FinancialInputs>>;
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  onReset: () => void;
  currency: string;
  language: Language;
  isPro?: boolean;
  period: Period; // Novo
  setPeriod: (p: Period) => void; // Novo
  onCompare?: () => void;
  onGoalSeek?: () => void;
}

const InputSection: React.FC<Props> = ({ inputs, setInputs, mode, setMode, onReset, currency, language, isPro, period, setPeriod, onCompare, onGoalSeek }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(false);
  
  const t = translations[language];

  const getCurrencyIcon = () => {
    if (currency === 'EUR') return <Euro size={14} />;
    return <span className="text-xs font-bold text-slate-400 w-3.5 text-center">{currency === 'BRL' ? 'R$' : '$'}</span>;
  };

  const validateField = (name: string, value: number) => {
    let error = '';
    if (isNaN(value)) return ''; 
    if (value < 0) error = t.inputs.errors.negative;
    if (name === 'TxP' && value > 100) error = t.inputs.errors.max100;
    if (name === 'MLL_D' && value >= 100) error = t.inputs.errors.max100;
    if (name === 'Churn' && value > 100) error = t.inputs.errors.max100;
    return error;
  };

  const handleValueChange = (name: string, value: number | undefined) => {
    const error = validateField(name, value ?? 0); 
    setErrors(prev => ({ ...prev, [name]: error }));
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const loadTemplate = (type: 'saas' | 'infoproduto' | 'ecommerce') => {
    let template: FinancialInputs = {};
    switch(type) {
      case 'saas':
        template = { CP: 0, CF: 3500, TxF: 0.50, TxP: 3.99, Marketing: 2000, Churn: 5.0, PVS: 49.90, Meta: 300, MLL_D: 30 };
        break;
      case 'infoproduto':
        template = { CP: 0, CF: 1000, TxF: 2.00, TxP: 9.90, Marketing: 5000, Churn: 2.0, PVS: 197.00, Meta: 100, MLL_D: 40 };
        break;
      case 'ecommerce':
        template = { CP: 45.00, CF: 2000, TxF: 0.00, TxP: 12.00, Marketing: 1500, Churn: 0, PVS: 129.90, Meta: 150, MLL_D: 15 };
        break;
    }
    setInputs(template);
    setMode(CalculationMode.DIRECT);
    setPeriod('monthly'); // Reset to monthly for templates
    setShowTemplates(false);
  };

  const ModeButton = ({ targetMode, icon: Icon, label }: { targetMode: CalculationMode, icon: any, label: string }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`flex-1 py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 border-2 ${
        mode === targetMode
          ? 'bg-[#1C3A5B] border-[#1C3A5B] text-white shadow-md shadow-[#1C3A5B]/20 dark:bg-blue-600 dark:border-blue-600 dark:shadow-blue-900/40'
          : 'bg-white border-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200'
      }`}
    >
      <Icon size={18} strokeWidth={mode === targetMode ? 2.5 : 2} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="bg-[#F0F4F8] dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden transition-colors">
      <div className="p-5 border-b border-slate-200/60 dark:border-slate-700 bg-[#F0F4F8] dark:bg-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#333333] dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="text-[#1C3A5B] dark:text-blue-400" size={20} />
            {t.inputs.title}
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowTemplates(!showTemplates)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors">
                <FolderOpen size={14} /> <span className="hidden sm:inline">{t.inputs.templates}</span>
              </button>
              {showTemplates && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                      <button onClick={() => loadTemplate('saas')} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"><Zap size={14} className="text-blue-500"/> SaaS / Assinatura</button>
                      <button onClick={() => loadTemplate('infoproduto')} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"><Zap size={14} className="text-purple-500"/> Infoproduto / Curso</button>
                      <button onClick={() => loadTemplate('ecommerce')} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"><Zap size={14} className="text-emerald-500"/> E-commerce / Drop</button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button onClick={onReset} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 p-2 rounded-lg transition-all active:scale-95"><RotateCcw size={16} /></button>
          </div>
        </div>
        
        {/* Period Selector */}
        <div className="mb-4 bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
           <span className="text-xs font-bold text-slate-500 ml-2 flex items-center gap-2"><CalendarClock size={14}/> {t.inputs.period.label}</span>
           <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === 'monthly' ? 'bg-[#1C3A5B] text-white shadow' : 'text-slate-500'}`}>{t.inputs.period.monthly}</button>
              <button onClick={() => setPeriod('yearly')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${period === 'yearly' ? 'bg-[#1C3A5B] text-white shadow' : 'text-slate-500'}`}>{t.inputs.period.yearly}</button>
           </div>
        </div>

        <div className="bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-xl flex gap-1">
          <ModeButton targetMode={CalculationMode.DIRECT} icon={Calculator} label={t.inputs.modes.direct} />
          <ModeButton targetMode={CalculationMode.TARGET_PRICE} icon={Target} label={t.inputs.modes.price} />
          <ModeButton targetMode={CalculationMode.TARGET_VOLUME} icon={BarChart2} label={t.inputs.modes.meta} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
        <div className="bg-blue-50 dark:bg-blue-900/20 text-[#1C3A5B] dark:text-blue-300 p-3 rounded-lg text-xs border border-blue-100 dark:border-blue-800 mb-6 flex gap-2 items-start shadow-sm">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <p>{mode === CalculationMode.DIRECT && t.inputs.context.direct}{mode === CalculationMode.TARGET_PRICE && t.inputs.context.price}{mode === CalculationMode.TARGET_VOLUME && t.inputs.context.meta}</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>{t.inputs.sections.costs}<span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span></h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label={t.inputs.labels.cp} name="CP" value={inputs.CP} onValueChange={handleValueChange} icon={getCurrencyIcon()} placeholder="0,00" error={errors.CP} type="currency" language={language} currency={currency}/>
                 <InputGroup label={t.inputs.labels.cf} name="CF" value={inputs.CF} onValueChange={handleValueChange} icon={getCurrencyIcon()} placeholder="0,00" error={errors.CF} type="currency" language={language} currency={currency}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label={t.inputs.labels.txf} name="TxF" value={inputs.TxF} onValueChange={handleValueChange} icon={getCurrencyIcon()} placeholder={t.inputs.placeholders.gateway} error={errors.TxF} type="currency" language={language} currency={currency}/>
                 <InputGroup label={t.inputs.labels.txp} name="TxP" value={inputs.TxP} onValueChange={handleValueChange} icon={<Percent size={14} />} placeholder="0,00" isSuffix error={errors.TxP} type="percent" language={language} currency={currency}/>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <InputGroup label={t.inputs.labels.marketing} name="Marketing" value={inputs.Marketing} onValueChange={handleValueChange} icon={<Megaphone size={14} />} placeholder={t.inputs.placeholders.ads} error={errors.Marketing} type="currency" language={language} currency={currency}/>
              </div>
            </div>
          </section>

          <section>
             <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>{t.inputs.sections.scenario}<span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span></h3>
            <div className="space-y-4">
               {mode !== CalculationMode.TARGET_PRICE && <InputGroup label={t.inputs.labels.pvs} name="PVS" value={inputs.PVS} onValueChange={handleValueChange} icon={getCurrencyIcon()} placeholder={t.inputs.placeholders.price} highlight error={errors.PVS} type="currency" language={language} currency={currency}/>}
               {mode !== CalculationMode.TARGET_VOLUME && <InputGroup label={t.inputs.labels.meta} name="Meta" value={inputs.Meta} onValueChange={handleValueChange} icon={<Hash size={14} />} placeholder={t.inputs.placeholders.units} highlight error={errors.Meta} type="integer" language={language} currency={currency}/>}
               <InputGroup label={t.inputs.labels.churn} name="Churn" value={inputs.Churn} onValueChange={handleValueChange} icon={<TrendingDown size={14} />} placeholder="0,00" isSuffix error={errors.Churn} type="percent" language={language} currency={currency}/>
               {mode !== CalculationMode.DIRECT && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 transition-all hover:shadow-md shadow-sm">
                     <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center justify-between"><span className="flex items-center gap-1.5"><Target size={14} className="text-indigo-600 dark:text-indigo-400"/> {t.inputs.labels.mll_d}</span></label>
                     <div className="relative group"><MaskedInput name="MLL_D" value={inputs.MLL_D} onValueChange={(val) => handleValueChange("MLL_D", val)} placeholder="0,00" type="percent" language={language} currency={currency} className={`block w-full rounded-lg border pl-3 pr-10 py-2.5 font-bold focus:ring-4 outline-none sm:text-sm bg-white dark:bg-slate-950 transition-shadow group-hover:border-indigo-300 dark:group-hover:border-indigo-700 ${errors.MLL_D ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-200' : 'border-indigo-200 dark:border-indigo-900 text-[#333333] dark:text-slate-100 focus:border-[#1C3A5B] dark:focus:border-blue-500 focus:ring-[#1C3A5B]/10 dark:focus:ring-blue-500/20'}`} /><div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-indigo-400 text-sm font-bold">%</span></div></div>
                     {errors.MLL_D && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.MLL_D}</p>}
                  </div>
               )}
            </div>
          </section>

          {/* ADVANCED FEATURES (PRO) */}
          <section>
             <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2"><span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>Avançado<span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span></h3>
            <div className="space-y-3">
              <button onClick={onCompare} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                 <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"><ArrowRightLeft size={16} className="text-indigo-500"/> Comparar Cenários</span>
                 {!isPro && <Lock size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors"/>}
              </button>
              <button onClick={onGoalSeek} className="w-full flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
                 <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"><Target size={16} className="text-indigo-500"/> Buscador de Metas</span>
                 {!isPro && <Lock size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors"/>}
              </button>
            </div>
          </section>

          {/* AD UNIT */}
          {!isPro && (
            <section className="no-print">
               <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">Publicidade</span>
                  <AdUnit slotId="1234567890" format="rectangle" testMode={true} />
               </div>
            </section>
          )}
        </div>
      </div>
      <div className="p-4 bg-[#F0F4F8] dark:bg-slate-800 border-t border-slate-200/60 dark:border-slate-700 text-[10px] text-center text-slate-400 dark:text-slate-500 transition-colors">{t.inputs.hints.fill}</div>
    </div>
  );
};

const MaskedInput = ({ name, value, onValueChange, placeholder, type = 'currency', language, currency, className }: { name: string, value?: number, onValueChange: (val: number | undefined) => void, placeholder: string, type: 'currency' | 'percent' | 'integer', language: Language, currency: string, className: string }) => {
  const getLocale = () => {
    if (currency === 'USD') return 'en-US';
    if (currency === 'BRL' || currency === 'EUR') return 'pt-BR';
    return language === 'pt' ? 'pt-BR' : 'en-US';
  };
  const formatDisplay = (val: number | undefined) => {
    if (val === undefined || val === null) return '';
    if (type === 'integer') return val.toString();
    return val.toLocaleString(getLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value;
    const digits = raw.replace(/\D/g, '');
    if (!digits) { onValueChange(undefined); return; }
    const numberValue = parseInt(digits, 10);
    if (type === 'integer') { onValueChange(numberValue); } else { onValueChange(numberValue / 100); }
  };
  return <input type="text" inputMode="numeric" name={name} value={formatDisplay(value)} onChange={handleChange} className={className} placeholder={placeholder} autoComplete="off" />;
};

const InputGroup = ({ label, name, value, onValueChange, icon, placeholder, isSuffix = false, highlight = false, error, type = 'currency', language, currency }: any) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-0.5">{label}</label>
    <div className="relative group">
      <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1C3A5B] dark:group-focus-within:text-blue-400'}`}>{!isSuffix && icon}</div>
      <MaskedInput name={name} value={value} onValueChange={(val) => onValueChange(name, val)} placeholder={placeholder} type={type} language={language} currency={currency} className={`block w-full rounded-lg py-2.5 ${isSuffix ? 'pl-3 pr-8' : 'pl-9 pr-3'} font-semibold bg-white dark:bg-slate-950 transition-all sm:text-sm shadow-sm outline-none border ${error ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:border-red-900/50 dark:focus:ring-red-900/20' : highlight ? 'border-blue-300 dark:border-blue-900 text-[#333333] dark:text-slate-100 focus:border-[#1C3A5B] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#1C3A5B]/10 dark:focus:ring-blue-500/20' : 'border-slate-300 dark:border-slate-700 text-[#333333] dark:text-slate-100 focus:border-[#1C3A5B] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#1C3A5B]/10 dark:focus:ring-blue-500/20 hover:border-slate-400 dark:hover:border-slate-600'}`}/>
      {isSuffix && <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1C3A5B] dark:group-focus-within:text-blue-400'}`}>{icon}</div>}
    </div>
    {error && <p className="text-[10px] text-red-500 mt-1 ml-0.5 flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle size={10} /> {error}</p>}
  </div>
);

export default InputSection;

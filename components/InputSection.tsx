
import React, { useState } from 'react';
import { FinancialInputs, CalculationMode } from '../types';
import { Calculator, Target, BarChart2, Info, DollarSign, Percent, Hash, Briefcase, RotateCcw, AlertCircle, TrendingDown, Megaphone, FolderOpen, Zap } from 'lucide-react';

interface Props {
  inputs: FinancialInputs;
  setInputs: React.Dispatch<React.SetStateAction<FinancialInputs>>;
  mode: CalculationMode;
  setMode: (mode: CalculationMode) => void;
  onReset: () => void;
}

const InputSection: React.FC<Props> = ({ inputs, setInputs, mode, setMode, onReset }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTemplates, setShowTemplates] = useState(false);

  const validateField = (name: string, value: number) => {
    let error = '';
    
    if (isNaN(value)) {
       return ''; 
    }
    
    if (value < 0) {
       error = 'O valor não pode ser negativo';
    }

    // Specific rules
    if (name === 'TxP' && value > 100) error = 'A taxa não pode exceder 100%';
    if (name === 'MLL_D' && value >= 100) error = 'A margem deve ser menor que 100%';
    if (name === 'Churn' && value > 100) error = 'Churn não pode exceder 100%';

    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const numValue = value === '' ? undefined : parseFloat(value);
    
    const error = validateField(name, numValue ?? 0); 
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    setInputs(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const loadTemplate = (type: 'saas' | 'infoproduto' | 'ecommerce') => {
    let template: FinancialInputs = {};
    
    switch(type) {
      case 'saas':
        template = {
          CP: 0, // Software tem custo marginal zero
          CF: 3500, // Servidores + Equipe
          TxF: 0.50, // Gateway
          TxP: 3.99, // Taxa %
          Marketing: 2000,
          Churn: 5.0, // Churn aceitável B2C
          PVS: 49.90, // Assinatura mensal
          Meta: 300,
          MLL_D: 30
        };
        break;
      case 'infoproduto':
        template = {
          CP: 0,
          CF: 1000, // Ferramentas
          TxF: 2.00, // Hotmart/Eduzz (exemplo)
          TxP: 9.90, // Taxa plataforma
          Marketing: 5000, // Tráfego pago pesado
          Churn: 2.0, // Reembolso
          PVS: 197.00,
          Meta: 100,
          MLL_D: 40
        };
        break;
      case 'ecommerce':
        template = {
          CP: 45.00, // Custo da mercadoria
          CF: 2000,
          TxF: 0.00,
          TxP: 12.00, // Taxas Marketplace + Imposto Simples
          Marketing: 1500,
          Churn: 0, // Não se aplica tanto
          PVS: 129.90,
          Meta: 150,
          MLL_D: 15
        };
        break;
    }
    
    setInputs(template);
    setMode(CalculationMode.DIRECT);
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
      
      {/* Header & Mode Selector */}
      <div className="p-5 border-b border-slate-200/60 dark:border-slate-700 bg-[#F0F4F8] dark:bg-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#333333] dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="text-[#1C3A5B] dark:text-blue-400" size={20} />
            Parâmetros
          </h2>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg text-xs font-bold transition-colors"
                title="Carregar cenários prontos"
              >
                <FolderOpen size={14} /> <span className="hidden sm:inline">Modelos</span>
              </button>
              
              {showTemplates && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTemplates(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 space-y-1">
                      <button onClick={() => loadTemplate('saas')} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Zap size={14} className="text-blue-500"/> SaaS / Assinatura
                      </button>
                      <button onClick={() => loadTemplate('infoproduto')} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Zap size={14} className="text-purple-500"/> Infoproduto / Curso
                      </button>
                      <button onClick={() => loadTemplate('ecommerce')} className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Zap size={14} className="text-emerald-500"/> E-commerce / Drop
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={onReset}
              title="Limpar campos"
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-700 p-2 rounded-lg transition-all active:scale-95"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
        
        <div className="bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-xl flex gap-1">
          <ModeButton targetMode={CalculationMode.DIRECT} icon={Calculator} label="Direto" />
          <ModeButton targetMode={CalculationMode.TARGET_PRICE} icon={Target} label="Preço" />
          <ModeButton targetMode={CalculationMode.TARGET_VOLUME} icon={BarChart2} label="Meta" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-600">
        
        {/* Context Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 text-[#1C3A5B] dark:text-blue-300 p-3 rounded-lg text-xs border border-blue-100 dark:border-blue-800 mb-6 flex gap-2 items-start shadow-sm">
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <p>
            {mode === CalculationMode.DIRECT && "Simule o resultado financeiro baseado no preço e volume atuais."}
            {mode === CalculationMode.TARGET_PRICE && "Calcule o preço ideal (PVS) para atingir sua meta de lucro."}
            {mode === CalculationMode.TARGET_VOLUME && "Calcule quantas vendas são necessárias para sua meta de lucro."}
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Section: Costs */}
          <section>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>
              Custos e Despesas
              <span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup 
                    label="Custo Produto (CP)" 
                    name="CP" 
                    value={inputs.CP} 
                    onChange={handleChange} 
                    icon={<DollarSign size={14} />} 
                    placeholder="0.00"
                    error={errors.CP}
                  />
                  <InputGroup 
                    label="Custo Fixo (CF)" 
                    name="CF" 
                    value={inputs.CF} 
                    onChange={handleChange} 
                    icon={<DollarSign size={14} />} 
                    placeholder="0.00"
                    error={errors.CF}
                  />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <InputGroup 
                    label="Taxa Fixa (TxF)" 
                    name="TxF" 
                    value={inputs.TxF} 
                    onChange={handleChange} 
                    icon={<DollarSign size={14} />} 
                    placeholder="Gateway"
                    error={errors.TxF}
                  />
                  <InputGroup 
                    label="Taxa % (TxP)" 
                    name="TxP" 
                    value={inputs.TxP} 
                    onChange={handleChange} 
                    icon={<Percent size={14} />} 
                    placeholder="Imposto"
                    isPercentage
                    error={errors.TxP}
                  />
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <InputGroup 
                    label="Marketing Invest. (Mensal)" 
                    name="Marketing" 
                    value={inputs.Marketing} 
                    onChange={handleChange} 
                    icon={<Megaphone size={14} />} 
                    placeholder="Ads/Divulgação"
                    error={errors.Marketing}
                  />
              </div>
            </div>
          </section>

          {/* Section: Variables */}
          <section>
             <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>
              Cenário e Vendas
              <span className="w-full h-px bg-slate-200 dark:bg-slate-700"></span>
            </h3>

            <div className="space-y-4">
               {mode !== CalculationMode.TARGET_PRICE && (
                  <InputGroup 
                    label="Preço Venda (PVS)" 
                    name="PVS" 
                    value={inputs.PVS} 
                    onChange={handleChange} 
                    icon={<DollarSign size={14} />} 
                    placeholder="Valor para cliente"
                    highlight
                    error={errors.PVS}
                  />
               )}

               {mode !== CalculationMode.TARGET_VOLUME && (
                  <InputGroup 
                    label="Meta de Vendas (Qtd)" 
                    name="Meta" 
                    value={inputs.Meta} 
                    onChange={handleChange} 
                    icon={<Hash size={14} />} 
                    placeholder="Unidades/mês"
                    highlight
                    error={errors.Meta}
                  />
               )}

               <InputGroup 
                    label="Churn (Cancelamento)" 
                    name="Churn" 
                    value={inputs.Churn} 
                    onChange={handleChange} 
                    icon={<TrendingDown size={14} />} 
                    placeholder="Taxa % mensal"
                    isPercentage
                    error={errors.Churn}
               />

               {mode !== CalculationMode.DIRECT && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900 transition-all hover:shadow-md shadow-sm">
                     <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center justify-between">
                       <span className="flex items-center gap-1.5"><Target size={14} className="text-indigo-600 dark:text-indigo-400"/> Margem Líquida Desejada</span>
                     </label>
                     <div className="relative group">
                      <input
                        type="number"
                        name="MLL_D"
                        // Mostra vazio se for undefined ou null
                        value={inputs.MLL_D ?? ''}
                        onChange={handleChange}
                        className={`block w-full rounded-lg border pl-3 pr-10 py-2.5 font-bold focus:ring-4 outline-none sm:text-sm bg-white dark:bg-slate-950 transition-shadow group-hover:border-indigo-300 dark:group-hover:border-indigo-700
                        ${errors.MLL_D 
                          ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-red-200' 
                          : 'border-indigo-200 dark:border-indigo-900 text-[#333333] dark:text-slate-100 focus:border-[#1C3A5B] dark:focus:border-blue-500 focus:ring-[#1C3A5B]/10 dark:focus:ring-blue-500/20'}`}
                        placeholder="Ex: 20"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-indigo-400 text-sm font-bold">%</span>
                      </div>
                    </div>
                     {errors.MLL_D && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} /> {errors.MLL_D}</p>}
                     {!errors.MLL_D && <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 mt-2 leading-tight">
                       Porcentagem do faturamento que deve sobrar como lucro limpo.
                     </p>}
                  </div>
               )}
            </div>
          </section>
        </div>
      </div>
      
      <div className="p-4 bg-[#F0F4F8] dark:bg-slate-800 border-t border-slate-200/60 dark:border-slate-700 text-[10px] text-center text-slate-400 dark:text-slate-500 transition-colors">
        Preencha os campos para calcular automaticamente
      </div>
    </div>
  );
};

const InputGroup = ({ 
  label, name, value, onChange, icon, placeholder, isPercentage = false, highlight = false, error 
}: { 
  label: string, name: string, value?: number, onChange: any, icon: any, placeholder: string, isPercentage?: boolean, highlight?: boolean, error?: string 
}) => (
  <div>
    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5 ml-0.5">{label}</label>
    <div className="relative group">
      <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1C3A5B] dark:group-focus-within:text-blue-400'}`}>
        {!isPercentage && icon}
      </div>
      <input
        type="number"
        name={name}
        value={value ?? ''}
        onChange={onChange}
        className={`block w-full rounded-lg py-2.5 ${isPercentage ? 'pl-3 pr-8' : 'pl-9 pr-3'} font-semibold bg-white dark:bg-slate-950 transition-all sm:text-sm shadow-sm outline-none border
        ${error
          ? 'border-red-300 text-red-600 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:border-red-900/50 dark:focus:ring-red-900/20'
          : highlight 
            ? 'border-blue-300 dark:border-blue-900 text-[#333333] dark:text-slate-100 focus:border-[#1C3A5B] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#1C3A5B]/10 dark:focus:ring-blue-500/20' 
            : 'border-slate-300 dark:border-slate-700 text-[#333333] dark:text-slate-100 focus:border-[#1C3A5B] dark:focus:border-blue-500 focus:ring-4 focus:ring-[#1C3A5B]/10 dark:focus:ring-blue-500/20 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
        placeholder={placeholder}
      />
      {isPercentage && (
        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 transition-colors ${error ? 'text-red-400' : 'text-slate-400 group-focus-within:text-[#1C3A5B] dark:group-focus-within:text-blue-400'}`}>
          {icon}
        </div>
      )}
    </div>
    {error && (
      <p className="text-[10px] text-red-500 mt-1 ml-0.5 flex items-center gap-1 animate-in slide-in-from-top-1">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

export default InputSection;

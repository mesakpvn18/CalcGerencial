
import React from 'react';
import { HistoryItem, CalculationMode, Language } from '../types';
import { X, Clock, ArrowRight, Trash2, Calculator, Target, BarChart2 } from 'lucide-react';
import { formatCurrency, formatPercent } from '../utils/calculations';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  language: Language;
}

const HistoryModal: React.FC<Props> = ({ isOpen, onClose, history, onLoad, onDelete, onClearAll, language }) => {
  if (!isOpen) return null;
  const t = translations[language];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="text-[#1C3A5B] dark:text-blue-400" size={20} />
              {t.app.history}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {history.length} simulações salvas
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
              <Clock size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">Nenhum cálculo salvo ainda.</p>
              <p className="text-xs mt-2 max-w-[200px]">Use o botão "Salvar" na tela de resultados para guardar suas simulações importantes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group relative"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[#1C3A5B] dark:text-blue-400">
                        {item.mode === CalculationMode.DIRECT && <Calculator size={14} />}
                        {item.mode === CalculationMode.TARGET_PRICE && <Target size={14} />}
                        {item.mode === CalculationMode.TARGET_VOLUME && <BarChart2 size={14} />}
                      </span>
                      <div>
                         <p className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                           {item.mode}
                         </p>
                         <p className="text-[10px] text-slate-400">
                           {new Date(item.timestamp).toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')}
                         </p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">{t.results.kpi.ll}</span>
                      <span className={`font-bold text-sm ${item.result.LL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {formatCurrency(item.result.LL, item.currency || 'BRL', language)}
                      </span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Margem</span>
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-200">
                        {formatPercent(item.result.MLL_Real, language)}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { onLoad(item); onClose(); }}
                    className="w-full py-2 bg-[#1C3A5B] dark:bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-800 dark:hover:bg-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    Carregar <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <button 
              onClick={onClearAll}
              className="w-full py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
            >
              Limpar Tudo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;

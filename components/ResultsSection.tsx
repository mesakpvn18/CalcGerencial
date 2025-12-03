
import React, { useState, useMemo } from 'react';
import { CalculationResult, FinancialInputs, CalculationMode, Language, Period } from '../types';
import { formatCurrency, formatPercent, calculateFinancials } from '../utils/calculations';
import { analyzeFinancials } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line, ReferenceDot
} from 'recharts';
import { BrainCircuit, Loader2, TrendingUp, AlertTriangle, Scale, DollarSign, Wallet, Save, PieChart as PieIcon, List, ShieldCheck, Users, Printer, FileText, HelpCircle, Check, Activity, Download, CalendarRange, Lock, RefreshCcw, TrendingDown, Minus } from 'lucide-react';
import { translations } from '../utils/translations';
import AdUnit from './AdUnit';

interface Props {
  result: CalculationResult;
  inputs: FinancialInputs;
  mode: CalculationMode;
  onSaveHistory: () => void;
  isDarkMode: boolean;
  currency: string;
  language: Language;
  user: any; 
  onOpenAuth: () => void;
  isPro?: boolean;
  onOpenUpgrade?: () => void;
  period: Period;
}

const ResultsSection: React.FC<Props> = ({ result: initialResult, inputs: initialInputs, mode, onSaveHistory, isDarkMode, currency, language, user, onOpenAuth, isPro, onOpenUpgrade, period }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [priceSensitivity, setPriceSensitivity] = useState(0);
  
  const t = translations[language];
  const fmtCurrency = (val: number) => formatCurrency(val, currency, language);
  const fmtPercent = (val: number) => formatPercent(val, language);

  // --- LÓGICA DE SIMULAÇÃO GLOBAL ---
  const { effectiveResult, effectiveInputs, isSimulating } = useMemo(() => {
    if (priceSensitivity === 0) {
      return { effectiveResult: initialResult, effectiveInputs: initialInputs, isSimulating: false };
    }
    const newPVS = (initialInputs.PVS || 0) * (1 + priceSensitivity / 100);
    const simInputs = { ...initialInputs, PVS: newPVS };
    const simResult = calculateFinancials(mode === CalculationMode.TARGET_PRICE ? CalculationMode.DIRECT : mode, simInputs);
    return { effectiveResult: simResult, effectiveInputs: simInputs, isSimulating: true };
  }, [initialResult, initialInputs, priceSensitivity, mode]);

  // --- LÓGICA DE MULTIPLICAÇÃO DO PERÍODO ---
  // Os inputs são SEMPRE mensais. O resultado base é MENSAL.
  // Aqui aplicamos o multiplicador apenas para visualização.
  const periodMultiplier = useMemo(() => {
     switch(period) {
        case 'bimestral': return 2;
        case 'trimestral': return 3;
        case 'semestral': return 6;
        case 'yearly': return 12;
        default: return 1; // monthly
     }
  }, [period]);

  const displayResult = useMemo(() => {
     return {
        ...effectiveResult,
        Meta: effectiveResult.Meta * periodMultiplier,
        PE_Valor: effectiveResult.PE_Valor * periodMultiplier,
        PE_UN: effectiveResult.PE_UN * periodMultiplier,
        LL: effectiveResult.LL * periodMultiplier,
        Revenue: effectiveResult.Revenue * periodMultiplier,
        // MC_Real unitária não muda, nem PVS
     };
  }, [effectiveResult, periodMultiplier]);
  
  const displayInputs = useMemo(() => {
     return {
       ...effectiveInputs,
       CF: (effectiveInputs.CF || 0) * periodMultiplier,
       Marketing: (effectiveInputs.Marketing || 0) * periodMultiplier,
     }
  }, [effectiveInputs, periodMultiplier]);

  const handleAiAnalysis = async () => {
    if (!isPro && onOpenUpgrade) {
        onOpenUpgrade();
        return;
    }
    setIsLoadingAi(true);
    // Para a IA, mandamos os dados do cenário base (mensal) ou explicamos o período?
    // Melhor mandar o base e deixar a IA analisar o 'unit economics', mas informar o período de visualização
    const analysis = await analyzeFinancials(displayResult, effectiveInputs, mode);
    setAiAnalysis(analysis);
    setIsLoadingAi(false);
  };

  const handleSave = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    onSaveHistory(); 
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownloadPDF = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsGeneratingPdf(true);
    window.scrollTo(0, 0);
    const element = document.getElementById('printable-dashboard');
    if (!element) { setIsGeneratingPdf(false); return; }
    const wasDarkMode = document.documentElement.classList.contains('dark');
    if (wasDarkMode) document.documentElement.classList.remove('dark');
    const originalStyle = { width: element.style.width, padding: element.style.padding, margin: element.style.margin, height: element.style.height, minHeight: element.style.minHeight };
    element.style.width = '1120px'; element.style.padding = '40px'; element.style.margin = '0 auto'; element.style.height = 'auto'; element.style.minHeight = '0px'; element.classList.add('pdf-generation-active');
    await new Promise(resolve => setTimeout(resolve, 500));
    // @ts-ignore
    if (typeof window.html2pdf === 'undefined') {
       alert("Biblioteca PDF não carregada. Use Ctrl+P.");
       Object.assign(element.style, originalStyle); element.classList.remove('pdf-generation-active'); if (wasDarkMode) document.documentElement.classList.add('dark'); setIsGeneratingPdf(false); return;
    }
    const opt = { margin: [0, 0, 0, 0], filename: `FinCalc_Report_${new Date().toISOString().split('T')[0]}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 1120, scrollY: 0, height: element.scrollHeight }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } };
    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (e) { console.error("PDF Error:", e); alert("Erro ao gerar PDF."); } finally { Object.assign(element.style, originalStyle); element.classList.remove('pdf-generation-active'); if (wasDarkMode) document.documentElement.classList.add('dark'); setIsGeneratingPdf(false); }
  };

  const handleExportCSV = () => {
    if (!user) { onOpenAuth(); return; }
    const fmt = (val: any) => { if (typeof val === 'number') return val.toFixed(2); if (val === undefined || val === null) return ''; return `"${String(val).replace(/"/g, '""')}"`; };
    const headers = ["Categoria", "Metrica", "Valor", "Unidade"];
    const rows = [ ["Cenario", "Modo", mode, ""], ["Premissas", "Custo Produto", effectiveInputs.CP || 0, currency], ["Resultado", "Lucro Liquido", displayResult.LL, currency], ];
    const csvContent = headers.join(";") + "\n" + rows.map(row => row.map(fmt).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `FinCalc_Export_${new Date().toISOString().split('T')[0]}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (!effectiveResult.isValid) { return <div className="h-full flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 text-center"><div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-6"><AlertTriangle className="h-10 w-10 text-red-500" /></div><h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Atenção nos parâmetros</h3><p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{effectiveResult.error}</p></div>; }

  // Recalcula totais para o gráfico usando valores multiplicados
  const totalCostsWithMarketing = displayInputs.CF + displayInputs.Marketing + (displayResult.CV_UN * displayResult.PE_UN);
  const totalCostsScenario = displayInputs.CF + displayInputs.Marketing + (displayResult.CV_UN * displayResult.Meta);
  
  const barChartData = [ { name: t.results.kpi.pe, Receita: displayResult.PE_Valor, Custos: totalCostsWithMarketing, Lucro: 0 }, { name: 'Cenário', Receita: displayResult.Revenue, Custos: totalCostsScenario, Lucro: displayResult.LL } ];
  
  // Pizza usa valores unitários/proporcionais, então não precisa multiplicar (exceto se quisesse mostrar totais absolutos no tooltip)
  const taxAmount = (effectiveInputs.TxF || 0) + (effectiveResult.PVS * ((effectiveInputs.TxP || 0) / 100));
  const productCost = effectiveInputs.CP || 0;
  const contributionMargin = effectiveResult.MC_Real > 0 ? effectiveResult.MC_Real : 0; 
  const pieChartData = [ { name: t.inputs.labels.cp, value: productCost, color: (isDarkMode && !isGeneratingPdf) ? '#64748b' : '#94a3b8' }, { name: 'Taxas', value: taxAmount, color: (isDarkMode && !isGeneratingPdf) ? '#d97706' : '#f59e0b' }, { name: t.results.kpi.mc, value: contributionMargin, color: (isDarkMode && !isGeneratingPdf) ? '#3b82f6' : '#1C3A5B' }, ];
  const activePieData = pieChartData.filter(d => d.value > 0);
  
  // Sensibilidade: multiplicamos o Lucro Líquido pelo periodo para manter consistência
  const sensitivityData = useMemo(() => {
    const basePrice = initialInputs.PVS || 0; if (basePrice <= 0) return []; const points = [];
    for (let i = -10; i <= 10; i++) { const variation = i * 0.05; const price = basePrice * (1 + variation); const simInputs = { ...initialInputs, PVS: price, Meta: initialInputs.Meta }; const simResult = calculateFinancials(CalculationMode.DIRECT, simInputs); points.push({ variationPercent: Math.round(variation * 100), price: price, lucro: simResult.LL * periodMultiplier, isCurrent: Math.round(variation * 100) === priceSensitivity }); } return points;
  }, [initialInputs, mode, priceSensitivity, periodMultiplier]);
  
  const formatAxisValue = (value: number) => { let prefix = '$'; if (currency === 'BRL') prefix = 'R$'; else if (currency === 'EUR') prefix = '€'; if (value >= 1000000) return `${prefix}${(value / 1000000).toFixed(1)}M`; if (value >= 1000) return `${prefix}${(value / 1000).toFixed(0)}k`; return `${prefix}${value}`; };

  // Labels dinâmicos baseados no período
  const getPeriodLabel = () => {
    switch(period) {
        case 'bimestral': return t.inputs.period.bimestral;
        case 'trimestral': return t.inputs.period.trimestral;
        case 'semestral': return t.inputs.period.semestral;
        case 'yearly': return t.inputs.period.yearly;
        default: return t.inputs.period.monthly;
    }
  };

  const periodLabelText = getPeriodLabel();
  const llLabel = `${t.results.kpi.ll} (${periodLabelText})`;
  const fixedLabel = `${t.results.table.fixed_costs}`;

  return (
    <div id="printable-dashboard" className="space-y-6 animate-in fade-in duration-500 pb-10">
      <style>{`.recharts-surface path { outline: none !important; } .recharts-sector:focus { outline: none !important; }`}</style>
      
      {isSimulating && (
        <div className="bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-900/20 flex items-center justify-between animate-in slide-in-from-top-2 no-print">
           <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-lg"><Activity size={20}/></div><div><p className="font-bold text-sm">Modo Simulação Ativo</p><p className="text-xs text-indigo-100 opacity-90">Preço alterado em <span className="font-bold">{priceSensitivity > 0 ? '+' : ''}{priceSensitivity}%</span>. Todos os gráficos abaixo mostram este cenário hipotético.</p></div></div>
           <button onClick={() => setPriceSensitivity(0)} className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center gap-1"><RefreshCcw size={12} /> Restaurar</button>
        </div>
      )}

      {/* PDF Header */}
      <div className="hidden pdf-mode mb-8 bg-white">
        <div className="w-full h-3 bg-[#1C3A5B] mb-6"></div>
        <div className="flex justify-between items-end px-2 mb-6">
          <div className="flex items-center gap-4"><div className="bg-[#1C3A5B] p-3 rounded-xl text-white"><DollarSign size={32} /></div><div><h1 className="text-3xl font-bold text-[#1C3A5B] leading-none">FinCalc Digital</h1><p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">Relatório de Viabilidade Financeira</p></div></div>
          <div className="text-right"><p className="text-xs font-bold text-slate-400 uppercase">Gerado em</p><p className="text-lg font-bold text-slate-800">{new Date().toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')} às {new Date().toLocaleTimeString()}</p><div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded text-xs font-bold uppercase text-slate-600 border border-slate-200">{mode} {isSimulating ? '(SIMULADO)' : ''}</div></div>
        </div>
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 break-inside-avoid">
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2 border-b border-slate-200 pb-2"><List size={14}/> {t.results.assumptions} ({periodLabelText})</h4>
           <div className="grid grid-cols-4 gap-8 text-sm">
              <div><span className="text-slate-400 text-xs uppercase block mb-1">{t.inputs.labels.cp}</span><span className="font-mono font-bold text-lg text-slate-800">{fmtCurrency(effectiveInputs.CP || 0)}</span></div>
              <div><span className="text-slate-400 text-xs uppercase block mb-1">{t.inputs.labels.pvs}</span><span className="font-mono font-bold text-lg text-slate-800">{fmtCurrency(effectiveResult.PVS)}</span></div>
              <div><span className="text-slate-400 text-xs uppercase block mb-1">{t.inputs.labels.meta}</span><span className="font-mono font-bold text-lg text-slate-800">{displayResult.Meta} un</span></div>
              <div><span className="text-slate-400 text-xs uppercase block mb-1">{t.inputs.labels.marketing}</span><span className="font-mono font-bold text-lg text-slate-800">{fmtCurrency(displayInputs.Marketing || 0)}</span></div>
           </div>
        </div>
      </div>
      
      {/* KPI Cards - USANDO displayResult (Multiplicado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print-break-inside pdf-avoid-break">
        <KPICard title={llLabel} value={fmtCurrency(displayResult.LL)} subtitle={`${t.results.kpi.sub.margin}: ${fmtPercent(displayResult.MLL_Real)}`} icon={Wallet} theme={displayResult.LL >= 0 ? "emerald" : "red"} />
        <KPICard title={t.results.kpi.mc} value={fmtCurrency(displayResult.MC_Real)} subtitle={t.results.kpi.sub.sobra} icon={TrendingUp} theme="blue" />
        <KPICard title={t.results.kpi.pe} value={`${displayResult.PE_UN}`} subtitle={t.results.kpi.sub.zerar} icon={Scale} theme="amber" unit="un." />
        <KPICard title={mode === CalculationMode.TARGET_PRICE ? t.results.kpi.suggested_price : t.results.kpi.price} value={fmtCurrency(displayResult.PVS)} subtitle={mode === CalculationMode.TARGET_VOLUME ? `${t.results.kpi.sub.meta}: ${displayResult.Meta} un.` : t.results.kpi.sub.val_unit} icon={DollarSign} theme="violet" />
      </div>

      {/* AD UNIT - HIDE IF PRO */}
      {!isPro && (
        <div className="no-print w-full flex justify-center" data-html2canvas-ignore="true">
            <AdUnit slotId="0987654321" format="horizontal" testMode={true} className="w-full max-w-3xl" />
        </div>
      )}

      {/* Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-break-inside pdf-avoid-break">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col min-h-[400px] print-chart-fix">
          <div className="mb-6 flex items-center justify-between">
            <div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><TrendingUp className="text-slate-400" size={20} /> {t.results.charts.viability}</h3><p className="text-sm text-slate-400 mt-1">{t.results.charts.revenue_cost} ({periodLabelText})</p></div>
            <div className="flex gap-2 no-print" data-html2canvas-ignore="true">
              <button onClick={handleExportCSV} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-green-600 transition-colors relative group" title={user ? t.results.actions.export : "Login necessário"}>
                  {!user && <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5"><Lock size={10} /></div>}<FileText size={18} />
              </button>
              <button onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 hover:text-[#1C3A5B] dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center gap-2 font-bold text-xs disabled:opacity-50 relative group" title={user ? t.results.actions.print : "Login necessário"}>
                  {!user && <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5"><Lock size={10} /></div>}{isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <Download size={16} />}<span className="hidden sm:inline">{isGeneratingPdf ? t.results.actions.generating : t.results.actions.print}</span>
              </button>
              <button onClick={handleSave} className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-xs relative group ${isSaved ? 'bg-emerald-100 text-emerald-700' : 'bg-[#1C3A5B] text-white hover:bg-blue-800'}`} title={user ? t.results.actions.save : "Login necessário"}>
                  {!user && <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full p-1"><Lock size={10} /></div>}{isSaved ? <Check size={16} /> : <Save size={16} />}{isSaved ? t.results.actions.saved : t.results.actions.save}
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode && !isGeneratingPdf ? "#334155" : "#f1f5f9"} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: isDarkMode && !isGeneratingPdf ? '#94a3b8' : '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: isDarkMode && !isGeneratingPdf ? '#64748b' : '#64748b', fontSize: 11}} tickFormatter={formatAxisValue} width={45} />
                <Tooltip content={<CustomBarTooltip isDarkMode={isDarkMode && !isGeneratingPdf} fmtCurrency={fmtCurrency} />} cursor={{fill: isDarkMode && !isGeneratingPdf ? '#1e293b' : '#f8fafc'}} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Receita" fill={isDarkMode && !isGeneratingPdf ? "#3b82f6" : "#1C3A5B"} radius={[4, 4, 0, 0]} isAnimationActive={!isGeneratingPdf} />
                <Bar dataKey="Custos" fill={isDarkMode && !isGeneratingPdf ? "#64748b" : "#94a3b8"} radius={[4, 4, 0, 0]} isAnimationActive={!isGeneratingPdf} />
                <Bar dataKey="Lucro" fill={displayResult.LL >= 0 ? "#4CAF50" : "#E53935"} radius={[4, 4, 0, 0]} isAnimationActive={!isGeneratingPdf} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col min-h-[400px] break-inside-avoid print-chart-fix">
          <div className="mb-2"><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><PieIcon className="text-slate-400" size={20} /> {t.results.charts.composition}</h3><p className="text-sm text-slate-400 mt-1">{t.results.charts.detail}: {fmtCurrency(displayResult.PVS)}</p></div>
          <div className="flex-1 w-full relative h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke={isDarkMode && !isGeneratingPdf ? '#1e293b' : '#ffffff'} strokeWidth={2} isAnimationActive={!isGeneratingPdf}>{activePieData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}</Pie>
                <Tooltip content={<CustomPieTooltip isDarkMode={isDarkMode && !isGeneratingPdf} total={displayResult.PVS} fmtCurrency={fmtCurrency} />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8"><div className="text-center"><span className="text-[10px] text-slate-400 uppercase font-bold block">Preço</span><span className="text-xl font-bold text-[#1C3A5B] dark:text-blue-400">{fmtCurrency(displayResult.PVS)}</span></div></div>
          </div>
        </div>
      </div>
      
      {/* Simulador */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col print-chart-fix pdf-avoid-break">
          <div className="mb-6 flex justify-between items-center">
            <div><h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><Activity className="text-indigo-500" size={20} /> {t.results.charts.sensitivity}</h3><p className="text-sm text-slate-400 mt-1">{t.results.charts.sensitivity_desc} ({periodLabelText})</p></div>
            <div className="hidden pdf-mode text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded border border-indigo-100">Cenário {priceSensitivity > 0 ? `+${priceSensitivity}%` : `${priceSensitivity}%`} sobre PVS</div>
          </div>
          <div className="mb-8 px-2" data-html2canvas-ignore="true">
             <input type="range" min="-50" max="50" step="1" value={priceSensitivity} onChange={(e) => setPriceSensitivity(parseInt(e.target.value))} className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#1C3A5B] dark:accent-blue-500" />
             <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-3"><span>-50%</span><span className="cursor-pointer hover:text-[#1C3A5B]" onClick={() => setPriceSensitivity(0)}>0%</span><span>+50%</span></div>
          </div>
          <div className="flex-1 w-full h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode && !isGeneratingPdf ? "#334155" : "#f1f5f9"} />
                   <XAxis dataKey="price" tickFormatter={(val) => { let prefix = '$'; if (currency === 'BRL') prefix = 'R$'; else if (currency === 'EUR') prefix = '€'; return `${prefix}${val.toFixed(0)}`; }} tick={{fill: isDarkMode && !isGeneratingPdf ? '#94a3b8' : '#64748b', fontSize: 11}} axisLine={false} tickLine={false} />
                   <YAxis tickFormatter={formatAxisValue} tick={{fill: isDarkMode && !isGeneratingPdf ? '#94a3b8' : '#64748b', fontSize: 11}} axisLine={false} tickLine={false} width={50} />
                   <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: isDarkMode && !isGeneratingPdf ? '#1e293b' : '#fff', color: isDarkMode && !isGeneratingPdf ? '#f8fafc' : '#334155' }} formatter={(value: number) => [fmtCurrency(value), t.results.kpi.ll]} labelFormatter={(label) => `${t.results.kpi.sub.val_unit}: ${fmtCurrency(label as number)}`} />
                   <ReferenceLine x={initialResult.PVS} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Original', position: 'top', fill: isDarkMode && !isGeneratingPdf ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                   <ReferenceLine y={0} stroke="#E53935" strokeOpacity={0.5} />
                   <Line type="monotone" dataKey="lucro" stroke="#4CAF50" strokeWidth={3} dot={false} activeDot={false} isAnimationActive={!isGeneratingPdf} />
                   <ReferenceDot x={displayResult.PVS} y={displayResult.LL} r={6} fill="#1C3A5B" stroke="white" strokeWidth={2} />
                </LineChart>
             </ResponsiveContainer>
          </div>
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-break-inside pdf-avoid-break">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
           <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center gap-2"><List className="text-[#1C3A5B] dark:text-blue-400" size={18} /><h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{t.results.table.title}</h3></div>
           <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
                    <TableRow label={t.results.table.revenue} value={displayResult.Revenue} bold tooltip={t.results.tooltips.revenue} fmtCurrency={fmtCurrency} />
                    <TableRow label={fixedLabel} value={displayInputs.CF || 0} isNegative tooltip={t.results.tooltips.fixed} fmtCurrency={fmtCurrency} />
                    <TableRow label={t.results.table.marketing} value={displayInputs.Marketing || 0} isNegative tooltip={t.results.tooltips.marketing} fmtCurrency={fmtCurrency} />
                    <TableRow label={t.results.table.variable_costs} value={displayResult.CV_UN * displayResult.Meta} isNegative subLabel={`${fmtCurrency(displayResult.CV_UN)}/un`} tooltip={t.results.tooltips.variable} fmtCurrency={fmtCurrency} />
                    <TableRow label={t.results.table.markup} customFormattedValue={(effectiveInputs.CP || 0) > 0 ? `${displayResult.Markup.toFixed(2)}x` : 'N/A'} subLabel={(effectiveInputs.CP || 0) > 0 ? "Sobre CP" : "Sem CP"} tooltip={t.results.tooltips.markup} />
                    <tr className="bg-slate-50 dark:bg-slate-700/30"><td colSpan={2} className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={14} /> {t.results.table.survival}</td></tr>
                    <TableRow label={t.results.table.pe_unit} customFormattedValue={`${displayResult.PE_UN} un`} tooltip={t.results.tooltips.pe} />
                     <TableRow label={t.results.table.pe_rev} value={displayResult.PE_Valor} tooltip={t.results.tooltips.pe} fmtCurrency={fmtCurrency} />
                     <TableRow label={t.results.table.margin_safety} customFormattedValue={fmtPercent(displayResult.MarginSafety * 100)} isStatus={true} statusColor={displayResult.MarginSafety > 0 ? 'text-emerald-600' : 'text-red-500'} tooltip={t.results.tooltips.safety} />
                    <TableRow label={t.results.table.mmc} value={displayResult.MMC} subLabel="Absorção CF" tooltip={t.results.tooltips.mmc} fmtCurrency={fmtCurrency} />
                    <tr className="bg-slate-50 dark:bg-slate-700/30"><td colSpan={2} className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2"><Users size={14} /> {t.results.table.efficiency}</td></tr>
                    <TableRow label={t.results.table.cac} value={displayResult.CAC} subLabel="Custo Aquisição" tooltip={t.results.tooltips.cac} fmtCurrency={fmtCurrency} />
                     <TableRow label={t.results.table.payback} customFormattedValue={displayResult.Payback > 0 ? `${displayResult.Payback.toFixed(1)}` : "N/A"} subLabel={period === 'monthly' ? "Meses" : "Anos"} isStatus={true} statusColor={displayResult.Payback <= 6 ? 'text-emerald-600' : displayResult.Payback <= 12 ? 'text-amber-500' : 'text-red-500'} tooltip={t.results.tooltips.payback} />
                    <TableRow label={t.results.table.ltv} value={displayResult.LTV} subLabel="Valor Vitalício" tooltip={t.results.tooltips.ltv} fmtCurrency={fmtCurrency} />
                     <TableRow label={t.results.table.lifetime} customFormattedValue={displayResult.Lifetime > 0 ? `${displayResult.Lifetime.toFixed(1)}` : "-"} subLabel={period === 'monthly' ? "Meses" : "Anos"} tooltip={t.results.tooltips.lifetime} />
                    <TableRow label={t.results.table.ratio} customFormattedValue={`${displayResult.LTV_CAC_Ratio.toFixed(1)}x`} isStatus={true} statusColor={displayResult.LTV_CAC_Ratio >= 3 ? 'text-emerald-600' : (displayResult.LTV_CAC_Ratio >= 1 ? 'text-amber-500' : 'text-red-500')} tooltip={t.results.tooltips.ratio} />
                    <TableRow label={t.results.table.roi} customFormattedValue={fmtPercent(displayResult.ROI)} isStatus={true} statusColor={displayResult.ROI > 0 ? 'text-emerald-600' : 'text-red-500'} tooltip={t.results.tooltips.roi} />
                     
                     {/* PROJEÇÃO DINÂMICA OU COMPARAÇÃO - MOSTRAR APENAS SE NÃO FOR MENSAL */}
                     {period !== 'monthly' && (
                       <tr className="bg-indigo-50 dark:bg-indigo-900/10 border-t border-indigo-100 dark:border-indigo-800">
                         <td colSpan={2} className="px-6 py-3">
                           <div className="flex justify-between items-center">
                             <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold text-xs uppercase">
                               <CalendarRange size={14} /> {t.results.table.projection_monthly}
                             </div>
                             <div className="font-mono font-bold text-sm text-indigo-700 dark:text-indigo-300">
                               {fmtCurrency(effectiveResult.LL)}
                             </div>
                           </div>
                         </td>
                       </tr>
                     )}
                    
                    <tr className="bg-slate-100/50 dark:bg-slate-700/50 border-t-2 border-slate-100 dark:border-slate-600"><td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-sm">{llLabel}</td><td className={`px-6 py-4 text-right font-bold text-sm ${displayResult.LL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{fmtCurrency(displayResult.LL)}</td></tr>
                </tbody>
            </table>
           </div>
        </div>

        {/* IA Assistant */}
        <div className={`lg:col-span-2 rounded-2xl shadow-lg overflow-hidden transition-all duration-700 border transform ${aiAnalysis ? 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-900 scale-100' : 'bg-gradient-to-br from-[#1C3A5B] to-[#0f243a] dark:from-slate-900 dark:to-slate-950 border-[#1C3A5B] dark:border-slate-700'} no-print`} data-html2canvas-ignore="true">
          <div className="p-6 md:p-8 relative h-full flex flex-col justify-center">
             {!aiAnalysis && (<><div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none"><BrainCircuit size={300} color="white" /></div><div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div></>)}
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4"><div className={`p-2.5 rounded-xl ${aiAnalysis ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'bg-white/10 text-blue-200 ring-1 ring-white/20'}`}><BrainCircuit size={24} /></div><div><h3 className={`text-xl font-bold ${aiAnalysis ? 'text-slate-800 dark:text-slate-100' : 'text-white'}`}>{t.results.ai.title}</h3></div></div>
                {!aiAnalysis ? (<div className="max-w-2xl"><p className="text-slate-300 mb-6 text-sm md:text-base leading-relaxed font-light">{t.results.ai.desc}</p><button onClick={handleAiAnalysis} disabled={isLoadingAi} className="px-6 py-3 bg-white hover:bg-blue-50 text-[#1C3A5B] rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed group active:scale-95 text-sm">{!isPro && <Lock size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />}{isLoadingAi ? <Loader2 className="animate-spin text-[#1C3A5B]" size={18} /> : <BrainCircuit size={18} className="text-[#1C3A5B] group-hover:scale-110 transition-transform" />}{isLoadingAi ? t.results.ai.analyzing : t.results.ai.button}</button></div>) : (<div className="animate-in fade-in slide-in-from-bottom-4 duration-700"><div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">{aiAnalysis.split('\n').map((line, i) => { const trimmed = line.trim(); if (trimmed.startsWith('#') || trimmed.startsWith('**')) { return <h4 key={i} className="font-bold text-slate-800 dark:text-slate-100 text-base mt-4 mb-2 flex items-center gap-2">{trimmed.replace(/[#*]/g, '')}</h4> } return <p key={i} className="mb-1.5">{line}</p> })}</div><div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-700 pt-4"><button onClick={() => setAiAnalysis(null)} className="text-xs font-semibold text-slate-500 hover:text-[#1C3A5B] dark:text-slate-400 dark:hover:text-blue-400 hover:underline transition-colors flex items-center gap-2"><BrainCircuit size={14} />{t.results.ai.new}</button></div></div>)}
             </div>
          </div>
        </div>
      </div>
      <div className="hidden pdf-mode mt-8 pt-4 border-t border-slate-200 text-center"><p className="text-[10px] text-slate-400">Este relatório foi gerado automaticamente pelo <strong>FinCalc Digital</strong>. Os resultados são simulações baseadas nos dados fornecidos e não garantem lucros futuros.</p><p className="text-[10px] font-bold text-[#1C3A5B] mt-1">www.fincalcdigital.app</p></div>
    </div>
  );
};

const CustomBarTooltip = ({ active, payload, label, isDarkMode, fmtCurrency }: any) => { if (active && payload && payload.length) { return ( <div className={`p-3 rounded-xl shadow-xl border min-w-[200px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'}`}> <p className={`font-bold mb-2 text-sm pb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>{label}</p> <div className="space-y-1"> {payload.map((entry: any, index: number) => { const value = entry.value as number; const isProfit = entry.name === 'Lucro'; const isNegativeProfit = isProfit && value < 0; return ( <div key={index} className="flex items-center justify-between text-xs sm:text-sm p-1"> <div className="flex items-center gap-2"> <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isNegativeProfit ? '#ef4444' : entry.color }}/> <span className={`font-medium ${isNegativeProfit ? 'text-red-500' : 'text-slate-500'}`}>{entry.name}</span> </div> <span className={`font-mono font-bold ${isProfit ? (value >= 0 ? 'text-emerald-600' : 'text-red-600') : ''}`}> {fmtCurrency(value)} </span> </div> ); })} </div> </div> ); } return null; };
const CustomPieTooltip = ({ active, payload, isDarkMode, total, fmtCurrency }: any) => { if (active && payload && payload.length) { const data = payload[0]; const percent = total > 0 ? (data.value / total) * 100 : 0; return ( <div className={`p-3 rounded-xl shadow-xl border min-w-[180px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'}`}> <p className="font-bold text-sm mb-1" style={{ color: data.payload.color }}>{data.name}</p> <div className="flex items-baseline gap-2"> <span className="text-lg font-bold font-mono">{fmtCurrency(data.value)}</span> <span className="text-xs font-medium text-slate-400">({percent.toFixed(1)}%)</span> </div> </div> ); } return null; };
const KPICard = ({ title, value, subtitle, icon: Icon, theme, unit }: { title: string, value: string, subtitle: string, icon: any, theme: 'emerald'|'red'|'blue'|'amber'|'violet', unit?: string }) => { const themes = { emerald: { bg: 'bg-white dark:bg-slate-800', border: 'border-[#4CAF50]/30', text: 'text-[#4CAF50]', iconBg: 'bg-[#4CAF50]/10', iconColor: 'text-[#4CAF50]' }, red: { bg: 'bg-white dark:bg-slate-800', border: 'border-[#E53935]/30', text: 'text-[#E53935]', iconBg: 'bg-[#E53935]/10', iconColor: 'text-[#E53935]' }, blue: { bg: 'bg-white dark:bg-slate-800', border: 'border-blue-200', text: 'text-[#1C3A5B]', iconBg: 'bg-blue-50', iconColor: 'text-[#1C3A5B]' }, amber: { bg: 'bg-white dark:bg-slate-800', border: 'border-[#FFC107]/50', text: 'text-[#d9a406]', iconBg: 'bg-[#FFC107]/10', iconColor: 'text-[#d9a406]' }, violet: { bg: 'bg-white dark:bg-slate-800', border: 'border-indigo-200', text: 'text-[#1C3A5B]', iconBg: 'bg-indigo-50', iconColor: 'text-[#1C3A5B]' } }; const currentTheme = themes[theme] || themes.blue; return ( <div className={`p-6 rounded-2xl shadow-sm border-l-4 transition-all hover:shadow-md flex flex-col justify-between h-full ${currentTheme.bg} ${currentTheme.border} dark:border-opacity-20`}> <div className="flex justify-between items-start mb-4"> <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p> <div className={`p-2.5 rounded-xl ${currentTheme.iconBg} dark:bg-opacity-20`}> <Icon size={18} className={currentTheme.iconColor} /> </div> </div> <div> <div className={`text-3xl font-bold tracking-tight ${currentTheme.text} dark:text-opacity-90`}>{value} <span className="text-sm font-medium opacity-60 text-slate-400 ml-0.5">{unit}</span></div> <p className="text-xs mt-2 font-medium text-slate-500 dark:text-slate-400">{subtitle}</p> </div> </div> ); };
const TableRow = ({ label, value, isNegative, bold, subLabel, tooltip, customFormattedValue, isStatus, statusColor, fmtCurrency }: any) => ( <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"> <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium"> <div className="flex items-center gap-2"> {label} {tooltip && ( <div className="group/tooltip relative"> <div className="cursor-help text-slate-300 hover:text-[#1C3A5B] dark:text-slate-600 dark:hover:text-blue-400 transition-colors"><HelpCircle size={14} /></div> <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-relaxed border border-slate-700">{tooltip}</div> </div> )} </div> {subLabel && <span className="block text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">{subLabel}</span>} </td> <td className={`px-6 py-3 text-right font-mono text-sm ${bold ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'} ${isNegative ? 'text-red-500 dark:text-red-400' : ''} ${isStatus ? `font-bold ${statusColor}` : ''}`}> {isNegative && "-"}{customFormattedValue ? customFormattedValue : (fmtCurrency ? fmtCurrency(value) : value)} </td> </tr> );

export default ResultsSection;

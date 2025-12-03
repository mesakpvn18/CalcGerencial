
import React, { useState, useMemo } from 'react';
import { CalculationResult, FinancialInputs, CalculationMode } from '../types';
import { formatCurrency, formatPercent, calculateFinancials } from '../utils/calculations';
import { analyzeFinancials } from '../services/geminiService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { BrainCircuit, Loader2, TrendingUp, AlertTriangle, Scale, DollarSign, Wallet, Save, PieChart as PieIcon, List, ShieldCheck, Users, Printer, FileText, HelpCircle, Check, Activity } from 'lucide-react';

interface Props {
  result: CalculationResult;
  inputs: FinancialInputs;
  mode: CalculationMode;
  onSaveHistory: () => void;
  isDarkMode: boolean;
}

const ResultsSection: React.FC<Props> = ({ result, inputs, mode, onSaveHistory, isDarkMode }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAiAnalysis = async () => {
    setIsLoadingAi(true);
    const analysis = await analyzeFinancials(result, inputs, mode);
    setAiAnalysis(analysis);
    setIsLoadingAi(false);
  };

  const handleSave = () => {
    onSaveHistory();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (e) {
      alert("Não foi possível iniciar a impressão automaticamente. Pressione Ctrl+P (ou Cmd+P) no seu teclado.");
    }
  };

  const handleExportCSV = () => {
    const fmt = (val: any) => {
      if (typeof val === 'number') {
        return val.toFixed(2).replace('.', ',');
      }
      if (val === undefined || val === null) return '';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const headers = ["Categoria", "Métrica", "Valor", "Unidade"];
    const rows = [
      ["Cenário", "Modo de Cálculo", mode === 'DIRECT' ? 'Direto' : mode === 'TARGET_PRICE' ? 'Meta Preço' : 'Meta Volume', ""],
      ["Premissas", "Custo Produto (CP)", inputs.CP || 0, "BRL"],
      ["Premissas", "Custo Fixo (CF)", inputs.CF || 0, "BRL"],
      ["Premissas", "Marketing", inputs.Marketing || 0, "BRL"],
      ["Premissas", "Taxa Fixa (TxF)", inputs.TxF || 0, "BRL"],
      ["Premissas", "Taxa Variável (TxP)", inputs.TxP || 0, "%"],
      ["Premissas", "Churn", inputs.Churn || 0, "%"],
      ["Resultado", "Receita Bruta", result.Revenue, "BRL"],
      ["Resultado", "Lucro Líquido", result.LL, "BRL"],
      ["Resultado", "Margem Líquida", result.MLL_Real, "%"],
      ["Resultado", "Ponto de Equilíbrio (Qtd)", result.PE_UN, "Unidades"],
      ["Resultado", "Ponto de Equilíbrio ($)", result.PE_Valor, "BRL"],
      ["Resultado", "Margem de Segurança", result.MarginSafety * 100, "%"],
      ["Resultado", "Markup", result.Markup, "x"],
      ["Eficiência", "CAC", result.CAC, "BRL"],
      ["Eficiência", "LTV", result.LTV, "BRL"],
      ["Eficiência", "Tempo de Vida (Lifetime)", result.Lifetime, "Meses"],
      ["Eficiência", "ROI", result.ROI, "%"]
    ];

    const csvContent = headers.join(";") + "\n" 
      + rows.map(row => row.map(fmt).join(";")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `FinCalc_Relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (!result.isValid) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-red-100 dark:border-red-900/30 text-center animate-in fade-in duration-500">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-6">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Atenção nos parâmetros</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{result.error}</p>
      </div>
    );
  }

  // --- Data Preparation ---
  const totalCostsWithMarketing = (inputs.CF || 0) + (inputs.Marketing || 0) + (result.CV_UN * result.PE_UN);
  const totalCostsScenario = (inputs.CF || 0) + (inputs.Marketing || 0) + (result.CV_UN * result.Meta);

  const barChartData = [
    {
      name: 'Ponto de Equilíbrio',
      Receita: result.PE_Valor,
      Custos: totalCostsWithMarketing,
      Lucro: 0, 
    },
    {
      name: 'Cenário Projetado',
      Receita: result.Revenue,
      Custos: totalCostsScenario,
      Lucro: result.LL,
    }
  ];

  const taxAmount = (inputs.TxF || 0) + (result.PVS * ((inputs.TxP || 0) / 100));
  const productCost = inputs.CP || 0;
  const contributionMargin = result.MC_Real > 0 ? result.MC_Real : 0; 
  
  const pieChartData = [
    { name: 'Custo Produto', value: productCost, color: isDarkMode ? '#64748b' : '#94a3b8' }, 
    { name: 'Impostos/Taxas', value: taxAmount, color: isDarkMode ? '#d97706' : '#f59e0b' }, 
    { name: 'Margem Contrib.', value: contributionMargin, color: isDarkMode ? '#3b82f6' : '#1C3A5B' },
  ];

  const activePieData = pieChartData.filter(d => d.value > 0);

  // --- SENSITIVITY ANALYSIS DATA ---
  const sensitivityData = useMemo(() => {
    const currentPrice = result.PVS;
    if (currentPrice <= 0) return [];

    const points = [];
    // Gera pontos de -25% a +25% do preço
    for (let i = -5; i <= 5; i++) {
        const variation = i * 0.05; // 5% steps
        const price = currentPrice * (1 + variation);
        
        // Simula cálculo para este preço
        // Assumimos que a Meta de Vendas se mantém constante para isolar o efeito do preço,
        // ou seja, elasticidade preço-demanda = 0 nesta simulação simples.
        const simInputs = { ...inputs, PVS: price, Meta: inputs.Meta };
        
        // Sempre usa modo DIRECT para simular impacto do preço fixo na meta atual
        const simResult = calculateFinancials(CalculationMode.DIRECT, simInputs);
        
        points.push({
            variation: `${(variation * 100).toFixed(0)}%`,
            price: price,
            lucro: simResult.LL,
            isCurrent: i === 0
        });
    }
    return points;
  }, [result.PVS, inputs, mode]);

  // Helper para formatar Eixo Y do Gráfico de Barras (10k, 1M)
  const formatAxisValue = (value: number) => {
    if (value >= 1000000) return `R$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$${(value / 1000).toFixed(0)}k`;
    return `R$${value}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <style>{`
        .recharts-surface path { outline: none !important; }
        .recharts-sector:focus { outline: none !important; }
      `}</style>
      
      {/* Header Impressão */}
      <div className="hidden print:block mb-8 border-b-2 border-slate-200 pb-4">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-[#1C3A5B] p-2 rounded-lg text-white">
               <DollarSign size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-bold text-[#1C3A5B]">FinCalc Digital</h1>
               <p className="text-sm text-slate-500">Relatório de Viabilidade Financeira</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('pt-BR')}</p>
            <div className="mt-2 inline-block bg-slate-100 px-2 py-1 rounded text-xs font-bold uppercase text-slate-600">
               {mode === CalculationMode.DIRECT ? 'Modo Direto' : mode === CalculationMode.TARGET_PRICE ? 'Modo Meta de Preço' : 'Modo Meta de Volume'}
            </div>
          </div>
        </div>
        {/* Resumo Inputs Impressão */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 break-inside-avoid">
           <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
             <List size={12}/> Premissas do Cenário
           </h4>
           <div className="grid grid-cols-4 gap-y-2 gap-x-8 text-sm">
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Custo Produto:</span>
                <span className="font-mono font-bold text-slate-700">{formatCurrency(inputs.CP || 0)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Preço Venda:</span>
                <span className="font-mono font-bold text-slate-700">{formatCurrency(result.PVS)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Meta Vendas:</span>
                <span className="font-mono font-bold text-slate-700">{inputs.Meta || result.Meta} un</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1">
                <span className="text-slate-500">Marketing:</span>
                <span className="font-mono font-bold text-slate-700">{formatCurrency(inputs.Marketing || 0)}</span>
              </div>
           </div>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 print-break-inside">
        <KPICard 
          title="Lucro Líquido" 
          value={formatCurrency(result.LL)} 
          subtitle={`Margem Liq: ${formatPercent(result.MLL_Real)}`}
          icon={Wallet}
          theme={result.LL >= 0 ? "emerald" : "red"}
        />
        <KPICard 
          title="Margem de Contrib." 
          value={formatCurrency(result.MC_Real)} 
          subtitle="Sobra por venda"
          icon={TrendingUp}
          theme="blue"
        />
        <KPICard 
          title="Ponto de Equilíbrio" 
          value={`${result.PE_UN}`} 
          subtitle="Vendas para zerar"
          icon={Scale}
          theme="amber"
          unit="unid."
        />
        <KPICard 
          title={mode === CalculationMode.TARGET_PRICE ? 'Preço Sugerido' : 'Preço Praticado'} 
          value={formatCurrency(result.PVS)} 
          subtitle={mode === CalculationMode.TARGET_VOLUME ? `Meta: ${result.Meta} unid.` : 'Valor por venda'}
          icon={DollarSign}
          theme="violet"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-break-inside">
        
        {/* Gráfico de Barras */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col min-h-[400px] print-chart-fix">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="text-slate-400" size={20} />
                Análise de Viabilidade
              </h3>
              <p className="text-sm text-slate-400 mt-1">Receita vs Custos Totais</p>
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={handleExportCSV} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-green-600 transition-colors" title="Exportar CSV">
                  <FileText size={18} />
              </button>
              <button onClick={handlePrint} className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 hover:text-[#1C3A5B] dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center gap-2 font-bold text-xs" title="Imprimir Relatório">
                  <Printer size={16} />
                  <span className="hidden sm:inline">Imprimir</span>
              </button>
              <button
                  onClick={handleSave}
                  className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 font-bold text-xs ${
                    isSaved 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' 
                      : 'bg-[#1C3A5B] text-white hover:bg-blue-800 shadow-md shadow-blue-900/10'
                  }`}
                  title="Salvar Histórico"
                >
                  {isSaved ? <Check size={16} /> : <Save size={16} />}
                  {isSaved ? 'Salvo!' : 'Salvar'}
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: isDarkMode ? '#64748b' : '#64748b', fontSize: 11}} 
                  tickFormatter={formatAxisValue}
                  width={45} 
                />
                <Tooltip content={<CustomBarTooltip isDarkMode={isDarkMode} />} cursor={{fill: isDarkMode ? '#1e293b' : '#f8fafc'}} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="Receita" fill={isDarkMode ? "#3b82f6" : "#1C3A5B"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custos" fill={isDarkMode ? "#64748b" : "#94a3b8"} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Lucro" fill={result.LL >= 0 ? "#4CAF50" : "#E53935"} radius={[4, 4, 0, 0]} />
                <ReferenceLine y={0} stroke={isDarkMode ? "#475569" : "#cbd5e1"} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Pizza */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col min-h-[400px] break-inside-avoid print-chart-fix">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <PieIcon className="text-slate-400" size={20} />
              Composição do Preço
            </h3>
            <p className="text-sm text-slate-400 mt-1">Detalhamento do PVS: {formatCurrency(result.PVS)}</p>
          </div>

          <div className="flex-1 w-full relative h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  stroke={isDarkMode ? '#1e293b' : '#ffffff'}
                  strokeWidth={2}
                >
                  {activePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip isDarkMode={isDarkMode} total={result.PVS} />} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
               <div className="text-center">
                 <span className="text-[10px] text-slate-400 uppercase font-bold block">Preço</span>
                 <span className="text-xl font-bold text-[#1C3A5B] dark:text-blue-400">{formatCurrency(result.PVS)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* NOVO: Gráfico de Sensibilidade (Sensitivity Analysis) */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col print-chart-fix">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Activity className="text-indigo-500" size={20} />
              Sensibilidade de Preço
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Como o Lucro Líquido (Eixo Y) muda se você alterar o preço (Eixo X) entre -25% e +25%.
            </p>
          </div>
          <div className="flex-1 w-full h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#334155" : "#f1f5f9"} />
                   <XAxis 
                     dataKey="price" 
                     tickFormatter={(val) => `R$${val.toFixed(0)}`}
                     tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11}}
                     axisLine={false}
                     tickLine={false}
                   />
                   <YAxis 
                     tickFormatter={formatAxisValue}
                     tick={{fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11}}
                     axisLine={false}
                     tickLine={false}
                     width={50}
                   />
                   <Tooltip 
                     contentStyle={{
                         borderRadius: '12px', 
                         border: 'none', 
                         boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                         backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                         color: isDarkMode ? '#f8fafc' : '#334155'
                     }}
                     formatter={(value: number) => [formatCurrency(value), 'Lucro Projetado']}
                     labelFormatter={(label) => `Preço: ${formatCurrency(label as number)}`}
                   />
                   <ReferenceLine x={result.PVS} stroke="#1C3A5B" strokeDasharray="3 3" label={{ value: 'Atual', position: 'top', fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 10 }} />
                   <ReferenceLine y={0} stroke="#E53935" strokeOpacity={0.5} />
                   <Line 
                     type="monotone" 
                     dataKey="lucro" 
                     stroke={isDarkMode ? '#4CAF50' : '#4CAF50'} 
                     strokeWidth={3}
                     dot={(props: any) => {
                         // Destaque para o ponto atual
                         if (props.payload.isCurrent) {
                             return <circle cx={props.cx} cy={props.cy} r={6} fill="#1C3A5B" stroke="white" strokeWidth={2} />;
                         }
                         return <circle cx={props.cx} cy={props.cy} r={0} />;
                     }}
                     activeDot={{ r: 6 }}
                   />
                </LineChart>
             </ResponsiveContainer>
          </div>
      </div>

      {/* Tabela de Detalhamento e IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-break-inside">
        
        {/* Tabela */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col transition-colors">
           <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center gap-2">
             <List className="text-[#1C3A5B] dark:text-blue-400" size={18} />
             <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Detalhamento</h3>
           </div>
           <div className="flex-1 overflow-auto">
             <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-slate-100/80 dark:divide-slate-700/50">
                    <TableRow label="Receita Bruta" value={result.Revenue} bold tooltip="Valor total das vendas (PVS x Quantidade)." />
                    <TableRow label="Custos Fixos Operacionais" value={inputs.CF || 0} isNegative tooltip="Custos que não mudam com a venda (Aluguel, Pro-labore)." />
                    <TableRow label="Investimento Marketing" value={inputs.Marketing || 0} isNegative tooltip="Verba destinada a anúncios e aquisição de clientes." />
                    <TableRow label="Custos Variáveis" value={result.CV_UN * result.Meta} isNegative subLabel={`R$ ${result.CV_UN.toFixed(2)}/un`} tooltip="Custos que aumentam conforme a venda (Taxas + Custo Produto)." />
                    <TableRow 
                      label="Markup" 
                      customFormattedValue={(inputs.CP || 0) > 0 ? `${result.Markup.toFixed(2)}x` : 'N/A'}
                      subLabel={(inputs.CP || 0) > 0 ? "Sobre CP" : "Sem CP"}
                      tooltip="Multiplicador do custo. Ex: 2.0x significa vender pelo dobro do custo."
                    />
                    
                    {/* Sobrevivência & Risco */}
                    <tr className="bg-slate-50 dark:bg-slate-700/30">
                      <td colSpan={2} className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck size={14} /> Sobrevivência & Risco
                      </td>
                    </tr>
                    <TableRow 
                      label="PE (Unidades)" 
                      customFormattedValue={`${result.PE_UN} un`}
                      tooltip="Mínimo de vendas para pagar as contas (Lucro Zero)."
                    />
                     <TableRow 
                      label="PE (Receita)" 
                      value={result.PE_Valor}
                      tooltip="Faturamento mínimo necessário para pagar todas as contas do mês."
                    />
                     <TableRow 
                      label="Margem Segurança" 
                      customFormattedValue={`${(result.MarginSafety * 100).toFixed(1)}%`}
                      isStatus={true}
                      statusColor={result.MarginSafety > 0 ? 'text-emerald-600' : 'text-red-500'}
                      tooltip="Quanto suas vendas podem cair antes de ter prejuízo."
                    />
                    <TableRow 
                      label="MMC (Por venda)" 
                      value={result.MMC} 
                      subLabel="Absorção CF"
                      tooltip="Quanto cada venda paga da conta fixa (luz, equipe)."
                    />

                    {/* Eficiência & Cliente */}
                    <tr className="bg-slate-50 dark:bg-slate-700/30">
                      <td colSpan={2} className="px-6 py-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14} /> Eficiência & Cliente
                      </td>
                    </tr>
                    <TableRow 
                      label="CAC" 
                      value={result.CAC} 
                      subLabel="Custo Aquisição"
                      tooltip="Quanto custa trazer 1 cliente novo (Marketing / Vendas)."
                    />
                    <TableRow 
                      label="LTV" 
                      value={result.LTV} 
                      subLabel="Valor Vitalício"
                      tooltip="Valor total que um cliente gasta com você."
                    />
                     <TableRow 
                      label="Tempo de Vida" 
                      customFormattedValue={result.Lifetime > 0 ? `${result.Lifetime.toFixed(1)} meses` : "Indefinido"}
                      subLabel="Retenção Média"
                      tooltip="Tempo médio que o cliente permanece pagando. Fórmula: 1 / Churn."
                    />
                    <TableRow 
                      label="Razão LTV/CAC" 
                      customFormattedValue={`${result.LTV_CAC_Ratio.toFixed(1)}x`}
                      isStatus={true}
                      statusColor={result.LTV_CAC_Ratio >= 3 ? 'text-emerald-600' : (result.LTV_CAC_Ratio >= 1 ? 'text-amber-500' : 'text-red-500')}
                      tooltip="Saúde do negócio. > 3x é Excelente. < 1x é Prejuízo."
                    />
                    <TableRow 
                      label="ROI Marketing" 
                      customFormattedValue={`${result.ROI.toFixed(1)}%`}
                      isStatus={true}
                      statusColor={result.ROI > 0 ? 'text-emerald-600' : 'text-red-500'}
                      tooltip="Retorno sobre todo o dinheiro investido."
                    />

                    {/* Resultado Final */}
                    <tr className="bg-slate-100/50 dark:bg-slate-700/50 border-t-2 border-slate-100 dark:border-slate-600">
                        <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 text-sm">Lucro Líquido</td>
                        <td className={`px-6 py-4 text-right font-bold text-sm ${result.LL >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                           {formatCurrency(result.LL)}
                        </td>
                    </tr>
                </tbody>
            </table>
           </div>
        </div>

        {/* IA Assistant */}
        <div className={`lg:col-span-2 rounded-2xl shadow-lg overflow-hidden transition-all duration-700 border transform ${aiAnalysis ? 'bg-white dark:bg-slate-800 border-purple-200 dark:border-purple-900 scale-100' : 'bg-gradient-to-br from-[#1C3A5B] to-[#0f243a] dark:from-slate-900 dark:to-slate-950 border-[#1C3A5B] dark:border-slate-700'} no-print`}>
          <div className="p-6 md:p-8 relative h-full flex flex-col justify-center">
             {!aiAnalysis && (
                <>
                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                    <BrainCircuit size={300} color="white" />
                  </div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                </>
             )}

             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2.5 rounded-xl ${aiAnalysis ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'bg-white/10 text-blue-200 ring-1 ring-white/20'}`}>
                     <BrainCircuit size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${aiAnalysis ? 'text-slate-800 dark:text-slate-100' : 'text-white'}`}>
                      Consultor Financeiro IA
                    </h3>
                  </div>
                </div>
                
                {!aiAnalysis ? (
                  <div className="max-w-2xl">
                     <p className="text-slate-300 mb-6 text-sm md:text-base leading-relaxed font-light">
                       Obtenha uma análise profissional do seu cenário. Nossa IA avaliará o risco e sugerirá otimizações.
                     </p>
                     <button
                      onClick={handleAiAnalysis}
                      disabled={isLoadingAi}
                      className="px-6 py-3 bg-white hover:bg-blue-50 text-[#1C3A5B] rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed group active:scale-95 text-sm"
                    >
                      {isLoadingAi ? <Loader2 className="animate-spin text-[#1C3A5B]" size={18} /> : <BrainCircuit size={18} className="text-[#1C3A5B] group-hover:scale-110 transition-transform" />}
                      {isLoadingAi ? 'Analisando...' : 'Gerar Relatório IA'}
                    </button>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                       {aiAnalysis.split('\n').map((line, i) => {
                          const trimmed = line.trim();
                          if (trimmed.startsWith('#') || trimmed.startsWith('**')) {
                               return <h4 key={i} className="font-bold text-slate-800 dark:text-slate-100 text-base mt-4 mb-2 flex items-center gap-2">
                                 {trimmed.replace(/[#*]/g, '')}
                               </h4>
                          }
                          return <p key={i} className="mb-1.5">{line}</p>
                       })}
                    </div>
                    <div className="mt-6 flex justify-end border-t border-slate-100 dark:border-slate-700 pt-4">
                      <button 
                        onClick={() => setAiAnalysis(null)}
                        className="text-xs font-semibold text-slate-500 hover:text-[#1C3A5B] dark:text-slate-400 dark:hover:text-blue-400 hover:underline transition-colors flex items-center gap-2"
                      >
                        <BrainCircuit size={14} />
                        Nova análise
                      </button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Custom Tooltip Components ---

const CustomBarTooltip = ({ active, payload, label, isDarkMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-3 rounded-xl shadow-xl border min-w-[200px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'}`}>
        <p className={`font-bold mb-2 text-sm pb-2 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const value = entry.value as number;
            const isProfit = entry.name === 'Lucro';
            const isNegativeProfit = isProfit && value < 0;

            return (
              <div key={index} className="flex items-center justify-between text-xs sm:text-sm p-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isNegativeProfit ? '#ef4444' : entry.color }}/>
                  <span className={`font-medium ${isNegativeProfit ? 'text-red-500' : 'text-slate-500'}`}>{entry.name}</span>
                </div>
                <span className={`font-mono font-bold ${isProfit ? (value >= 0 ? 'text-emerald-600' : 'text-red-600') : ''}`}>
                  {formatCurrency(value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload, isDarkMode, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percent = total > 0 ? (data.value / total) * 100 : 0;
    
    return (
      <div className={`p-3 rounded-xl shadow-xl border min-w-[180px] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-100 text-slate-800'}`}>
        <p className="font-bold text-sm mb-1" style={{ color: data.payload.color }}>{data.name}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold font-mono">{formatCurrency(data.value)}</span>
          <span className="text-xs font-medium text-slate-400">({percent.toFixed(1)}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

// --- Helper Components ---

const KPICard = ({ title, value, subtitle, icon: Icon, theme, unit }: { title: string, value: string, subtitle: string, icon: any, theme: 'emerald'|'red'|'blue'|'amber'|'violet', unit?: string }) => {
  const themes = {
    emerald: { bg: 'bg-white dark:bg-slate-800', border: 'border-[#4CAF50]/30', text: 'text-[#4CAF50]', iconBg: 'bg-[#4CAF50]/10', iconColor: 'text-[#4CAF50]' },
    red: { bg: 'bg-white dark:bg-slate-800', border: 'border-[#E53935]/30', text: 'text-[#E53935]', iconBg: 'bg-[#E53935]/10', iconColor: 'text-[#E53935]' },
    blue: { bg: 'bg-white dark:bg-slate-800', border: 'border-blue-200', text: 'text-[#1C3A5B]', iconBg: 'bg-blue-50', iconColor: 'text-[#1C3A5B]' },
    amber: { bg: 'bg-white dark:bg-slate-800', border: 'border-[#FFC107]/50', text: 'text-[#d9a406]', iconBg: 'bg-[#FFC107]/10', iconColor: 'text-[#d9a406]' },
    violet: { bg: 'bg-white dark:bg-slate-800', border: 'border-indigo-200', text: 'text-[#1C3A5B]', iconBg: 'bg-indigo-50', iconColor: 'text-[#1C3A5B]' }
  };
  const currentTheme = themes[theme] || themes.blue;

  return (
    <div className={`p-6 rounded-2xl shadow-sm border-l-4 transition-all hover:shadow-md flex flex-col justify-between h-full ${currentTheme.bg} ${currentTheme.border} dark:border-opacity-20`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`p-2.5 rounded-xl ${currentTheme.iconBg} dark:bg-opacity-20`}>
          <Icon size={18} className={currentTheme.iconColor} />
        </div>
      </div>
      <div>
        <div className={`text-3xl font-bold tracking-tight ${currentTheme.text} dark:text-opacity-90`}>
          {value} <span className="text-sm font-medium opacity-60 text-slate-400 ml-0.5">{unit}</span>
        </div>
        <p className="text-xs mt-2 font-medium text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
};

const TableRow = ({ label, value, isNegative, bold, subLabel, tooltip, customFormattedValue, isStatus, statusColor }: any) => (
  <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
    <td className="px-6 py-3 text-slate-600 dark:text-slate-300 font-medium">
      <div className="flex items-center gap-2">
        {label}
        {tooltip && (
          <div className="group/tooltip relative">
             <div className="cursor-help text-slate-300 hover:text-[#1C3A5B] dark:text-slate-600 dark:hover:text-blue-400 transition-colors">
               <HelpCircle size={14} />
             </div>
             <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl leading-relaxed border border-slate-700">
               {tooltip}
             </div>
          </div>
        )}
      </div>
      {subLabel && <span className="block text-xs text-slate-400 dark:text-slate-500 font-normal mt-0.5">{subLabel}</span>}
    </td>
    <td className={`px-6 py-3 text-right font-mono text-sm 
      ${bold ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'} 
      ${isNegative ? 'text-red-500 dark:text-red-400' : ''}
      ${isStatus ? `font-bold ${statusColor}` : ''}
    `}>
      {isNegative && "-"}
      {customFormattedValue ? customFormattedValue : formatCurrency(value)}
    </td>
  </tr>
);

export default ResultsSection;

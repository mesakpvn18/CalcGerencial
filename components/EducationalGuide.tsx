
import React from 'react';
import { X, BookOpen, TrendingUp, ShieldAlert, Users, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EducationalGuide: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: "Lucratividade & Margem",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      items: [
        {
          term: "Margem de Contribuição (MC)",
          what: "É o valor que 'sobra' de cada venda após pagar os custos diretos do produto e impostos.",
          analysis: "Se a MC for baixa, você precisa vender volumes gigantescos para ter lucro.",
          action: "Para aumentar: Aumente o preço (PVS), negocie custos de produto menores (CP) ou reduza taxas (TxF/TxP)."
        },
        {
          term: "Markup (Multiplicador)",
          what: "Quantas vezes o preço de venda cobre o custo do produto.",
          analysis: "Produtos digitais geralmente permitem Markups altos (3x a 10x). Comércio físico opera com 1.5x a 2.5x.",
          action: "Se seu Markup é baixo (< 2.0x) em infoprodutos, sua precificação provavelmente está errada ou o custo de tráfego vai corroer seu lucro."
        },
        {
          term: "Lucro Líquido (LL)",
          what: "O dinheiro que realmente entra no bolso após pagar TUDO (Variáveis + Fixos + Marketing).",
          analysis: "Lucro não é salário! O LL deve ser reinvestido ou distribuído como dividendos.",
          action: "Se LL for negativo, pare e revise: ou seu custo fixo é alto demais para o volume atual, ou sua margem é muito pequena."
        }
      ]
    },
    {
      title: "Risco & Sobrevivência",
      icon: ShieldAlert,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      items: [
        {
          term: "Ponto de Equilíbrio (PE)",
          what: "O mínimo que você precisa vender para ficar no 'zero a zero' (sem lucro, sem prejuízo).",
          analysis: "Quanto mais baixo o PE, menor o risco do negócio.",
          action: "Se seu PE está muito próximo da sua capacidade máxima de vendas, qualquer imprevisto te leva ao prejuízo. Reduza Custos Fixos para baixar o PE."
        },
        {
          term: "Margem de Segurança",
          what: "A porcentagem que sua Meta atual está ACIMA do Ponto de Equilíbrio.",
          analysis: "Ideal > 20%. Significa que suas vendas podem cair 20% e você ainda não terá prejuízo.",
          action: "Se estiver negativa ou < 10%, o negócio está em zona de perigo. Foque em vendas urgentes."
        },
        {
          term: "MMC (Absorção de CF)",
          what: "Quanto cada venda precisa contribuir apenas para pagar a conta de luz, aluguel, equipe, etc.",
          analysis: "Mostra o peso da sua estrutura fixa sobre cada unidade vendida.",
          action: "Se a MMC for um valor alto, sua estrutura é pesada. Dilua isso aumentando o volume de vendas."
        }
      ]
    },
    {
      title: "Eficiência do Cliente (Unit Economics)",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      items: [
        {
          term: "CAC (Custo de Aquisição)",
          what: "Quanto você gasta em Marketing/Vendas para conseguir 1 cliente novo.",
          analysis: "CAC alto só é aceitável se o cliente gastar muito com você ao longo do tempo (LTV alto).",
          action: "Para reduzir CAC: Melhore a conversão da Landing Page, melhore os criativos dos anúncios ou invista em orgânico."
        },
        {
          term: "LTV (Lifetime Value)",
          what: "Quanto dinheiro um cliente deixa na empresa durante todo o tempo que permanece com você.",
          analysis: "Fundamental em assinaturas (SaaS/IPTV). O LTV deve ser pelo menos 3x maior que o CAC.",
          action: "Aumente o LTV reduzindo o Churn (cancelamento) ou fazendo Upsell (vendendo planos mais caros)."
        },
        {
          term: "Razão LTV/CAC",
          what: "O 'Termômetro de Ouro' de startups e negócios digitais.",
          analysis: "3x ou mais = Saudável. 1x = Você troca dinheiro (trabalha de graça). < 1x = Você paga para trabalhar (prejuízo certo).",
          action: "Se estiver abaixo de 3x, pare de escalar anúncios e conserte a retenção ou o preço."
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
        
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="text-[#1C3A5B] dark:text-blue-400" size={24} />
              Guia Estratégico
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Como interpretar seus números e tomar decisões.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="space-y-8">
            {sections.map((section, idx) => (
              <section key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 ${section.bg}`}>
                  <section.icon className={section.color} size={20} />
                  <h3 className={`font-bold text-lg ${section.color.replace('text-', 'text-slate-900 dark:text-')}`}>{section.title}</h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {section.items.map((item, i) => (
                    <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-baseline justify-between mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{item.term}</h4>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {item.what}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                          <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1 flex items-center gap-1">
                            <Target size={12}/> Análise
                          </p>
                          <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-snug">
                            {item.analysis}
                          </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1 flex items-center gap-1">
                            <TrendingUp size={12}/> Ação Prática
                          </p>
                          <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-snug">
                            {item.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalGuide;

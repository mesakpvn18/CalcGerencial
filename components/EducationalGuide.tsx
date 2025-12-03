
import React from 'react';
import { X, BookOpen, TrendingUp, ShieldAlert, Users, Target } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const EducationalGuide: React.FC<Props> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;
  const t = translations[language];

  // Tradução manual da estrutura de seções pois é complexa
  const getSections = () => {
    // Portuguese
    if (language === 'pt') {
      return [
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
    } 
    // English
    else {
      return [
        {
          title: "Lucrativity & Margin",
          icon: TrendingUp,
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-900/20",
          items: [
            {
              term: "Contribution Margin (MC)",
              what: "The value that 'remains' from each sale after paying direct product costs and taxes.",
              analysis: "If MC is low, you need to sell massive volumes to make a profit.",
              action: "To increase: Increase price (PVS), negotiate lower product costs (CP), or reduce fees (TxF/TxP)."
            },
            {
              term: "Markup (Multiplier)",
              what: "How many times the sales price covers the product cost.",
              analysis: "Digital products usually allow high Markups (3x to 10x). Physical retail operates with 1.5x to 2.5x.",
              action: "If your Markup is low (< 2.0x) for digital products, your pricing is likely wrong or traffic costs will erode your profit."
            },
            {
              term: "Net Profit (LL)",
              what: "The money that actually goes into your pocket after paying EVERYTHING (Variables + Fixed + Marketing).",
              analysis: "Profit is not salary! LL should be reinvested or distributed as dividends.",
              action: "If LL is negative, stop and review: either your fixed costs are too high for the current volume, or your margin is too small."
            }
          ]
        },
        {
          title: "Risk & Survival",
          icon: ShieldAlert,
          color: "text-amber-600",
          bg: "bg-amber-50 dark:bg-amber-900/20",
          items: [
            {
              term: "Break-Even Point (PE)",
              what: "The minimum you need to sell to 'break even' (zero profit, zero loss).",
              analysis: "The lower the PE, the lower the business risk.",
              action: "If your PE is very close to your maximum sales capacity, any unforeseen event leads to a loss. Reduce Fixed Costs to lower the PE."
            },
            {
              term: "Margin of Safety",
              what: "The percentage your current Target is ABOVE the Break-Even Point.",
              analysis: "Ideal > 20%. Means your sales can drop 20% and you still won't lose money.",
              action: "If negative or < 10%, the business is in the danger zone. Focus on urgent sales."
            },
            {
              term: "MMC (Fixed Cost Absorption)",
              what: "How much each sale needs to contribute just to pay the electricity bill, rent, team, etc.",
              analysis: "Shows the weight of your fixed structure on each unit sold.",
              action: "If MMC is high, your structure is heavy. Dilute this by increasing sales volume."
            }
          ]
        },
        {
          title: "Client Efficiency (Unit Economics)",
          icon: Users,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          items: [
            {
              term: "CAC (Acquisition Cost)",
              what: "How much you spend on Marketing/Sales to get 1 new customer.",
              analysis: "High CAC is only acceptable if the customer spends a lot with you over time (High LTV).",
              action: "To reduce CAC: Improve Landing Page conversion, improve ad creatives, or invest in organic traffic."
            },
            {
              term: "LTV (Lifetime Value)",
              what: "How much money a customer leaves in the company during the entire time they stay with you.",
              analysis: "Fundamental in subscriptions (SaaS/IPTV). LTV must be at least 3x higher than CAC.",
              action: "Increase LTV by reducing Churn (cancellation) or doing Upsell (selling more expensive plans)."
            },
            {
              term: "LTV/CAC Ratio",
              what: "The 'Golden Thermometer' of startups and digital businesses.",
              analysis: "3x or more = Healthy. 1x = You trade money (work for free). < 1x = You pay to work (certain loss).",
              action: "If below 3x, stop scaling ads and fix retention or pricing."
            }
          ]
        }
      ];
    }
  };

  const sections = getSections();

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
              {t.guide.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.guide.subtitle}
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
                            <Target size={12}/> {t.guide.analysis}
                          </p>
                          <p className="text-xs text-blue-900/80 dark:text-blue-200/80 leading-snug">
                            {item.analysis}
                          </p>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase mb-1 flex items-center gap-1">
                            <TrendingUp size={12}/> {t.guide.action}
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


import { FinancialInputs, CalculationResult, CalculationMode } from '../types';

export const calculateFinancials = (
  mode: CalculationMode,
  inputs: FinancialInputs
): CalculationResult => {
  // Sanitiza inputs: se undefined ou null, considera 0 para o cálculo
  const CP = inputs.CP ?? 0;
  const TxF = inputs.TxF ?? 0;
  const TxP = inputs.TxP ?? 0;
  const CF = inputs.CF ?? 0;
  const Marketing = inputs.Marketing ?? 0;
  const MarketingType = inputs.MarketingType || 'fixed'; // Padrão 'fixed'
  const Churn = inputs.Churn ?? 0;
  const PVS = inputs.PVS ?? 0;
  const Meta = inputs.Meta ?? 0;
  const MLL_D = inputs.MLL_D ?? 0;

  const txpDecimal = TxP / 100;
  const mllDecimal = MLL_D ? MLL_D / 100 : 0;
  
  // Separa o Marketing em Fixo ou Variável
  let fixedMarketing = 0;
  let variableMarketingDecimal = 0;

  if (MarketingType === 'percent') {
    variableMarketingDecimal = Marketing / 100;
  } else {
    fixedMarketing = Marketing;
  }

  const TotalFixedCosts = CF + fixedMarketing;

  let calculatedPVS = PVS;
  let calculatedMeta = Meta;
  let error: string | undefined = undefined;

  // --- Logic Routing ---

  if (mode === CalculationMode.TARGET_PRICE) {
    if (!Meta || Meta <= 0) {
      return getEmptyResult("Defina uma Meta de volume válida.");
    }
    // Denominador subtrai as taxas variáveis (Impostos + Margem + Marketing%)
    const denominator = Meta * (1 - txpDecimal - mllDecimal - variableMarketingDecimal);
    if (denominator <= 0) {
      return getEmptyResult("Impossível atingir a margem desejada com as taxas atuais (Impostos + Mkt + Margem > 100%).");
    }
    const numerator = ((CP + TxF) * Meta) + TotalFixedCosts;
    calculatedPVS = numerator / denominator;
    calculatedMeta = Meta;

  } else if (mode === CalculationMode.TARGET_VOLUME) {
    if (!PVS || PVS <= 0) {
      return getEmptyResult("Defina um Preço de Venda (PVS) válido.");
    }
    // Custo Variável Unitário inclui o Marketing Variável se houver
    const cv_un_temp = CP + TxF + (PVS * txpDecimal) + (PVS * variableMarketingDecimal);
    const mc_real = PVS - cv_un_temp;
    
    // Para target volume: Lucro = Receita - CV - CF => (P*Q - CV_un*Q) - CF = P*Q*Margem
    // Q * (P - CV_un - P*Margem) = CF
    const denominator = mc_real - (PVS * mllDecimal);
    
    if (denominator <= 0) {
       return getEmptyResult("Preço muito baixo para atingir a margem desejada. O lucro por unidade é insuficiente.");
    }
    calculatedMeta = Math.ceil(TotalFixedCosts / denominator);
    calculatedPVS = PVS;

  } else {
    calculatedPVS = PVS;
    calculatedMeta = Meta;
  }

  // --- Final Metrics Calculation ---
  const CV_UN = CP + TxF + (calculatedPVS * txpDecimal) + (calculatedPVS * variableMarketingDecimal);
  const MC_Real = calculatedPVS - CV_UN;
  const PE_UN = MC_Real > 0 ? Math.ceil(TotalFixedCosts / MC_Real) : 0;
  const PE_Valor = PE_UN * calculatedPVS;
  const Revenue = calculatedPVS * calculatedMeta;
  const LL = (MC_Real * calculatedMeta) - TotalFixedCosts;
  const MLL_Real = Revenue > 0 ? (LL / Revenue) * 100 : 0;
  const Markup = CP > 0 ? calculatedPVS / CP : 0;
  const MMC = calculatedMeta > 0 ? TotalFixedCosts / calculatedMeta : 0;
  const MarginSafety = calculatedMeta > 0 ? (calculatedMeta - PE_UN) / calculatedMeta : -1;

  // Calcula o valor total monetário do Marketing para exibição
  const MarketingTotal = fixedMarketing + (calculatedPVS * calculatedMeta * variableMarketingDecimal);

  // --- Efficiency Metrics ---
  const CAC = calculatedMeta > 0 ? MarketingTotal / calculatedMeta : 0;
  const churnDecimal = (Churn || 0) / 100;
  const Lifetime = churnDecimal > 0 ? 1 / churnDecimal : 0;
  
  // CORREÇÃO: LTV deve ser baseado na Margem de Contribuição (MC_Real), não na Receita (PVS).
  // Se usar Receita, o LTV fica inflado e ignora custos variáveis.
  // Se Churn for 0, usamos 12 meses como cap de projeção conservadora para evitar infinito.
  const LTV = churnDecimal > 0 ? MC_Real / churnDecimal : (MC_Real * 12);
  
  const Payback = (CAC > 0 && MC_Real > 0) ? CAC / MC_Real : 0;
  const TotalCosts = (CV_UN * calculatedMeta) + TotalFixedCosts;
  const ROI = TotalCosts > 0 ? (LL / TotalCosts) * 100 : 0;
  const LTV_CAC_Ratio = CAC > 0 ? LTV / CAC : 0;

  return {
    PVS: calculatedPVS,
    Meta: calculatedMeta,
    CV_UN,
    MC_Real,
    PE_UN,
    PE_Valor,
    LL,
    Revenue,
    MLL_Real,
    Markup,
    MMC,
    MarginSafety,
    CAC,
    LTV,
    Lifetime,
    Payback,
    ROI,
    LTV_CAC_Ratio,
    MarketingTotal, // Novo campo
    isValid: true,
    error
  };
};

const getEmptyResult = (errorMsg: string): CalculationResult => ({
  PVS: 0,
  Meta: 0,
  CV_UN: 0,
  MC_Real: 0,
  PE_UN: 0,
  PE_Valor: 0,
  LL: 0,
  Revenue: 0,
  MLL_Real: 0,
  Markup: 0,
  MMC: 0,
  MarginSafety: 0,
  CAC: 0,
  LTV: 0,
  Lifetime: 0,
  Payback: 0,
  ROI: 0,
  LTV_CAC_Ratio: 0,
  MarketingTotal: 0,
  isValid: false,
  error: errorMsg
});

export const formatCurrency = (value: number, currency: string = 'BRL', language: string = 'pt') => {
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(value);
};

export const formatPercent = (value: number, language: string = 'pt') => {
  const locale = language === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
};

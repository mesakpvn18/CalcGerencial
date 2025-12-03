
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
  const Churn = inputs.Churn ?? 0;
  const PVS = inputs.PVS ?? 0;
  const Meta = inputs.Meta ?? 0;
  const MLL_D = inputs.MLL_D ?? 0;

  const txpDecimal = TxP / 100;
  const mllDecimal = MLL_D ? MLL_D / 100 : 0;
  
  // Marketing is effectively a fixed cost for the period, add it to CF for P&L logic
  const TotalFixedCosts = CF + Marketing;

  let calculatedPVS = PVS;
  let calculatedMeta = Meta;
  let error: string | undefined = undefined;

  // --- Logic Routing ---

  if (mode === CalculationMode.TARGET_PRICE) {
    // Reverse Engineering A: Calculate PVS given Meta and MLL_D
    
    if (!Meta || Meta <= 0) {
      return getEmptyResult("Defina uma Meta de volume válida.");
    }
    
    const denominator = Meta * (1 - txpDecimal - mllDecimal);
    
    if (denominator <= 0) {
      return getEmptyResult("Impossível atingir a margem desejada com as taxas atuais. A soma de Taxas + Margem excede 100%.");
    }

    // Numerator includes Total Fixed Costs (CF + Marketing)
    const numerator = ((CP + TxF) * Meta) + TotalFixedCosts;
    calculatedPVS = numerator / denominator;
    calculatedMeta = Meta;

  } else if (mode === CalculationMode.TARGET_VOLUME) {
    // Reverse Engineering B: Calculate Meta given PVS and MLL_D
    
    if (!PVS || PVS <= 0) {
      return getEmptyResult("Defina um Preço de Venda (PVS) válido.");
    }

    const cv_un = CP + TxF + (PVS * txpDecimal);
    const mc_real = PVS - cv_un;
    
    const denominator = mc_real - (PVS * mllDecimal);

    if (denominator <= 0) {
       return getEmptyResult("Preço muito baixo para atingir a margem desejada. O lucro por unidade é insuficiente para cobrir a % de lucro desejada.");
    }

    calculatedMeta = Math.ceil(TotalFixedCosts / denominator);
    calculatedPVS = PVS;

  } else {
    // Direct Calculation
    calculatedPVS = PVS;
    calculatedMeta = Meta;
  }

  // --- Final Metrics Calculation (Common for all modes) ---

  const CV_UN = CP + TxF + (calculatedPVS * txpDecimal);
  const MC_Real = calculatedPVS - CV_UN;
  
  // Break Even considers Total Fixed Costs (CF + Marketing)
  const PE_UN = MC_Real > 0 ? Math.ceil(TotalFixedCosts / MC_Real) : 0;
  const PE_Valor = PE_UN * calculatedPVS;
  
  const Revenue = calculatedPVS * calculatedMeta;
  const LL = (MC_Real * calculatedMeta) - TotalFixedCosts;
  const MLL_Real = Revenue > 0 ? (LL / Revenue) * 100 : 0;
  
  // Markup Calculation (Multiplier)
  const Markup = CP > 0 ? calculatedPVS / CP : 0;

  // MMC Calculation (Margem Mínima de Contribuição para cobrir CF)
  const MMC = calculatedMeta > 0 ? TotalFixedCosts / calculatedMeta : 0;

  // Margin of Safety Calculation
  const MarginSafety = calculatedMeta > 0 ? (calculatedMeta - PE_UN) / calculatedMeta : -1;

  // --- Efficiency Metrics (CAC, LTV, ROI) ---
  
  // CAC: Marketing / Meta (New Customers)
  const CAC = calculatedMeta > 0 ? (Marketing || 0) / calculatedMeta : 0;
  
  // LTV: PVS / Churn% (Simplified for subscription)
  // Lifetime Calculation based on Churn
  const churnDecimal = (Churn || 0) / 100;
  
  // Se Churn > 0, Lifetime = 1 / Churn. Se Churn = 0, consideramos indefinido/infinito (usamos 0 no valor numérico para tratar na UI)
  const Lifetime = churnDecimal > 0 ? 1 / churnDecimal : 0;

  // LTV Calculation
  const LTV = churnDecimal > 0 ? calculatedPVS / churnDecimal : (calculatedPVS * 12); // Fallback to 12 months if churn 0

  // ROI: (Net Profit / Total Investment) * 100
  // Total Investment = Total Variable Costs + Total Fixed Costs (including marketing)
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
    ROI,
    LTV_CAC_Ratio,
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
  ROI: 0,
  LTV_CAC_Ratio: 0,
  isValid: false,
  error: errorMsg
});

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatPercent = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value / 100);
};
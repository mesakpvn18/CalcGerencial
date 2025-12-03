
export type Language = 'pt' | 'en';

export enum CalculationMode {
  DIRECT = 'DIRECT',
  TARGET_PRICE = 'TARGET_PRICE',
  TARGET_VOLUME = 'TARGET_VOLUME',
}

export interface FinancialInputs {
  CP?: number;       // Custo do Produto
  TxF?: number;      // Taxa Fixa por Transação
  TxP?: number;      // Taxa Percentual por Transação (0-100)
  CF?: number;       // Custos Fixos Mensais
  Marketing?: number; // Novo: Investimento em Marketing
  Churn?: number;    // Novo: Taxa de Cancelamento %
  PVS?: number;     // Preço de Venda Final (Optional depending on mode)
  Meta?: number;    // Meta de Vendas Mensais (Optional depending on mode)
  MLL_D?: number;   // Margem de Lucro Líquida Desejada (Optional depending on mode)
}

export interface CalculationResult {
  PVS: number;
  Meta: number;
  CV_UN: number;
  MC_Real: number;
  PE_UN: number;
  PE_Valor: number;
  LL: number;
  Revenue: number;
  MLL_Real: number;
  Markup: number;
  MMC: number;
  MarginSafety: number;
  // Métricas de Eficiência
  CAC: number;
  LTV: number;
  Lifetime: number;
  Payback: number; // Novo: Meses para recuperar o CAC
  ROI: number;
  LTV_CAC_Ratio: number;
  
  isValid: boolean;
  error?: string;
}

export interface AIAnalysisResponse {
  analysis: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: CalculationMode;
  inputs: FinancialInputs;
  result: CalculationResult;
  currency?: string; 
  language?: Language;
}

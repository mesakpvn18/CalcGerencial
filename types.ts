
export type Language = 'pt' | 'en';
export type Period = 'monthly' | 'bimestral' | 'trimestral' | 'semestral' | 'yearly';

export enum CalculationMode {
  DIRECT = 'DIRECT',
  TARGET_PRICE = 'TARGET_PRICE',
  TARGET_VOLUME = 'TARGET_VOLUME',
}

export interface FinancialInputs {
  CP?: number;       // Custo do Produto
  TxF?: number;      // Taxa Fixa por Transação
  TxP?: number;      // Taxa Percentual por Transação (0-100)
  CF?: number;       // Custos Fixos (Do período selecionado)
  Marketing?: number; // Investimento em Marketing (Do período selecionado)
  Churn?: number;    // Taxa de Cancelamento %
  PVS?: number;     // Preço de Venda Final
  Meta?: number;    // Meta de Vendas (Do período selecionado)
  MLL_D?: number;   // Margem de Lucro Líquida Desejada
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
  CAC: number;
  LTV: number;
  Lifetime: number;
  Payback: number;
  ROI: number;
  LTV_CAC_Ratio: number;
  isValid: boolean;
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: CalculationMode;
  period?: Period; 
  inputs: FinancialInputs;
  result: CalculationResult;
  currency?: string; 
  language?: Language;
  isCloud?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  is_pro: boolean; // Status da assinatura
}

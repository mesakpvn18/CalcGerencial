import { GoogleGenAI } from "@google/genai";
import { CalculationResult, FinancialInputs, CalculationMode } from "../types";

export const analyzeFinancials = async (
  results: CalculationResult,
  inputs: FinancialInputs,
  mode: CalculationMode
): Promise<string> => {
  
  // Acesso seguro à chave de API evitando ReferenceError
  let apiKey = '';
  try {
    // Tenta acessar via window.process (polyfill) ou process global
    const envSource = (typeof window !== 'undefined' && (window as any).process) 
      ? (window as any).process 
      : (typeof process !== 'undefined' ? process : undefined);

    if (envSource && envSource.env) {
      apiKey = envSource.env.API_KEY;
    }
  } catch (e) {
    console.warn("Ambiente seguro: Não foi possível ler process.env diretamente.");
  }

  if (!apiKey) {
    return "Erro: Chave de API não detectada. O sistema funcionará, mas a IA não poderá gerar análises.";
  }

  // Inicializa o cliente Gemini apenas se houver chave
  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelId = "gemini-2.5-flash";

    const prompt = `
      Atue como um Consultor Financeiro Sênior especializado em Negócios Digitais e Assinaturas (SaaS/IPTV).
      Analise os seguintes dados de um cenário de negócio. Use Markdown para formatar a resposta.
      Seja conciso, direto e estratégico. Fale diretamente com o empreendedor.

      CONTEXTO:
      Modo de Cálculo: ${mode}
      
      DADOS DE ENTRADA (Premissas):
      - Custo Produto (CP): R$ ${inputs.CP}
      - Taxa Fixa (TxF): R$ ${inputs.TxF}
      - Taxa % (TxP): ${inputs.TxP}%
      - Custo Fixo Mensal (CF): R$ ${inputs.CF}
      ${mode === CalculationMode.TARGET_PRICE ? `- Meta de Vendas: ${inputs.Meta} un` : ''}
      ${mode === CalculationMode.TARGET_VOLUME ? `- Preço Venda (PVS): R$ ${inputs.PVS}` : ''}
      ${inputs.MLL_D ? `- Margem Lucro Desejada: ${inputs.MLL_D}%` : ''}

      RESULTADOS CALCULADOS:
      - Preço Final (PVS): R$ ${results.PVS.toFixed(2)}
      - Volume (Meta): ${results.Meta} unidades
      - Margem Contribuição Real (MC_Real): R$ ${results.MC_Real.toFixed(2)}
      - Ponto de Equilíbrio (PE): ${results.PE_UN} unidades
      - Lucro Líquido (LL): R$ ${results.LL.toFixed(2)}
      - Margem Líquida Real: ${results.MLL_Real.toFixed(1)}%

      TAREFAS:
      1. Interprete o resultado principal (${mode === CalculationMode.TARGET_PRICE ? 'O Preço Sugerido' : mode === CalculationMode.TARGET_VOLUME ? 'O Volume Necessário' : 'O Lucro Projetado'}).
      2. Avalie o Risco: Compare o Ponto de Equilíbrio (${results.PE_UN}) com a Meta (${results.Meta}). O quão difícil é atingir isso?
      3. Dê uma dica prática para melhorar a Margem de Contribuição neste cenário específico.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Não foi possível gerar a análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ocorreu um erro ao conectar com a IA. Tente novamente mais tarde.";
  }
};
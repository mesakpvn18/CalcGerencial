
import { Language } from '../types';

export const translations = {
  pt: {
    app: {
      title: "FinCalc Digital",
      subtitle: "Contabilidade Gerencial",
      install: "Instalar",
      guide: "Guia",
      share: "Compartilhar",
      copied: "Copiado!",
      history: "Histórico",
      loading: "Carregando dados...",
      footer: "Baseado no método da Margem de Contribuição."
    },
    inputs: {
      title: "Parâmetros",
      templates: "Modelos",
      clear: "Limpar campos",
      period: {
         label: "Projeção / Visualização",
         monthly: "Mensal (Base)",
         bimestral: "Bimestral (2 meses)",
         trimestral: "Trimestral (3 meses)",
         semestral: "Semestral (6 meses)",
         yearly: "Anual (12 meses)"
      },
      input_hint: "Insira os valores MENSAIS. O sistema fará a projeção automaticamente.",
      modes: {
        direct: "Direto",
        price: "Preço",
        meta: "Meta"
      },
      context: {
        direct: "Simule o resultado financeiro baseado no preço e volume atuais.",
        price: "Calcule o preço ideal (PVS) para atingir sua meta de lucro.",
        meta: "Calcule quantas vendas são necessárias para sua meta de lucro."
      },
      sections: {
        costs: "Custos e Despesas (Mensal)",
        scenario: "Cenário e Vendas (Mensal)"
      },
      labels: {
        cp: "Custo Produto (CP)",
        cf: "Custo Fixo",
        txf: "Taxa Fixa (TxF)",
        txp: "Taxa % (TxP)",
        marketing: "Investimento em Marketing",
        pvs: "Preço Venda (PVS)",
        meta: "Meta de Vendas",
        churn: "Churn (Cancelamento)",
        mll_d: "Margem Líquida Desejada"
      },
      placeholders: {
        gateway: "Gateway",
        tax: "Imposto",
        ads: "Ads/Divulgação",
        price: "Valor para cliente",
        units: "Unidades",
        percent: "Taxa %",
        margin_ex: "Ex: 20"
      },
      hints: {
        margin: "Porcentagem do faturamento que deve sobrar como lucro limpo.",
        fill: "Preencha os campos para calcular automaticamente"
      },
      errors: {
        negative: "O valor não pode ser negativo",
        max100: "A taxa não pode exceder 100%"
      }
    },
    results: {
      header: "Relatório de Viabilidade Financeira",
      date: "Data",
      assumptions: "Premissas do Cenário",
      kpi: {
        ll: "Lucro Líquido",
        mc: "Margem de Contrib.",
        pe: "Ponto de Equilíbrio",
        price: "Preço Praticado",
        suggested_price: "Preço Sugerido",
        sub: {
          margin: "Margem Liq",
          sobra: "Sobra por venda",
          zerar: "Vendas para zerar",
          val_unit: "Valor por venda",
          meta: "Meta"
        }
      },
      charts: {
        viability: "Análise de Viabilidade",
        revenue_cost: "Receita vs Custos Totais",
        composition: "Composição do Preço",
        detail: "Detalhamento do PVS",
        sensitivity: "Sensibilidade de Preço",
        sensitivity_desc: "Como o Lucro Líquido (Eixo Y) muda se você alterar o preço (Eixo X) entre -25% e +25%."
      },
      table: {
        title: "Detalhamento",
        revenue: "Receita Bruta",
        fixed_costs: "Custos Fixos Operacionais",
        marketing: "Investimento Marketing",
        variable_costs: "Custos Variáveis",
        markup: "Markup",
        survival: "Sobrevivência & Risco",
        pe_unit: "PE (Unidades)",
        pe_rev: "PE (Receita)",
        margin_safety: "Margem Segurança",
        mmc: "MMC (Por venda)",
        efficiency: "Eficiência & Cliente",
        cac: "CAC",
        payback: "Payback do CAC",
        ltv: "LTV",
        lifetime: "Tempo de Vida",
        ratio: "Razão LTV/CAC",
        roi: "ROI Marketing",
        projection: "Visualização Base (Mensal)",
        period_view: "Visão do Período"
      },
      tooltips: {
        revenue: "Valor total das vendas no período (PVS x Quantidade).",
        fixed: "Custos que não mudam com a venda (Aluguel, Pro-labore).",
        marketing: "Verba destinada a anúncios e aquisição de clientes.",
        variable: "Custos que aumentam conforme a venda (Taxas + Custo Produto).",
        markup: "Multiplicador do custo. Ex: 2.0x significa vender pelo dobro do custo.",
        pe: "Mínimo de vendas para pagar as contas (Lucro Zero).",
        safety: "Quanto suas vendas podem cair antes de ter prejuízo.",
        mmc: "Quanto cada venda paga da conta fixa (luz, equipe).",
        cac: "Quanto custa trazer 1 cliente novo (Marketing / Vendas).",
        payback: "Quantos meses o cliente precisa pagar para cobrir o custo de trazê-lo.",
        ltv: "Valor total que um cliente gasta com você.",
        lifetime: "Tempo médio que o cliente permanece pagando.",
        ratio: "Saúde do negócio. > 3x é Excelente. < 1x é Prejuízo.",
        roi: "Retorno sobre todo o dinheiro investido."
      },
      actions: {
        export: "CSV",
        print: "PDF",
        save: "Salvar",
        saved: "Salvo!",
        generating: "Gerando..."
      },
      ai: {
        title: "Consultor Financeiro IA",
        desc: "Obtenha uma análise profissional do seu cenário. Nossa IA avaliará o risco e sugerirá otimizações.",
        button: "Gerar Relatório IA",
        analyzing: "Analisando...",
        new: "Nova análise",
        error: "Erro na IA"
      }
    },
    guide: {
      title: "Guia Estratégico",
      subtitle: "Como interpretar seus números e tomar decisões.",
      lucrativity: "Lucratividade & Margem",
      risk: "Risco & Sobrevivência",
      efficiency: "Eficiência do Cliente",
      analysis: "Análise",
      action: "Ação Prática"
    }
  },
  en: {
    app: {
      title: "FinCalc Digital",
      subtitle: "Management Accounting",
      install: "Install",
      guide: "Guide",
      share: "Share",
      copied: "Copied!",
      history: "History",
      loading: "Loading data...",
      footer: "Based on Contribution Margin logic."
    },
    inputs: {
      title: "Parameters",
      templates: "Templates",
      clear: "Clear fields",
      period: {
         label: "Projection / View",
         monthly: "Monthly (Base)",
         bimestral: "Bimonthly (2 mo)",
         trimestral: "Quarterly (3 mo)",
         semestral: "Semiannual (6 mo)",
         yearly: "Yearly (12 mo)"
      },
      input_hint: "Enter MONTHLY values. The system will project automatically.",
      modes: {
        direct: "Direct",
        price: "Price",
        meta: "Target"
      },
      context: {
        direct: "Simulate financial results based on current price and volume.",
        price: "Calculate ideal price (PVS) to reach your profit target.",
        meta: "Calculate sales volume needed to reach your profit target."
      },
      sections: {
        costs: "Costs & Expenses (Monthly)",
        scenario: "Scenario & Sales (Monthly)"
      },
      labels: {
        cp: "Product Cost (CP)",
        cf: "Fixed Cost",
        txf: "Fixed Fee (TxF)",
        txp: "Tax Rate % (TxP)",
        marketing: "Marketing Invest.",
        pvs: "Sales Price (PVS)",
        meta: "Sales Target",
        churn: "Churn Rate",
        mll_d: "Desired Net Margin"
      },
      placeholders: {
        gateway: "Gateway",
        tax: "Tax",
        ads: "Ads/Promo",
        price: "Value for client",
        units: "Units",
        percent: "Rate %",
        margin_ex: "Ex: 20"
      },
      hints: {
        margin: "Percentage of revenue that should remain as net profit.",
        fill: "Fill in fields to calculate automatically"
      },
      errors: {
        negative: "Value cannot be negative",
        max100: "Rate cannot exceed 100%"
      }
    },
    results: {
      header: "Financial Viability Report",
      date: "Date",
      assumptions: "Scenario Assumptions",
      kpi: {
        ll: "Net Profit",
        mc: "Contrib. Margin",
        pe: "Break-Even Point",
        price: "Current Price",
        suggested_price: "Suggested Price",
        sub: {
          margin: "Net Margin",
          sobra: "Leftover per sale",
          zerar: "Sales to zero",
          val_unit: "Value per unit",
          meta: "Target"
        }
      },
      charts: {
        viability: "Viability Analysis",
        revenue_cost: "Revenue vs Total Costs",
        composition: "Price Composition",
        detail: "PVS Breakdown",
        sensitivity: "Price Sensitivity",
        sensitivity_desc: "How Net Profit (Y-Axis) changes if you alter price (X-Axis) between -25% and +25%."
      },
      table: {
        title: "Breakdown",
        revenue: "Gross Revenue",
        fixed_costs: "Op. Fixed Costs",
        marketing: "Marketing Investment",
        variable_costs: "Variable Costs",
        markup: "Markup",
        survival: "Survival & Risk",
        pe_unit: "BEP (Units)",
        pe_rev: "BEP (Revenue)",
        margin_safety: "Margin of Safety",
        mmc: "MMC (Per sale)",
        efficiency: "Efficiency & Client",
        cac: "CAC",
        payback: "CAC Payback",
        ltv: "LTV",
        lifetime: "Lifetime",
        ratio: "LTV/CAC Ratio",
        roi: "Marketing ROI",
        projection: "Base View (Monthly)",
        period_view: "Period View"
      },
      tooltips: {
        revenue: "Total sales value (Price x Quantity).",
        fixed: "Costs that don't change with sales (Rent, Salaries).",
        marketing: "Budget for ads and customer acquisition.",
        variable: "Costs that increase with sales (Taxes + Product Cost).",
        markup: "Cost multiplier. Ex: 2.0x means selling for double the cost.",
        pe: "Minimum sales to pay bills (Zero Profit).",
        safety: "How much sales can drop before losing money.",
        mmc: "How much each sale pays for fixed bills.",
        cac: "Cost to acquire 1 new customer.",
        payback: "Months a customer needs to pay to cover acquisition cost.",
        ltv: "Total value a customer spends with you.",
        lifetime: "Average time a customer stays paying.",
        ratio: "Business health. > 3x is Excellent. < 1x is Loss.",
        roi: "Return on total investment."
      },
      actions: {
        export: "CSV",
        print: "PDF",
        save: "Save",
        saved: "Saved!",
        generating: "Generating..."
      },
      ai: {
        title: "AI Financial Advisor",
        desc: "Get professional analysis. Our AI will evaluate risk and suggest optimizations.",
        button: "Generate AI Report",
        analyzing: "Analyzing...",
        new: "New analysis",
        error: "AI Error"
      }
    },
    guide: {
      title: "Strategic Guide",
      subtitle: "How to interpret your numbers and make decisions.",
      lucrativity: "Lucrativity & Margin",
      risk: "Risco & Survival",
      efficiency: "Client Efficiency",
      analysis: "Analysis",
      action: "Action"
    }
  }
};

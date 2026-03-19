import { useState, useMemo, useCallback } from 'react';

// ─── Inputs ─────────────────────────────────────────────
export interface SimuladorInputs {
  // Tráfego
  investimento: number;
  cpc: number;

  // Conversão
  taxaConversao: number;

  // Produto Principal
  precoProduto: number;

  // Order Bump
  precoBump: number;
  taxaBump: number;

  // Upsell
  precoUpsell: number;
  taxaUpsell: number;

  // Downsell
  precoDownsell: number;
  taxaDownsell: number;
}

// ─── Outputs ────────────────────────────────────────────
export interface SimuladorOutputs {
  // Tráfego
  cliques: number;

  // Vendas
  vendas: number;

  // Receitas por etapa
  receitaProduto: number;
  vendasBump: number;
  receitaBump: number;
  vendasUpsell: number;
  receitaUpsell: number;
  recusaramUpsell: number;
  vendasDownsell: number;
  receitaDownsell: number;

  // Totais
  receitaTotal: number;
  ticketMedio: number;
  cpa: number;
  lucro: number;
  roi: number;
  roas: number;
  breakevenVendas: number;
}

// ─── Alertas ────────────────────────────────────────────
export type AlertLevel = 'danger' | 'warning' | 'info';

export interface SimuladorAlert {
  level: AlertLevel;
  message: string;
}

// ─── Defaults ───────────────────────────────────────────
const DEFAULTS: SimuladorInputs = {
  investimento: 10000,
  cpc: 2,
  taxaConversao: 3,
  precoProduto: 97,
  precoBump: 37,
  taxaBump: 25,
  precoUpsell: 197,
  taxaUpsell: 15,
  precoDownsell: 47,
  taxaDownsell: 30,
};

// ─── Compute ────────────────────────────────────────────
export function computeOutputs(inputs: SimuladorInputs): SimuladorOutputs {
  const { investimento, cpc, taxaConversao, precoProduto } = inputs;

  // Tráfego
  const cliques = cpc > 0 ? Math.round(investimento / cpc) : 0;

  // Vendas
  const vendas = Math.round(cliques * (taxaConversao / 100));

  // Produto principal
  const receitaProduto = vendas * precoProduto;

  // Order Bump
  const vendasBump = Math.round(vendas * (inputs.taxaBump / 100));
  const receitaBump = vendasBump * inputs.precoBump;

  // Upsell
  const vendasUpsell = Math.round(vendas * (inputs.taxaUpsell / 100));
  const receitaUpsell = vendasUpsell * inputs.precoUpsell;

  // Downsell (apenas quem recusou upsell)
  const recusaramUpsell = vendas - vendasUpsell;
  const vendasDownsell = Math.round(recusaramUpsell * (inputs.taxaDownsell / 100));
  const receitaDownsell = vendasDownsell * inputs.precoDownsell;

  // Totais
  const receitaTotal = receitaProduto + receitaBump + receitaUpsell + receitaDownsell;
  const ticketMedio = vendas > 0 ? receitaTotal / vendas : 0;
  const cpa = vendas > 0 ? investimento / vendas : 0;
  const lucro = receitaTotal - investimento;
  const roi = investimento > 0 ? (lucro / investimento) * 100 : 0;
  const roas = investimento > 0 ? receitaTotal / investimento : 0;
  const breakevenVendas = ticketMedio > 0 ? Math.ceil(investimento / ticketMedio) : 0;

  return {
    cliques,
    vendas,
    receitaProduto,
    vendasBump,
    receitaBump,
    vendasUpsell,
    receitaUpsell,
    recusaramUpsell,
    vendasDownsell,
    receitaDownsell,
    receitaTotal,
    ticketMedio,
    cpa,
    lucro,
    roi,
    roas,
    breakevenVendas,
  };
}

// ─── Alertas ────────────────────────────────────────────
export function computeAlerts(inputs: SimuladorInputs, outputs: SimuladorOutputs): SimuladorAlert[] {
  const alerts: SimuladorAlert[] = [];

  if (outputs.lucro < 0) {
    alerts.push({ level: 'danger', message: `Prejuizo de R$ ${Math.abs(outputs.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Revise CPC, conversao ou ticket.` });
  } else if (outputs.roi > 0 && outputs.roi < 30) {
    alerts.push({ level: 'warning', message: `ROI de ${outputs.roi.toFixed(1)}% — margem apertada. Considere otimizar o funil.` });
  }

  if (outputs.cpa > inputs.precoProduto && outputs.vendas > 0) {
    alerts.push({ level: 'danger', message: `CPA (R$ ${outputs.cpa.toFixed(2)}) maior que o preco do produto (R$ ${inputs.precoProduto}). Funil insustentavel sem bump/upsell.` });
  }

  if (inputs.taxaConversao < 1) {
    alerts.push({ level: 'warning', message: `Taxa de conversao abaixo de 1% — gargalo na pagina de vendas.` });
  }

  if (inputs.taxaBump < 5 && inputs.precoBump > 0) {
    alerts.push({ level: 'info', message: `Taxa de bump em ${inputs.taxaBump}%. Benchmark: 15-30%. Revise a oferta.` });
  }

  if (inputs.taxaUpsell < 5 && inputs.precoUpsell > 0) {
    alerts.push({ level: 'info', message: `Taxa de upsell em ${inputs.taxaUpsell}%. Benchmark: 10-20%. Revise a oferta.` });
  }

  return alerts;
}

// ─── Cenários ───────────────────────────────────────────
export interface CenarioResult {
  label: string;
  outputs: SimuladorOutputs;
}

export function computeCenarios(inputs: SimuladorInputs, variacao: number = 20): CenarioResult[] {
  const fator = variacao / 100;

  const pessimista: SimuladorInputs = {
    ...inputs,
    taxaConversao: inputs.taxaConversao * (1 - fator),
    cpc: inputs.cpc * (1 + fator),
  };

  const otimista: SimuladorInputs = {
    ...inputs,
    taxaConversao: inputs.taxaConversao * (1 + fator),
    cpc: inputs.cpc * (1 - fator),
  };

  return [
    { label: 'Pessimista', outputs: computeOutputs(pessimista) },
    { label: 'Base', outputs: computeOutputs(inputs) },
    { label: 'Otimista', outputs: computeOutputs(otimista) },
  ];
}

// ─── Hook ───────────────────────────────────────────────
export function useSimulador() {
  const [inputs, setInputs] = useState<SimuladorInputs>(DEFAULTS);

  const updateInput = useCallback(<K extends keyof SimuladorInputs>(key: K, value: SimuladorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetDefaults = useCallback(() => {
    setInputs(DEFAULTS);
  }, []);

  const outputs = useMemo(() => computeOutputs(inputs), [inputs]);
  const alerts = useMemo(() => computeAlerts(inputs, outputs), [inputs, outputs]);
  const cenarios = useMemo(() => computeCenarios(inputs), [inputs]);

  return {
    inputs,
    outputs,
    alerts,
    cenarios,
    updateInput,
    resetDefaults,
    defaults: DEFAULTS,
  };
}

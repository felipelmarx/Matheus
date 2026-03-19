import { useState, useMemo, useCallback } from 'react';

// ─── Inputs ─────────────────────────────────────────────
export interface SimuladorInputs {
  // Tráfego
  investimento: number;
  cpc: number;

  // Conversão da Página
  taxaConversao: number;

  // Produto Principal
  precoProduto: number;
  custoProduto: number;
  taxaReembolso: number;

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

  // Custos
  receitaBruta: number;
  reembolsos: number;
  custosProduto: number;

  // Totais
  receitaLiquida: number;
  ticketMedio: number;
  cpa: number;
  epc: number;
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

// ─── Dream Goal ─────────────────────────────────────────
export interface DreamGoalResult {
  vendasNecessarias: number;
  cliquesNecessarios: number;
  investimentoNecessario: number;
}

// ─── Cenários ───────────────────────────────────────────
export interface CenarioResult {
  label: string;
  outputs: SimuladorOutputs;
}

// ─── Defaults ───────────────────────────────────────────
const DEFAULTS: SimuladorInputs = {
  investimento: 10000,
  cpc: 2,
  taxaConversao: 3,
  precoProduto: 97,
  custoProduto: 0,
  taxaReembolso: 0,
  precoBump: 37,
  taxaBump: 25,
  precoUpsell: 197,
  taxaUpsell: 15,
  precoDownsell: 47,
  taxaDownsell: 30,
};

// ─── Compute ────────────────────────────────────────────
export function computeOutputs(inputs: SimuladorInputs): SimuladorOutputs {
  const { investimento, cpc, taxaConversao, precoProduto, custoProduto, taxaReembolso } = inputs;

  // Tráfego
  const cliques = cpc > 0 ? Math.round(investimento / cpc) : 0;

  // Vendas
  const vendas = Math.round(cliques * (taxaConversao / 100));

  // Produto principal
  const receitaProduto = vendas * precoProduto;

  // Order Bump (% dos compradores aceita)
  const vendasBump = Math.round(vendas * (inputs.taxaBump / 100));
  const receitaBump = vendasBump * inputs.precoBump;

  // Upsell (% dos compradores aceita)
  const vendasUpsell = Math.round(vendas * (inputs.taxaUpsell / 100));
  const receitaUpsell = vendasUpsell * inputs.precoUpsell;

  // Downsell (apenas quem recusou upsell)
  const recusaramUpsell = vendas - vendasUpsell;
  const vendasDownsell = Math.round(recusaramUpsell * (inputs.taxaDownsell / 100));
  const receitaDownsell = vendasDownsell * inputs.precoDownsell;

  // Receita bruta
  const receitaBruta = receitaProduto + receitaBump + receitaUpsell + receitaDownsell;

  // Custos e reembolsos
  const reembolsos = Math.round(vendas * (taxaReembolso / 100)) * precoProduto;
  const custosProduto = vendas * custoProduto;

  // Líquido
  const receitaLiquida = receitaBruta - reembolsos - custosProduto;
  const ticketMedio = vendas > 0 ? receitaBruta / vendas : 0;
  const cpa = vendas > 0 ? investimento / vendas : 0;
  const epc = cliques > 0 ? receitaLiquida / cliques : 0;
  const lucro = receitaLiquida - investimento;
  const roi = investimento > 0 ? (lucro / investimento) * 100 : 0;
  const roas = investimento > 0 ? receitaLiquida / investimento : 0;
  const breakevenVendas = ticketMedio > 0 ? Math.ceil(investimento / ticketMedio) : 0;

  return {
    cliques, vendas,
    receitaProduto, vendasBump, receitaBump,
    vendasUpsell, receitaUpsell, recusaramUpsell,
    vendasDownsell, receitaDownsell,
    receitaBruta, reembolsos, custosProduto,
    receitaLiquida, ticketMedio, cpa, epc,
    lucro, roi, roas, breakevenVendas,
  };
}

// ─── Alertas ────────────────────────────────────────────
export function computeAlerts(inputs: SimuladorInputs, outputs: SimuladorOutputs): SimuladorAlert[] {
  const alerts: SimuladorAlert[] = [];

  if (outputs.vendas > 0 && outputs.lucro < 0) {
    alerts.push({ level: 'danger', message: `Prejuizo de R$ ${Math.abs(outputs.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` });
  } else if (outputs.roi > 0 && outputs.roi < 30) {
    alerts.push({ level: 'warning', message: `ROI de ${outputs.roi.toFixed(1)}% — margem apertada` });
  }

  if (outputs.cpa > inputs.precoProduto && outputs.vendas > 0) {
    alerts.push({ level: 'danger', message: `CPA (R$ ${outputs.cpa.toFixed(2)}) > preco do produto. Insustentavel sem bump/upsell` });
  }

  if (inputs.taxaConversao < 1) {
    alerts.push({ level: 'warning', message: `Conversao em ${inputs.taxaConversao}% — gargalo na pagina` });
  }

  return alerts;
}

// ─── Cenários ───────────────────────────────────────────
export function computeCenarios(inputs: SimuladorInputs, variacao: number = 20): CenarioResult[] {
  const f = variacao / 100;
  return [
    { label: 'Pessimista', outputs: computeOutputs({ ...inputs, taxaConversao: inputs.taxaConversao * (1 - f), cpc: inputs.cpc * (1 + f) }) },
    { label: 'Base', outputs: computeOutputs(inputs) },
    { label: 'Otimista', outputs: computeOutputs({ ...inputs, taxaConversao: inputs.taxaConversao * (1 + f), cpc: inputs.cpc * (1 - f) }) },
  ];
}

// ─── Dream Goal ─────────────────────────────────────────
export function computeDreamGoal(inputs: SimuladorInputs, outputs: SimuladorOutputs, lucroDesejado: number): DreamGoalResult | null {
  if (outputs.lucro <= 0 || outputs.vendas <= 0) return null;

  const lucroPorVenda = outputs.lucro / outputs.vendas;
  const vendasNecessarias = Math.ceil(lucroDesejado / lucroPorVenda);
  const cliquesNecessarios = Math.ceil(vendasNecessarias / (inputs.taxaConversao / 100));
  const investimentoNecessario = Math.ceil(cliquesNecessarios * inputs.cpc);

  return { vendasNecessarias, cliquesNecessarios, investimentoNecessario };
}

// ─── Hook ───────────────────────────────────────────────
export function useSimulador() {
  const [inputs, setInputs] = useState<SimuladorInputs>(DEFAULTS);
  const [lucroDesejado, setLucroDesejado] = useState(50000);

  const updateInput = useCallback(<K extends keyof SimuladorInputs>(key: K, value: SimuladorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetDefaults = useCallback(() => setInputs(DEFAULTS), []);

  const outputs = useMemo(() => computeOutputs(inputs), [inputs]);
  const alerts = useMemo(() => computeAlerts(inputs, outputs), [inputs, outputs]);
  const cenarios = useMemo(() => computeCenarios(inputs), [inputs]);
  const dreamGoal = useMemo(() => computeDreamGoal(inputs, outputs, lucroDesejado), [inputs, outputs, lucroDesejado]);

  return { inputs, outputs, alerts, cenarios, dreamGoal, lucroDesejado, setLucroDesejado, updateInput, resetDefaults, defaults: DEFAULTS };
}

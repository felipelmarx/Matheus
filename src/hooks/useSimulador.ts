import { useState, useMemo, useCallback, useEffect } from 'react';

// ─── Inputs ─────────────────────────────────────────────
export interface SimuladorInputs {
  // Tráfego
  investimento: number;
  cpc: number;

  // Conversão da Página
  taxaConversao: number;

  // Produto Principal (Ingresso)
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

  // Qualificação (Back-end)
  taxaAplicacao: number;
  taxaAgendamento: number;
  taxaEntrevista: number;

  // Formação (High-Ticket)
  taxaVendaFormacao: number;
  ticketFormacao: number;
}

// ─── Outputs ────────────────────────────────────────────
export interface SimuladorOutputs {
  // Tráfego
  cliques: number;

  // Front-end: Vendas
  vendas: number;
  receitaProduto: number;
  vendasBump: number;
  receitaBump: number;
  vendasUpsell: number;
  receitaUpsell: number;
  recusaramUpsell: number;
  vendasDownsell: number;
  receitaDownsell: number;

  // Front-end: Totais
  faturamentoFrontEnd: number;
  ticketMedioFrontEnd: number;
  saldoFrontEnd: number;

  // Back-end: Qualificação
  aplicacoes: number;
  agendamentos: number;
  entrevistas: number;

  // Back-end: Formação
  vendasFormacao: number;
  faturamentoBackEnd: number;

  // Custos
  receitaBruta: number;
  reembolsos: number;
  custosProduto: number;

  // Totais Gerais
  faturamentoTotal: number;
  ticketMedioGeral: number;
  cpa: number;
  epc: number;
  custoAplicacao: number;
  custoAgendamento: number;
  custoEntrevista: number;
  custoVendaFormacao: number;
  ticketMedioFormacao: number;
  tmCac: number;
  lucro: number;
  roi: number;
  roas: number;
  breakevenVendas: number;
}

// ─── Alertas ────────────────────────────────────────────
export type AlertLevel = 'danger' | 'warning' | 'info';
export interface SimuladorAlert { level: AlertLevel; message: string; }

// ─── Dream Goal ─────────────────────────────────────────
export interface DreamGoalResult {
  vendasNecessarias: number;
  cliquesNecessarios: number;
  investimentoNecessario: number;
}

// ─── Cenários ───────────────────────────────────────────
export interface CenarioResult { label: string; outputs: SimuladorOutputs; }

// ─── Defaults ───────────────────────────────────────────
const DEFAULTS: SimuladorInputs = {
  investimento: 50000,
  cpc: 2,
  taxaConversao: 3,
  precoProduto: 7,
  custoProduto: 0,
  taxaReembolso: 0,
  precoBump: 27,
  taxaBump: 20,
  precoUpsell: 47,
  taxaUpsell: 15,
  precoDownsell: 17,
  taxaDownsell: 30,
  taxaAplicacao: 30,
  taxaAgendamento: 60,
  taxaEntrevista: 80,
  taxaVendaFormacao: 20,
  ticketFormacao: 5000,
};

// ─── Compute ────────────────────────────────────────────
export function computeOutputs(inputs: SimuladorInputs): SimuladorOutputs {
  const { investimento, cpc, taxaConversao, precoProduto, custoProduto, taxaReembolso } = inputs;

  // === TRÁFEGO ===
  const cliques = cpc > 0 ? Math.round(investimento / cpc) : 0;

  // === FRONT-END ===
  const vendas = Math.round(cliques * (taxaConversao / 100));
  const receitaProduto = vendas * precoProduto;

  const vendasBump = Math.round(vendas * (inputs.taxaBump / 100));
  const receitaBump = vendasBump * inputs.precoBump;

  const vendasUpsell = Math.round(vendas * (inputs.taxaUpsell / 100));
  const receitaUpsell = vendasUpsell * inputs.precoUpsell;

  const recusaramUpsell = vendas - vendasUpsell;
  const vendasDownsell = Math.round(recusaramUpsell * (inputs.taxaDownsell / 100));
  const receitaDownsell = vendasDownsell * inputs.precoDownsell;

  const faturamentoFrontEnd = receitaProduto + receitaBump + receitaUpsell + receitaDownsell;
  const ticketMedioFrontEnd = vendas > 0 ? faturamentoFrontEnd / vendas : 0;
  const saldoFrontEnd = faturamentoFrontEnd - investimento;

  // === BACK-END: QUALIFICAÇÃO ===
  const aplicacoes = Math.round(vendas * (inputs.taxaAplicacao / 100));
  const agendamentos = Math.round(aplicacoes * (inputs.taxaAgendamento / 100));
  const entrevistas = Math.round(agendamentos * (inputs.taxaEntrevista / 100));

  // === BACK-END: FORMAÇÃO ===
  const vendasFormacao = Math.round(entrevistas * (inputs.taxaVendaFormacao / 100));
  const faturamentoBackEnd = vendasFormacao * inputs.ticketFormacao;

  // === CUSTOS ===
  const receitaBruta = faturamentoFrontEnd + faturamentoBackEnd;
  const reembolsos = Math.round(vendas * (taxaReembolso / 100)) * precoProduto;
  const custosProduto = vendas * custoProduto;

  // === TOTAIS ===
  const faturamentoTotal = receitaBruta - reembolsos - custosProduto;
  const ticketMedioGeral = vendas > 0 ? faturamentoTotal / vendas : 0;
  const cpa = vendas > 0 ? investimento / vendas : 0;
  const epc = cliques > 0 ? faturamentoTotal / cliques : 0;
  const custoAplicacao = aplicacoes > 0 ? investimento / aplicacoes : 0;
  const custoAgendamento = agendamentos > 0 ? investimento / agendamentos : 0;
  const custoEntrevista = entrevistas > 0 ? investimento / entrevistas : 0;
  const custoVendaFormacao = vendasFormacao > 0 ? investimento / vendasFormacao : 0;
  const ticketMedioFormacao = vendasFormacao > 0 ? faturamentoBackEnd / vendasFormacao : 0;
  const cacReal = (saldoFrontEnd < 0 && vendasFormacao > 0) ? Math.abs(saldoFrontEnd) / vendasFormacao : 0;
  const tmCac = cacReal > 0 ? ticketMedioFormacao / cacReal : 0;
  const lucro = faturamentoTotal - investimento;
  const roi = investimento > 0 ? (lucro / investimento) * 100 : 0;
  const roas = investimento > 0 ? faturamentoTotal / investimento : 0;
  const breakevenVendas = ticketMedioGeral > 0 ? Math.ceil(investimento / ticketMedioGeral) : 0;

  return {
    cliques, vendas,
    receitaProduto, vendasBump, receitaBump,
    vendasUpsell, receitaUpsell, recusaramUpsell,
    vendasDownsell, receitaDownsell,
    faturamentoFrontEnd, ticketMedioFrontEnd, saldoFrontEnd,
    aplicacoes, agendamentos, entrevistas,
    vendasFormacao, faturamentoBackEnd,
    receitaBruta, reembolsos, custosProduto,
    faturamentoTotal, ticketMedioGeral, cpa, epc,
    custoAplicacao, custoAgendamento,
    custoEntrevista, custoVendaFormacao,
    ticketMedioFormacao, tmCac,
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
    alerts.push({ level: 'danger', message: `CPA (R$ ${outputs.cpa.toFixed(2)}) > preco do ingresso. Front-end no prejuizo` });
  }

  if (inputs.taxaConversao < 1) {
    alerts.push({ level: 'warning', message: `Conversao em ${inputs.taxaConversao}% — gargalo na pagina` });
  }

  if (outputs.saldoFrontEnd < 0 && outputs.faturamentoBackEnd > 0) {
    alerts.push({ level: 'info', message: `Front-end: -R$ ${Math.abs(outputs.saldoFrontEnd).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}. Back-end cobre com R$ ${outputs.faturamentoBackEnd.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` });
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

// ─── Storage ──────────────────────────────────────────────
const STORAGE_KEY = 'simulador-inputs';

function loadSaved(): SimuladorInputs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

// ─── Hook ───────────────────────────────────────────────
export function useSimulador() {
  const [inputs, setInputs] = useState<SimuladorInputs>(loadSaved);
  const [lucroDesejado, setLucroDesejado] = useState(50000);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

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

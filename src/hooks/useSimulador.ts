import { useState, useMemo, useCallback } from 'react';

export interface SimuladorInputs {
  // Investimento & Trafego
  investimento: number;
  cpc: number;

  // Pagina de Captura
  conectRate: number;

  // Checkout
  taxaCheckout: number;
  ticketIngresso: number;
  ingressosManuais: number; // 0 = calcula pelo trafego, >0 = override

  // Bump (oferta no checkout)
  ticketBump: number;
  taxaBump: number;

  // Upsell (oferta pos-compra)
  ticketUpsell: number;
  taxaUpsell: number;

  // Qualificacao
  taxaAplicacao: number;
  taxaAgendamento: number;
  taxaEntrevista: number;

  // Back-end (Formacao)
  taxaVendaFormacao: number;
  ticketFormacao: number;

  // Cenarios
  variacao: number;
}

export interface SimuladorOutputs {
  cliques: number;
  viewPages: number;
  ingressos: number;
  usandoOverride: boolean;
  receitaIngresso: number;
  receitaBump: number;
  receitaUpsell: number;
  faturamentoFrontEnd: number;
  ticketMedioFrontEnd: number;
  aplicacoes: number;
  agendamentos: number;
  entrevistas: number;
  vendasFormacao: number;
  faturamentoBackEnd: number;
  faturamentoTotal: number;
  lucro: number;
  roi: number;
  roas: number;
  cpa: number;
  custoEntrevista: number;
  custoVendaFormacao: number;
}

export interface CenarioResult {
  label: string;
  outputs: SimuladorOutputs;
}

export interface BreakevenPoint {
  investimento: number;
  lucro: number;
  faturamento: number;
}

const DEFAULTS: SimuladorInputs = {
  investimento: 2000,
  cpc: 1.5,
  conectRate: 75,
  taxaCheckout: 3,
  ticketIngresso: 7,
  ingressosManuais: 0,
  ticketBump: 27,
  taxaBump: 30,
  ticketUpsell: 47,
  taxaUpsell: 15,
  taxaAplicacao: 30,
  taxaAgendamento: 60,
  taxaEntrevista: 80,
  taxaVendaFormacao: 20,
  ticketFormacao: 5000,
  variacao: 20,
};

function computeOutputs(inputs: SimuladorInputs, taxaMultiplier = 1): SimuladorOutputs {
  const inv = inputs.investimento;
  const clamp = (rate: number) => Math.min(rate * taxaMultiplier, 100);

  // Trafego
  const cliques = inputs.cpc > 0 ? Math.round(inv / inputs.cpc) : 0;
  const viewPages = Math.round(cliques * clamp(inputs.conectRate) / 100);

  // Ingressos: manual override ou calculo por trafego
  const usandoOverride = inputs.ingressosManuais > 0;
  const ingressos = usandoOverride
    ? Math.round(inputs.ingressosManuais * taxaMultiplier)
    : Math.round(viewPages * clamp(inputs.taxaCheckout) / 100);
  const receitaIngresso = ingressos * inputs.ticketIngresso;

  // Bump & Upsell
  const bumpVendas = Math.round(ingressos * clamp(inputs.taxaBump) / 100);
  const receitaBump = bumpVendas * inputs.ticketBump;
  const upsellVendas = Math.round(ingressos * clamp(inputs.taxaUpsell) / 100);
  const receitaUpsell = upsellVendas * inputs.ticketUpsell;

  // Front-end total
  const faturamentoFrontEnd = receitaIngresso + receitaBump + receitaUpsell;
  const ticketMedioFrontEnd = ingressos > 0 ? faturamentoFrontEnd / ingressos : 0;

  // Qualificacao
  const aplicacoes = Math.round(ingressos * clamp(inputs.taxaAplicacao) / 100);
  const agendamentos = Math.round(aplicacoes * clamp(inputs.taxaAgendamento) / 100);
  const entrevistas = Math.round(agendamentos * clamp(inputs.taxaEntrevista) / 100);

  // Back-end
  const vendasFormacao = Math.round(entrevistas * clamp(inputs.taxaVendaFormacao) / 100);
  const faturamentoBackEnd = vendasFormacao * inputs.ticketFormacao;

  // Totais
  const faturamentoTotal = faturamentoFrontEnd + faturamentoBackEnd;
  const lucro = faturamentoTotal - inv;
  const roi = inv > 0 ? (lucro / inv) * 100 : 0;
  const roas = inv > 0 ? faturamentoTotal / inv : 0;
  const cpa = ingressos > 0 ? inv / ingressos : 0;
  const custoEntrevista = entrevistas > 0 ? inv / entrevistas : 0;
  const custoVendaFormacao = vendasFormacao > 0 ? inv / vendasFormacao : 0;

  return {
    cliques,
    viewPages,
    ingressos,
    usandoOverride,
    receitaIngresso,
    receitaBump,
    receitaUpsell,
    faturamentoFrontEnd,
    ticketMedioFrontEnd,
    aplicacoes,
    agendamentos,
    entrevistas,
    vendasFormacao,
    faturamentoBackEnd,
    faturamentoTotal,
    lucro,
    roi,
    roas,
    cpa,
    custoEntrevista,
    custoVendaFormacao,
  };
}

export function useSimulador() {
  const [inputs, setInputs] = useState<SimuladorInputs>(DEFAULTS);

  const updateInput = useCallback(<K extends keyof SimuladorInputs>(key: K, value: SimuladorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetDefaults = useCallback(() => {
    setInputs(DEFAULTS);
  }, []);

  const outputs = useMemo(() => computeOutputs(inputs), [inputs]);

  const cenarios = useMemo((): CenarioResult[] => {
    const v = inputs.variacao / 100;
    return [
      { label: 'Pessimista', outputs: computeOutputs(inputs, 1 - v) },
      { label: 'Realista', outputs: computeOutputs(inputs, 1) },
      { label: 'Otimista', outputs: computeOutputs(inputs, 1 + v) },
    ];
  }, [inputs]);

  const breakevenCurve = useMemo((): BreakevenPoint[] => {
    const points: BreakevenPoint[] = [];
    // Escala dinamica: ate 5x o investimento atual, minimo 20k
    const maxInv = Math.max(inputs.investimento * 5, 20000);
    const step = maxInv <= 50000 ? 1000 : maxInv <= 200000 ? 5000 : 10000;
    for (let inv = step; inv <= maxInv; inv += step) {
      const simInputs = { ...inputs, investimento: inv };
      const result = computeOutputs(simInputs);
      points.push({
        investimento: inv,
        lucro: result.lucro,
        faturamento: result.faturamentoTotal,
      });
    }
    return points;
  }, [inputs]);

  return {
    inputs,
    outputs,
    cenarios,
    breakevenCurve,
    updateInput,
    resetDefaults,
    defaults: DEFAULTS,
  };
}

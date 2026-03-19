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

  // Trafego
  const cliques = inputs.cpc > 0 ? Math.round(inv / inputs.cpc) : 0;
  const viewPages = Math.round(cliques * (inputs.conectRate * taxaMultiplier) / 100);

  // Checkout
  const ingressos = Math.round(viewPages * (inputs.taxaCheckout * taxaMultiplier) / 100);
  const receitaIngresso = ingressos * inputs.ticketIngresso;

  // Bump & Upsell
  const bumpVendas = Math.round(ingressos * (inputs.taxaBump * taxaMultiplier) / 100);
  const receitaBump = bumpVendas * inputs.ticketBump;
  const upsellVendas = Math.round(ingressos * (inputs.taxaUpsell * taxaMultiplier) / 100);
  const receitaUpsell = upsellVendas * inputs.ticketUpsell;

  // Front-end total
  const faturamentoFrontEnd = receitaIngresso + receitaBump + receitaUpsell;
  const ticketMedioFrontEnd = ingressos > 0 ? faturamentoFrontEnd / ingressos : 0;

  // Qualificacao
  const aplicacoes = Math.round(ingressos * (inputs.taxaAplicacao * taxaMultiplier) / 100);
  const agendamentos = Math.round(aplicacoes * (inputs.taxaAgendamento * taxaMultiplier) / 100);
  const entrevistas = Math.round(agendamentos * (inputs.taxaEntrevista * taxaMultiplier) / 100);

  // Back-end
  const vendasFormacao = Math.round(entrevistas * (inputs.taxaVendaFormacao * taxaMultiplier) / 100);
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
    for (let inv = 500; inv <= 20000; inv += 500) {
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

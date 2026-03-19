import { useState, useMemo, useCallback } from 'react';

export interface SimuladorInputs {
  // Investimento
  investimento: number;

  // Ingressos
  ingressos: number;
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
}

export interface SimuladorOutputs {
  // Front-end
  ingressos: number;
  receitaIngresso: number;
  bumpVendas: number;
  receitaBump: number;
  upsellVendas: number;
  receitaUpsell: number;
  faturamentoFrontEnd: number;
  ticketMedioFrontEnd: number;
  saldoFrontEnd: number;

  // Qualificacao
  aplicacoes: number;
  agendamentos: number;
  entrevistas: number;

  // Back-end
  vendasFormacao: number;
  faturamentoBackEnd: number;

  // Totais
  faturamentoTotal: number;
  lucro: number;
  roi: number;
  roas: number;
  cpa: number;
  custoEntrevista: number;
  custoVendaFormacao: number;
}

const DEFAULTS: SimuladorInputs = {
  investimento: 50000,
  ingressos: 1000,
  ticketIngresso: 7,
  ticketBump: 27,
  taxaBump: 20,
  ticketUpsell: 47,
  taxaUpsell: 15,
  taxaAplicacao: 30,
  taxaAgendamento: 60,
  taxaEntrevista: 80,
  taxaVendaFormacao: 20,
  ticketFormacao: 5000,
};

export function computeOutputs(inputs: SimuladorInputs): SimuladorOutputs {
  const inv = inputs.investimento;
  const ingressos = inputs.ingressos;

  // Front-end: Ingresso
  const receitaIngresso = ingressos * inputs.ticketIngresso;

  // Front-end: Bump
  const bumpVendas = Math.round(ingressos * (inputs.taxaBump / 100));
  const receitaBump = bumpVendas * inputs.ticketBump;

  // Front-end: Upsell
  const upsellVendas = Math.round(ingressos * (inputs.taxaUpsell / 100));
  const receitaUpsell = upsellVendas * inputs.ticketUpsell;

  // Front-end: Totais
  const faturamentoFrontEnd = receitaIngresso + receitaBump + receitaUpsell;
  const ticketMedioFrontEnd = ingressos > 0 ? faturamentoFrontEnd / ingressos : 0;
  const saldoFrontEnd = faturamentoFrontEnd - inv;

  // Qualificacao
  const aplicacoes = Math.round(ingressos * (inputs.taxaAplicacao / 100));
  const agendamentos = Math.round(aplicacoes * (inputs.taxaAgendamento / 100));
  const entrevistas = Math.round(agendamentos * (inputs.taxaEntrevista / 100));

  // Back-end
  const vendasFormacao = Math.round(entrevistas * (inputs.taxaVendaFormacao / 100));
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
    ingressos,
    receitaIngresso,
    bumpVendas,
    receitaBump,
    upsellVendas,
    receitaUpsell,
    faturamentoFrontEnd,
    ticketMedioFrontEnd,
    saldoFrontEnd,
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

  return {
    inputs,
    outputs,
    updateInput,
    resetDefaults,
    defaults: DEFAULTS,
  };
}

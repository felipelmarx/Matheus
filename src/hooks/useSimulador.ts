import { useState, useMemo, useCallback, useEffect } from 'react';

// ─── Modo de UI ────────────────────────────────────────
// Simples: mostra apenas 5 campos essenciais. Compute usa funil completo
// com valores atuais (setados manualmente ou via "Aplicar Dx").
export type SimuladorMode = 'simples' | 'avancado';

// ─── Inputs ─────────────────────────────────────────────
export interface SimuladorInputs {
  mode: SimuladorMode;

  // Investimento — somente tráfego (API agora é derivado de cortesias)
  investimentoTrafego: number;

  // Tráfego
  cpc: number;
  connectRate: number;

  // Checkout (2 estágios)
  taxaLPVCheckout: number;
  taxaCheckoutVenda: number;

  // Produto
  precoIngresso: number;
  ticketMedio: number;

  // Cortesias (modelo v3) — cada lead pago gera N% de cortesia, custo por lead na API
  taxaCortesia: number;   // % de leads pagos que convidam cortesia
  custoPorLead: number;   // R$ por inscrito (pago + cortesia) na API de lembretes

  // API extra (fixo) — soma ao API derivado, não afeta números de ingressos
  investimentoApiExtra: number;

  // Backend — Qualificação
  taxaAplicacao: number;
  taxaAgendamento: number;
  taxaEntrevista: number;

  // Backend — Formação
  taxaVendaFormacao: number;
  ticketFormacao: number;
}

// ─── Outputs ────────────────────────────────────────────
export interface SimuladorOutputs {
  // Investimento
  investimentoTrafego: number;   // passthrough do input (para display)
  investimentoBruto: number;
  investimentoLiquido: number;
  investimentoApi: number;       // DERIVADO: inscritosTotais * custoPorLead + extra

  // Tráfego
  cliques: number;
  viewPage: number;

  // Checkout
  checkouts: number;
  vendas: number;
  faturamentoCaptacao: number;

  // Cortesias
  leadsCortesia: number;
  inscritosTotais: number;

  // Backend
  aplicacoes: number;
  agendamentos: number;
  entrevistas: number;
  vendasFormacao: number;
  faturamentoFormacao: number;

  // KPIs
  cpa: number;
  custoVendaFormacao: number;
  tmCac: number;
  faturamentoTotal: number;
  lucro: number;
  roi: number;
  roas: number;
  breakevenVendas: number;
  epc: number;
}

// ─── Alertas ────────────────────────────────────────────
export type AlertLevel = 'danger' | 'warning' | 'info';
export interface SimuladorAlert { level: AlertLevel; message: string; }

// ─── Dream Goal ─────────────────────────────────────────
export interface DreamGoalResult {
  vendasFormacaoNecessarias: number;
  vendasNecessarias: number;
  cliquesNecessarios: number;
  investimentoNecessario: number;
}

// ─── Cenários ───────────────────────────────────────────
export interface CenarioResult { label: string; outputs: SimuladorOutputs; }

// ─── Defaults ───────────────────────────────────────────
const DEFAULTS: SimuladorInputs = {
  mode: 'simples',
  investimentoTrafego: 78723,
  cpc: 2.84,
  connectRate: 64.6,
  taxaLPVCheckout: 19.0,
  taxaCheckoutVenda: 38.6,
  precoIngresso: 7,
  ticketMedio: 18,
  taxaCortesia: 25,
  custoPorLead: 9,
  investimentoApiExtra: 0,
  taxaAplicacao: 10.2,
  taxaAgendamento: 69.6,
  taxaEntrevista: 55.6,
  taxaVendaFormacao: 43.1,
  ticketFormacao: 6594,
};

// Chaves obrigatórias do novo shape (para detecção de migração do localStorage)
const REQUIRED_KEYS: (keyof SimuladorInputs)[] = [
  'mode',
  'investimentoTrafego',
  'cpc',
  'connectRate',
  'taxaLPVCheckout',
  'taxaCheckoutVenda',
  'precoIngresso',
  'ticketMedio',
  'taxaCortesia',
  'custoPorLead',
  'investimentoApiExtra',
  'taxaAplicacao',
  'taxaAgendamento',
  'taxaEntrevista',
  'taxaVendaFormacao',
  'ticketFormacao',
];

// ─── Compute ────────────────────────────────────────────
// Compute e' unico — nao depende do modo. O modo so afeta a UI (quais campos
// sao visiveis). Valores "ocultos" vem dos defaults ou do botao "Aplicar Dx".
export function computeOutputs(inputs: SimuladorInputs): SimuladorOutputs {
  const {
    investimentoTrafego,
    cpc,
    connectRate,
    taxaLPVCheckout,
    taxaCheckoutVenda,
    ticketMedio,
    taxaCortesia,
    custoPorLead,
    investimentoApiExtra,
    taxaAplicacao,
    taxaAgendamento,
    taxaEntrevista,
    taxaVendaFormacao,
    ticketFormacao,
  } = inputs;

  // === TRÁFEGO ===
  const cliques = cpc > 0 ? Math.round(investimentoTrafego / cpc) : 0;
  const viewPage = Math.round(cliques * (connectRate / 100));

  // === CHECKOUT (2 estágios) ===
  const checkouts = Math.round(viewPage * (taxaLPVCheckout / 100));
  const vendas = Math.round(checkouts * (taxaCheckoutVenda / 100));
  const faturamentoCaptacao = vendas * ticketMedio;

  // === CORTESIAS (modelo v3) ===
  const leadsCortesia = Math.round(vendas * (taxaCortesia / 100));
  const inscritosTotais = vendas + leadsCortesia;

  // === INVESTIMENTO (API derivado + extra fixo) ===
  const investimentoApi = inscritosTotais * custoPorLead + investimentoApiExtra;
  const investimentoBruto = investimentoTrafego + investimentoApi;

  // === BACKEND ===
  const aplicacoes = Math.round(inscritosTotais * (taxaAplicacao / 100));
  const agendamentos = Math.round(aplicacoes * (taxaAgendamento / 100));
  const entrevistas = Math.round(agendamentos * (taxaEntrevista / 100));
  const vendasFormacao = Math.round(entrevistas * (taxaVendaFormacao / 100));
  const faturamentoFormacao = vendasFormacao * ticketFormacao;

  // === RESULTADO ===
  const investimentoLiquido = investimentoBruto - faturamentoCaptacao;
  const cpa = vendas > 0 ? investimentoTrafego / vendas : 0;
  const custoVendaFormacao = vendasFormacao > 0 ? investimentoLiquido / vendasFormacao : 0;
  const tmCac = custoVendaFormacao > 0 ? ticketFormacao / custoVendaFormacao : 0;
  const faturamentoTotal = faturamentoCaptacao + faturamentoFormacao;
  const lucro = faturamentoTotal - investimentoBruto;
  const roi = investimentoBruto > 0 ? (lucro / investimentoBruto) * 100 : 0;
  const roas = investimentoBruto > 0 ? faturamentoTotal / investimentoBruto : 0;
  const ticketMedioGeral = vendas > 0 ? faturamentoTotal / vendas : 0;
  const breakevenVendas = ticketMedioGeral > 0 ? Math.ceil(investimentoBruto / ticketMedioGeral) : 0;
  const epc = cliques > 0 ? faturamentoTotal / cliques : 0;

  return {
    investimentoTrafego,
    investimentoBruto,
    investimentoLiquido,
    investimentoApi,
    cliques,
    viewPage,
    checkouts,
    vendas,
    faturamentoCaptacao,
    leadsCortesia,
    inscritosTotais,
    aplicacoes,
    agendamentos,
    entrevistas,
    vendasFormacao,
    faturamentoFormacao,
    cpa,
    custoVendaFormacao,
    tmCac,
    faturamentoTotal,
    lucro,
    roi,
    roas,
    breakevenVendas,
    epc,
  };
}

// ─── Alertas ────────────────────────────────────────────
export function computeAlerts(inputs: SimuladorInputs, outputs: SimuladorOutputs): SimuladorAlert[] {
  const alerts: SimuladorAlert[] = [];

  // Prejuízo geral
  if (outputs.vendas > 0 && outputs.lucro < 0) {
    alerts.push({
      level: 'danger',
      message: `Prejuizo de R$ ${Math.abs(outputs.lucro).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
    });
  } else if (outputs.roi > 0 && outputs.roi < 30) {
    alerts.push({
      level: 'warning',
      message: `ROI de ${outputs.roi.toFixed(1)}% — margem apertada`,
    });
  }

  // CPA do tráfego vs ticket médio de captação
  if (outputs.cpa > inputs.ticketMedio && outputs.vendas > 0) {
    alerts.push({
      level: 'danger',
      message: `CPA (R$ ${outputs.cpa.toFixed(2)}) > ticket medio (R$ ${inputs.ticketMedio.toFixed(2)}). Captacao no prejuizo`,
    });
  }

  // Connect rate baixo
  if (inputs.connectRate < 40) {
    alerts.push({
      level: 'warning',
      message: `Connect Rate em ${inputs.connectRate.toFixed(1)}% — cliques nao carregam a LP`,
    });
  }

  // Conversão LPV → Checkout baixa
  if (inputs.taxaLPVCheckout < 5) {
    alerts.push({
      level: 'warning',
      message: `LPV -> Checkout em ${inputs.taxaLPVCheckout.toFixed(1)}% — gargalo na pagina`,
    });
  }

  // Conversão Checkout → Venda baixa
  if (inputs.taxaCheckoutVenda < 20) {
    alerts.push({
      level: 'warning',
      message: `Checkout -> Venda em ${inputs.taxaCheckoutVenda.toFixed(1)}% — recuperacao de carrinho fraca`,
    });
  }

  // TM/CAC da formação
  if (outputs.vendasFormacao > 0 && outputs.tmCac > 0 && outputs.tmCac < 1) {
    alerts.push({
      level: 'danger',
      message: `TM/CAC em ${outputs.tmCac.toFixed(2)}x — formacao nao paga o custo de aquisicao`,
    });
  }

  // Captação positiva (info)
  if (outputs.investimentoLiquido < 0 && outputs.faturamentoFormacao > 0) {
    alerts.push({
      level: 'info',
      message: `Captacao lucrativa em R$ ${Math.abs(outputs.investimentoLiquido).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}. Formacao e bonus.`,
    });
  }

  return alerts;
}

// ─── Cenários ───────────────────────────────────────────
export function computeCenarios(inputs: SimuladorInputs, variacao: number = 20): CenarioResult[] {
  const f = variacao / 100;
  return [
    {
      label: 'Pessimista',
      outputs: computeOutputs({
        ...inputs,
        taxaLPVCheckout: inputs.taxaLPVCheckout * (1 - f),
        taxaCheckoutVenda: inputs.taxaCheckoutVenda * (1 - f),
        cpc: inputs.cpc * (1 + f),
      }),
    },
    { label: 'Base', outputs: computeOutputs(inputs) },
    {
      label: 'Otimista',
      outputs: computeOutputs({
        ...inputs,
        taxaLPVCheckout: inputs.taxaLPVCheckout * (1 + f),
        taxaCheckoutVenda: inputs.taxaCheckoutVenda * (1 + f),
        cpc: inputs.cpc * (1 - f),
      }),
    },
  ];
}

// ─── Dream Goal ─────────────────────────────────────────
export function computeDreamGoal(
  inputs: SimuladorInputs,
  outputs: SimuladorOutputs,
  lucroDesejado: number,
): DreamGoalResult | null {
  if (outputs.lucro <= 0 || outputs.vendas <= 0 || outputs.vendasFormacao <= 0) return null;

  const lucroPorVenda = outputs.lucro / outputs.vendas;
  const vendasNecessarias = Math.ceil(lucroDesejado / lucroPorVenda);

  // Proporção vendas formação / vendas captação (mesmo funil)
  const ratioFormacao = outputs.vendasFormacao / outputs.vendas;
  const vendasFormacaoNecessarias = Math.ceil(vendasNecessarias * ratioFormacao);

  // Cliques necessários: desfazer o funil de captação
  // vendas = cliques * (connectRate/100) * (taxaLPVCheckout/100) * (taxaCheckoutVenda/100)
  const taxaGlobal =
    (inputs.connectRate / 100) *
    (inputs.taxaLPVCheckout / 100) *
    (inputs.taxaCheckoutVenda / 100);
  const cliquesNecessarios = taxaGlobal > 0 ? Math.ceil(vendasNecessarias / taxaGlobal) : 0;
  const investimentoNecessario = Math.ceil(cliquesNecessarios * inputs.cpc);

  return {
    vendasFormacaoNecessarias,
    vendasNecessarias,
    cliquesNecessarios,
    investimentoNecessario,
  };
}

// ─── Storage ──────────────────────────────────────────────
const STORAGE_KEY = 'simulador-inputs';

function isValidShape(parsed: unknown): parsed is Partial<SimuladorInputs> {
  if (!parsed || typeof parsed !== 'object') return false;
  const p = parsed as Record<string, unknown>;
  // Shape v3 (atual): requer taxaCortesia + custoPorLead (introduzidos em v3)
  // Se tiver investimentoApi como número no shape antigo (pré-v3), rejeitar para reset
  const hasV3Keys =
    typeof p.taxaCortesia === 'number' &&
    typeof p.custoPorLead === 'number';
  const hasCoreKeys =
    typeof p.investimentoTrafego === 'number' &&
    typeof p.connectRate === 'number' &&
    typeof p.taxaLPVCheckout === 'number';
  return hasCoreKeys && hasV3Keys;
}

function loadSaved(): SimuladorInputs {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    // Migração graceful: shape antigo → reset para DEFAULTS
    if (!isValidShape(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return DEFAULTS;
    }
    // Merge restrito: apenas chaves conhecidas do shape atual entram.
    // Isso elimina qualquer `investimentoApi` legado que tenha persistido.
    const merged: SimuladorInputs = { ...DEFAULTS };
    const source = parsed as Record<string, unknown>;
    // Mode e' string literal — tratar separado dos numericos
    if (source.mode === 'simples' || source.mode === 'avancado') {
      merged.mode = source.mode;
    }
    // Demais chaves sao todas numericas
    const numericKeys = REQUIRED_KEYS.filter((k) => k !== 'mode') as Exclude<keyof SimuladorInputs, 'mode'>[];
    for (const key of numericKeys) {
      const val = source[key];
      if (typeof val === 'number' && Number.isFinite(val)) {
        merged[key] = val;
      }
    }
    return merged;
  } catch {
    return DEFAULTS;
  }
}

// ─── Hook ───────────────────────────────────────────────
export function useSimulador() {
  const [inputs, setInputs] = useState<SimuladorInputs>(loadSaved);
  const [lucroDesejado, setLucroDesejado] = useState(100000);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      // silencioso — quota exceeded ou storage indisponível
    }
  }, [inputs]);

  const updateInput = useCallback(<K extends keyof SimuladorInputs>(key: K, value: SimuladorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetDefaults = useCallback(() => setInputs(DEFAULTS), []);

  const outputs = useMemo(() => computeOutputs(inputs), [inputs]);
  const alerts = useMemo(() => computeAlerts(inputs, outputs), [inputs, outputs]);
  const cenarios = useMemo(() => computeCenarios(inputs), [inputs]);
  const dreamGoal = useMemo(() => computeDreamGoal(inputs, outputs, lucroDesejado), [inputs, outputs, lucroDesejado]);

  return {
    inputs,
    outputs,
    alerts,
    cenarios,
    dreamGoal,
    lucroDesejado,
    setLucroDesejado,
    updateInput,
    resetDefaults,
    defaults: DEFAULTS,
  };
}

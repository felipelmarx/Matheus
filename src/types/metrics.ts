/**
 * Dados de UM dia (uma linha da aba da planilha).
 * Refatorado para o novo schema da planilha (123 colunas).
 * Apenas os 30 campos relevantes ao dashboard são tipados.
 */
export interface DailyData {
  date: string;

  // Investimento
  investimentoTotal: number;
  investimentoCaptacao: number;
  investimentoMetaAds: number;
  investimentoGoogleAds: number;

  // Funil topo
  impressoes: number;
  cpm: number;
  cliques: number;
  cpc: number;
  ctr: number;

  // Funil meio
  viewsMeta: number;
  viewsOrganico: number;
  connectRateMeta: number;

  // Checkout
  checkoutsMeta: number;
  checkoutsOrganico: number;
  custoFinalizacao: number;

  // Captação
  entraramNoGrupo: number;
  confirmados: number;

  // Vendas presencial
  vendasAds: number;
  vendasOrganico: number;
  vendasSmartPresencial: number;
  vendasTotal: number;

  // Faturamento
  faturamentoAds: number;
  faturamentoSmart: number;
  faturamentoOrganico: number;
  faturamentoIngressos: number;
  faturamentoTotal: number;

  // Reembolsos
  reembolsoAds: number;
  reembolsoOrg: number;

  // Lucro
  lucroAds: number;
  lucroSmart: number;
  lucroTotal: number;

  // Performance
  cpa: number;
  comprasAds: number;
  comprasTotal: number;
  roasAds: number;
  roasGeral: number;
  ticketMedioAds: number;
  ticketMedioGeral: number;
  conversaoCliqueVenda: number;
}

/**
 * Métricas agregadas do evento inteiro.
 */
export interface EventoMetrics {
  // HERO KPIs
  totalInvestimento: number;
  totalVendas: number;
  totalFaturamento: number;
  totalLucro: number;
  roasGeral: number;
  ticketMedioGeral: number;

  // Funil de conversão
  totalImpressoes: number;
  totalCliques: number;
  totalViews: number;
  totalCheckouts: number;
  ctrMedio: number;
  conversaoCheckoutVenda: number;

  // Breakdown vendas
  vendasAds: number;
  vendasOrganico: number;
  vendasSmartPresencial: number;

  // Breakdown faturamento
  faturamentoAds: number;
  faturamentoOrganico: number;
  faturamentoSmart: number;
  faturamentoIngressos: number;

  // Captação
  totalConfirmados: number;
  totalGrupo: number;

  // Custos
  cpcMedio: number;
  cpmMedio: number;
  custoFinalizacaoMedio: number;
  cpaAds: number;

  // Reembolsos
  totalReembolsos: number;
  reembolsosAds: number;
  reembolsosOrg: number;

  // ROAS
  roasAds: number;

  // Daily breakdown (only days with activity)
  dailyData: DailyData[];

  // Meta
  lastUpdated: string;
}

export interface EventData {
  eventId: string;
  eventLabel: string;
  dateLabel?: string;
  metrics: EventoMetrics;
}

export interface MultiEventResponse {
  events: EventData[];
}

/**
 * Resposta da API `/api/metrics?event={id}`.
 */
export interface SingleEventResponse {
  event: EventData;
}

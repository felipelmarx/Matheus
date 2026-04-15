export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface DesafioData {
  // Periods
  captacao: string;
  aoVivo: string;

  // Traffic
  cliques: number;
  viewPages: number;
  conectRate: number;

  // Checkout funnel (may be null if not available in sheet yet)
  checkouts: number | null;

  // Investment & Revenue
  investimento: number;            // Investimento bruto (total: trafego + API + extras)
  investimentoCaptacao: number;    // Investimento so de trafego (ads/FB)
  vendas: number;
  cortesias: number;
  ingressosTotais: number;
  cpa: number;
  ticketMedio: number;
  faturamento: number;
  lucroPrejuizo: number;

  // Applications
  aplicacoes: number;
  custoPorAplicacao: number;

  // Scheduling & Interviews
  agendamentos: number;
  entrevistas: number;
  custoEntrevista: number;

  // Formation
  vendasFormacao: number;
  custoVendasFormacao: number;
  faturamentoTotal: number;
  ticketMedioFormacao: number;

  // Cancellations & No-show
  cancelamentos: number;
  noShow: number;

  // Comparecimentos (participacao por sessao 1..5) — RESUMO-TECNICO
  comparecimentos: number[];
}

export type DesafioKey = 'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5';
export type TabKey = 'geral' | DesafioKey | 'comparar' | 'analises' | 'analiseAplicacoes' | 'analiseCruzada' | 'simulador' | 'guia';
export type GeralMode = 'total' | 'meta1' | 'meta2';

export interface DailyMetric {
  data: string;
  investimento: number;
  vendas: number;
  cpa: number;
  ticketMedio: number;
  faturamento: number;
  lucroPrejuizo: number;
  cortesia: number;
  ingressosTotais: number;
  qualificados: number;
  desqualificados: number;
}

export interface AdMetric {
  rank: number;
  name: string;
  totalSpent: number;
  totalPurchases: number;
  cpa: number;
  formationSales: number;
  dailyBreakdown: { day: string; spent: number; purchases: number }[];
}

export interface PopupQualificadorSide {
  investimento: number;
  checkouts: number;
  conversaoCheckout: number;
  proporcao: number;
  vendas: number;
  cpaReal: number;
  faturamento: number;
  ticketMedio: number;
}

export interface PopupQualificadorDay {
  data: string;
  qualificador: PopupQualificadorSide;
  desqualificado: PopupQualificadorSide;
  investimentoTotal: number;
}

export interface AnaliseCompradorSection {
  title: string;
  content: string;
}

export interface AllDesafiosData {
  geral: DesafioData;
  desafio1: DesafioData;
  desafio2: DesafioData;
  desafio3: DesafioData;
  desafio3Daily: DailyMetric[];
  desafio4: DesafioData;
  desafio4Daily: DailyMetric[];
  desafio5: DesafioData;
  desafio5Daily: DailyMetric[];
  popupQualificador: PopupQualificadorDay[];
  popupConsolidado: {
    qualificador: PopupQualificadorSide;
    desqualificado: PopupQualificadorSide;
    investimentoTotal: number;
  } | null;
  topAds: AdMetric[];
  topAdsDesafio4: AdMetric[];
  visaoEstrategica: string[];
  resumoTecnico: { metrics: ResumoTecnicoMetric[]; analysis: string[] };
  analiseCompradores: AnaliseCompradorSection[];
  analiseAplicacoes: AnaliseCompradorSection[];
  analiseCruzada: AnaliseCompradorSection[];
  lastUpdated: string;
  fromCache: boolean;
}

// Keep legacy type for backward compat
export interface DashboardData {
  investimento: number;
  faturamento: number;
  vendas: number;
  cpa: number;
  ticketMedio: number;
  cliques: number;
  viewPages: number;
  conectRate: number;
  lucroPrejuizo: number;
  aplicacoes: number;
  custoPorAplicacao: number;
  vendasFormacao: number;
  faturamentoTotal: number;
  desafioAtual: string;
  periodo: string;
  lastUpdated: string;
  fromCache: boolean;
}

export interface ResumoTecnicoMetric {
  label: string;
  desafio1: string;
  desafio2: string;
  comparacaoIA: string;
  desafio3: string;
}

export interface CacheEntry {
  data: AllDesafiosData;
  timestamp: number;
  ttl: number;
}

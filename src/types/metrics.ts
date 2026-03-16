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

  // Investment & Revenue
  investimento: number;
  vendas: number;
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
}

export type DesafioKey = 'desafio1' | 'desafio2' | 'desafio3' | 'desafio4';
export type TabKey = 'geral' | DesafioKey | 'comparar' | 'analises';
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
}

export interface AdMetric {
  rank: number;
  name: string;
  totalSpent: number;
  totalPurchases: number;
  cpa: number;
  dailyBreakdown: { day: string; spent: number; purchases: number }[];
}

export interface AllDesafiosData {
  geral: DesafioData;
  desafio1: DesafioData;
  desafio2: DesafioData;
  desafio3: DesafioData;
  desafio3Daily: DailyMetric[];
  desafio4: DesafioData;
  desafio4Daily: DailyMetric[];
  topAds: AdMetric[];
  visaoEstrategica: string[];
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

export interface CacheEntry {
  data: AllDesafiosData;
  timestamp: number;
  ttl: number;
}

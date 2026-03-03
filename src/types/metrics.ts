export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface DashboardData {
  // Core metrics
  investimento: number;
  faturamento: number;
  vendas: number;
  cpa: number;
  ticketMedio: number;

  // Extended metrics
  cliques: number;
  viewPages: number;
  conectRate: number;
  lucroPrejuizo: number;
  aplicacoes: number;
  custoPorAplicacao: number;
  vendasFormacao: number;
  faturamentoTotal: number;

  // Metadata
  desafioAtual: string;
  periodo: string;
  lastUpdated: string;
  fromCache: boolean;
}

export interface CacheEntry {
  data: DashboardData;
  timestamp: number;
  ttl: number;
}

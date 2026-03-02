export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

export interface DashboardData {
  investimento: number;
  faturamento: number;
  vendas: number;
  cpa: number;
  ticketMedio: number;
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

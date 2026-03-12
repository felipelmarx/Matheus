export interface DailyData {
  date: string;
  investimento: number;
  inscritosTotal: number;
  vendasAds: number;
  vendasOrganicas: number;
  ingressosCortesias: number;
  cpa: number;
  ticketMedio: number;
  faturamento: number;
  lucroPrejuizo: number;
}

export interface EventoMetrics {
  // Totals
  totalInvestimento: number;
  totalInscritos: number;
  totalVendasAds: number;
  totalVendasOrganicas: number;
  totalIngressosCortesias: number;
  totalFaturamento: number;
  totalLucroPrejuizo: number;

  // Averages
  cpaMedio: number;
  ticketMedio: number;

  // Calculated
  roas: number;
  totalVendas: number;

  // Daily breakdown (only days with activity)
  dailyData: DailyData[];

  // Meta
  lastUpdated: string;
}

export interface EventData {
  eventId: string;
  eventLabel: string;
  metrics: EventoMetrics;
}

export interface MultiEventResponse {
  events: EventData[];
}

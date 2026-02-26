export interface MetricCard {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
}

export interface BestPerformer {
  id: string;
  name: string;
  value: number;
  percentage: number;
  rank: number;
}

export interface DashboardData {
  investedValue: number;
  salesCount: number;
  cpa: number;
  bestAds: BestPerformer[];
  bestPages: BestPerformer[];
  lastUpdated: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

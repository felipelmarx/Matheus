import { DailyData, EventoMetrics } from '@/types/metrics';
import { parseSheetNumber } from './metricsCalculator';
import { getCached, setCache } from './cache';

const API_KEY = process.env.GOOGLE_API_KEY;
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

if (!API_KEY || !SPREADSHEET_ID) {
  throw new Error('Missing GOOGLE_API_KEY or GOOGLE_SHEETS_SPREADSHEET_ID env vars');
}

async function fetchSheetRows(range: string): Promise<string[][]> {
  const encodedRange = encodeURIComponent(range);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodedRange}?key=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Sheets API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.values || [];
}

function parseDailyRow(row: string[]): DailyData {
  return {
    date: row[0] || '',
    investimento: parseSheetNumber(row[1]),
    inscritosTotal: parseSheetNumber(row[2]),
    vendasAds: parseSheetNumber(row[3]),
    vendasOrganicas: parseSheetNumber(row[4]),
    ingressosCortesias: parseSheetNumber(row[5]),
    cpa: parseSheetNumber(row[6]),
    ticketMedio: parseSheetNumber(row[7]),
    faturamento: parseSheetNumber(row[8]),
    lucroPrejuizo: parseSheetNumber(row[9]),
  };
}

function hasActivity(day: DailyData): boolean {
  return (
    day.investimento !== 0 ||
    day.inscritosTotal !== 0 ||
    day.vendasAds !== 0 ||
    day.vendasOrganicas !== 0 ||
    day.ingressosCortesias !== 0 ||
    day.faturamento !== 0
  );
}

export async function fetchEventoMetrics(
  sheetTab: string,
  range: string
): Promise<EventoMetrics> {
  const cacheKey = `evento-metrics-${sheetTab}`;
  const cached = getCached<EventoMetrics>(cacheKey);
  if (cached) return cached;

  const rows = await fetchSheetRows(`'${sheetTab}'!${range}`);

  // Skip header row (first row)
  const dataRows = rows.slice(1);
  const allDays = dataRows.map(parseDailyRow);
  const activeDays = allDays.filter(hasActivity);

  // Calculate totals
  const totalInvestimento = allDays.reduce((sum, d) => sum + d.investimento, 0);
  const totalInscritos = allDays.reduce((sum, d) => sum + d.inscritosTotal, 0);
  const totalVendasAds = allDays.reduce((sum, d) => sum + d.vendasAds, 0);
  const totalVendasOrganicas = allDays.reduce((sum, d) => sum + d.vendasOrganicas, 0);
  const totalIngressosCortesias = allDays.reduce((sum, d) => sum + d.ingressosCortesias, 0);
  const totalFaturamento = allDays.reduce((sum, d) => sum + d.faturamento, 0);
  const totalLucroPrejuizo = allDays.reduce((sum, d) => sum + d.lucroPrejuizo, 0);
  const totalVendas = totalVendasAds + totalVendasOrganicas;

  // Averages (from active days only)
  const daysWithSales = activeDays.filter(d => d.vendasAds > 0 || d.vendasOrganicas > 0);
  const cpaMedio = totalVendas > 0 ? totalInvestimento / totalVendas : 0;
  const ticketMedio =
    daysWithSales.length > 0
      ? daysWithSales.reduce((sum, d) => sum + d.ticketMedio, 0) / daysWithSales.length
      : 0;

  // ROI
  const roi = totalInvestimento > 0
    ? ((totalFaturamento - totalInvestimento) / totalInvestimento) * 100
    : 0;

  const metrics: EventoMetrics = {
    totalInvestimento,
    totalInscritos,
    totalVendasAds,
    totalVendasOrganicas,
    totalIngressosCortesias,
    totalFaturamento,
    totalLucroPrejuizo,
    cpaMedio,
    ticketMedio,
    roi,
    totalVendas,
    dailyData: activeDays,
    lastUpdated: new Date().toISOString(),
  };

  setCache(cacheKey, metrics);
  return metrics;
}

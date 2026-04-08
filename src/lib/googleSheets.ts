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

const n = (row: string[], idx: number): number => parseSheetNumber(row[idx]);

function parseDailyRow(row: string[]): DailyData {
  return {
    date: row[0] || '',

    investimentoTotal: n(row, 2),
    investimentoCaptacao: n(row, 3),
    investimentoMetaAds: n(row, 4),
    investimentoGoogleAds: n(row, 5),

    impressoes: n(row, 11),
    cpm: n(row, 12),
    cliques: n(row, 13),
    cpc: n(row, 14),
    ctr: n(row, 15),

    viewsMeta: n(row, 16),
    viewsOrganico: n(row, 17),
    connectRateMeta: n(row, 19),

    checkoutsMeta: n(row, 22),
    checkoutsOrganico: n(row, 23),
    custoFinalizacao: n(row, 26),

    entraramNoGrupo: n(row, 27),
    confirmados: n(row, 32),

    vendasTotal: n(row, 77),
    vendasAds: n(row, 78),
    vendasOrganico: n(row, 79),
    vendasSmartPresencial: n(row, 80),

    faturamentoAds: n(row, 84),
    faturamentoSmart: n(row, 85),
    faturamentoOrganico: n(row, 86),
    faturamentoIngressos: n(row, 87),
    faturamentoTotal: n(row, 88),

    lucroAds: n(row, 89),
    lucroSmart: n(row, 90),
    lucroTotal: n(row, 91),

    comprasAds: n(row, 93),
    comprasTotal: n(row, 94),
    roasAds: n(row, 96),
    roasGeral: n(row, 97),
    conversaoCliqueVenda: n(row, 98),
    ticketMedioAds: n(row, 101),
    ticketMedioGeral: n(row, 102),
  };
}

function hasActivity(day: DailyData): boolean {
  return (
    day.investimentoTotal > 0 ||
    day.vendasTotal > 0 ||
    day.entraramNoGrupo > 0 ||
    day.faturamentoTotal > 0
  );
}

const sum = (arr: DailyData[], pick: (d: DailyData) => number): number =>
  arr.reduce((acc, d) => acc + pick(d), 0);

export async function fetchEventoMetrics(
  sheetTab: string,
  range: string,
  options: { force?: boolean } = {}
): Promise<EventoMetrics> {
  const cacheKey = `evento-metrics-${sheetTab}`;
  if (!options.force) {
    const cached = getCached<EventoMetrics>(cacheKey);
    if (cached) return cached;
  }

  const rows = await fetchSheetRows(`'${sheetTab}'!${range}`);

  // Skip header row
  const dataRows = rows.slice(1);
  const allDays = dataRows.map(parseDailyRow);
  const activeDays = allDays.filter(hasActivity);

  const totalInvestimento = sum(activeDays, d => d.investimentoTotal);
  const totalVendas = sum(activeDays, d => d.vendasTotal);
  const totalFaturamento = sum(activeDays, d => d.faturamentoTotal);
  const totalLucro = sum(activeDays, d => d.lucroTotal);
  const roasGeral = totalInvestimento > 0 ? totalFaturamento / totalInvestimento : 0;
  const ticketMedioGeral = totalVendas > 0 ? totalFaturamento / totalVendas : 0;

  const totalImpressoes = sum(activeDays, d => d.impressoes);
  const totalCliques = sum(activeDays, d => d.cliques);
  const totalViews = sum(activeDays, d => d.viewsMeta + d.viewsOrganico);
  const totalCheckouts = sum(activeDays, d => d.checkoutsMeta + d.checkoutsOrganico);
  const ctrMedio = totalImpressoes > 0 ? totalCliques / totalImpressoes : 0;
  const conversaoCheckoutVenda = totalCheckouts > 0 ? totalVendas / totalCheckouts : 0;

  const vendasAds = sum(activeDays, d => d.vendasAds);
  const vendasOrganico = sum(activeDays, d => d.vendasOrganico);
  const vendasSmartPresencial = sum(activeDays, d => d.vendasSmartPresencial);

  const faturamentoAds = sum(activeDays, d => d.faturamentoAds);
  const faturamentoOrganico = sum(activeDays, d => d.faturamentoOrganico);
  const faturamentoSmart = sum(activeDays, d => d.faturamentoSmart);
  const faturamentoIngressos = sum(activeDays, d => d.faturamentoIngressos);

  const totalConfirmados = sum(activeDays, d => d.confirmados);
  const totalGrupo = sum(activeDays, d => d.entraramNoGrupo);

  const cpcMedio = totalCliques > 0 ? totalInvestimento / totalCliques : 0;
  const cpmMedio = totalImpressoes > 0 ? (totalInvestimento / totalImpressoes) * 1000 : 0;
  const custoFinalizacaoMedio = totalCheckouts > 0 ? totalInvestimento / totalCheckouts : 0;

  const somaInvestimentoAds = sum(activeDays, d => d.investimentoMetaAds + d.investimentoGoogleAds);
  const somaFaturamentoAds = faturamentoAds;
  const roasAds = somaInvestimentoAds > 0 ? somaFaturamentoAds / somaInvestimentoAds : 0;

  const metrics: EventoMetrics = {
    totalInvestimento,
    totalVendas,
    totalFaturamento,
    totalLucro,
    roasGeral,
    ticketMedioGeral,

    totalImpressoes,
    totalCliques,
    totalViews,
    totalCheckouts,
    ctrMedio,
    conversaoCheckoutVenda,

    vendasAds,
    vendasOrganico,
    vendasSmartPresencial,

    faturamentoAds,
    faturamentoOrganico,
    faturamentoSmart,
    faturamentoIngressos,

    totalConfirmados,
    totalGrupo,

    cpcMedio,
    cpmMedio,
    custoFinalizacaoMedio,

    roasAds,

    dailyData: activeDays,
    lastUpdated: new Date().toISOString(),
  };

  setCache(cacheKey, metrics);
  return metrics;
}

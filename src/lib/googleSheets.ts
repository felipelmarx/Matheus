import type { DashboardData } from '@/types/metrics';
import { parseSheetNumber } from './metricsCalculator';
import { getCached, getStale, setCache } from './cache';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
const API_KEY = process.env.GOOGLE_API_KEY ?? '';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fetch all rows from RESUMO - GERAL (A1:R35)
async function fetchResumoRows(): Promise<string[][]> {
  const range = encodeURIComponent('RESUMO - GERAL!A1:R35');
  const url = `${SHEETS_API}/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`);
  const json = await res.json();
  return (json.values ?? []) as string[][];
}

// Find value: label at row N col labelCol, value at row N+1 col valueCol
function findValue(rows: string[][], pattern: RegExp, labelCol: number, valueCol: number): string {
  for (let i = 0; i < rows.length - 1; i++) {
    const label = (rows[i]?.[labelCol] ?? '').trim();
    if (pattern.test(label)) {
      return (rows[i + 1]?.[valueCol] ?? '').trim();
    }
  }
  return '';
}

// Extract all metrics for a desafio column pair
function extractMetrics(rows: string[][], labelCol: number, valueCol: number) {
  const p = parseSheetNumber;
  return {
    investimento: p(findValue(rows, /investimento/i, labelCol, valueCol)),
    faturamento: p(findValue(rows, /faturamento\s*(ingresso|.*bumps)/i, labelCol, valueCol)),
    vendas: p(findValue(rows, /^vendas$/i, labelCol, valueCol)),
    cpa: p(findValue(rows, /^cpa$/i, labelCol, valueCol)),
    ticketMedio: p(findValue(rows, /ticket\s*m[eé]dio/i, labelCol, valueCol)),
    cliques: p(findValue(rows, /cliques/i, labelCol, valueCol)),
    viewPages: p(findValue(rows, /view\s*pages?/i, labelCol, valueCol)),
    conectRate: p(findValue(rows, /conect\s*rate/i, labelCol, valueCol)),
    lucroPrejuizo: p(findValue(rows, /lucro.*preju[ií]zo|preju[ií]zo.*lucro/i, labelCol, valueCol)),
    aplicacoes: p(findValue(rows, /aplica[cç][oõ]es/i, labelCol, valueCol)),
    custoPorAplicacao: p(findValue(rows, /custo\s*(por|\/)\s*aplica[cç][aã]o/i, labelCol, valueCol)),
    vendasFormacao: p(findValue(rows, /vendas\s*(da\s*)?forma[cç][aã]o/i, labelCol, valueCol)),
    faturamentoTotal: p(findValue(rows, /faturamento\s*total/i, labelCol, valueCol)),
  };
}

// Extract period text
function extractPeriod(rows: string[][], labelCol: number): string {
  for (const row of rows) {
    const val = (row?.[labelCol] ?? '').trim();
    if (/capta[cç][aã]o/i.test(val)) return val;
  }
  return '';
}

function getDefaultData(): DashboardData {
  return {
    investimento: 0, faturamento: 0, vendas: 0, cpa: 0, ticketMedio: 0,
    cliques: 0, viewPages: 0, conectRate: 0, lucroPrejuizo: 0,
    aplicacoes: 0, custoPorAplicacao: 0, vendasFormacao: 0, faturamentoTotal: 0,
    desafioAtual: '', periodo: '', lastUpdated: new Date().toISOString(), fromCache: false,
  };
}

// Columns per desafio:
// DESAFIO 1: label=2, value=3
// DESAFIO 2: label=8, value=9
// DESAFIO 3: label=14, value=15
const DESAFIOS = [
  { label: 'DESAFIO 3', labelCol: 14, valueCol: 15 },
  { label: 'DESAFIO 2', labelCol: 8, valueCol: 9 },
  { label: 'DESAFIO 1', labelCol: 2, valueCol: 3 },
];

export async function fetchMetricsFromSheets(): Promise<DashboardData> {
  const cached = getCached();
  if (cached) return { ...cached, fromCache: true };

  if (!SPREADSHEET_ID || !API_KEY) {
    console.error('[sheets] Missing GOOGLE_API_KEY or SPREADSHEET_ID');
    return getStale() ?? getDefaultData();
  }

  try {
    console.log('[sheets] Fetching from Google Sheets...');
    const rows = await fetchResumoRows();

    for (const d of DESAFIOS) {
      const metrics = extractMetrics(rows, d.labelCol, d.valueCol);
      const hasData = metrics.investimento > 0 || metrics.vendas > 0 || metrics.faturamento > 0;

      if (hasData) {
        const periodo = extractPeriod(rows, d.labelCol);
        const data: DashboardData = {
          ...metrics,
          desafioAtual: d.label,
          periodo,
          lastUpdated: new Date().toISOString(),
          fromCache: false,
        };
        setCache(data);
        console.log(`[sheets] Loaded ${d.label}: inv=${metrics.investimento} fat=${metrics.faturamento} vendas=${metrics.vendas}`);
        return data;
      }
    }

    console.warn('[sheets] No data found in any desafio');
    return getDefaultData();

  } catch (error) {
    console.error('[sheets] Error:', error instanceof Error ? error.message : error);
    return getStale() ?? getDefaultData();
  }
}

export async function forceRefresh(): Promise<DashboardData> {
  const { invalidateCache } = await import('./cache');
  invalidateCache();
  return fetchMetricsFromSheets();
}

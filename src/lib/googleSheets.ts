import type { DesafioData, AllDesafiosData } from '@/types/metrics';
import { parseSheetNumber } from './metricsCalculator';
import { getCached, getStale, setCache } from './cache';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
const API_KEY = process.env.GOOGLE_API_KEY ?? '';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fetch rows from DASH AUTO (C1:R40)
async function fetchDashAutoRows(): Promise<string[][]> {
  const range = encodeURIComponent('DASH AUTO!C1:R40');
  const url = `${SHEETS_API}/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error ${res.status}`);
  const json = await res.json();
  return (json.values ?? []) as string[][];
}

// Find value: label at row N col labelCol, value at row N+1 col targetCol
function findValue(rows: string[][], pattern: RegExp, labelCol: number, targetCol: number): string {
  for (let i = 0; i < rows.length - 1; i++) {
    const label = (rows[i]?.[labelCol] ?? '').trim();
    if (pattern.test(label)) {
      return (rows[i + 1]?.[targetCol] ?? '').trim();
    }
  }
  return '';
}

// Get raw text from a specific row matching pattern
function findText(rows: string[][], pattern: RegExp, col: number): string {
  for (const row of rows) {
    const val = (row?.[col] ?? '').trim();
    if (pattern.test(val)) return val;
  }
  return '';
}

// Extract all metrics for a desafio
// labelCol = column where labels are, valueCol = column where values are
function extractDesafioData(rows: string[][], labelCol: number, valueCol: number): DesafioData {
  const p = parseSheetNumber;

  return {
    captacao: findText(rows, /capta[cç][aã]o/i, labelCol),
    aoVivo: findText(rows, /ao\s*vivo/i, labelCol),

    cliques: p(findValue(rows, /cliques/i, labelCol, valueCol)),
    viewPages: p(findValue(rows, /view\s*pages?/i, labelCol, valueCol)),
    conectRate: p(findValue(rows, /conect\s*rate/i, labelCol, valueCol)),

    investimento: p(findValue(rows, /investimento/i, labelCol, valueCol)),
    vendas: p(findValue(rows, /vendas\s*(ingresso|$)/i, labelCol, valueCol)),
    cpa: p(findValue(rows, /^cp[ai]$/i, labelCol, valueCol)),
    ticketMedio: p(findValue(rows, /ticket\s*m[eé]dio/i, labelCol, valueCol)),
    faturamento: p(findValue(rows, /faturamento\s*(ingresso|.*bumps)/i, labelCol, valueCol)),
    lucroPrejuizo: p(findValue(rows, /investimento\s*l[ií]quido|lucro.*preju[ií]zo/i, labelCol, valueCol)),

    // aplicacoes: count is in valueCol, cost is in labelCol (same row)
    aplicacoes: p(findValue(rows, /aplica[cç][oõ]es/i, labelCol, valueCol)),
    custoPorAplicacao: p(findValue(rows, /aplica[cç][oõ]es/i, labelCol, labelCol)),

    agendamentos: p(findValue(rows, /agendamentos/i, labelCol, valueCol)),

    // entrevistas: count is in valueCol, cost is in labelCol (same row)
    entrevistas: p(findValue(rows, /entrevistas/i, labelCol, valueCol)),
    custoEntrevista: p(findValue(rows, /entrevistas/i, labelCol, labelCol)),

    vendasFormacao: p(findValue(rows, /vendas\s*(da\s*)?forma[cç][aã]o/i, labelCol, valueCol)),
    custoVendasFormacao: p(findValue(rows, /custo\s*por\s*vendas\s*(da\s*)?forma[cç][aã]o/i, labelCol, valueCol)),
    faturamentoTotal: p(findValue(rows, /faturamento\s*total/i, labelCol, valueCol)),
    ticketMedioFormacao: p(findValue(rows, /ticket\s*m[eé]dio\s*(da\s*)?forma[cç][aã]o/i, labelCol, valueCol)),
  };
}

function getDefaultDesafio(): DesafioData {
  return {
    captacao: '', aoVivo: '',
    cliques: 0, viewPages: 0, conectRate: 0,
    investimento: 0, vendas: 0, cpa: 0, ticketMedio: 0, faturamento: 0, lucroPrejuizo: 0,
    aplicacoes: 0, custoPorAplicacao: 0,
    agendamentos: 0, entrevistas: 0, custoEntrevista: 0,
    vendasFormacao: 0, custoVendasFormacao: 0, faturamentoTotal: 0, ticketMedioFormacao: 0,
  };
}

function getDefaultData(): AllDesafiosData {
  return {
    desafio1: getDefaultDesafio(),
    desafio2: getDefaultDesafio(),
    desafio3: getDefaultDesafio(),
    lastUpdated: new Date().toISOString(),
    fromCache: false,
  };
}

// Column mappings for DASH AUTO (C1:R35 → indices 0-15)
// DESAFIO 1: label=0 (C), value=1 (D)
// DESAFIO 2: label=6 (I), value=7 (J)
// DESAFIO 3: label=12 (O), value=13 (P)
const DESAFIO_COLS = [
  { key: 'desafio1' as const, labelCol: 0, valueCol: 1 },
  { key: 'desafio2' as const, labelCol: 6, valueCol: 7 },
  { key: 'desafio3' as const, labelCol: 12, valueCol: 13 },
];

export async function fetchMetricsFromSheets(): Promise<AllDesafiosData> {
  const cached = getCached();
  if (cached) return { ...cached, fromCache: true };

  if (!SPREADSHEET_ID || !API_KEY) {
    console.error('[sheets] Missing GOOGLE_API_KEY or SPREADSHEET_ID');
    return getStale() ?? getDefaultData();
  }

  try {
    console.log('[sheets] Fetching from DASH AUTO...');
    const rows = await fetchDashAutoRows();

    const data: AllDesafiosData = {
      desafio1: getDefaultDesafio(),
      desafio2: getDefaultDesafio(),
      desafio3: getDefaultDesafio(),
      lastUpdated: new Date().toISOString(),
      fromCache: false,
    };

    for (const col of DESAFIO_COLS) {
      const desafioData = extractDesafioData(rows, col.labelCol, col.valueCol);
      data[col.key] = desafioData;
      console.log(`[sheets] ${col.key}: inv=${desafioData.investimento} vendas=${desafioData.vendas} fat=${desafioData.faturamentoTotal}`);
    }

    setCache(data);
    return data;

  } catch (error) {
    console.error('[sheets] Error:', error instanceof Error ? error.message : error);
    return getStale() ?? getDefaultData();
  }
}

export async function forceRefresh(): Promise<AllDesafiosData> {
  const { invalidateCache } = await import('./cache');
  invalidateCache();
  return fetchMetricsFromSheets();
}

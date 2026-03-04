import type { DesafioData, DailyMetric, AllDesafiosData } from '@/types/metrics';
import { parseSheetNumber } from './metricsCalculator';
import { getCached, getStale, setCache } from './cache';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
const API_KEY = process.env.GOOGLE_API_KEY ?? '';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fetch rows from a given sheet range
async function fetchSheetRows(range: string): Promise<string[][]> {
  const encoded = encodeURIComponent(range);
  const url = `${SHEETS_API}/${SPREADSHEET_ID}/values/${encoded}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
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

  const result: DesafioData = {
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
    ticketMedioFormacao: 0,
  };

  // ticketMedioFormacao: try sheet extraction, fallback to computed value
  const tmf = p(findValue(rows, /ticket\s*m[eé]dio\s*(da\s*)?forma[cç][aã]o/i, labelCol, valueCol))
    || p(findValue(rows, /ticket\s*m[eé]dio\s*(da\s*)?forma[cç][aã]o/i, 0, valueCol));
  result.ticketMedioFormacao = tmf > 0
    ? tmf
    : (result.vendasFormacao > 0 ? result.faturamentoTotal / result.vendasFormacao : 0);

  return result;
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

// Extract daily metrics from MAR/ABR MÉTRICAS GERAIS (CU5:DB17)
// Columns: CU=data, CV=investimento, CW=vendas, CX=CPA, CY=ticket médio, CZ=faturamento, DA=lucro/prejuízo, DB=cortesia
function extractDailyMetrics(rows: string[][]): DailyMetric[] {
  const p = parseSheetNumber;
  const daily: DailyMetric[] = [];

  for (const row of rows) {
    const dateVal = (row[0] ?? '').trim();
    if (!dateVal || /^(data|dia|date)$/i.test(dateVal)) continue;

    daily.push({
      data: dateVal,
      investimento: p(row[1]),
      vendas: p(row[2]),
      cpa: p(row[3]),
      ticketMedio: p(row[4]),
      faturamento: p(row[5]),
      lucroPrejuizo: p(row[6]),
      cortesia: p(row[7]),
    });
  }

  return daily;
}

function getDefaultData(): AllDesafiosData {
  return {
    geral: getDefaultDesafio(),
    desafio1: getDefaultDesafio(),
    desafio2: getDefaultDesafio(),
    desafio3: getDefaultDesafio(),
    desafio3Daily: [],
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
    console.log('[sheets] Fetching from DASH AUTO, RESUMO - GERAL, and MAR/ABR MÉTRICAS GERAIS...');
    const [dashRows, resumoRows] = await Promise.all([
      fetchSheetRows('DASH AUTO!C1:R35'),
      fetchSheetRows('RESUMO - GERAL!C1:R77'),
    ]);

    // Daily fetch is independent - don't let it break the main data
    let dailyRows: string[][] = [];
    try {
      dailyRows = await fetchSheetRows("'MAR/ABR - METRICAS GERAIS'!CU5:DB17");
    } catch (err) {
      console.warn('[sheets] Daily metrics fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Extract geral data from RESUMO - GERAL (label=col0/C, value=col1/D)
    const geralData = extractDesafioData(resumoRows, 0, 1);
    console.log(`[sheets] geral: inv=${geralData.investimento} vendas=${geralData.vendas} fat=${geralData.faturamentoTotal}`);

    const desafio3Daily = extractDailyMetrics(dailyRows);
    console.log(`[sheets] desafio3Daily: ${desafio3Daily.length} days loaded`);

    const data: AllDesafiosData = {
      geral: geralData,
      desafio1: getDefaultDesafio(),
      desafio2: getDefaultDesafio(),
      desafio3: getDefaultDesafio(),
      desafio3Daily,
      lastUpdated: new Date().toISOString(),
      fromCache: false,
    };

    for (const col of DESAFIO_COLS) {
      const desafioData = extractDesafioData(dashRows, col.labelCol, col.valueCol);
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

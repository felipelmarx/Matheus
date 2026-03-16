import type { DesafioData, DailyMetric, AdMetric, AllDesafiosData } from '@/types/metrics';
import { parseSheetNumber } from './metricsCalculator';
import { getCached, getStale, setCache } from './cache';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? '';
const ADS_SPREADSHEET_ID = process.env.ADS_SPREADSHEET_ID ?? '';
const API_KEY = process.env.GOOGLE_API_KEY ?? '';
const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// Fetch rows from a given sheet range (optionally from a different spreadsheet)
async function fetchSheetRows(range: string, spreadsheetId?: string): Promise<string[][]> {
  const id = spreadsheetId ?? SPREADSHEET_ID;
  const encoded = encodeURIComponent(range);
  const url = `${SHEETS_API}/${id}/values/${encoded}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
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
    ingressosTotais: p(findValue(rows, /ingressos?\s*totais/i, labelCol, valueCol)),
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
    cancelamentos: 0,
    noShow: 0,
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
    investimento: 0, vendas: 0, ingressosTotais: 0, cpa: 0, ticketMedio: 0, faturamento: 0, lucroPrejuizo: 0,
    aplicacoes: 0, custoPorAplicacao: 0,
    agendamentos: 0, entrevistas: 0, custoEntrevista: 0,
    vendasFormacao: 0, custoVendasFormacao: 0, faturamentoTotal: 0, ticketMedioFormacao: 0,
    cancelamentos: 0, noShow: 0,
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

// Aggregate ads data: group by ad name, sum spent/purchases, rank by purchases
function extractAdsData(rows: string[][]): AdMetric[] {
  const p = parseSheetNumber;
  const adsMap = new Map<string, { spent: number; purchases: number; daily: Map<string, { spent: number; purchases: number }> }>();

  for (const row of rows) {
    const day = (row[0] ?? '').trim();
    const name = (row[1] ?? '').trim();
    if (!day || !name) continue;

    const spent = p(row[2]);
    const purchases = p(row[3]);

    const existing = adsMap.get(name) ?? { spent: 0, purchases: 0, daily: new Map() };
    existing.spent += spent;
    existing.purchases += purchases;

    const dayData = existing.daily.get(day) ?? { spent: 0, purchases: 0 };
    dayData.spent += spent;
    dayData.purchases += purchases;
    existing.daily.set(day, dayData);

    adsMap.set(name, existing);
  }

  return [...adsMap.entries()]
    .filter(([, d]) => d.purchases > 0 || d.spent > 0)
    .sort((a, b) => b[1].purchases - a[1].purchases || a[1].spent - b[1].spent)
    .slice(0, 10)
    .map(([name, d], i) => ({
      rank: i + 1,
      name,
      totalSpent: d.spent,
      totalPurchases: d.purchases,
      cpa: d.purchases > 0 ? d.spent / d.purchases : 0,
      dailyBreakdown: [...d.daily.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, v]) => ({ day, spent: v.spent, purchases: v.purchases })),
    }));
}

// Extract daily metrics for Desafio 4 from FN4:JF16
// Column indices (0-based from FN):
// 7=date, 9=investimento, 77=cortesias, 78=vendas ads,
// 82=CPA, 84=ticketMedio, 85=faturamento ads total, 87=lucro
function extractDesafio4Daily(rows: string[][]): DailyMetric[] {
  const p = parseSheetNumber;
  const daily: DailyMetric[] = [];

  // Data rows start at index 4 (row 8 in spreadsheet)
  for (let i = 4; i < rows.length; i++) {
    const row = rows[i];
    const dateVal = (row?.[7] ?? '').trim();
    if (!dateVal || !/\d{2}\/\d{2}\/\d{4}/.test(dateVal)) continue;

    daily.push({
      data: dateVal,
      investimento: p(row[9]),
      vendas: p(row[78]),
      cpa: p(row[82]),
      ticketMedio: p(row[84]),
      faturamento: p(row[85]),
      lucroPrejuizo: p(row[87]),
      cortesia: p(row[77]),
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
    desafio4: getDefaultDesafio(),
    desafio4Daily: [],
    topAds: [],
    visaoEstrategica: [],
    lastUpdated: new Date().toISOString(),
    fromCache: false,
  };
}

// Column mappings for RESUMO - GERAL (C1:X77 → indices 0-21)
// DESAFIO 1: label=0 (C), value=1 (D)
// DESAFIO 2: label=6 (I), value=7 (J)
// DESAFIO 3: label=12 (O), value=13 (P)
// DESAFIO 4: label=18 (U), value=19 (V)
const DESAFIO_COLS = [
  { key: 'desafio1' as const, labelCol: 0, valueCol: 1 },
  { key: 'desafio2' as const, labelCol: 6, valueCol: 7 },
  { key: 'desafio3' as const, labelCol: 12, valueCol: 13 },
  { key: 'desafio4' as const, labelCol: 18, valueCol: 19 },
];

export async function fetchMetricsFromSheets(): Promise<AllDesafiosData> {
  const cached = getCached();
  if (cached) return { ...cached, fromCache: true };

  if (!SPREADSHEET_ID || !API_KEY) {
    console.error('[sheets] Missing GOOGLE_API_KEY or SPREADSHEET_ID');
    return getStale() ?? getDefaultData();
  }

  try {
    console.log('[sheets] Fetching from RESUMO - GERAL, MAR/ABR MÉTRICAS GERAIS, and ADS...');
    const resumoRows = await fetchSheetRows('RESUMO - GERAL!C1:X77');

    // Daily fetch is independent - don't let it break the main data
    let dailyRows: string[][] = [];
    try {
      dailyRows = await fetchSheetRows("'MAR/ABR - METRICAS GERAIS'!CU5:DB17");
    } catch (err) {
      console.warn('[sheets] Daily metrics fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Desafio 4 fetch is independent
    let desafio4Rows: string[][] = [];
    try {
      desafio4Rows = await fetchSheetRows("'MAR/ABR - METRICAS GERAIS'!FN4:JF16");
      console.log(`[sheets] Desafio 4: ${desafio4Rows.length} rows loaded`);
    } catch (err) {
      console.warn('[sheets] Desafio 4 fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Ads fetch is independent - don't let it break the main data
    let adsRows: string[][] = [];
    try {
      if (ADS_SPREADSHEET_ID) {
        adsRows = await fetchSheetRows('ADD!A2:D1000', ADS_SPREADSHEET_ID);
        console.log(`[sheets] Ads: ${adsRows.length} rows loaded`);
      }
    } catch (err) {
      console.warn('[sheets] Ads fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Extract geral data from RESUMO - GERAL (label=col0/C, value=col1/D)
    const geralData = extractDesafioData(resumoRows, 0, 1);
    console.log(`[sheets] geral: inv=${geralData.investimento} vendas=${geralData.vendas} fat=${geralData.faturamentoTotal}`);

    const desafio3Daily = extractDailyMetrics(dailyRows);
    console.log(`[sheets] desafio3Daily: ${desafio3Daily.length} days loaded`);

    const desafio4Daily = extractDesafio4Daily(desafio4Rows);
    console.log(`[sheets] desafio4Daily: ${desafio4Daily.length} days loaded`);

    const topAds = extractAdsData(adsRows);
    console.log(`[sheets] topAds: ${topAds.length} ads ranked`);

    const data: AllDesafiosData = {
      geral: geralData,
      desafio1: getDefaultDesafio(),
      desafio2: getDefaultDesafio(),
      desafio3: getDefaultDesafio(),
      desafio3Daily,
      desafio4: getDefaultDesafio(),
      desafio4Daily,
      topAds,
      visaoEstrategica: [],
      lastUpdated: new Date().toISOString(),
      fromCache: false,
    };

    // All desafio data from RESUMO - GERAL (same column structure)
    for (const col of DESAFIO_COLS) {
      const desafioData = extractDesafioData(resumoRows, col.labelCol, col.valueCol);
      data[col.key] = desafioData;
      console.log(`[sheets] ${col.key}: inv=${desafioData.investimento} vendas=${desafioData.vendas} fat=${desafioData.faturamentoTotal}`);
    }

    // Cancelamentos & No-show from RESUMO - GERAL B35:T39
    // Columns: B=0, H=6, N=12, T=18 (0-indexed from B)
    // Rows: 0=header, 1="cancelamento", 2=cancel value, 3="no-show", 4=noshow value
    try {
      const cancelRows = await fetchSheetRows('RESUMO - GERAL!B35:T39');
      const cancelCols: { key: 'desafio1' | 'desafio2' | 'desafio3' | 'desafio4'; col: number }[] = [
        { key: 'desafio1', col: 0 },   // B
        { key: 'desafio2', col: 6 },   // H
        { key: 'desafio3', col: 12 },  // N
        { key: 'desafio4', col: 18 },  // T
      ];
      for (const cc of cancelCols) {
        data[cc.key].cancelamentos = parseSheetNumber(cancelRows[2]?.[cc.col] ?? '');
        data[cc.key].noShow = parseSheetNumber(cancelRows[4]?.[cc.col] ?? '');
      }
      console.log('[sheets] Cancelamentos/No-show loaded');
    } catch (err) {
      console.warn('[sheets] Cancelamentos fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Visao Estrategica from VISAO-ESTRATEGICA tab
    try {
      const veRows = await fetchSheetRows('VISAO-ESTRATEGICA!A1:J29');
      data.visaoEstrategica = veRows.map((row) => (row[0] ?? '').trim()).filter((line) => line.length > 0);
      console.log(`[sheets] Visao Estrategica: ${data.visaoEstrategica.length} lines loaded`);
    } catch (err) {
      console.warn('[sheets] Visao Estrategica fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Sum ingressosTotais for geral from desafio1 + desafio2
    data.geral.ingressosTotais = data.desafio1.ingressosTotais + data.desafio2.ingressosTotais;

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

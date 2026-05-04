import type { DesafioData, DesafioKey, DailyMetric, AdMetric, AllDesafiosData, ResumoTecnicoMetric, PopupQualificadorDay, PopupQualificadorSide, AnaliseCompradorSection, OrganicoFontes, OrganicoSourceRow } from '@/types/metrics';
import { parseSheetNumber } from './metricsCalculator';
import { getCached, getStale, setCache } from './cache';
import adsDesafiosCsv from '@/data/ads-desafios.json';

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

    // Checkouts: graceful extraction — null when sheet row absent/empty
    checkouts: (() => {
      const raw = findValue(rows, /checkouts?(\s*iniciad)?/i, labelCol, valueCol);
      if (!raw || raw.trim() === '' || raw.trim() === '-') return null;
      const parsed = p(raw);
      return parsed > 0 ? parsed : null;
    })(),

    // Investimento bruto: "Investimento bruto" OU "Investimento" puro (exclui "Investimento captacao")
    investimento: p(findValue(rows, /^investimento(\s+bruto)?$/i, labelCol, valueCol)),
    // Investimento de trafego: "Investimento captacao"
    investimentoCaptacao: p(findValue(rows, /investimento\s*capta[cç][aã]o/i, labelCol, valueCol)),
    vendas: p(findValue(rows, /vendas\s*(ingresso|$)/i, labelCol, valueCol)),
    cortesias: p(findValue(rows, /^cortesias?$/i, labelCol, valueCol)),
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
    comparecimentos: [0, 0, 0, 0, 0],
  };

  // ticketMedioFormacao: try sheet extraction, fallback to computed value
  const tmf = p(findValue(rows, /ticket\s*m[eé]dio\s*(da\s*)?forma[cç][aã]o/i, labelCol, valueCol))
    || p(findValue(rows, /ticket\s*m[eé]dio\s*(da\s*)?forma[cç][aã]o/i, 0, valueCol));
  result.ticketMedioFormacao = tmf > 0
    ? tmf
    : (result.vendasFormacao > 0 ? result.faturamentoTotal / result.vendasFormacao : 0);

  // Fallback: se "Investimento bruto" estiver vazio/0 mas houver "Investimento captacao",
  // usa o de captacao (cenario tipico de desafio em andamento — bruto so e consolidado depois)
  if (result.investimento === 0 && result.investimentoCaptacao > 0) {
    result.investimento = result.investimentoCaptacao;
  }

  // Fallback: compute custoPorAplicacao / custoEntrevista a partir do investimento liquido
  // (campo lucroPrejuizo carrega o valor da linha "Investimento Liquido" da planilha)
  const invLiquido = result.lucroPrejuizo > 0 ? result.lucroPrejuizo : result.investimento;
  if (result.custoPorAplicacao === 0 && invLiquido > 0 && result.aplicacoes > 0) {
    result.custoPorAplicacao = invLiquido / result.aplicacoes;
  }
  if (result.custoEntrevista === 0 && invLiquido > 0 && result.entrevistas > 0) {
    result.custoEntrevista = invLiquido / result.entrevistas;
  }

  return result;
}

function getDefaultDesafio(): DesafioData {
  return {
    captacao: '', aoVivo: '',
    cliques: 0, viewPages: 0, conectRate: 0,
    checkouts: null,
    investimento: 0, investimentoCaptacao: 0, vendas: 0, cortesias: 0, ingressosTotais: 0, cpa: 0, ticketMedio: 0, faturamento: 0, lucroPrejuizo: 0,
    aplicacoes: 0, custoPorAplicacao: 0,
    agendamentos: 0, entrevistas: 0, custoEntrevista: 0,
    vendasFormacao: 0, custoVendasFormacao: 0, faturamentoTotal: 0, ticketMedioFormacao: 0,
    cancelamentos: 0, noShow: 0,
    comparecimentos: [0, 0, 0, 0, 0],
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
      ingressosTotais: p(row[8]),
      qualificados: p(row[9]),
      desqualificados: p(row[10]),
    });
  }

  return daily;
}

// Extract resumo organico (Comercial e Midias) from 'ABR - METRICAS GERAIS'!KV3:LF30
// Colunas relativas a KV (j=0):
// 0=FONTES (label), 1=Edson, 2=Ellid, 3=Geovana (SS),
// 4=Stories, 5=Direct-Automacao, 6=Feed, 7=Bio, 8=Pulmonautas (INSTAGRAM),
// 9=YOUTUBE, 10=EXTRA
function extractOrganicoFontes(rows: string[][]): OrganicoFontes {
  const p = parseSheetNumber;
  const empty = (label: string): OrganicoSourceRow => ({
    data: label, edson: 0, ellid: 0, geovana: 0, stories: 0,
    directAutomacao: 0, feed: 0, bio: 0, pulmonautas: 0, youtube: 0, extra: 0,
  });
  const parseRow = (label: string, row: string[]): OrganicoSourceRow => ({
    data: label,
    edson: p(row[1]),
    ellid: p(row[2]),
    geovana: p(row[3]),
    stories: p(row[4]),
    directAutomacao: p(row[5]),
    feed: p(row[6]),
    bio: p(row[7]),
    pulmonautas: p(row[8]),
    youtube: p(row[9]),
    extra: p(row[10]),
  });

  let soma = empty('SOMA');
  const out: OrganicoSourceRow[] = [];
  for (const row of rows) {
    const label = (row[0] ?? '').trim();
    if (!label) continue;
    if (/^soma$/i.test(label)) { soma = parseRow('SOMA', row); continue; }
    if (/^fontes$/i.test(label)) continue;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(label)) {
      out.push(parseRow(label, row));
    }
  }
  return { soma, rows: out };
}

// Aggregate ads data: group by ad name, sum spent/purchases, rank by purchases
// formationSalesMap maps normalized ad name → formation sales count
// Overrides manuais por desafio — aplicados sobre as linhas do CSV antes da agregacao.
// `remove`: remove todas as linhas com esses nomes exatos (usado para "zerar" valores do CSV antes de injetar novos).
// `add`: injeta linhas sinteticas [day, name, spent, purchases] que entram na agregacao normal.
type AdsOverride = {
  remove?: string[];
  add?: { name: string; spent: number; purchases: number; day?: string }[];
};

const ADS_OVERRIDES: Partial<Record<'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5' | 'desafio6', AdsOverride>> = {
  desafio5: {
    // Zera os R$ 33 / 0 vendas do CSV para nao somar com o override
    remove: ['AD 2 ( Gabriel Editor ) VIDEO BEBE - Copy'],
    add: [
      { name: 'AD 2 ( Gabriel Editor ) VIDEO BEBE - Copy', spent: 6782.40, purchases: 120, day: '2026-04-01' },
    ],
  },
};

function applyAdsOverrides(desafio: 'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5' | 'desafio6', rows: string[][]): string[][] {
  const ov = ADS_OVERRIDES[desafio];
  if (!ov) return rows;
  const removeSet = new Set((ov.remove ?? []).map((n) => n.trim()));
  const filtered = removeSet.size > 0 ? rows.filter((r) => !removeSet.has((r[1] ?? '').trim())) : rows;
  const added: string[][] = (ov.add ?? []).map((a) => [a.day ?? '2026-04-01', a.name, String(a.spent), String(a.purchases)]);
  return added.length > 0 ? [...filtered, ...added] : filtered;
}

function extractAdsData(rows: string[][], formationSalesMap?: Map<string, number>): AdMetric[] {
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
      formationSales: matchFormationSales(name, formationSalesMap),
      dailyBreakdown: [...d.daily.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, v]) => ({ day, spent: v.spent, purchases: v.purchases })),
    }));
}

// Manual overrides for ads not captured in ANALISE-COMPRADORES section 6
// These are merged into the formation sales map and take precedence over extracted values
const MANUAL_FORMATION_SALES_RAW: Array<[string, number]> = [
  ['EDU REELS 4 AYAHUASCA', 3],
  ['[EDU] hook 3 cta 1', 1],
  ['AD 1 LOTE 6 COLOMBIA', 3],
  ['Sistema Nervoso Entérico - Versão pra ads [Editado Anderson]', 2],
];

// Normalize an ad name for matching: lowercase, strip emoji, suffixes, extra spaces
function normalizeAdName(name: string): string {
  return name
    .toLowerCase()
    // strip emoji and most non-text symbols
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}]/gu, '')
    // strip "|adId" suffix
    .split('|')[0]
    // strip "- copy", "- copia", "- cópia"
    .replace(/\s*-\s*c[oó]p[iy]a?\b.*$/i, '')
    // strip version markers like "v2", "v10"
    .replace(/\s*\bv\d+\b/gi, '')
    // normalize punctuation (hyphens, parens, brackets, underscores) to spaces
    .replace(/[\(\)\[\]\-_]+/g, ' ')
    // insert space between letters and digits when glued (ad4 -> ad 4, lote1 -> lote 1)
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/(\d)([a-zA-Z])/g, '$1 $2')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

// Match an ad name from the ADD/AT tab to formation sales from COMP-FORM
// 3-layer matching with aggregation: exact → prefix (>=8) → substring (>8)
function matchFormationSales(adName: string, salesMap?: Map<string, number>): number {
  if (!salesMap || salesMap.size === 0) return 0;
  const norm = normalizeAdName(adName);
  if (!norm) return 0;

  let total = 0;
  let matched = false;

  // Layer 1: exact normalized match — sum ALL
  for (const [key, count] of salesMap) {
    if (key === norm) {
      total += count;
      matched = true;
    }
  }
  if (matched) return total;

  // Layer 2: prefix match (min 8 chars) — sum ALL
  if (norm.length >= 8) {
    for (const [key, count] of salesMap) {
      if (key.length >= 8 && (key.startsWith(norm) || norm.startsWith(key))) {
        total += count;
        matched = true;
      }
    }
    if (matched) return total;
  }

  // Layer 3: substring (only if key length > 8) — sum ALL
  for (const [key, count] of salesMap) {
    if (key.length > 8 && norm.length > 8 && (key.includes(norm) || norm.includes(key))) {
      total += count;
      matched = true;
    }
  }

  if (!matched) {
    console.log(`[sheets][formation-miss] ad="${adName}" norm="${norm}"`);
  }

  return total;
}

// Extract formation sales per ad from ANALISE-COMPRADORES section 6 narrative.
// The AI-generated text contains lines like:
//   'edu-ayhuasca 2' — ~10 compradores
//   'AD 1 LOTE 1' e variações — presente em ~12 compradores
// We pull (adName, count) pairs by scanning quoted ad names followed by a
// "~N comprador(es)" mention within the same fragment (split by '. ' / ';').
function extractFormationSalesFromAnaliseCompradores(
  sections: AnaliseCompradorSection[],
): Map<string, number> {
  const map = new Map<string, number>();
  const section6 = sections.find((s) => /an[uú]ncios/i.test(s.title));
  if (!section6 || !section6.content) return map;

  // Split into clauses on sentence boundaries to keep ad name + count colocated
  const clauses = section6.content.split(/(?<=[.;])\s+/);

  // Quoted ad name: ' " ' or ' ' ' (also smart quotes)
  const QUOTED = /['"\u2018\u2019\u201C\u201D]([^'"\u2018\u2019\u201C\u201D]{2,80})['"\u2018\u2019\u201C\u201D]/g;
  const COUNT = /~?\s*(\d{1,4})\s*comprador/i;

  for (const clause of clauses) {
    const countMatch = COUNT.exec(clause);
    if (!countMatch) continue;
    const count = parseInt(countMatch[1], 10);
    if (!Number.isFinite(count) || count <= 0) continue;

    QUOTED.lastIndex = 0;
    const names: string[] = [];
    let m;
    while ((m = QUOTED.exec(clause)) !== null) {
      names.push(m[1]);
    }
    if (names.length === 0) continue;

    // If multiple ad names share one count clause (rare), give each the count.
    for (const raw of names) {
      const norm = normalizeAdName(raw);
      if (!norm) continue;
      // Don't overwrite a higher value already discovered
      const prev = map.get(norm) ?? 0;
      if (count > prev) map.set(norm, count);
    }
  }

  console.log(
    `[sheets][analise-compradores] extracted ${map.size} ad→buyer pairs: ` +
      [...map.entries()].slice(0, 8).map(([k, v]) => `"${k}"(${v})`).join(', '),
  );

  // Merge manual overrides (take precedence over extracted values)
  for (const [rawName, count] of MANUAL_FORMATION_SALES_RAW) {
    const norm = normalizeAdName(rawName);
    if (!norm) continue;
    map.set(norm, count);
  }
  console.log(
    `[sheets][analise-compradores] after manual merge: ${map.size} pairs (+${MANUAL_FORMATION_SALES_RAW.length} manual)`,
  );

  return map;
}

// Fetch formation sales data from COMP-FORM tab (LEGACY fallback)
// Returns maps for each desafio: normalized ad name → sales count
async function fetchFormationSalesData(): Promise<{ d3: Map<string, number>; all: Map<string, number> }> {
  const d3Map = new Map<string, number>();
  const allMap = new Map<string, number>();

  try {
    const rows = await fetchSheetRows("'COMP-FORM'!A2:U200");
    for (const row of rows) {
      const pagante = (row[9] ?? '').toUpperCase().trim();
      const anuncioRaw = (row[15] ?? '').trim();
      if (pagante !== 'SIM' || !anuncioRaw) continue;

      // Normalize using the same function as the matcher
      const adName = normalizeAdName(anuncioRaw);
      if (!adName || adName === '{{ad.name}}') continue;

      const d3 = (row[20] ?? '').toUpperCase().trim();

      // All desafios combined (for topAds which uses all ADD data)
      allMap.set(adName, (allMap.get(adName) ?? 0) + 1);

      // Desafio 3 specific
      if (d3 === 'SIM') {
        d3Map.set(adName, (d3Map.get(adName) ?? 0) + 1);
      }
    }
    console.log(`[sheets] Formation sales: ${allMap.size} ads total, ${d3Map.size} ads in D3`);
    const sampleAll = [...allMap.entries()].slice(0, 5).map(([k, v]) => `"${k}"(${v})`).join(', ');
    console.log(`[sheets][formation-sample] all keys: ${sampleAll}`);
    const sampleD3 = [...d3Map.entries()].slice(0, 5).map(([k, v]) => `"${k}"(${v})`).join(', ');
    console.log(`[sheets][formation-sample] d3 keys: ${sampleD3}`);
  } catch (err) {
    console.warn('[sheets] COMP-FORM fetch failed (non-blocking):', err instanceof Error ? err.message : err);
  }

  return { d3: d3Map, all: allMap };
}

// Extract daily metrics for Desafio 6 from GW6:GZ16
// Range columns (0-based from GW): 0=DATA, 1=MODIFICACOES, 2=INVESTIMENTO GERAL, 3=INVESTIMENTO CAPTACAO
// Demais campos (vendas, CPA, etc.) ainda nao existem na planilha — preenchidos com 0.
function extractDesafio6Daily(rows: string[][]): DailyMetric[] {
  const p = parseSheetNumber;
  const daily: DailyMetric[] = [];

  for (const row of rows) {
    const dateVal = (row?.[0] ?? '').trim();
    if (!dateVal || !/\d{2}\/\d{2}\/\d{4}/.test(dateVal)) continue;

    daily.push({
      data: dateVal,
      investimento: p(row[2]),
      vendas: 0,
      cpa: 0,
      ticketMedio: 0,
      faturamento: 0,
      lucroPrejuizo: 0,
      cortesia: 0,
      ingressosTotais: 0,
      qualificados: 0,
      desqualificados: 0,
    });
  }

  return daily;
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
      ingressosTotais: 0,
      qualificados: 0,
      desqualificados: 0,
    });
  }

  return daily;
}

// Extract Pop-up Qualificador data from ABR - METRICAS GERAIS (AW5:BM19)
// Row 0-1 = headers, row 2 = empty, data starts row 3 (= 30/03/2026)
// Cols 0-7 = QUALIFICADOR, col 8 = investimento total, cols 9-16 = DESQUALIFICADO
// Extract a PopupQualificadorSide from a row (AX:BN range = 17 cols)
// Qualificador: cols 0-7, Investimento Total: col 8, Desqualificador: cols 9-16
function extractPopupSide(row: string[], startCol: number): PopupQualificadorSide {
  const p = parseSheetNumber;
  return {
    investimento: p(row[startCol]),
    checkouts: p(row[startCol + 1]),
    conversaoCheckout: p(row[startCol + 2]),
    proporcao: p(row[startCol + 3]),
    vendas: p(row[startCol + 4]),
    cpaReal: p(row[startCol + 5]),
    faturamento: p(row[startCol + 6]),
    ticketMedio: p(row[startCol + 7]),
  };
}

// Dates from column B (rows 8+), data from AX:BN (rows 8+)
function extractPopupQualificador(dataRows: string[][], dateRows: string[][]): PopupQualificadorDay[] {
  const p = parseSheetNumber;
  const days: PopupQualificadorDay[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.length === 0) continue;

    // Skip rows where all values are zero/empty
    const hasData = row.some((val) => p(val) !== 0);
    if (!hasData) continue;

    const dateStr = (dateRows[i]?.[0] ?? '').trim();
    if (!dateStr) continue;

    days.push({
      data: dateStr,
      qualificador: extractPopupSide(row, 0),
      desqualificado: extractPopupSide(row, 9),
      investimentoTotal: p(row[8]),
    });
  }

  return days;
}

// Extract consolidated result from row 29 (same column structure as daily rows)
function extractPopupConsolidado(row: string[]): {
  qualificador: PopupQualificadorSide;
  desqualificado: PopupQualificadorSide;
  investimentoTotal: number;
} | null {
  if (!row || row.length === 0) return null;
  const p = parseSheetNumber;
  const hasData = row.some((val) => p(val) !== 0);
  if (!hasData) return null;

  return {
    qualificador: extractPopupSide(row, 0),
    desqualificado: extractPopupSide(row, 9),
    investimentoTotal: p(row[8]),
  };
}

// Parse ANALISE-COMPRADORES tab: sections with header row + content row, separated by blank rows
function parseAnaliseCompradores(rows: string[][]): AnaliseCompradorSection[] {
  const sections: AnaliseCompradorSection[] = [];
  let i = 0;

  while (i < rows.length) {
    const cell = (rows[i]?.[0] ?? '').trim();

    // Skip empty rows, the main title row, and the date row
    if (!cell || i <= 2) {
      i++;
      continue;
    }

    // Check if this looks like a section header (starts with a number followed by period)
    if (/^\d+\.\s+/.test(cell)) {
      const title = cell;
      // Content is on the next non-empty row
      let content = '';
      for (let j = i + 1; j < rows.length; j++) {
        const nextCell = (rows[j]?.[0] ?? '').trim();
        if (nextCell && !/^\d+\.\s+/.test(nextCell)) {
          content = nextCell;
          i = j + 1;
          break;
        }
        if (/^\d+\.\s+/.test(nextCell)) {
          i = j;
          break;
        }
        i = j + 1;
      }
      sections.push({ title, content });
    } else {
      i++;
    }
  }

  return sections;
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
    desafio5: getDefaultDesafio(),
    desafio5Daily: [],
    desafio6: getDefaultDesafio(),
    desafio6Daily: [],
    popupQualificador: [],
    popupConsolidado: null,
    topAds: [],
    topAdsDesafio4: [],
    topAdsPorDesafio: {
      desafio1: [], desafio2: [], desafio3: [], desafio4: [], desafio5: [], desafio6: [],
    },
    visaoEstrategica: [],
    resumoTecnico: { metrics: [], analysis: [] },
    analiseCompradores: [],
    analiseAplicacoes: [],
    analiseCruzada: [],
    organicoFontes: {
      soma: { data: 'SOMA', edson: 0, ellid: 0, geovana: 0, stories: 0, directAutomacao: 0, feed: 0, bio: 0, pulmonautas: 0, youtube: 0, extra: 0 },
      rows: [],
    },
    lastUpdated: new Date().toISOString(),
    fromCache: false,
  };
}

// Column mappings for RESUMO - GERAL (C1:AJ77 → indices 0-33)
// DESAFIO 1: label=0 (C), value=1 (D)
// DESAFIO 2: label=6 (I), value=7 (J)
// DESAFIO 3: label=12 (O), value=13 (P)
// DESAFIO 4: label=18 (U), value=19 (V)
// DESAFIO 5: label=24 (AA), value=25 (AB)
// DESAFIO 6: label=30 (AG), value=31 (AH)
const DESAFIO_COLS = [
  { key: 'desafio1' as const, labelCol: 0, valueCol: 1 },
  { key: 'desafio2' as const, labelCol: 6, valueCol: 7 },
  { key: 'desafio3' as const, labelCol: 12, valueCol: 13 },
  { key: 'desafio4' as const, labelCol: 18, valueCol: 19 },
  { key: 'desafio5' as const, labelCol: 24, valueCol: 25 },
  { key: 'desafio6' as const, labelCol: 30, valueCol: 31 },
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
    const resumoRows = await fetchSheetRows('RESUMO - GERAL!C1:AJ77');

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

    // Desafio 5 daily fetch is independent
    let desafio5Rows: string[][] = [];
    try {
      desafio5Rows = await fetchSheetRows("'ABR - METRICAS GERAIS'!DS5:EC13");
      console.log(`[sheets] Desafio 5 daily: ${desafio5Rows.length} rows loaded`);
    } catch (err) {
      console.warn('[sheets] Desafio 5 daily fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Desafio 6 daily fetch (planilha so traz DATA/INVESTIMENTO ate ao vivo iniciar)
    // Range cobre DATA + INVESTIMENTOS em GW6:GZ16 do tab 'ABR - METRICAS GERAIS'.
    // extractDesafio6Daily faz parse minimal — outras metricas voltam 0 ate serem populadas.
    let desafio6Rows: string[][] = [];
    try {
      desafio6Rows = await fetchSheetRows("'ABR - METRICAS GERAIS'!GW6:GZ16");
      console.log(`[sheets] Desafio 6 daily: ${desafio6Rows.length} rows loaded`);
    } catch (err) {
      console.warn('[sheets] Desafio 6 daily fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Resumo Organico (Comercial e Midias) — 'ABR - METRICAS GERAIS'!KV3:LF30
    let organicoRows: string[][] = [];
    try {
      organicoRows = await fetchSheetRows("'ABR - METRICAS GERAIS'!KV3:LF30");
      console.log(`[sheets] Organico fontes: ${organicoRows.length} rows loaded`);
    } catch (err) {
      console.warn('[sheets] Organico fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Pop-up Qualificador fetch: dates from col B, data from AX:BN, consolidated from row 29
    let popupDataRows: string[][] = [];
    let popupDateRows: string[][] = [];
    let popupConsolidadoRow: string[] = [];
    try {
      [popupDataRows, popupDateRows, popupConsolidadoRow] = await Promise.all([
        fetchSheetRows("'ABR - METRICAS GERAIS'!AX8:BN28"),
        fetchSheetRows("'ABR - METRICAS GERAIS'!B8:B28"),
        fetchSheetRows("'ABR - METRICAS GERAIS'!AX29:BN29").then(rows => rows[0] ?? []),
      ]);
      console.log(`[sheets] Popup Qualificador: ${popupDataRows.length} data rows, ${popupDateRows.length} date rows loaded`);
    } catch (err) {
      console.warn('[sheets] Popup Qualificador fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Ads fetch is independent - don't let it break the main data
    let adsRows: string[][] = [];
    try {
      if (ADS_SPREADSHEET_ID) {
        adsRows = await fetchSheetRows('ADD!A2:D10000', ADS_SPREADSHEET_ID);
        console.log(`[sheets] Ads: ${adsRows.length} rows loaded`);
      }
    } catch (err) {
      console.warn('[sheets] Ads fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // AT tab rows (fonte de anuncios por desafio — filtrados por data)
    let allAtRows: string[][] = [];
    try {
      if (ADS_SPREADSHEET_ID) {
        allAtRows = await fetchSheetRows('AT!A2:D20000', ADS_SPREADSHEET_ID);
        console.log(`[sheets] Ads (AT tab): ${allAtRows.length} rows loaded`);
      }
    } catch (err) {
      console.warn('[sheets] Ads AT fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // Ranges de data por desafio (captacao -> ao vivo)
    const ADS_DATE_RANGES: Record<'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5' | 'desafio6', { start: string; end: string }> = {
      desafio1: { start: '2026-01-24', end: '2026-02-06' },
      desafio2: { start: '2026-02-16', end: '2026-02-27' },
      desafio3: { start: '2026-03-02', end: '2026-03-13' },
      desafio4: { start: '2026-03-16', end: '2026-03-27' },
      desafio5: { start: '2026-03-30', end: '2026-04-10' },
      desafio6: { start: '2026-04-27', end: '2026-05-08' },
    };
    const filterByRange = (start: string, end: string) =>
      allAtRows.filter((r) => {
        const d = r[0] ?? '';
        return d >= start && d <= end;
      });
    const adsD4Rows = filterByRange(ADS_DATE_RANGES.desafio4.start, ADS_DATE_RANGES.desafio4.end);

    // Extract geral data from RESUMO - GERAL (label=col0/C, value=col1/D)
    const geralData = extractDesafioData(resumoRows, 0, 1);
    console.log(`[sheets] geral: inv=${geralData.investimento} vendas=${geralData.vendas} fat=${geralData.faturamentoTotal}`);

    const desafio3Daily = extractDailyMetrics(dailyRows);
    console.log(`[sheets] desafio3Daily: ${desafio3Daily.length} days loaded`);

    const desafio4Daily = extractDesafio4Daily(desafio4Rows);
    console.log(`[sheets] desafio4Daily: ${desafio4Daily.length} days loaded`);

    const desafio5Daily = extractDailyMetrics(desafio5Rows);
    console.log(`[sheets] desafio5Daily: ${desafio5Daily.length} days loaded`);

    const desafio6Daily = extractDesafio6Daily(desafio6Rows);
    console.log(`[sheets] desafio6Daily: ${desafio6Daily.length} days loaded`);

    const organicoFontes = extractOrganicoFontes(organicoRows);
    console.log(`[sheets] organicoFontes: ${organicoFontes.rows.length} days loaded`);

    const popupQualificador = extractPopupQualificador(popupDataRows, popupDateRows);
    console.log(`[sheets] popupQualificador: ${popupQualificador.length} days loaded`);

    const popupConsolidado = extractPopupConsolidado(popupConsolidadoRow);
    console.log(`[sheets] popupConsolidado: ${popupConsolidado ? 'loaded' : 'no data'}`);

    // NEW STRATEGY: Fetch ANALISE-COMPRADORES early and derive formation sales
    // map from section 6 narrative (source of truth per Sr. Matheus).
    let analiseCompradoresSections: AnaliseCompradorSection[] = [];
    try {
      const acRows = await fetchSheetRows('ANALISE-COMPRADORES!A1:A50');
      analiseCompradoresSections = parseAnaliseCompradores(acRows);
      console.log(`[sheets] Analise Compradores: ${analiseCompradoresSections.length} sections loaded`);
    } catch (err) {
      console.warn('[sheets] Analise Compradores fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    const formationSalesMap = extractFormationSalesFromAnaliseCompradores(analiseCompradoresSections);

    // Fallback to legacy COMP-FORM matcher only if AC produced nothing
    let legacyFormation = { d3: new Map<string, number>(), all: new Map<string, number>() };
    if (formationSalesMap.size === 0) {
      try {
        legacyFormation = await fetchFormationSalesData();
        console.log('[sheets] Falling back to COMP-FORM (ANALISE-COMPRADORES section 6 yielded 0 pairs)');
      } catch (err) {
        console.warn('[sheets] Formation sales fallback failed (non-blocking):', err instanceof Error ? err.message : err);
      }
    }

    const adsMapAll = formationSalesMap.size > 0 ? formationSalesMap : legacyFormation.all;
    const adsMapD3 = formationSalesMap.size > 0 ? formationSalesMap : legacyFormation.d3;

    const topAds = extractAdsData(adsRows, adsMapD3);
    console.log(`[sheets] topAds: ${topAds.length} ads ranked`);

    const topAdsDesafio4 = extractAdsData(adsD4Rows, adsMapAll);
    console.log(`[sheets] topAdsDesafio4: ${topAdsDesafio4.length} ads ranked`);

    // Anuncios por desafio — fonte: CSVs do Meta Ads via `npm run ingest-ads`
    // (substitui o filtro por data na tab AT do Google Sheets)
    const csvRows = adsDesafiosCsv as Partial<Record<'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5' | 'desafio6', string[][]>>;
    const topAdsPorDesafio = {
      desafio1: extractAdsData(applyAdsOverrides('desafio1', csvRows.desafio1 ?? []), adsMapAll),
      desafio2: extractAdsData(applyAdsOverrides('desafio2', csvRows.desafio2 ?? []), adsMapAll),
      desafio3: extractAdsData(applyAdsOverrides('desafio3', csvRows.desafio3 ?? []), adsMapD3),
      desafio4: extractAdsData(applyAdsOverrides('desafio4', csvRows.desafio4 ?? []), adsMapAll),
      // D5: sem formationSalesMap -> todos os ads retornam formationSales=0
      desafio5: extractAdsData(applyAdsOverrides('desafio5', csvRows.desafio5 ?? [])),
      // D6: ainda sem CSV ingerido — array vazio ate `npm run ingest-ads` rodar com dados de D6
      desafio6: extractAdsData(applyAdsOverrides('desafio6', csvRows.desafio6 ?? [])),
    };
    console.log(`[sheets] topAdsPorDesafio (CSV source): D1=${topAdsPorDesafio.desafio1.length} D2=${topAdsPorDesafio.desafio2.length} D3=${topAdsPorDesafio.desafio3.length} D4=${topAdsPorDesafio.desafio4.length} D5=${topAdsPorDesafio.desafio5.length} D6=${topAdsPorDesafio.desafio6.length}`);

    const data: AllDesafiosData = {
      geral: geralData,
      desafio1: getDefaultDesafio(),
      desafio2: getDefaultDesafio(),
      desafio3: getDefaultDesafio(),
      desafio3Daily,
      desafio4: getDefaultDesafio(),
      desafio4Daily,
      desafio5: getDefaultDesafio(),
      desafio5Daily,
      desafio6: getDefaultDesafio(),
      desafio6Daily,
      popupQualificador,
      popupConsolidado,
      topAds,
      topAdsDesafio4,
      topAdsPorDesafio,
      visaoEstrategica: [],
      resumoTecnico: { metrics: [], analysis: [] },
      analiseCompradores: [],
      analiseAplicacoes: [],
      analiseCruzada: [],
      organicoFontes,
      lastUpdated: new Date().toISOString(),
      fromCache: false,
    };

    // All desafio data from RESUMO - GERAL (same column structure)
    for (const col of DESAFIO_COLS) {
      const desafioData = extractDesafioData(resumoRows, col.labelCol, col.valueCol);
      data[col.key] = desafioData;
      console.log(`[sheets] ${col.key}: inv=${desafioData.investimento} vendas=${desafioData.vendas} fat=${desafioData.faturamentoTotal}`);
    }

    // Cancelamentos & No-show from RESUMO - GERAL B35:AJ46
    // Layout atual na planilha (sheet rows / indices relativos a B35=0):
    //   D1-D4: sheet row 43 = idx 8 (cancel value), sheet row 45 = idx 10 (no-show value)
    //   D5 esta shifted 1 row: sheet row 44 = idx 9 (cancel), sheet row 46 = idx 11 (no-show)
    //   D6: ainda sem dados de cancelamento (desafio em captacao) — fallback 0
    try {
      const cancelRows = await fetchSheetRows('RESUMO - GERAL!B35:AJ46');
      const cancelCols: { key: 'desafio1' | 'desafio2' | 'desafio3' | 'desafio4' | 'desafio5' | 'desafio6'; col: number; cancelRow: number; noShowRow: number }[] = [
        { key: 'desafio1', col: 0, cancelRow: 8, noShowRow: 10 },   // B
        { key: 'desafio2', col: 6, cancelRow: 8, noShowRow: 10 },   // H
        { key: 'desafio3', col: 12, cancelRow: 8, noShowRow: 10 },  // N
        { key: 'desafio4', col: 18, cancelRow: 8, noShowRow: 10 },  // T
        { key: 'desafio5', col: 24, cancelRow: 9, noShowRow: 11 },  // Z (shifted 1 row down)
        { key: 'desafio6', col: 30, cancelRow: 9, noShowRow: 11 },  // AF (mesmo shift do D5)
      ];
      for (const cc of cancelCols) {
        data[cc.key].cancelamentos = parseSheetNumber(cancelRows[cc.cancelRow]?.[cc.col] ?? '');
        data[cc.key].noShow = parseSheetNumber(cancelRows[cc.noShowRow]?.[cc.col] ?? '');
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

    // RESUMO-TECNICO: metrics (rows 1-65) + analysis (rows 72+)
    try {
      // Range expandido ate coluna W para capturar comparecimentos do D4 (col O=14), D5 (col S=18) e D6 (col W=22)
      const rtRows = await fetchSheetRows('RESUMO-TECNICO!A1:W112');
      const metrics: ResumoTecnicoMetric[] = [];
      const maxMetricRow = Math.min(65, rtRows.length);
      for (let i = 0; i < maxMetricRow; i++) {
        const row = rtRows[i];
        const label = (row?.[0] ?? '').trim();
        if (!label) continue;
        metrics.push({
          label,
          desafio1: (row?.[1] ?? '').trim(),
          desafio2: (row?.[5] ?? '').trim(),
          comparacaoIA: (row?.[7] ?? '').trim(),
          desafio3: (row?.[10] ?? '').trim(),
        });
      }
      const analysis: string[] = [];
      for (let i = 71; i < rtRows.length; i++) {
        const line = (rtRows[i]?.[0] ?? '').trim();
        if (line.length > 0) analysis.push(line);
      }
      data.resumoTecnico = { metrics, analysis };
      console.log(`[sheets] Resumo Tecnico: ${metrics.length} metrics, ${analysis.length} analysis lines`);

      // Extract comparecimentos por sessao para cada desafio.
      // Colunas de VALOR: D1=B(1), D2=F(5), D3=K(10), D4=O(14), D5=S(18), D6=W(22). 5 sessoes no total.
      // D6 ainda sem dados (planilha so vai ate col T) — parseSheetNumber retorna 0 em ausencia.
      const comparecimentoCols: { key: DesafioKey; col: number }[] = [
        { key: 'desafio1', col: 1 },
        { key: 'desafio2', col: 5 },
        { key: 'desafio3', col: 10 },
        { key: 'desafio4', col: 14 },
        { key: 'desafio5', col: 18 },
        { key: 'desafio6', col: 22 },
      ];
      let sessionIdx = 0;
      for (const row of rtRows) {
        const label = (row?.[0] ?? '').trim();
        // Captura apenas as linhas "Participou sessão NN ..." (total ZOOM + SITE).
        if (!/^Participou\s+sess[aã]o\s+\d+/i.test(label)) continue;
        if (sessionIdx >= 5) break;
        for (const cc of comparecimentoCols) {
          const raw = (row?.[cc.col] ?? '').trim();
          const val = parseSheetNumber(raw);
          data[cc.key].comparecimentos[sessionIdx] = val;
        }
        sessionIdx++;
      }
      console.log(`[sheets] Comparecimentos: ${sessionIdx} sessoes carregadas para 5 desafios`);
    } catch (err) {
      console.warn('[sheets] Resumo Tecnico fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // ANALISE-COMPRADORES already fetched above for formation sales matching
    data.analiseCompradores = analiseCompradoresSections;

    // ANALISE-APLICACOES: application analysis (10 sections)
    try {
      const aaRows = await fetchSheetRows('ANALISE-APLICACOES!A1:A50');
      data.analiseAplicacoes = parseAnaliseCompradores(aaRows);
      console.log(`[sheets] Analise Aplicacoes: ${data.analiseAplicacoes.length} sections loaded`);
    } catch (err) {
      console.warn('[sheets] Analise Aplicacoes fetch failed (non-blocking):', err instanceof Error ? err.message : err);
    }

    // ANALISE-CRUZADA: cross-analysis buyers x applications (10 sections)
    try {
      const acxRows = await fetchSheetRows('ANALISE-CRUZADA!A1:A50');
      data.analiseCruzada = parseAnaliseCompradores(acxRows);
      console.log(`[sheets] Analise Cruzada: ${data.analiseCruzada.length} sections loaded`);
    } catch (err) {
      console.warn('[sheets] Analise Cruzada fetch failed (non-blocking):', err instanceof Error ? err.message : err);
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

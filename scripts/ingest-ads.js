#!/usr/bin/env node
/*
 * Ingest Meta Ads CSVs from D:\DESAFIO 1..5 into src/data/ads-desafios.json.
 *
 * Output shape matches the legacy Google Sheets AT tab rows:
 *   { desafio1: [[date, name, spent, purchases], ...], desafio2: ..., ... }
 *
 * Only counts "Resultados" as purchases when "Indicador de resultados" contains
 * "purchase" (filters out non-purchase-objective ads like engagement/awareness).
 */

const fs = require('fs');
const path = require('path');

const DESAFIOS_ROOT = 'D:/';
const OUT_PATH = path.join(__dirname, '..', 'src', 'data', 'ads-desafios.json');

// Column indexes in the CSV (0-based)
const COL = {
  day: 0,        // "Início dos relatórios"
  name: 2,       // "Nome do anúncio"
  spent: 11,     // "Valor usado (BRL)"
  resultados: 12,
  indicator: 13, // "Indicador de resultados"
};

function parseCsv(content) {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const c = content[i];
    if (inQuotes) {
      if (c === '"') {
        if (content[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); field = ''; row = []; }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function findCsv(folder) {
  const files = fs.readdirSync(folder).filter((f) => f.toLowerCase().endsWith('.csv'));
  if (files.length === 0) throw new Error(`Nenhum CSV em ${folder}`);
  return path.join(folder, files[0]);
}

function toNumber(s) {
  if (s == null) return 0;
  const t = String(s).trim();
  if (!t) return 0;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : 0;
}

const result = {};
const summary = [];

for (const n of [1, 2, 3, 4, 5]) {
  const folder = path.join(DESAFIOS_ROOT, `DESAFIO ${n}`);
  const csvPath = findCsv(folder);
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCsv(content);

  // Drop header + empty trailing rows
  const data = rows.slice(1).filter((r) => r.length >= 14 && (r[COL.name] || '').trim());

  const out = [];
  let rawPurchaseRows = 0;
  let zeroPurchaseRows = 0;

  for (const r of data) {
    const day = (r[COL.day] || '').trim();
    const name = (r[COL.name] || '').trim();
    const spentStr = (r[COL.spent] || '').trim();
    const indicator = (r[COL.indicator] || '').toLowerCase();
    const isPurchase = indicator.includes('purchase');
    const purchases = isPurchase ? toNumber(r[COL.resultados]) : 0;

    if (!day || !name) continue;
    // Keep rows even with 0 purchases (spend still counts)
    if (isPurchase && purchases > 0) rawPurchaseRows++;
    else zeroPurchaseRows++;

    out.push([day, name, spentStr, String(purchases)]);
  }

  result[`desafio${n}`] = out;
  summary.push({ desafio: n, rows: out.length, withPurchase: rawPurchaseRows, zeroPurchase: zeroPurchaseRows, csv: path.basename(csvPath) });
}

const outDir = path.dirname(OUT_PATH);
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(result, null, 2));

console.log('=== Ingest Ads — Summary ===');
for (const s of summary) {
  console.log(`D${s.desafio}: ${s.rows} rows (${s.withPurchase} with purchases, ${s.zeroPurchase} zero) — ${s.csv}`);
}
console.log(`\nSaved: ${OUT_PATH}`);

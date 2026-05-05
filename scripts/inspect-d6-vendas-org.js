#!/usr/bin/env node
/* Inspect IM5:IM29 for VENDAS ORG (D6). Quick recon. */
const fs = require('fs');
const path = require('path');
const envText = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#')).map((l) => {
    const [k, ...rest] = l.split('=');
    return [k.trim(), rest.join('=').trim().replace(/^"|"$/g, '')];
  }),
);
const SPREADSHEET_ID = env.GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = env.GOOGLE_API_KEY;
const RANGE = "'ABR - METRICAS GERAIS'!IL5:IO29";
(async () => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url);
  const json = await res.json();
  const rows = json.values || [];
  console.log(`Range ${RANGE} -> ${rows.length} rows\n`);
  console.log('Sheet row | IL             | IM             | IN             | IO');
  console.log('-'.repeat(80));
  rows.forEach((row, i) => {
    const sheetRow = 5 + i;
    const cells = [0, 1, 2, 3].map((j) => (row[j] ?? '').toString().padEnd(14));
    const marker = sheetRow === 26 ? '  <== row 26' : sheetRow === 29 ? '  <== row 29' : '';
    console.log(`${String(sheetRow).padStart(8)}  | ${cells.join(' | ')}${marker}`);
  });
})().catch((e) => { console.error(e); process.exit(1); });

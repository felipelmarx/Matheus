#!/usr/bin/env node
/*
 * Inspection script for D6 Organico range (KH5:KN29 in 'ABR - METRICAS GERAIS').
 *
 * Goal: confirm what each column (KH/KI/KJ/KK/KL/KM/KN) holds, especially row 26
 * (the aggregate row used by the cards). Run BEFORE implementation:
 *
 *   node scripts/inspect-d6-organico.js
 *
 * Reads GOOGLE_API_KEY + GOOGLE_SHEETS_SPREADSHEET_ID from .env.local (no dotenv dep).
 */
const fs = require('fs');
const path = require('path');

// Minimal .env.local parser (no external dep)
const envPath = path.join(__dirname, '..', '.env.local');
const envText = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith('#')).map((l) => {
    const [k, ...rest] = l.split('=');
    return [k.trim(), rest.join('=').trim().replace(/^"|"$/g, '')];
  }),
);

const SPREADSHEET_ID = env.GOOGLE_SHEETS_SPREADSHEET_ID;
const API_KEY = env.GOOGLE_API_KEY;
const RANGE = "'ABR - METRICAS GERAIS'!KH5:KN29";
const COLS = ['KH', 'KI', 'KJ', 'KK', 'KL', 'KM', 'KN'];

(async () => {
  if (!SPREADSHEET_ID || !API_KEY) {
    console.error('Missing GOOGLE_SHEETS_SPREADSHEET_ID or GOOGLE_API_KEY in .env.local');
    process.exit(1);
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}&valueRenderOption=FORMATTED_VALUE`;
  const res = await fetch(url);
  if (!res.ok) { console.error(`Sheets API ${res.status}: ${await res.text()}`); process.exit(1); }
  const json = await res.json();
  const rows = json.values || [];
  console.log(`Range ${RANGE} -> ${rows.length} rows fetched.\n`);
  console.log('Sheet row | ' + COLS.map((c) => c.padEnd(14)).join(' | '));
  console.log('-'.repeat(10 + 7 * 17));
  rows.forEach((row, i) => {
    const sheetRow = 5 + i;
    const cells = COLS.map((_, j) => (row[j] ?? '').toString().padEnd(14));
    const marker = sheetRow === 26 ? '  <== ROW 26 (aggregate used by cards)' : '';
    console.log(`${String(sheetRow).padStart(8)}  | ${cells.join(' | ')}${marker}`);
  });
})().catch((e) => { console.error(e); process.exit(1); });

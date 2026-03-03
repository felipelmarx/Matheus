export function parseSheetNumber(raw: string | undefined | null): number {
  if (!raw || raw.trim() === '' || raw.trim() === '-') return 0;

  let cleaned = raw.trim();

  // Handle negative indicators: leading minus or parenthetical
  const isNegative = cleaned.startsWith('-') || cleaned.startsWith('(');
  cleaned = cleaned.replace(/^[-(]+|[)]+$/g, '').trim();

  // Remove R$ prefix and whitespace
  cleaned = cleaned.replace(/R\$\s*/g, '').replace(/\s/g, '');

  if (cleaned.endsWith('%')) cleaned = cleaned.slice(0, -1);

  if (cleaned.includes(',')) {
    // Brazilian format with comma as decimal: 33.858,28 → 33858.28
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    // Brazilian thousands-only format: 1.346 → 1346
    cleaned = cleaned.replace(/\./g, '');
  }

  const value = parseFloat(cleaned);
  if (!isFinite(value)) return 0;
  return isNegative ? -value : value;
}

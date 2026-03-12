/**
 * Parse BR currency format to number.
 * Handles: R$ 1.000,50 | -R$ 631 | (1.000) | 0 | empty
 */
export function parseSheetNumber(raw: string | undefined | null): number {
  if (!raw || raw.trim() === '') return 0;

  let str = raw.trim();

  // Check for negative in parentheses: (1.000)
  const isParenNeg = str.startsWith('(') && str.endsWith(')');
  if (isParenNeg) {
    str = str.slice(1, -1);
  }

  // Check for leading negative sign
  const isNeg = str.startsWith('-') || isParenNeg;
  str = str.replace(/^-/, '');

  // Remove currency symbol and spaces
  str = str.replace(/R\$\s*/g, '').trim();

  // Remove percentage
  str = str.replace(/%/g, '');

  // BR format: 1.000,50 → 1000.50
  // Remove thousand separators (dots), replace decimal comma with dot
  str = str.replace(/\./g, '').replace(',', '.');

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  return isNeg ? -num : num;
}

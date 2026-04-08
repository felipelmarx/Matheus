/**
 * Formatters for the iBreathwork dashboard.
 * All numbers use pt-BR conventions.
 */

export function formatBRL(n: number): string {
  if (!Number.isFinite(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatInt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Math.round(n).toLocaleString("pt-BR");
}

export function formatROAS(n: number): string {
  if (!Number.isFinite(n)) return "0.00x";
  return `${n.toFixed(2)}x`;
}

export function formatPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "0%";
  return `${n.toFixed(digits)}%`;
}

export function formatDateBR(iso: string): string {
  // Accepts "YYYY-MM-DD" or similar and returns "DD/MM"
  if (!iso) return "";
  const parts = iso.split(/[-/]/);
  if (parts.length >= 3) {
    // Detect order
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[2].slice(0, 2)}/${parts[1]}`;
    }
    // DD/MM/YYYY
    return `${parts[0]}/${parts[1]}`;
  }
  return iso;
}

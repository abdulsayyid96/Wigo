/**
 * Currency utility functions for Indonesian Rupiah (IDR / Rp)
 */

/**
 * Parses any string or number into a raw integer value in Rupiah.
 * E.g. "Rp 2.450.000" -> 2450000
 * E.g. "2450000" -> 2450000
 */
export function parseIdrNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return Math.max(0, Math.floor(value));
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) return 0;
  const parsed = parseInt(digitsOnly, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats a number or string into standard Indonesian Rupiah display format.
 * E.g. 2450000 -> "Rp 2.450.000"
 * E.g. 0 -> "Rp 0"
 */
export function formatIdr(value: number | string | undefined | null): string {
  const num = parseIdrNumber(value);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

/**
 * Formats live input while typing. If empty, returns empty string so user can delete all.
 * E.g. "" -> ""
 * E.g. "25000" -> "Rp 25.000"
 */
export function formatIdrInput(rawText: string): string {
  const digitsOnly = rawText.replace(/\D/g, '');
  if (!digitsOnly) return '';
  const num = parseInt(digitsOnly, 10);
  if (isNaN(num)) return '';
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Rp ${formatted}`;
}

/**
 * Calculates unit cost from total purchase cost and quantity.
 * Returns formatted IDR string or empty string if total cost is zero.
 */
export function calculateUnitCost(totalCostInput: string | number, quantity: number): string {
  const total = parseIdrNumber(totalCostInput);
  if (total <= 0) return '';
  const qty = Math.max(1, quantity || 1);
  const unit = Math.round(total / qty);
  return formatIdr(unit);
}

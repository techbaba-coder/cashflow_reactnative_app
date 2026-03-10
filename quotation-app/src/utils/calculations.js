/**
 * Calculate amount for a single line item.
 * amount = area × rate
 */
export function calcAmount(area, rate) {
  const a = parseFloat(area) || 0;
  const r = parseFloat(rate) || 0;
  return parseFloat((a * r).toFixed(2));
}

/**
 * Calculate grand total from an array of items.
 */
export function calcTotal(items) {
  return parseFloat(
    items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toFixed(2)
  );
}

/**
 * Format a number as Indian currency string.
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a date string nicely.
 */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

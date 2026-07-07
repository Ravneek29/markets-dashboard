/** Format a price with fixed 2-decimal precision and thousands separators. */
export function formatPrice(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a signed percentage, e.g. +1.24% / -0.80%. */
export function formatPercent(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** Format a signed absolute change, e.g. +2.30 / -1.15. */
export function formatChange(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}`;
}

/** Direction of a change, used for colour and a11y labels. */
export function direction(value: number): "up" | "down" | "flat" {
  if (value > 0) return "up";
  if (value < 0) return "down";
  return "flat";
}

/** Format an epoch-ms timestamp as HH:MM:SS. */
export function formatClock(t: number): string {
  return new Date(t).toLocaleTimeString("en-US", { hour12: false });
}

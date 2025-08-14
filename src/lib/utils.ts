import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Robust USD price formatter that preserves very small decimals (e.g., BONK)
export function formatUsd(value?: number | null): string {
  if (value === null || value === undefined || !isFinite(value as number)) return "$—";
  const abs = Math.abs(value);

  // Large values: nice currency formatting
  if (abs >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }

  // Mid-range values
  if (abs >= 1) return `$${value.toFixed(2)}`;
  if (abs >= 0.1) return `$${value.toFixed(3)}`;
  if (abs >= 0.01) return `$${value.toFixed(4)}`;
  if (abs >= 0.001) return `$${value.toFixed(6)}`;
  if (abs >= 0.000001) return `$${value.toFixed(8)}`;
  if (abs >= 0.00000001) return `$${value.toFixed(10)}`;

  return '<$0.00000001';
}

export function formatPercent(value?: number | null, digits = 2): string {
  if (value === null || value === undefined || !isFinite(value as number)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

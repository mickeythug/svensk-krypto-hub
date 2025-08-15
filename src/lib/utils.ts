import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Enhanced USD price formatter with proper comma separators and consistent formatting
export function formatUsd(value?: number | null): string {
  if (value === null || value === undefined || !isFinite(value as number)) return "$—";
  const abs = Math.abs(value);

  // Use Intl.NumberFormat for all values to ensure proper comma separators
  if (abs >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }

  // Mid-range and small values with consistent formatting
  if (abs >= 1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);
  }
  
  if (abs >= 0.1) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 3,
      minimumFractionDigits: 3,
    }).format(value);
  }
  
  if (abs >= 0.01) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 4,
      minimumFractionDigits: 4,
    }).format(value);
  }
  
  if (abs >= 0.001) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 6,
      minimumFractionDigits: 6,
    }).format(value);
  }
  
  if (abs >= 0.000001) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 8,
      minimumFractionDigits: 8,
    }).format(value);
  }
  
  if (abs >= 0.00000001) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 10,
      minimumFractionDigits: 10,
    }).format(value);
  }

  return '<$0.00000001';
}

export function formatPercent(value?: number | null, digits = 2): string {
  if (value === null || value === undefined || !isFinite(value as number)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

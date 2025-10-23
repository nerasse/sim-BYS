import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fr-FR").format(num);
}

export function formatCurrency(amount: number): string {
  return `${amount}$`;
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}


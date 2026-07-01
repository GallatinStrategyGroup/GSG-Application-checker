import type { CheckerType } from "@/lib/checkers";

export interface Price {
  amount: number; // whole US dollars
  label: string;
}

// Service prices in US dollars. When Stripe is wired, the checkout amount reads
// from here too (converted to cents). EC = EC Check; finished/partial = Application Check.
export const PRICES: Record<CheckerType, Price> = {
  ec: { amount: 63.99, label: "EC Check" },
  finished: { amount: 189.99, label: "Application Check" },
  partial: { amount: 189.99, label: "Application Check" },
};

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// Stripe works in the smallest currency unit (cents).
export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

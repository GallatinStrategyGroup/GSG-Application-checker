import type { CheckerType } from "@/lib/checkers";

export interface Price {
  amount: number; // whole US dollars
  label: string;
}

// Placeholder prices — change these anytime. When Stripe is wired, the checkout
// amount will read from here too. EC = EC Check; finished/partial = Application Check.
export const PRICES: Record<CheckerType, Price> = {
  ec: { amount: 49, label: "EC Check" },
  finished: { amount: 99, label: "Application Check" },
  partial: { amount: 99, label: "Application Check" },
};

export function formatUsd(amount: number): string {
  return `$${amount}`;
}

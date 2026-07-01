import Stripe from "stripe";

// True once STRIPE_SECRET_KEY is set (in .env.local locally, in Vercel for prod).
// Until then the pay button falls back to completing the submission without a charge.
export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

// Server-only Stripe client. Never import this into a Client Component.
export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

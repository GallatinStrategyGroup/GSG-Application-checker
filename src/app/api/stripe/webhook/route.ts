import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient, isAdminConfigured } from "@/lib/supabase/admin";

// Stripe calls this endpoint directly (no user session) whenever a payment
// event happens. It's the reliable source of truth: even if the customer closes
// the tab before the redirect, this still marks the submission as paid.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured || !webhookSecret) {
    return new Response("Stripe webhook not configured", { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  // Signature verification needs the raw, unparsed request body.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const submissionId = session.metadata?.submission_id;

    if (session.payment_status === "paid" && submissionId && isAdminConfigured) {
      const admin = createAdminClient();
      await admin
        .from("submissions")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", submissionId);
    }
  }

  // Always 200 so Stripe doesn't keep retrying a handled event.
  return new Response("ok", { status: 200 });
}

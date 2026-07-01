import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { PRICES, toCents } from "@/lib/pricing";
import type { CheckerType } from "@/lib/checkers";

// Creates a Stripe Checkout session for a submission and returns its URL.
// The price is derived from the submission's own type in the database — never
// from the client — so it can't be tampered with.
export async function POST(request: Request) {
  // Not set up yet → tell the client to fall back to the no-charge path.
  if (!isStripeConfigured) {
    return Response.json({ configured: false });
  }

  let submissionId: string | undefined;
  try {
    ({ submissionId } = await request.json());
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (!submissionId) {
    return Response.json({ error: "Missing submission." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "No session." }, { status: 401 });
  }

  // RLS also guards this, but we filter by owner explicitly.
  const { data: submission } = await supabase
    .from("submissions")
    .select("id, type, assigned_reviewer_id")
    .eq("id", submissionId)
    .eq("student_id", user.id)
    .maybeSingle<{ id: string; type: CheckerType; assigned_reviewer_id: string | null }>();

  if (!submission) {
    return Response.json({ error: "Submission not found." }, { status: 404 });
  }

  const price = PRICES[submission.type];

  let counselorName = "your counselor";
  if (submission.assigned_reviewer_id) {
    const { data: reviewer } = await supabase
      .from("reviewers")
      .select("name")
      .eq("id", submission.assigned_reviewer_id)
      .maybeSingle<{ name: string }>();
    if (reviewer?.name) counselorName = reviewer.name;
  }

  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: toCents(price.amount),
          product_data: { name: `${price.label} — ${counselorName}` },
        },
      },
    ],
    metadata: { submission_id: submission.id },
    success_url: `${origin}/pay/success?submission=${submission.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/start/${submission.type}`,
  });

  return Response.json({ url: session.url });
}

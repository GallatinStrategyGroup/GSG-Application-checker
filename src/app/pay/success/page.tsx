import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { SiteHeader } from "@/components/site-header";

// Stripe redirects here after checkout. We verify the payment server-side with
// the secret key, then mark the submission as submitted so it enters the queue.
export default async function PaySuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ submission?: string; session_id?: string }>;
}) {
  const { submission, session_id } = await searchParams;

  let paid = false;

  if (isStripeConfigured && submission && session_id) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === "paid" && session.metadata?.submission_id === submission) {
        paid = true;

        // Mark the submission submitted (RLS ensures the student owns it).
        const supabase = await createClient();
        await supabase
          .from("submissions")
          .update({ status: "submitted", submitted_at: new Date().toISOString() })
          .eq("id", submission);
      }
    } catch {
      paid = false;
    }
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-lg px-6 py-20">
          {paid ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-xl font-bold text-white">
                ✓
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-green-900">Payment received</h1>
              <p className="mt-2 text-sm text-green-900">
                Your application is submitted and in your counselor&apos;s queue. Create an account
                to track it and read your feedback when it&apos;s ready.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/signup"
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                >
                  Create an account
                </Link>
                <Link
                  href="/"
                  className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <h1 className="text-2xl font-semibold text-amber-900">Payment not confirmed</h1>
              <p className="mt-2 text-sm text-amber-900">
                We couldn&apos;t confirm this payment. If you were charged, don&apos;t worry — nothing
                is lost. Head back and try again, or contact us.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Back to home
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

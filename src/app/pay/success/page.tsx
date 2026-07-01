import { createClient } from "@/lib/supabase/server";
import { isStripeConfigured, getStripe } from "@/lib/stripe";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

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
      <main className="flex flex-1 items-center justify-center bg-zinc-50/60 px-6 py-20">
        <div className="w-full max-w-md">
          {paid ? (
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                ✓
              </div>
              <h1 className="mt-5 font-serif text-3xl font-medium tracking-tight text-zinc-900">
                Payment received
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                Your application is submitted and in your counselor&apos;s queue. Create an account
                to track it and read your feedback when it&apos;s ready.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button href="/signup">Create an account</Button>
                <Button href="/" variant="secondary">
                  Back to home
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
              <h1 className="font-serif text-2xl font-medium text-amber-900">
                Payment not confirmed
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-amber-900">
                We couldn&apos;t confirm this payment. If you were charged, don&apos;t worry —
                nothing is lost. Head back and try again, or contact us.
              </p>
              <div className="mt-6">
                <Button href="/">Back to home</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

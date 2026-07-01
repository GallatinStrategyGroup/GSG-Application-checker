"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function IntroCallForm({
  reviewerId,
  reviewerName,
}: {
  reviewerId: string;
  reviewerName: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [times, setTimes] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isSupabaseConfigured) {
      setError("Booking isn't connected yet.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error: insErr } = await supabase.from("intro_call_requests").insert({
        reviewer_id: reviewerId,
        student_name: name.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        preferred_times: times.trim() || null,
        message: message.trim() || null,
      });
      if (insErr) throw insErr;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
        <h2 className="text-lg font-semibold text-green-900">Request sent!</h2>
        <p className="mt-2 text-sm text-green-900">
          Thanks — {reviewerName} will reach out to schedule your free intro call. Keep an eye on
          your email.
        </p>
        <Link
          href="/counseling"
          className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Back to counselors
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Your name</span>
          <input
            className={`${inputClass} mt-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Email</span>
          <input
            type="email"
            required
            className={`${inputClass} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Phone (optional)</span>
          <input
            className={`${inputClass} mt-1`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Best times to reach you</span>
          <input
            className={`${inputClass} mt-1`}
            value={times}
            onChange={(e) => setTimes(e.target.value)}
            placeholder="e.g. weekday evenings"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">What would you like help with?</span>
        <textarea
          className={`${inputClass} mt-1 min-h-28`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="A sentence or two about where you are and what you're hoping for."
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Request free intro call"}
      </button>
    </form>
  );
}

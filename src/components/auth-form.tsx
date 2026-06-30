"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);

    try {
      const supabase = createClient();

      if (isSignup) {
        const {
          data: { user: current },
        } = await supabase.auth.getUser();

        if (current?.is_anonymous) {
          // Guest already has drafts — convert that session into a real account
          // so the drafts stay attached (same user id).
          const { error } = await supabase.auth.updateUser({
            email,
            password,
            data: { full_name: fullName },
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      // Did we end up with a real (non-anonymous) session?
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && !user.is_anonymous) {
        // Keep the profile row in sync (email / name).
        await supabase
          .from("profiles")
          .update({
            email: user.email,
            ...(fullName.trim() ? { full_name: fullName.trim() } : {}),
          })
          .eq("id", user.id);

        router.push("/submissions");
        router.refresh();
        return;
      }

      // No active session yet — email confirmation is likely on.
      setNotice("Account created. Check your email to confirm, then log in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Login isn&apos;t connected yet. Add your Supabase keys (see{" "}
        <code className="font-mono">docs/SETUP.md</code>) to enable accounts.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSignup && (
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Full name</span>
          <input
            className={`${inputClass} mt-1`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
      )}

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Email</span>
        <input
          type="email"
          required
          className={`${inputClass} mt-1`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-zinc-700">Password</span>
        <input
          type="password"
          required
          minLength={6}
          className={`${inputClass} mt-1`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
      </label>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {notice && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        {busy ? "Working…" : isSignup ? "Create account" : "Log in"}
      </button>

      <p className="text-center text-sm text-zinc-600">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-700 hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-blue-700 hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

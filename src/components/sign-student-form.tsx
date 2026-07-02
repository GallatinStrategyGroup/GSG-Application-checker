"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignStudentForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("sign_student", { student_email: email });
      if (error) throw error;

      if (data?.ok) {
        setMsg({ kind: "ok", text: `Signed — ${email.trim()} now has 3 free checks.` });
        setEmail("");
        router.refresh();
      } else {
        setMsg({ kind: "error", text: data?.error ?? "Could not sign this student." });
      }
    } catch (err) {
      setMsg({ kind: "error", text: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@email.com"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:flex-1"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {busy ? "Signing…" : "Sign & grant 3 free checks"}
        </button>
      </div>
      {msg && (
        <p className={`mt-3 text-sm ${msg.kind === "ok" ? "text-green-700" : "text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </form>
  );
}

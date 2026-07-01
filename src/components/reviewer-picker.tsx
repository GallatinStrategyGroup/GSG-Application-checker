"use client";

import { useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Avatar } from "@/components/avatar";
import {
  displayedLoad,
  turnaroundLabel,
  todaySeed,
  type ReviewerCard,
} from "@/lib/reviewers";

export function ReviewerPicker({
  selectedId,
  onSelect,
}: {
  selectedId: string | null;
  onSelect: (id: string, name: string) => void;
}) {
  const [reviewers, setReviewers] = useState<ReviewerCard[]>([]);
  const [loads, setLoads] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const [{ data: revs }, { data: counts }] = await Promise.all([
        supabase
          .from("reviewers")
          .select("id, name, headline, bio, avatar_url")
          .eq("accepting", true)
          .order("display_order"),
        supabase.rpc("reviewer_active_counts"),
      ]);

      if (cancelled) return;

      const list = (revs ?? []) as ReviewerCard[];
      setReviewers(list);

      // Backfill the name for a selection restored from a saved draft.
      if (selectedId) {
        const match = list.find((r) => r.id === selectedId);
        if (match) onSelect(match.id, match.name);
      }

      const map: Record<string, number> = {};
      for (const row of (counts ?? []) as { reviewer_id: string; active_count: number }[]) {
        map[row.reviewer_id] = Number(row.active_count) || 0;
      }
      setLoads(map);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // Fetch once on mount; selectedId is only read to backfill the saved name.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <p className="text-sm text-zinc-500">
        The reviewer list appears once Supabase is connected.
      </p>
    );
  }
  if (loading) return <p className="text-sm text-zinc-500">Loading reviewers…</p>;
  if (reviewers.length === 0) {
    return <p className="text-sm text-zinc-500">No reviewers are available yet.</p>;
  }

  const seed = todaySeed();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {reviewers.map((r) => {
        const load = displayedLoad(r.id, loads[r.id] ?? 0, seed);
        const selected = selectedId === r.id;
        return (
          <button
            type="button"
            key={r.id}
            onClick={() => onSelect(r.id, r.name)}
            aria-pressed={selected}
            className={`flex flex-col rounded-xl border p-5 text-left transition ${
              selected
                ? "border-blue-600 ring-2 ring-blue-200"
                : "border-zinc-200 hover:border-blue-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center gap-3">
              <Avatar name={r.name} url={r.avatar_url} />
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900">{r.name}</p>
                {r.headline && <p className="truncate text-xs text-zinc-500">{r.headline}</p>}
              </div>
            </div>

            {r.bio && <p className="mt-3 text-sm leading-relaxed text-zinc-600">{r.bio}</p>}

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 text-xs">
              <span className="text-zinc-500">Helping {load} students now</span>
              <span className="font-semibold text-blue-700">{turnaroundLabel(load)}</span>
            </div>

            <span
              className={`mt-3 text-xs font-semibold ${
                selected ? "text-blue-700" : "text-transparent"
              }`}
            >
              ✓ Selected
            </span>
          </button>
        );
      })}
    </div>
  );
}

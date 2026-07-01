"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import type { CvSection } from "@/lib/counselors";

export function CounselorCard({
  id,
  name,
  headline,
  bio,
  avatarUrl,
  cv,
}: {
  id: string;
  name: string;
  headline: string | null;
  bio: string | null;
  avatarUrl: string | null;
  cv: CvSection[] | null;
}) {
  const [open, setOpen] = useState(false);
  const hasCv = !!cv && cv.length > 0;

  return (
    <article className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-4">
        <Avatar name={name} url={avatarUrl} size={64} />
        <div className="min-w-0">
          <h3 className="font-serif text-xl font-medium text-zinc-900">{name}</h3>
          {headline && <p className="text-sm text-blue-700">{headline}</p>}
        </div>
      </div>

      {bio && <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">{bio}</p>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link
          href={`/counseling/${id}`}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Book a free intro call
        </Link>
        {hasCv && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:underline"
          >
            {open ? "Hide full CV" : "View full CV"}
            <span
              aria-hidden
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              ⌄
            </span>
          </button>
        )}
      </div>

      {open && hasCv && (
        <div className="mt-6 space-y-5 border-t border-zinc-100 pt-6">
          {cv!.map((section) => (
            <div key={section.heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {section.heading}
              </h4>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-zinc-600">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

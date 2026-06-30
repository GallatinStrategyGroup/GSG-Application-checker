"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ReviewerPicker } from "@/components/reviewer-picker";
import type { Checker } from "@/lib/checkers";

// ---- Shapes of the editable rows -------------------------------------------

type Tier = "reach" | "match" | "safety";

interface SchoolRow {
  name: string;
  tier: Tier;
}
interface ActivityRow {
  role: string;
  organization: string;
  years: string;
  hours: string;
  description: string;
}
interface EssayRow {
  title: string;
  body: string;
}

const emptySchool = (): SchoolRow => ({ name: "", tier: "reach" });
const emptyActivity = (): ActivityRow => ({
  role: "",
  organization: "",
  years: "",
  hours: "",
  description: "",
});
const emptyEssay = (): EssayRow => ({ title: "", body: "" });

const TIERS: { value: Tier; label: string }[] = [
  { value: "reach", label: "Reach" },
  { value: "match", label: "Match" },
  { value: "safety", label: "Safety" },
];

// ---- Shared styles ---------------------------------------------------------

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const labelClass = "block text-sm font-medium text-zinc-700";

// ---------------------------------------------------------------------------

export function CheckerForm({ checker }: { checker: Checker }) {
  const draftKey = `gsg-draft-${checker.type}`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Shared intake
  const [intendedMajor, setIntendedMajor] = useState("");
  const [gpa, setGpa] = useState("");
  const [schools, setSchools] = useState<SchoolRow[]>([emptySchool()]);

  // Type-specific
  const [activities, setActivities] = useState<ActivityRow[]>([emptyActivity()]);
  const [essays, setEssays] = useState<EssayRow[]>([emptyEssay()]);
  const [supplementalInfo, setSupplementalInfo] = useState("");

  // Which reviewer the student picked.
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);

  // Load an in-progress draft saved earlier in this browser.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }
      const id = typeof window !== "undefined" ? localStorage.getItem(draftKey) : null;
      if (!id) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: submission } = await supabase
        .from("submissions")
        .select("id, intended_major, gpa, supplemental_info, status, assigned_reviewer_id")
        .eq("id", id)
        .maybeSingle();

      if (cancelled) return;

      // Draft is gone (deleted, or belongs to a session we no longer have).
      if (!submission) {
        localStorage.removeItem(draftKey);
        setLoading(false);
        return;
      }

      setDraftId(submission.id);
      setIntendedMajor(submission.intended_major ?? "");
      setGpa(submission.gpa ?? "");
      setSupplementalInfo(submission.supplemental_info ?? "");
      setSelectedReviewerId(submission.assigned_reviewer_id ?? null);

      const [{ data: sc }, { data: ac }, { data: es }] = await Promise.all([
        supabase.from("target_schools").select("name, tier").eq("submission_id", id),
        supabase
          .from("activities")
          .select("role, organization, years, hours, description")
          .eq("submission_id", id)
          .order("position"),
        supabase
          .from("essays")
          .select("title, body")
          .eq("submission_id", id)
          .order("position"),
      ]);

      if (cancelled) return;
      if (sc && sc.length) setSchools(sc as SchoolRow[]);
      if (ac && ac.length) setActivities(ac as ActivityRow[]);
      if (es && es.length) setEssays(es as EssayRow[]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  // ---- Save / submit -------------------------------------------------------

  async function persist(status: "draft" | "submitted") {
    setMessage(null);

    if (status === "submitted" && checker.requiresIntakeToSubmit) {
      const hasSchool = schools.some((s) => s.name.trim());
      if (!intendedMajor.trim() || !hasSchool) {
        setMessage({
          kind: "error",
          text: "To submit, please add your intended major and at least one target school.",
        });
        return;
      }
    }

    if (status === "submitted" && !selectedReviewerId) {
      setMessage({
        kind: "error",
        text: "Please choose a reviewer before submitting.",
      });
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      // Make sure we have a session. Anonymous is fine for now; in Phase 3 the
      // student creates a real account and these drafts get linked to it.
      let {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        user = data.user;
      }
      if (!user) throw new Error("Could not start a session.");

      const submissionFields = {
        student_id: user.id,
        type: checker.type,
        status,
        intended_major: intendedMajor.trim() || null,
        gpa: gpa.trim() || null,
        supplemental_info: checker.hasSupplemental ? supplementalInfo.trim() || null : null,
        assigned_reviewer_id: selectedReviewerId,
        updated_at: new Date().toISOString(),
        ...(status === "submitted" ? { submitted_at: new Date().toISOString() } : {}),
      };

      // Create the submission the first time, update it afterwards.
      let id = draftId;
      if (id) {
        const { error } = await supabase
          .from("submissions")
          .update(submissionFields)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("submissions")
          .insert(submissionFields)
          .select("id")
          .single();
        if (error) throw error;
        id = data.id as string;
        setDraftId(id);
        localStorage.setItem(draftKey, id);
      }

      // Replace the child rows with the current state (simple and correct).
      const schoolRows = schools
        .filter((s) => s.name.trim())
        .map((s) => ({ submission_id: id, name: s.name.trim(), tier: s.tier }));

      const activityRows = activities
        .filter((a) => a.role.trim() || a.organization.trim() || a.description.trim())
        .map((a, i) => ({
          submission_id: id,
          role: a.role.trim() || null,
          organization: a.organization.trim() || null,
          years: a.years.trim() || null,
          hours: a.hours.trim() || null,
          description: a.description.trim() || null,
          position: i,
        }));

      const essayRows = checker.hasEssays
        ? essays
            .filter((e) => e.title.trim() || e.body.trim())
            .map((e, i) => ({
              submission_id: id,
              title: e.title.trim() || null,
              body: e.body.trim() || null,
              position: i,
            }))
        : [];

      await supabase.from("target_schools").delete().eq("submission_id", id);
      await supabase.from("activities").delete().eq("submission_id", id);
      await supabase.from("essays").delete().eq("submission_id", id);

      if (schoolRows.length) await supabase.from("target_schools").insert(schoolRows);
      if (activityRows.length) await supabase.from("activities").insert(activityRows);
      if (essayRows.length) await supabase.from("essays").insert(essayRows);

      if (status === "submitted") {
        localStorage.removeItem(draftKey);
        setSubmitted(true);
      } else {
        setMessage({ kind: "ok", text: "Draft saved. You can close this and come back later." });
      }
    } catch (err) {
      const text =
        err instanceof Error && /anonymous/i.test(err.message)
          ? "Saving needs anonymous sign-ins enabled in Supabase (Authentication → Providers). See docs/SETUP.md."
          : err instanceof Error
            ? err.message
            : "Something went wrong while saving.";
      setMessage({ kind: "error", text });
    } finally {
      setSaving(false);
    }
  }

  // ---- Not-configured + success states ------------------------------------

  if (!isSupabaseConfigured) {
    return (
      <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <p className="font-medium">Saving isn&apos;t connected yet.</p>
        <p className="mt-1">
          Add your Supabase keys (see <code className="font-mono">docs/SETUP.md</code>) to enable
          saving and submitting. The form below is the real layout — it just can&apos;t store
          anything until then.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-blue-900">Submitted — thank you!</h2>
        <p className="mt-2 text-sm text-blue-900">
          Your work is in the queue and a reviewer will leave written feedback. Create an account to
          track this submission and read your feedback when it&apos;s ready — what you just submitted
          stays attached to it.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Create an account
          </Link>
          <Link
            href="/"
            className="inline-block rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-800 hover:bg-blue-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="mt-8 text-sm text-zinc-500">Loading…</p>;
  }

  // ---- The form ------------------------------------------------------------

  return (
    <form
      className="mt-8 space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        persist("submitted");
      }}
    >
      {/* Shared intake */}
      <Section
        title="About you"
        subtitle="This helps reviewers tailor feedback to the schools you're aiming for."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Intended major">
            <input
              className={inputClass}
              value={intendedMajor}
              onChange={(e) => setIntendedMajor(e.target.value)}
              placeholder="e.g. Computer Science"
            />
          </Field>
          <Field label="GPA">
            <input
              className={inputClass}
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              placeholder="e.g. 3.9 (unweighted)"
            />
          </Field>
        </div>

        <div className="mt-6">
          <p className={labelClass}>Target schools</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Tag each one Reach, Match, or Safety. Your dream schools go under Reach.
          </p>
          <div className="mt-3 space-y-2">
            {schools.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  className={inputClass}
                  value={s.name}
                  onChange={(e) => setSchools(update(schools, i, { name: e.target.value }))}
                  placeholder="School name"
                />
                <select
                  className={`${inputClass} w-32 shrink-0`}
                  value={s.tier}
                  onChange={(e) =>
                    setSchools(update(schools, i, { tier: e.target.value as Tier }))
                  }
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <RemoveButton
                  disabled={schools.length === 1}
                  onClick={() => setSchools(removeAt(schools, i))}
                />
              </div>
            ))}
          </div>
          <AddButton label="Add school" onClick={() => setSchools([...schools, emptySchool()])} />
        </div>
      </Section>

      {/* Activities — every checker has these */}
      <Section
        title="Activities"
        subtitle={
          checker.type === "ec"
            ? "List your extracurriculars. This is what reviewers will assess."
            : "List your extracurriculars, clubs, jobs, and roles."
        }
      >
        <div className="space-y-4">
          {activities.map((a, i) => (
            <div key={i} className="rounded-xl border border-zinc-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role / position">
                  <input
                    className={inputClass}
                    value={a.role}
                    onChange={(e) => setActivities(update(activities, i, { role: e.target.value }))}
                    placeholder="e.g. Team Captain"
                  />
                </Field>
                <Field label="Organization">
                  <input
                    className={inputClass}
                    value={a.organization}
                    onChange={(e) =>
                      setActivities(update(activities, i, { organization: e.target.value }))
                    }
                    placeholder="e.g. Varsity Soccer"
                  />
                </Field>
                <Field label="Years involved">
                  <input
                    className={inputClass}
                    value={a.years}
                    onChange={(e) => setActivities(update(activities, i, { years: e.target.value }))}
                    placeholder="e.g. 9, 10, 11, 12"
                  />
                </Field>
                <Field label="Hours per week / weeks per year">
                  <input
                    className={inputClass}
                    value={a.hours}
                    onChange={(e) => setActivities(update(activities, i, { hours: e.target.value }))}
                    placeholder="e.g. 10 hrs/wk, 30 wks/yr"
                  />
                </Field>
              </div>
              <Field label="Description" className="mt-3">
                <textarea
                  className={`${inputClass} min-h-20`}
                  value={a.description}
                  onChange={(e) =>
                    setActivities(update(activities, i, { description: e.target.value }))
                  }
                  placeholder="What you did and the impact you had."
                />
              </Field>
              <div className="mt-2 flex justify-end">
                <RemoveButton
                  disabled={activities.length === 1}
                  onClick={() => setActivities(removeAt(activities, i))}
                />
              </div>
            </div>
          ))}
        </div>
        <AddButton
          label="Add activity"
          onClick={() => setActivities([...activities, emptyActivity()])}
        />
      </Section>

      {/* Essays — finished + partial only */}
      {checker.hasEssays && (
        <Section title="Essays" subtitle="Add each essay with a short title and the full text.">
          <div className="space-y-4">
            {essays.map((e, i) => (
              <div key={i} className="rounded-xl border border-zinc-200 p-4">
                <Field label="Essay title">
                  <input
                    className={inputClass}
                    value={e.title}
                    onChange={(ev) => setEssays(update(essays, i, { title: ev.target.value }))}
                    placeholder="e.g. Common App personal statement"
                  />
                </Field>
                <Field label="Essay text" className="mt-3">
                  <textarea
                    className={`${inputClass} min-h-40`}
                    value={e.body}
                    onChange={(ev) => setEssays(update(essays, i, { body: ev.target.value }))}
                    placeholder="Paste your essay here."
                  />
                </Field>
                <div className="mt-2 flex justify-end">
                  <RemoveButton
                    disabled={essays.length === 1}
                    onClick={() => setEssays(removeAt(essays, i))}
                  />
                </div>
              </div>
            ))}
          </div>
          <AddButton label="Add essay" onClick={() => setEssays([...essays, emptyEssay()])} />
        </Section>
      )}

      {/* Supplemental — finished + partial only */}
      {checker.hasSupplemental && (
        <Section
          title="Anything else?"
          subtitle="Optional. Context, questions for your reviewer, or anything that doesn't fit above."
        >
          <textarea
            className={`${inputClass} min-h-28`}
            value={supplementalInfo}
            onChange={(e) => setSupplementalInfo(e.target.value)}
            placeholder="Optional notes for your reviewer."
          />
        </Section>
      )}

      {/* Choose your reviewer */}
      <Section
        title="Choose your reviewer"
        subtitle="Pick who reviews your application. Turn-around times reflect how busy each reviewer is right now."
      >
        <ReviewerPicker selectedId={selectedReviewerId} onSelect={setSelectedReviewerId} />
      </Section>

      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-200 pt-6">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {saving ? "Working…" : "Submit for review"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => persist("draft")}
          className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          Save draft
        </button>
        <span className="text-xs text-zinc-500">
          {checker.requiresIntakeToSubmit
            ? "Major, one school, and a reviewer are needed to submit."
            : "Nothing is required to save a draft. Choose a reviewer to submit."}
        </span>
      </div>
    </form>
  );
}

// ---- Small presentational helpers -----------------------------------------

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className={labelClass}>{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-lg px-2 text-sm font-medium text-zinc-400 hover:text-red-600 disabled:opacity-40 disabled:hover:text-zinc-400"
      aria-label="Remove"
    >
      Remove
    </button>
  );
}

// ---- Tiny immutable array helpers -----------------------------------------

function update<T>(rows: T[], index: number, patch: Partial<T>): T[] {
  return rows.map((row, i) => (i === index ? { ...row, ...patch } : row));
}

function removeAt<T>(rows: T[], index: number): T[] {
  return rows.filter((_, i) => i !== index);
}

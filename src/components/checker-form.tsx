"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ReviewerPicker } from "@/components/reviewer-picker";
import { FileUploads } from "@/components/file-uploads";
import { PRICES, formatUsd } from "@/lib/pricing";
import type { Attachment } from "@/lib/attachments";
import type { Checker } from "@/lib/checkers";

// ---- Shapes of the editable rows -------------------------------------------

type Tier = "reach" | "match" | "safety";
type Step = 1 | 2 | 3;

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

const STEP_LABELS = ["Your work", "Pick a counselor", "Payment"];

// ---- Shared styles ---------------------------------------------------------

const fieldBase =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
const inputClass = `w-full ${fieldBase}`;
const labelClass = "block text-sm font-medium text-zinc-700";
const primaryBtn =
  "rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60";
const secondaryBtn =
  "rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60";

// ---------------------------------------------------------------------------

export function CheckerForm({ checker }: { checker: Checker }) {
  const draftKey = `gsg-draft-${checker.type}`;
  const price = PRICES[checker.type];

  const [step, setStep] = useState<Step>(1);
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

  // Which counselor the student picked.
  const [selectedReviewerId, setSelectedReviewerId] = useState<string | null>(null);
  const [selectedReviewerName, setSelectedReviewerName] = useState<string | null>(null);

  // Uploaded files.
  const [attachments, setAttachments] = useState<Attachment[]>([]);

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

      const [{ data: sc }, { data: ac }, { data: es }, { data: at }] = await Promise.all([
        supabase.from("target_schools").select("name, tier").eq("submission_id", id),
        supabase
          .from("activities")
          .select("role, organization, years, hours, description")
          .eq("submission_id", id)
          .order("position"),
        supabase.from("essays").select("title, body").eq("submission_id", id).order("position"),
        supabase
          .from("attachments")
          .select("id, title, file_name, file_path")
          .eq("submission_id", id)
          .order("created_at"),
      ]);

      if (cancelled) return;
      if (sc && sc.length) setSchools(sc as SchoolRow[]);
      if (ac && ac.length) setActivities(ac as ActivityRow[]);
      if (es && es.length) setEssays(es as EssayRow[]);
      if (at && at.length) setAttachments(at as Attachment[]);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [draftKey]);

  // ---- Save / submit -------------------------------------------------------

  async function persist(status: "draft" | "submitted"): Promise<string | null> {
    setMessage(null);

    if (status === "submitted" && checker.requiresIntakeToSubmit) {
      const hasSchool = schools.some((s) => s.name.trim());
      if (!intendedMajor.trim() || !hasSchool) {
        setMessage({
          kind: "error",
          text: "Please add your intended major and at least one target school.",
        });
        return null;
      }
    }
    if (status === "submitted" && !selectedReviewerId) {
      setMessage({ kind: "error", text: "Please choose a counselor first." });
      return null;
    }

    setSaving(true);
    try {
      const supabase = createClient();

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

      let id = draftId;
      if (id) {
        const { error } = await supabase.from("submissions").update(submissionFields).eq("id", id);
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
      return id;
    } catch (err) {
      const text =
        err instanceof Error && /anonymous/i.test(err.message)
          ? "Saving needs anonymous sign-ins enabled in Supabase (Authentication → Providers). See docs/SETUP.md."
          : err instanceof Error
            ? err.message
            : "Something went wrong while saving.";
      setMessage({ kind: "error", text });
      return null;
    } finally {
      setSaving(false);
    }
  }

  // Uploads need a submission to attach to — create the draft if there isn't one.
  async function ensureSubmission(): Promise<string | null> {
    if (draftId) return draftId;
    return persist("draft");
  }

  // ---- Step navigation -----------------------------------------------------

  async function goToCounselor() {
    setMessage(null);
    if (checker.requiresIntakeToSubmit) {
      const hasSchool = schools.some((s) => s.name.trim());
      if (!intendedMajor.trim() || !hasSchool) {
        setMessage({
          kind: "error",
          text: "Add your intended major and at least one target school to continue.",
        });
        return;
      }
    }
    if (await persist("draft")) {
      setMessage(null);
      setStep(2);
    }
  }

  async function goToPayment() {
    setMessage(null);
    if (!selectedReviewerId) {
      setMessage({ kind: "error", text: "Choose a counselor to continue." });
      return;
    }
    if (await persist("draft")) {
      setMessage(null);
      setStep(3);
    }
  }

  async function payAndSubmit() {
    setMessage(null);
    // Make sure the submission exists and is saved before checkout.
    if (!(await persist("draft"))) return;

    setSaving(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: draftId }),
      });
      const data = await res.json();

      if (data.url) {
        // Off to Stripe's secure checkout. Keep the button busy during redirect.
        window.location.assign(data.url);
        return;
      }
      if (data.configured === false) {
        // Stripe isn't set up yet — complete without a charge for now.
        setSaving(false);
        await persist("submitted");
        return;
      }
      throw new Error(data.error || "Could not start checkout.");
    } catch (err) {
      setMessage({
        kind: "error",
        text: err instanceof Error ? err.message : "Could not start checkout.",
      });
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
          saving and submitting.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-blue-900">Submitted — thank you!</h2>
        <p className="mt-2 text-sm text-blue-900">
          Your work is in the queue and your counselor will leave written feedback. Create an account
          to track this submission and read your feedback when it&apos;s ready — what you just
          submitted stays attached to it.
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

  // ---- Wizard --------------------------------------------------------------

  return (
    <div className="mt-8">
      {/* Stepper */}
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <li key={label} className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  active
                    ? "bg-blue-700 text-white"
                    : done
                      ? "bg-blue-100 text-blue-700"
                      : "bg-zinc-100 text-zinc-400"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span
                className={`hidden text-sm sm:inline ${
                  active ? "font-semibold text-zinc-900" : "text-zinc-400"
                }`}
              >
                {label}
              </span>
              {n < 3 && <span className="h-px w-5 bg-zinc-200 sm:w-8" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <div className="mt-8 space-y-10">
        {/* STEP 1 — your work */}
        {step === 1 && (
          <>
            <Section
              title="About you"
              subtitle="This helps your counselor tailor feedback to the schools you're aiming for."
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
                    <div key={i} className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className={`${fieldBase} w-full min-w-0 sm:flex-1`}
                        value={s.name}
                        onChange={(e) => setSchools(update(schools, i, { name: e.target.value }))}
                        placeholder="School name (e.g. Boston University)"
                      />
                      <div className="flex gap-2">
                        <select
                          className={`${fieldBase} flex-1 sm:w-36 sm:flex-none`}
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
                    </div>
                  ))}
                </div>
                <AddButton
                  label="Add school"
                  onClick={() => setSchools([...schools, emptySchool()])}
                />
              </div>
            </Section>

            <Section
              title="Activities"
              subtitle={
                checker.type === "ec"
                  ? "List your extracurriculars. This is what your counselor will assess."
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
                          onChange={(e) =>
                            setActivities(update(activities, i, { role: e.target.value }))
                          }
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
                          onChange={(e) =>
                            setActivities(update(activities, i, { years: e.target.value }))
                          }
                          placeholder="e.g. 9, 10, 11, 12"
                        />
                      </Field>
                      <Field label="Hours per week / weeks per year">
                        <input
                          className={inputClass}
                          value={a.hours}
                          onChange={(e) =>
                            setActivities(update(activities, i, { hours: e.target.value }))
                          }
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

            {checker.hasSupplemental && (
              <Section
                title="Anything else?"
                subtitle="Optional. Context, questions for your counselor, or anything that doesn't fit above."
              >
                <textarea
                  className={`${inputClass} min-h-28`}
                  value={supplementalInfo}
                  onChange={(e) => setSupplementalInfo(e.target.value)}
                  placeholder="Optional notes for your counselor."
                />
              </Section>
            )}

            <Section
              title="Upload files (optional)"
              subtitle="Drag in your Common App, essays, or any PDFs. Give each one a title so your counselor knows what it is."
            >
              <FileUploads
                attachments={attachments}
                onChange={setAttachments}
                ensureSubmission={ensureSubmission}
              />
            </Section>
          </>
        )}

        {/* STEP 2 — pick a counselor */}
        {step === 2 && (
          <Section
            title="Choose your counselor"
            subtitle="Pick who reviews your application. Turn-around times reflect how busy each counselor is right now."
          >
            <ReviewerPicker
              selectedId={selectedReviewerId}
              onSelect={(id, name) => {
                setSelectedReviewerId(id);
                setSelectedReviewerName(name);
              }}
            />
          </Section>
        )}

        {/* STEP 3 — payment */}
        {step === 3 && (
          <Section title="Payment" subtitle="Review your order and submit for review.">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Service</dt>
                  <dd className="font-medium text-zinc-900">{price.label}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Counselor</dt>
                  <dd className="font-medium text-zinc-900">
                    {selectedReviewerName ?? "Selected counselor"}
                  </dd>
                </div>
                {intendedMajor.trim() && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Intended major</dt>
                    <dd className="text-zinc-900">{intendedMajor}</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-100 pt-3 text-base">
                  <dt className="font-semibold text-zinc-900">Total</dt>
                  <dd className="font-semibold text-zinc-900">{formatUsd(price.amount)}</dd>
                </div>
              </dl>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              You&apos;ll be taken to Stripe&apos;s secure checkout to pay. Your application is
              submitted for review as soon as payment succeeds.
            </p>
          </Section>
        )}
      </div>

      {message && (
        <p
          className={`mt-8 rounded-lg px-4 py-3 text-sm ${
            message.kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-200 pt-6">
        <div>
          {step > 1 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setMessage(null);
                setStep((step - 1) as Step);
              }}
              className={secondaryBtn}
            >
              Back
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {step === 1 && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => persist("draft")}
                className={secondaryBtn}
              >
                Save draft
              </button>
              <button type="button" disabled={saving} onClick={goToCounselor} className={primaryBtn}>
                {saving ? "Saving…" : "Continue to counselor →"}
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button
                type="button"
                disabled={saving}
                onClick={() => persist("draft")}
                className={secondaryBtn}
              >
                Save draft
              </button>
              <button type="button" disabled={saving} onClick={goToPayment} className={primaryBtn}>
                {saving ? "Saving…" : "Continue to payment →"}
              </button>
            </>
          )}
          {step === 3 && (
            <button
              type="button"
              disabled={saving}
              onClick={payAndSubmit}
              className={primaryBtn}
            >
              {saving ? "Working…" : `Pay ${formatUsd(price.amount)} & submit`}
            </button>
          )}
        </div>
      </div>
    </div>
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

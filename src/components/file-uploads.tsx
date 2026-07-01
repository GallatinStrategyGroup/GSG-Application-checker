"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeFileName, type Attachment } from "@/lib/attachments";

const MAX_MB = 20;

export function FileUploads({
  attachments,
  onChange,
  ensureSubmission,
}: {
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
  // Returns the submission id, creating a draft first if needed.
  ensureSubmission: () => Promise<string | null>;
}) {
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    if (files.some((f) => f.size > MAX_MB * 1024 * 1024)) {
      setError(`Each file must be under ${MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    try {
      const submissionId = await ensureSubmission();
      if (!submissionId) {
        setError("Couldn't start your submission. Please try again.");
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Couldn't start a session.");
        return;
      }

      let current = attachments;
      for (const file of files) {
        const path = `${user.id}/${submissionId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;

        const { error: upErr } = await supabase.storage.from("uploads").upload(path, file);
        if (upErr) throw upErr;

        const defaultTitle = file.name.replace(/\.[^.]+$/, "");
        const { data: row, error: rowErr } = await supabase
          .from("attachments")
          .insert({
            submission_id: submissionId,
            title: defaultTitle,
            file_path: path,
            file_name: file.name,
          })
          .select("id, title, file_name, file_path")
          .single();
        if (rowErr) throw rowErr;

        current = [...current, row as Attachment];
        onChange(current);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function saveTitle(id: string, title: string) {
    onChange(attachments.map((a) => (a.id === id ? { ...a, title } : a)));
    await createClient().from("attachments").update({ title }).eq("id", id);
  }

  async function remove(att: Attachment) {
    onChange(attachments.filter((a) => a.id !== att.id));
    const supabase = createClient();
    await supabase.storage.from("uploads").remove([att.file_path]);
    await supabase.from("attachments").delete().eq("id", att.id);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-zinc-300 bg-zinc-50 hover:border-blue-300"
        }`}
      >
        <p className="text-sm font-medium text-zinc-700">
          {busy ? "Uploading…" : "Drag & drop files here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Common App, essays, Google Doc PDFs — up to {MAX_MB} MB each.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {attachments.length > 0 && (
        <ul className="mt-4 space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3"
            >
              <input
                className="min-w-0 flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 focus:border-blue-500 focus:outline-none"
                defaultValue={att.title ?? ""}
                placeholder="What is this? e.g. Common App, BU supplement"
                onBlur={(e) => saveTitle(att.id, e.target.value)}
              />
              <span className="max-w-[40%] truncate text-xs text-zinc-400">{att.file_name}</span>
              <button
                type="button"
                onClick={() => remove(att)}
                className="text-sm font-medium text-zinc-400 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface Attachment {
  id: string;
  title: string | null;
  file_name: string | null;
  file_path: string;
}

// Turn a filename into a safe storage path segment.
export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

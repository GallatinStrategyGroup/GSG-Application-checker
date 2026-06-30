import { createBrowserClient } from "@supabase/ssr";

// Are the Supabase keys present? Before you finish docs/SETUP.md they won't be,
// so the UI can show a friendly "connect Supabase to save" message instead of
// crashing.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

// Supabase client for use in the browser (Client Components).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

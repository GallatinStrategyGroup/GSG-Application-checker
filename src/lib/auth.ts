import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

// Returns the current Supabase user (or null) from a Server Component.
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

// A "real" account = signed in AND not just an anonymous guest session.
export function isSignedIn(user: User | null): boolean {
  return Boolean(user) && !user!.is_anonymous;
}

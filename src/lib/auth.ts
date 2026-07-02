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

export type Role = "student" | "reviewer";

export interface CurrentProfile {
  user: User;
  role: Role;
  isAdmin: boolean;
}

// The signed-in user together with their role, or null if not signed in.
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const user = await getCurrentUser();
  if (!isSignedIn(user)) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user!.id)
    .maybeSingle<{ role: Role; is_admin: boolean }>();

  return { user: user!, role: data?.role ?? "student", isAdmin: data?.is_admin ?? false };
}

import { createClient } from "@supabase/supabase-js";

// Admin client using the service-role key. It BYPASSES Row Level Security, so it
// is server-only and used only where there is no user session — e.g. the Stripe
// webhook, which Stripe calls directly. Never import this into browser code.
export const isAdminConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

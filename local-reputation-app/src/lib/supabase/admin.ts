import { createClient } from "@supabase/supabase-js";

// Service-role client that BYPASSES Row Level Security.
// Only for trusted server code (webhooks, cron jobs). Never import from client code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

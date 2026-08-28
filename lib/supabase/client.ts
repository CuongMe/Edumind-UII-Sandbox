import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { requireSupabaseConfig } from "@/lib/supabase/env";

export function createClient() {
  const { url, publishableKey } = requireSupabaseConfig();

  return createSupabaseClient(url, publishableKey, {
    auth: {
      // Demo mode: keep the Supabase session in the browser instead of
      // using server-readable cookies. This works on Vercel, but protected
      // pages are guarded after client-side JavaScript loads.
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  });
}

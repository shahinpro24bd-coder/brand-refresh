import { createClient } from "@supabase/supabase-js";

import { supabase as generatedClient } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { BACKEND_KEY, BACKEND_URL } from "@/lib/backend-config";

function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function fallbackClient() {
  return createClient<Database>(BACKEND_URL, BACKEND_KEY, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (isOpaqueKey(BACKEND_KEY) && headers.get("Authorization") === `Bearer ${BACKEND_KEY}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", BACKEND_KEY);
        return fetch(input, { ...init, headers });
      },
    },
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

const hasBuildTimeConfig = Boolean(
  import.meta.env["VITE_SUPABASE_URL"] && import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
);

/**
 * The one database/login connection the whole app uses. On hosts where the
 * environment variables were not configured it falls back to the public
 * connection details, so signing in and saving keep working after deployment.
 */
export const db = hasBuildTimeConfig ? generatedClient : fallbackClient();

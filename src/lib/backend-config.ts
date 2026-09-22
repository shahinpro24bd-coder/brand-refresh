/**
 * Connection details for the content database.
 *
 * These two values are the public (publishable) ones that any visitor's browser
 * would see anyway, so they are kept here as literals too. That way the site
 * keeps working when it is deployed to a host where the environment variables
 * were not configured (for example a plain Vercel import of this repository).
 */
const FALLBACK_URL = "https://zcqhfcetkgnbwhottwbg.supabase.co";
const FALLBACK_KEY = "sb_publishable_6SxU7TmTXDbkkrgT5N5xtg_FUWfjFuq";

export const BACKEND_URL: string =
  (import.meta.env["VITE_SUPABASE_URL"] as string | undefined) || FALLBACK_URL;

export const BACKEND_KEY: string =
  (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined) || FALLBACK_KEY;

/** Ten years: replacement images keep working without any server-side key. */
export const IMAGE_URL_TTL_SECONDS = 60 * 60 * 24 * 365 * 10;

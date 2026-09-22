/**
 * Absolute site origin.
 *
 * Search engines require fully-qualified URLs for canonical, hreflang and
 * og:image tags. The origin is taken from the incoming request during
 * server rendering and from the browser location on the client, so the same
 * code produces correct URLs on the preview host, the Lovable domain and any
 * custom domain that is attached later.
 *
 * Set VITE_SITE_URL to pin a single canonical domain (recommended once the
 * final domain is live).
 */

const CONFIGURED = (import.meta.env["VITE_SITE_URL"] as string | undefined)?.replace(/\/+$/, "");

const FALLBACK = "https://project--28264b08-65ec-43f7-bd7e-df3567edf117.lovable.app";

let requestOrigin = "";

/** Called once per server request before rendering. */
export function setRequestOrigin(origin: string) {
  requestOrigin = origin.replace(/\/+$/, "");
}

export function siteOrigin(): string {
  if (CONFIGURED) return CONFIGURED;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return requestOrigin || FALLBACK;
}

/** Absolute URL for a root-relative path ("/about" -> "https://host/about"). */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

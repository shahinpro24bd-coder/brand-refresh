import { queryOptions } from "@tanstack/react-query";

import { BACKEND_KEY, BACKEND_URL } from "@/lib/backend-config";
import { EMPTY_SITE_CONTENT, type Lang, type SiteContent } from "@/lib/i18n";

/**
 * Saved wording and image replacements are read straight from the content
 * database over its public read-only endpoint. This works while rendering on
 * the server and in the visitor's browser, on any hosting provider, without
 * needing extra server configuration.
 */
async function readTable<T>(table: string, columns: string): Promise<T[]> {
  const response = await fetch(
    `${BACKEND_URL}/rest/v1/${table}?select=${encodeURIComponent(columns)}`,
    {
      headers: { apikey: BACKEND_KEY, accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) throw new Error(`${table}: ${response.status}`);
  return (await response.json()) as T[];
}

// The public pages must render (and stay indexable) even when the content
// database is unreachable: in that case the built-in wording is used.
async function loadSiteContent(): Promise<SiteContent> {
  try {
    const [textRows, imageRows] = await Promise.all([
      readTable<{ lang: string; key: string; value: string }>("site_text", "lang,key,value"),
      readTable<{ key: string; url: string }>("site_image", "key,url"),
    ]);

    const text: SiteContent["text"] = {};
    for (const row of textRows) {
      const lang = row.lang as Lang;
      text[lang] = { ...(text[lang] ?? {}), [row.key]: row.value };
    }
    const images: Record<string, string> = {};
    for (const row of imageRows) images[row.key] = row.url;

    return { text, images };
  } catch (error) {
    console.error("[site-content] falling back to built-in wording", error);
    return EMPTY_SITE_CONTENT;
  }
}

export const siteContentQueryOptions = queryOptions<SiteContent>({
  queryKey: ["site-content"],
  queryFn: loadSiteContent,
  staleTime: 60_000,
  gcTime: 30 * 60_000,
  retry: 1,
});

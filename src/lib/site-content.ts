import { queryOptions } from "@tanstack/react-query";

import { getSiteContent } from "@/lib/cms.functions";
import { EMPTY_SITE_CONTENT, type SiteContent } from "@/lib/i18n";

// The public pages must render (and stay indexable) even when the content
// database is unreachable: in that case the built-in wording is used.
async function loadSiteContent(): Promise<SiteContent> {
  try {
    return await getSiteContent();
  } catch (error) {
    console.error("[site-content] falling back to built-in wording", error);
    return EMPTY_SITE_CONTENT;
  }
}

export const siteContentQueryOptions = queryOptions<SiteContent>({
  queryKey: ["site-content"],
  queryFn: loadSiteContent,
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
  retry: false,
});

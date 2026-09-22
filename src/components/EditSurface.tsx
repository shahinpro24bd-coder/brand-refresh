import { Suspense } from "react";

import {
  ABOUT_LINK,
  CONTACT_LINK,
  LEGACY_LINKS,
  LegacyPage,
  RTL_LINK,
} from "@/components/LegacyPage";
import { CmsEditor } from "@/components/CmsEditor";
import { Toaster } from "@/components/ui/sonner";
import type { Lang, Page } from "@/lib/i18n";

export const EDIT_HEAD = {
  meta: [
    { title: "Edit page | Dr. Arman Molazadeh" },
    { name: "description", content: "Inline editor for the website wording and images." },
    { name: "robots", content: "noindex, nofollow" },
    { property: "og:title", content: "Edit page" },
    { property: "og:description", content: "Inline editor for the website wording and images." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
  links: [...LEGACY_LINKS, ABOUT_LINK, CONTACT_LINK, RTL_LINK],
};

export function EditSurface({ lang, page }: { lang: Lang; page: Page }) {
  return (
    <div className="cms-edit-shell" key={`${lang}-${page}`}>
      <Suspense fallback={<div className="cms-loading">Loading page…</div>}>
        <LegacyPage lang={lang} page={page} editMode />
        <CmsEditor lang={lang} page={page} />
      </Suspense>
      <Toaster />
    </div>
  );
}

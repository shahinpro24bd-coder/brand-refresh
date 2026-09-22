import { createFileRoute } from "@tanstack/react-router";

import { EditSurface, EDIT_HEAD } from "@/components/EditSurface";
import type { Lang, Page } from "@/lib/i18n";

const LANGS: Lang[] = ["en", "ar", "fa"];
const PAGES: Page[] = ["home", "about", "services", "gallery", "reviews", "contact"];

/** Public URL words also work here, so /edit/patient-reviews opens the reviews editor. */
const SLUG_ALIASES: Record<string, Page> = {
  "patient-reviews": "reviews",
  "patient-review": "reviews",
  reviews: "reviews",
  "video-gallery": "gallery",
  gallery: "gallery",
};

function parse(splat: string): { lang: Lang; page: Page } {
  const parts = splat.split("/").filter(Boolean);
  let lang: Lang = "en";
  if (parts[0] && LANGS.includes(parts[0] as Lang)) lang = parts.shift() as Lang;
  const slug = parts[0] ?? "";
  const page = PAGES.includes(slug as Page)
    ? (slug as Page)
    : (SLUG_ALIASES[slug] ?? "home");
  return { lang, page };
}

export const Route = createFileRoute("/_authenticated/edit/$")({
  head: () => EDIT_HEAD,
  component: EditRoute,
});

function EditRoute() {
  const { _splat } = Route.useParams();
  const { lang, page } = parse(_splat ?? "");
  return <EditSurface lang={lang} page={page} />;
}

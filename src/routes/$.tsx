import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

const LANGS = ["en", "ar", "fa"] as const;
const PAGES: Record<string, string> = {
  index: "home",
  home: "home",
  about: "about",
  services: "services",
  gallery: "gallery",
  contact: "contact",
};

/**
 * Legacy editor URLs: /index2.html, /about2, /ar/contact2.html, /fa/services2 ...
 * They all forward to the inline editor at /edit/<lang>/<page>.
 */
export const Route = createFileRoute("/$")({
  beforeLoad: ({ params }) => {
    const parts = (params._splat ?? "").split("/").filter(Boolean);

    let lang = "en";
    if (parts[0] && (LANGS as readonly string[]).includes(parts[0])) lang = parts.shift()!;

    const slug = (parts[0] ?? "").replace(/\.html?$/i, "").toLowerCase();
    if (parts.length > 1 || !slug.endsWith("2")) throw notFound();

    const page = PAGES[slug.slice(0, -1)];
    if (!page) throw notFound();

    throw redirect({ href: `/edit/${lang}/${page}` });
  },
  component: () => null,
});

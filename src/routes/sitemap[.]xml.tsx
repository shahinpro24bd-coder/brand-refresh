import { createFileRoute } from "@tanstack/react-router";

const PATHS = ["", "/about", "/services", "/gallery", "/patient-reviews", "/contact"];
const LANGS = [
  { prefix: "", hreflang: "en" },
  { prefix: "/ar", hreflang: "ar" },
  { prefix: "/fa", hreflang: "fa" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = LANGS.flatMap((lang) =>
          PATHS.map((path) => {
            const loc = `${origin}${lang.prefix}${path}` || `${origin}/`;
            const alternates = LANGS.map(
              (alt) =>
                `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${origin}${alt.prefix}${path}${alt.prefix === "" && path === "" ? "/" : ""}"/>`,
            ).join("\n");
            return `  <url>\n    <loc>${lang.prefix === "" && path === "" ? `${origin}/` : loc}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${path === "" ? "1.0" : "0.8"}</priority>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${origin}${path || "/"}"/>\n  </url>`;
          }),
        ).join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;

        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});

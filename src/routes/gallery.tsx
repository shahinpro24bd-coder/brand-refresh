import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage } from "@/components/LegacyPage";

const TITLE = "Video Gallery | Dr. Arman Molazadeh, Retina Surgeon Dubai";
const DESCRIPTION =
  "Watch short educational videos on retina, cataract and diabetic eye care by Dr. Arman Molazadeh, vitreoretinal surgeon in Dubai.";
const KEYWORDS =
  "retina surgery videos Dubai, eye care videos UAE, vitreoretinal surgeon Dubai Instagram, Dr. Arman Molazadeh videos";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: seoMeta({
      lang: "en",
      page: "gallery",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      { rel: "preconnect", href: "https://www.instagram.com" },
      { rel: "preconnect", href: "https://static.cdninstagram.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://www.instagram.com" },
      ...LEGACY_LINKS,
      ABOUT_LINK,
      ...seoAlternates("gallery", "en"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "en", page: "gallery", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="en" page="gallery" />,
});

import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage } from "@/components/LegacyPage";

const TITLE = "About Dr. Arman Molazadeh, MD | Retina Surgeon in Dubai";
const DESCRIPTION =
  "Learn about Dr. Arman Molazadeh, MD - DHA-licensed vitreoretinal surgeon in Dubai. Medical education, fellowship training, clinical expertise and surgical experience.";
const KEYWORDS =
  "vitreoretinal surgeon Dubai, retina specialist UAE, ophthalmologist Dubai, DHA licensed eye surgeon, Dr. Arman Molazadeh biography, eye doctor Dubai qualifications";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: seoMeta({
      lang: "en",
      page: "about",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
      ogType: "profile",
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      ...seoAlternates("about", "en"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "en", page: "about", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="en" page="about" />,
});

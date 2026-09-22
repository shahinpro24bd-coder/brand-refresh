import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, REVIEWS_LINK, LegacyPage } from "@/components/LegacyPage";

const TITLE = "Patient Reviews | Dr. Arman Molazadeh, Retina Surgeon Dubai";
const DESCRIPTION =
  "Watch video reviews from patients of Dr. Arman Molazadeh, vitreoretinal surgeon in Dubai, sharing their eye care experience.";
const KEYWORDS =
  "patient reviews retina surgeon Dubai, eye surgery testimonials UAE, Dr. Arman Molazadeh reviews";

export const Route = createFileRoute("/patient-reviews")({
  head: () => ({
    meta: seoMeta({
      lang: "en",
      page: "reviews",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      REVIEWS_LINK,
      ...seoAlternates("reviews", "en"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "en", page: "reviews", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="en" page="reviews" />,
});

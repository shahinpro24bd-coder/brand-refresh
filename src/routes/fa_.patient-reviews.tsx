import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import {
  ABOUT_LINK,
  LEGACY_LINKS,
  REVIEWS_LINK,
  RTL_LINK,
  LegacyPage,
} from "@/components/LegacyPage";

const TITLE = "نظرات بیماران | دکتر آرمان مولازاده، جراح شبکیه در دبی";
const DESCRIPTION =
  "ویدیوهای نظرات بیماران دکتر آرمان مولازاده، جراح شبکیه و زجاجیه در دبی، درباره تجربه درمان چشم.";
const KEYWORDS =
  "نظرات بیماران جراح شبکیه دبی, تجربه جراحی چشم امارات, دکتر آرمان مولازاده";

export const Route = createFileRoute("/fa_/patient-reviews")({
  head: () => ({
    meta: seoMeta({
      lang: "fa",
      page: "reviews",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      REVIEWS_LINK,
      RTL_LINK,
      ...seoAlternates("reviews", "fa"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "fa", page: "reviews", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="fa" page="reviews" />,
});

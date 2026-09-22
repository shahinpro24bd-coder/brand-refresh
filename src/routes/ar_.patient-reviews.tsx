import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import {
  ABOUT_LINK,
  LEGACY_LINKS,
  REVIEWS_LINK,
  RTL_LINK,
  LegacyPage,
} from "@/components/LegacyPage";

const TITLE = "تقييمات المرضى | الدكتور آرمان مولازاده، جراح الشبكية في دبي";
const DESCRIPTION =
  "شاهد تقييمات مصوّرة من مرضى الدكتور آرمان مولازاده، جراح الشبكية والزجاجية في دبي، يشاركون تجربتهم في رعاية العيون.";
const KEYWORDS =
  "تقييمات مرضى جراح الشبكية دبي, تجارب جراحة العيون الإمارات, الدكتور آرمان مولازاده";

export const Route = createFileRoute("/ar_/patient-reviews")({
  head: () => ({
    meta: seoMeta({
      lang: "ar",
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
      ...seoAlternates("reviews", "ar"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "ar", page: "reviews", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="ar" page="reviews" />,
});

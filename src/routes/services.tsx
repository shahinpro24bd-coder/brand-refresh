import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage } from "@/components/LegacyPage";

const TITLE = "Eye Care Services | Dr. Arman Molazadeh, Retina Surgeon Dubai";
const DESCRIPTION =
  "Retinal detachment surgery, vitrectomy, diabetic eye disease, intravitreal injections, laser, macular care, cataract and refractive surgery in Dubai.";
const KEYWORDS =
  "retinal detachment surgery Dubai, vitrectomy Dubai, diabetic retinopathy treatment UAE, intravitreal injection Dubai, macular hole surgery Dubai, cataract surgery Dubai, LASIK Dubai";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: seoMeta({
      lang: "en",
      page: "services",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      ...seoAlternates("services", "en"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "en", page: "services", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="en" page="services" />,
});

import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { LEGACY_LINKS, LegacyPage } from "@/components/LegacyPage";

const HERO_IMAGE = "/legacy/img/dr-arman-hero.webp";

const TITLE = "Dr. Arman Molazadeh | Eye Care & Retina Specialist Dubai";
const DESCRIPTION =
  "Dr. Arman Eye Care by Dr. Arman Molazadeh, DHA-licensed vitreoretinal surgeon in Dubai, for retinal, diabetic eye, macular, cataract and LASIK treatment.";
const KEYWORDS =
  "retina specialist Dubai, vitreoretinal surgeon Dubai, retinal detachment surgery Dubai, diabetic retinopathy treatment Dubai, intravitreal injection Dubai, macular degeneration Dubai, cataract surgery Dubai, LASIK Dubai, eye specialist UAE, Dr. Arman Molazadeh";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: seoMeta({
      lang: "en",
      page: "home",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      { rel: "preload", as: "image", href: HERO_IMAGE, fetchPriority: "high" },
      ...LEGACY_LINKS,
      ...seoAlternates("home", "en"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "en", page: "home", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="en" />,
});

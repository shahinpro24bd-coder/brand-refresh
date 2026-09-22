import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const HERO_IMAGE = "/legacy/img/dr-arman-hero.webp";

const TITLE = "أخصائي شبكية العين في دبي | الدكتور آرمان مولازاده";
const DESCRIPTION =
  "مركز الدكتور آرمان للعناية بالعيون مع الدكتور آرمان مولازاده، جراح شبكية وجسم زجاجي مرخّص في دبي لعلاج الشبكية والسكري والساد والليزك.";
const KEYWORDS =
  "أخصائي شبكية في دبي, جراح شبكية دبي, جراحة انفصال الشبكية دبي, علاج اعتلال الشبكية السكري دبي, حقن داخل العين دبي, التنكس البقعي دبي, جراحة الساد دبي, الليزك دبي, طبيب عيون الإمارات, الدكتور آرمان مولازاده";

export const Route = createFileRoute("/ar")({
  head: () => ({
    meta: seoMeta({
      lang: "ar",
      page: "home",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      { rel: "preload", as: "image", href: HERO_IMAGE, fetchPriority: "high" },
      ...LEGACY_LINKS,
      RTL_LINK,
      ...seoAlternates("home", "ar"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "ar", page: "home", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="ar" />,
});

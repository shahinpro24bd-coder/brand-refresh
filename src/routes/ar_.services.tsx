import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "خدمات العيون | الدكتور آرمان مولازاده، جراح شبكية في دبي";
const DESCRIPTION =
  "جراحة انفصال الشبكية، استئصال الزجاجية، اعتلال الشبكية السكري، الحقن داخل العين، الليزر، أمراض البقعة، الساد وتصحيح النظر في دبي.";
const KEYWORDS =
  "جراحة انفصال الشبكية دبي, جراحة الجسم الزجاجي دبي, علاج اعتلال الشبكية السكري الإمارات, حقن داخل العين دبي, جراحة الساد دبي, الليزك دبي";

export const Route = createFileRoute("/ar_/services")({
  head: () => ({
    meta: seoMeta({
      lang: "ar",
      page: "services",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      RTL_LINK,
      ...seoAlternates("services", "ar"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "ar", page: "services", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="ar" page="services" />,
});

import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "عن الدكتور آرمان مولازاده | جراح شبكية في دبي";
const DESCRIPTION =
  "تعرّف على الدكتور آرمان مولازاده، جراح الشبكية والجسم الزجاجي المرخّص من هيئة الصحة بدبي: التعليم الطبي، الزمالة، الخبرة السريرية والجراحية.";
const KEYWORDS =
  "جراح شبكية دبي, أخصائي شبكية الإمارات, طبيب عيون دبي, الدكتور آرمان مولازاده, استشاري عيون دبي";

export const Route = createFileRoute("/ar_/about")({
  head: () => ({
    meta: seoMeta({
      lang: "ar",
      page: "about",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
      ogType: "profile",
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      RTL_LINK,
      ...seoAlternates("about", "ar"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "ar", page: "about", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="ar" page="about" />,
});

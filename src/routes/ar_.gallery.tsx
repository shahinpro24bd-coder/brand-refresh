import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "معرض الفيديو | الدكتور آرمان مولازاده، جراح شبكية في دبي";
const DESCRIPTION =
  "شاهد فيديوهات تعليمية قصيرة عن الشبكية والساد وأمراض العين السكرية من الدكتور آرمان مولازاده، جراح الشبكية والجسم الزجاجي في دبي.";
const KEYWORDS =
  "فيديوهات جراحة الشبكية دبي, نصائح العيون الإمارات, الدكتور آرمان مولازاده فيديو";

export const Route = createFileRoute("/ar_/gallery")({
  head: () => ({
    meta: seoMeta({
      lang: "ar",
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
      RTL_LINK,
      ...seoAlternates("gallery", "ar"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "ar", page: "gallery", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="ar" page="gallery" />,
});

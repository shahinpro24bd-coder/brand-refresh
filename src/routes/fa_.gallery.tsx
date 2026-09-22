import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "گالری ویدیو | دکتر آرمان مولازاده، جراح شبکیه در دبی";
const DESCRIPTION =
  "ویدیوهای آموزشی کوتاه درباره شبکیه، آب مروارید و بیماری چشمی دیابتی از دکتر آرمان مولازاده، جراح شبکیه و زجاجیه در دبی.";
const KEYWORDS =
  "ویدیو جراحی شبکیه دبی, نکات سلامت چشم امارات, دکتر آرمان مولازاده ویدیو";

export const Route = createFileRoute("/fa_/gallery")({
  head: () => ({
    meta: seoMeta({
      lang: "fa",
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
      ...seoAlternates("gallery", "fa"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "fa", page: "gallery", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="fa" page="gallery" />,
});

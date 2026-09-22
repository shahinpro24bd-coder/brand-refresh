import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "درباره دکتر آرمان مولازاده | جراح شبکیه در دبی";
const DESCRIPTION =
  "درباره دکتر آرمان مولازاده، جراح شبکیه و زجاجیه دارای مجوز DHA در دبی: تحصیلات پزشکی، فلوشیپ، تخصص بالینی و سابقه جراحی.";
const KEYWORDS =
  "جراح شبکیه دبی, متخصص شبکیه امارات, چشم پزشک دبی, دکتر آرمان مولازاده, فوق تخصص شبکیه دبی";

export const Route = createFileRoute("/fa_/about")({
  head: () => ({
    meta: seoMeta({
      lang: "fa",
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
      ...seoAlternates("about", "fa"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "fa", page: "about", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="fa" page="about" />,
});

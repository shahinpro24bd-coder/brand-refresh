import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "خدمات چشم پزشکی | دکتر آرمان مولازاده، جراح شبکیه در دبی";
const DESCRIPTION =
  "جراحی پارگی و جداشدگی شبکیه، ویترکتومی، رتینوپاتی دیابتی، تزریق داخل چشمی، لیزر، بیماری‌های ماکولا، آب مروارید و جراحی رفرکتیو در دبی.";
const KEYWORDS =
  "جراحی پارگی شبکیه دبی, ویترکتومی دبی, درمان رتینوپاتی دیابتی امارات, تزریق داخل چشم دبی, جراحی آب مروارید دبی, لیزیک دبی";

export const Route = createFileRoute("/fa_/services")({
  head: () => ({
    meta: seoMeta({
      lang: "fa",
      page: "services",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      RTL_LINK,
      ...seoAlternates("services", "fa"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "fa", page: "services", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="fa" page="services" />,
});

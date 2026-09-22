import { createFileRoute } from "@tanstack/react-router";

import { pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const HERO_IMAGE = "/legacy/img/dr-arman-hero.webp";

const TITLE = "فوق تخصص شبکیه چشم در دبی | دکتر آرمان مولازاده";
const DESCRIPTION =
  "مرکز مراقبت چشم دکتر آرمان با دکتر آرمان مولازاده، فوق تخصص جراحی شبکیه و ویتره در دبی برای درمان شبکیه، دیابت، ماکولا، آب مروارید و لیزیک.";
const KEYWORDS =
  "فوق تخصص شبکیه دبی, جراح شبکیه در دبی, جراحی جداشدگی شبکیه دبی, درمان رتینوپاتی دیابتی دبی, تزریق داخل چشمی دبی, دژنراسیون ماکولا دبی, جراحی آب مروارید دبی, لیزیک دبی, چشم پزشک ایرانی دبی, دکتر آرمان مولازاده";

export const Route = createFileRoute("/fa")({
  head: () => ({
    meta: seoMeta({
      lang: "fa",
      page: "home",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      { rel: "preload", as: "image", href: HERO_IMAGE, fetchPriority: "high" },
      ...LEGACY_LINKS,
      RTL_LINK,
      ...seoAlternates("home", "fa"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "fa", page: "home", title: TITLE, description: DESCRIPTION }),
        ),
      },
    ],
  }),
  component: () => <LegacyPage lang="fa" />,
});

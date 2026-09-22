import { createFileRoute } from "@tanstack/react-router";

import { clinicSchema, pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { CONTACT_LINK, ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "تواصل مع الدكتور آرمان مولازاده | حجز موعد في دبي";
const DESCRIPTION =
  "احجز موعداً مع الدكتور آرمان مولازاده، جراح الشبكية والجسم الزجاجي المرخّص من هيئة الصحة بدبي عبر الهاتف أو واتساب أو نموذج الحجز.";
const KEYWORDS =
  "حجز موعد طبيب عيون دبي, موعد أخصائي شبكية دبي, واتساب طبيب عيون دبي, مركز نيو فيجن دبي";

export const Route = createFileRoute("/ar_/contact")({
  head: () => ({
    meta: seoMeta({
      lang: "ar",
      page: "contact",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      CONTACT_LINK,
      RTL_LINK,
      ...seoAlternates("contact", "ar"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "ar", page: "contact", title: TITLE, description: DESCRIPTION }),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(clinicSchema("ar", DESCRIPTION)),
      },
    ],
  }),
  component: () => <LegacyPage lang="ar" page="contact" />,
});

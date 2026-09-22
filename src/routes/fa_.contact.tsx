import { createFileRoute } from "@tanstack/react-router";

import { clinicSchema, pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { CONTACT_LINK, ABOUT_LINK, LEGACY_LINKS, LegacyPage, RTL_LINK } from "@/components/LegacyPage";

const TITLE = "تماس با دکتر آرمان مولازاده | رزرو نوبت در دبی";
const DESCRIPTION =
  "برای رزرو نوبت با دکتر آرمان مولازاده، جراح شبکیه و زجاجیه دارای مجوز DHA در دبی، تماس بگیرید، واتساپ بزنید یا فرم نوبت را ارسال کنید.";
const KEYWORDS =
  "نوبت چشم پزشک دبی, وقت متخصص شبکیه دبی, واتساپ چشم پزشک دبی, کلینیک نیو ویژن دبی";

export const Route = createFileRoute("/fa_/contact")({
  head: () => ({
    meta: seoMeta({
      lang: "fa",
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
      ...seoAlternates("contact", "fa"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "fa", page: "contact", title: TITLE, description: DESCRIPTION }),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(clinicSchema("fa", DESCRIPTION)),
      },
    ],
  }),
  component: () => <LegacyPage lang="fa" page="contact" />,
});

import { createFileRoute } from "@tanstack/react-router";

import { clinicSchema, pageSchema, seoAlternates, seoMeta } from "@/lib/seo";

import { CONTACT_LINK, ABOUT_LINK, LEGACY_LINKS, LegacyPage } from "@/components/LegacyPage";

const TITLE = "Contact Dr. Arman Molazadeh | Book an Eye Appointment in Dubai";
const DESCRIPTION =
  "Book an appointment with Dr. Arman Molazadeh, DHA-licensed vitreoretinal surgeon in Dubai. Call, WhatsApp or send the appointment form.";
const KEYWORDS =
  "book eye appointment Dubai, retina specialist appointment Dubai, WhatsApp eye doctor Dubai, ophthalmologist contact UAE, New Vision Eye Center Dubai";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: seoMeta({
      lang: "en",
      page: "contact",
      title: TITLE,
      description: DESCRIPTION,
      keywords: KEYWORDS,
    }),
    links: [
      ...LEGACY_LINKS,
      ABOUT_LINK,
      CONTACT_LINK,
      ...seoAlternates("contact", "en"),
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          pageSchema({ lang: "en", page: "contact", title: TITLE, description: DESCRIPTION }),
        ),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify(clinicSchema("en", DESCRIPTION)),
      },
    ],
  }),
  component: () => <LegacyPage lang="en" page="contact" />,
});

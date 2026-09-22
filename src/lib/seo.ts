import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER, type Lang } from "./i18n";

export const CLINIC = {
  name: "New Vision Eye Center",
  phone: "+97144519595",
  email: "dr.mowlazadeh@gmail.com",
  city: "Dubai",
  country: "AE",
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  bookingMessage: WHATSAPP_MESSAGE,
};

const DOCTOR_NAME: Record<Lang, string> = {
  en: "Dr. Arman Molazadeh, MD",
  ar: "الدكتور آرمان مولازاده",
  fa: "دکتر آرمان مولازاده",
};

const BRAND_NAME: Record<Lang, string> = {
  en: "Dr. Arman Eye Care",
  ar: "مركز الدكتور آرمان للعناية بالعيون",
  fa: "مرکز مراقبت چشم دکتر آرمان",
};

const CITY: Record<Lang, string> = { en: "Dubai", ar: "دبي", fa: "دبی" };

/**
 * Physician + MedicalBusiness graph used on the localized contact pages so
 * search engines get clinic location, contact details and doctor data.
 */
export function clinicSchema(lang: Lang, description: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalBusiness", "MedicalClinic"],
        "@id": "#clinic",
        name: BRAND_NAME[lang],
        alternateName: [CLINIC.name, "Dr Arman Eye Care"],
        description,
        telephone: CLINIC.phone,
        email: CLINIC.email,
        inLanguage: lang,
        address: {
          "@type": "PostalAddress",
          addressLocality: CITY[lang],
          addressRegion: CITY[lang],
          addressCountry: CLINIC.country,
        },
        areaServed: [
          { "@type": "City", name: "Dubai" },
          { "@type": "Country", name: "United Arab Emirates" },
        ],
        medicalSpecialty: "Ophthalmologic",
        availableLanguage: ["English", "Arabic", "Persian"],
        potentialAction: {
          "@type": "ReserveAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${CLINIC.whatsapp}?text=${encodeURIComponent(CLINIC.bookingMessage)}`,
            inLanguage: lang,
            actionPlatform: [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform",
            ],
          },
        },
      },
      {
        "@type": "Physician",
        "@id": "#physician",
        name: DOCTOR_NAME[lang],
        alternateName: ["Dr. Arman Molazadeh, MD", "Dr Arman Eye Care"],
        medicalSpecialty: "Ophthalmologic",
        description,
        telephone: CLINIC.phone,
        email: CLINIC.email,
        knowsLanguage: ["en", "ar", "fa"],
        worksFor: { "@id": "#clinic" },
        address: {
          "@type": "PostalAddress",
          addressLocality: CITY[lang],
          addressCountry: CLINIC.country,
        },
        availableService: [
          { "@type": "MedicalProcedure", name: "Retinal detachment surgery" },
          { "@type": "MedicalProcedure", name: "Pars plana vitrectomy" },
          { "@type": "MedicalProcedure", name: "Intravitreal injections" },
          { "@type": "MedicalProcedure", name: "Retinal laser treatment" },
          { "@type": "MedicalProcedure", name: "Cataract surgery" },
          { "@type": "MedicalProcedure", name: "LASIK and refractive surgery" },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------ *
 * Shared per-page SEO for every English / Arabic / Persian page.
 *
 * Every public page gets: absolute canonical, absolute hreflang set for the
 * three languages, social cards with an absolute image, brand keywords in
 * Latin script (so "dr arman molazadeh" / "dr arman eye care" searches match
 * on the Arabic and Persian pages too) and a WebPage + Physician +
 * BreadcrumbList structured-data graph in the page language.
 * ------------------------------------------------------------------ */

import type { Page } from "./i18n";
import { absoluteUrl } from "./site-origin";

const PAGE_PATH: Record<Page, string> = {
  home: "",
  about: "/about",
  services: "/services",
  gallery: "/gallery",
  reviews: "/patient-reviews",
  contact: "/contact",
};

const LANG_PREFIX: Record<Lang, string> = { en: "", ar: "/ar", fa: "/fa" };

const OG_LOCALE: Record<Lang, string> = { en: "en_AE", ar: "ar_AE", fa: "fa_IR" };

const HREFLANGS: { code: string; lang: Lang }[] = [
  { code: "en", lang: "en" },
  { code: "en-AE", lang: "en" },
  { code: "ar", lang: "ar" },
  { code: "ar-AE", lang: "ar" },
  { code: "fa", lang: "fa" },
  { code: "fa-IR", lang: "fa" },
];

/** Social preview image (JPEG for widest social-network support). */
const SOCIAL_IMAGE = "/legacy/img/dr-arman-hero.jpg";

/** Name searches that must resolve to this site in any of the three languages. */
const LATIN_BRAND_KEYWORDS =
  "Dr Arman Molazadeh, Dr. Arman Molazadeh, dr arman molazadeh dubai, Dr Arman, Dr Arman Eye Care, Dr. Arman Eye Care, dr arman eye care dubai, Arman Mowlazadeh, Arman Molazadeh ophthalmologist";

const NATIVE_BRAND_KEYWORDS: Record<Lang, string> = {
  en: "Dr Arman eye clinic Dubai, Dr Arman retina specialist",
  ar: "الدكتور آرمان مولازاده, دكتور آرمان, مركز الدكتور آرمان للعناية بالعيون, دكتور آرمان عيون دبي",
  fa: "دکتر آرمان مولازاده, دکتر آرمان, مرکز مراقبت چشم دکتر آرمان, دکتر آرمان چشم پزشک دبی",
};

const SITE_NAME: Record<Lang, string> = {
  en: "Dr. Arman Eye Care | Dr. Arman Molazadeh",
  ar: "مركز الدكتور آرمان للعناية بالعيون | الدكتور آرمان مولازاده",
  fa: "مرکز مراقبت چشم دکتر آرمان | دکتر آرمان مولازاده",
};

const PAGE_LABEL: Record<Lang, Record<Page, string>> = {
  en: {
    home: "Home",
    about: "About",
    services: "Services",
    gallery: "Video gallery",
    reviews: "Patient reviews",
    contact: "Contact",
  },
  ar: {
    home: "الرئيسية",
    about: "نبذة",
    services: "الخدمات",
    gallery: "معرض الفيديو",
    reviews: "تقييمات المرضى",
    contact: "اتصل بنا",
  },
  fa: {
    home: "خانه",
    about: "درباره",
    services: "خدمات",
    gallery: "گالری ویدیو",
    reviews: "نظرات بیماران",
    contact: "تماس",
  },
};

/** Root-relative path of a page in a language. */
export function pagePath(lang: Lang, page: Page): string {
  return `${LANG_PREFIX[lang]}${PAGE_PATH[page]}` || "/";
}

type MetaTag = Record<string, string>;
type LinkTagLike = Record<string, string>;

export function seoMeta(options: {
  lang: Lang;
  page: Page;
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
}): MetaTag[] {
  const { lang, page, title, description, keywords, ogType = "website" } = options;
  const url = absoluteUrl(pagePath(lang, page));
  const image = absoluteUrl(SOCIAL_IMAGE);
  const keywordList = [keywords, NATIVE_BRAND_KEYWORDS[lang], LATIN_BRAND_KEYWORDS]
    .filter(Boolean)
    .join(", ");

  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywordList },
    {
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
    { name: "author", content: DOCTOR_NAME_PUBLIC[lang] },
    { name: "geo.region", content: "AE-DU" },
    { name: "geo.placename", content: "Dubai" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: ogType },
    { property: "og:site_name", content: SITE_NAME[lang] },
    { property: "og:locale", content: OG_LOCALE[lang] },
    ...(["en", "ar", "fa"] as Lang[])
      .filter((other) => other !== lang)
      .map((other) => ({ property: "og:locale:alternate", content: OG_LOCALE[other] })),
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: DOCTOR_NAME_PUBLIC[lang] },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

/** Absolute canonical + hreflang set shared by all three language versions. */
export function seoAlternates(page: Page, lang: Lang): LinkTagLike[] {
  return [
    { rel: "canonical", href: absoluteUrl(pagePath(lang, page)) },
    ...HREFLANGS.map((entry) => ({
      rel: "alternate",
      hrefLang: entry.code,
      href: absoluteUrl(pagePath(entry.lang, page)),
    })),
    { rel: "alternate", hrefLang: "x-default", href: absoluteUrl(pagePath("en", page)) },
  ];
}

const DOCTOR_NAME_PUBLIC: Record<Lang, string> = {
  en: "Dr. Arman Molazadeh, MD",
  ar: "الدكتور آرمان مولازاده",
  fa: "دکتر آرمان مولازاده",
};

/**
 * WebPage + Physician + BreadcrumbList graph so every page in every language
 * carries the doctor and brand names search engines match name queries against.
 */
export function pageSchema(options: {
  lang: Lang;
  page: Page;
  title: string;
  description: string;
}) {
  const { lang, page, title, description } = options;
  const url = absoluteUrl(pagePath(lang, page));
  const home = absoluteUrl(pagePath(lang, "home"));

  const breadcrumb = [
    { name: PAGE_LABEL[lang].home, item: home },
    ...(page === "home" ? [] : [{ name: PAGE_LABEL[lang][page], item: url }]),
  ].map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: entry.name,
    item: entry.item,
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: SITE_NAME[lang],
        inLanguage: lang,
        publisher: { "@id": `${home}#physician` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: lang,
        isPartOf: { "@id": `${home}#website` },
        about: { "@id": `${home}#physician` },
        primaryImageOfPage: { "@type": "ImageObject", url: absoluteUrl(SOCIAL_IMAGE) },
      },
      {
        "@type": ["Physician", "MedicalBusiness"],
        "@id": `${home}#physician`,
        name: DOCTOR_NAME_PUBLIC[lang],
        alternateName: [
          "Dr. Arman Molazadeh, MD",
          "Dr Arman Molazadeh",
          "Dr Arman Eye Care",
          BRAND_NAME[lang],
        ],
        url: home,
        image: absoluteUrl(SOCIAL_IMAGE),
        medicalSpecialty: "Ophthalmologic",
        description,
        telephone: CLINIC.phone,
        email: CLINIC.email,
        inLanguage: lang,
        knowsLanguage: ["en", "ar", "fa"],
        availableLanguage: ["English", "Arabic", "Persian"],
        address: {
          "@type": "PostalAddress",
          addressLocality: CITY[lang],
          addressCountry: CLINIC.country,
        },
        areaServed: [
          { "@type": "City", name: "Dubai" },
          { "@type": "Country", name: "United Arab Emirates" },
        ],
        worksFor: { "@type": "MedicalClinic", name: CLINIC.name },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: breadcrumb,
      },
    ],
  };
}

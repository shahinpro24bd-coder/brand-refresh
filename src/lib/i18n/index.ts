import aboutBodyHtml from "../../legacy/about-body.html?raw";
import galleryBodyHtml from "../../legacy/gallery-body.html?raw";
import reviewsBodyHtml from "../../legacy/reviews-body.html?raw";
import servicesBodyHtml from "../../legacy/services-body.html?raw";
import contactBodyHtml from "../../legacy/contact-body.html?raw";
import bodyHtml from "../../legacy/index-body.html?raw";

import { ar } from "./ar";
import { en } from "./en";
import { fa } from "./fa";
// Plain static file so the logo loads on any host (Lovable, Vercel, etc.).
const SITE_LOGO_URL = "/legacy/img/dr-arman-logo.png";

export type Lang = "en" | "ar" | "fa";
export type Page = "home" | "about" | "services" | "gallery" | "reviews" | "contact";

export const dictionaries: Record<Lang, Record<string, string>> = { en, ar, fa };

export const langDir: Record<Lang, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
  fa: "rtl",
};

export const langPath: Record<Lang, string> = { en: "/", ar: "/ar", fa: "/fa" };

export const aboutPath: Record<Lang, string> = {
  en: "/about",
  ar: "/ar/about",
  fa: "/fa/about",
};

export const servicesPath: Record<Lang, string> = {
  en: "/services",
  ar: "/ar/services",
  fa: "/fa/services",
};

export const galleryPath: Record<Lang, string> = {
  en: "/gallery",
  ar: "/ar/gallery",
  fa: "/fa/gallery",
};

export const contactPath: Record<Lang, string> = {
  en: "/contact",
  ar: "/ar/contact",
  fa: "/fa/contact",
};

export const reviewsPath: Record<Lang, string> = {
  en: "/patient-reviews",
  ar: "/ar/patient-reviews",
  fa: "/fa/patient-reviews",
};

export const ACTION_PHONE_NUMBER = "+971567515919";
export const ACTION_PHONE_DISPLAY = "+971 56 751 5919";
export const WHATSAPP_NUMBER = "971567515919";
export const WHATSAPP_MESSAGE =
  "Hello, I would like to book an appointment with Dr. Arman Molazadeh.";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

const ACTIVE = " active";

const pagePaths: Record<Page, Record<Lang, string>> = {
  home: langPath,
  about: aboutPath,
  services: servicesPath,
  gallery: galleryPath,
  reviews: reviewsPath,
  contact: contactPath,
};

/** Live URL -> which page/language it shows, so the editor can follow site links. */
export function matchSitePath(pathname: string): { lang: Lang; page: Page } | null {
  const clean = `/${pathname.split("?")[0]?.split("#")[0]?.replace(/^\/+|\/+$/g, "") ?? ""}`;
  for (const [page, paths] of Object.entries(pagePaths) as [Page, Record<Lang, string>][]) {
    for (const [lang, path] of Object.entries(paths) as [Lang, string][]) {
      const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
      if (clean === normalized || (clean === "/" && normalized === "/")) {
        return { lang, page };
      }
    }
  }
  return null;
}

/** The editor URL for a page/language pair. */
export function editHref(lang: Lang, page: Page): string {
  const langPart = lang === "en" ? "" : `/${lang}`;
  const pagePart = page === "home" ? "" : `/${page}`;
  const rest = `${langPart}${pagePart}`;
  return rest ? `/edit${rest}` : "/edit";
}

/** Saved editor content: text overrides per language, image replacements per original path. */
export type SiteContent = {
  text: Partial<Record<Lang, Record<string, string>>>;
  images: Record<string, string>;
};

export const EMPTY_SITE_CONTENT: SiteContent = { text: {}, images: {} };

export type RenderOptions = {
  content?: SiteContent;
  editMode?: boolean;
};

const LEGACY_IMG_PATTERN = /\/legacy\/img\/[A-Za-z0-9._/-]+\.(?:jpg|jpeg|png|webp|gif|svg)/gi;

/** Swap replaced images in, and (in edit mode) tag their elements so they can be clicked. */
function applyImages(html: string, images: Record<string, string>, editMode: boolean): string {
  return html.replace(/<[^>]*>/g, (tag) => {
    if (!tag.includes("/legacy/img/")) return tag;
    const paths = tag.match(LEGACY_IMG_PATTERN);
    if (!paths || paths.length === 0) return tag;
    const original = paths[0] as string;
    let next = tag.replace(LEGACY_IMG_PATTERN, (path) => images[path] ?? path);
    if (editMode && !next.includes("data-cms-img=")) {
      next = next.replace(/\s*\/?>$/, ` data-cms-img="${original}">`);
    }
    return next;
  });
}

function render(template: string, lang: Lang, page: Page, options: RenderOptions = {}): string {
  const content = options.content ?? EMPTY_SITE_CONTENT;
  const editMode = options.editMode ?? false;
  const dict = { ...dictionaries[lang], ...(content.text[lang] ?? {}) };

  const pageHeroImageKey = `page-hero:${page}`;

  const values: Record<string, string> = {
    ...dict,
    wa_url: WHATSAPP_URL,
    call_url: `tel:${ACTION_PHONE_NUMBER}`,
    action_phone: ACTION_PHONE_DISPLAY,
    nav_logo: SITE_LOGO_URL,
    footer_logo: SITE_LOGO_URL,
    hero_image: content.images["/legacy/img/dr-arman-hero.webp"] ?? "/legacy/img/dr-arman-hero.webp",
    page_hero_image_key: pageHeroImageKey,
    page_hero_image: content.images[pageHeroImageKey] ?? "/legacy/img/retina-vitreous-care.webp",
    home_url: langPath[lang],
    contact_url: contactPath[lang],
    contact_en_url: contactPath.en,
    contact_ar_url: contactPath.ar,
    contact_fa_url: contactPath.fa,
    en_url: pagePaths[page].en,
    ar_url: pagePaths[page].ar,
    fa_url: pagePaths[page].fa,
    about_url: aboutPath[lang],
    about_en_url: aboutPath.en,
    about_ar_url: aboutPath.ar,
    about_fa_url: aboutPath.fa,
    services_url: servicesPath[lang],
    services_en_url: servicesPath.en,
    services_ar_url: servicesPath.ar,
    services_fa_url: servicesPath.fa,
    gallery_url: galleryPath[lang],
    gallery_en_url: galleryPath.en,
    gallery_ar_url: galleryPath.ar,
    gallery_fa_url: galleryPath.fa,
    reviews_url: reviewsPath[lang],
    reviews_en_url: reviewsPath.en,
    reviews_ar_url: reviewsPath.ar,
    reviews_fa_url: reviewsPath.fa,
    en_active: lang === "en" ? ACTIVE : "",
    ar_active: lang === "ar" ? ACTIVE : "",
    fa_active: lang === "fa" ? ACTIVE : "",
  };

  const substitute = (key: string, match: string) =>
    Object.prototype.hasOwnProperty.call(values, key) ? (values[key] ?? match) : match;

  // One pass over tags AND placeholders: a placeholder matched on its own is in
  // text position (tags are swallowed by the first alternative), so only those
  // get wrapped for inline editing — attribute placeholders stay plain.
  const withValues = template
    .replace(/<[^>]*>|\{\{([a-z0-9_]+)\}\}/gi, (match, key?: string) => {
      if (key === undefined) {
        return match.replace(/\{\{([a-z0-9_]+)\}\}/gi, (m, k: string) => substitute(k, m));
      }
      const value = substitute(key, match);
      const editable =
        editMode && Object.prototype.hasOwnProperty.call(dictionaries[lang], key) === true;
      return editable
        ? `<span class="cms-editable" data-cms-key="${key}" data-cms-lang="${lang}">${value}</span>`
        : value;
    });

  const withAutoText = applyAutoText(withValues, page, lang, dict, editMode);
  const withImages = applyImages(withAutoText, content.images, editMode);

  if (page === "gallery") {
    const reels = parseReelList(content.text.en?.[REELS_TEXT_KEY]);
    const alt = dict["gallery_video_alt"] ?? "Instagram video";
    return withImages.replace(REELS_MARKER, () => renderReelCards(reels, alt, editMode));
  }

  if (page === "reviews") {
    const videos = parseReviewList(content.text.en?.[REVIEWS_TEXT_KEY]);
    const alt = dict["reviews_video_alt"] ?? "Patient review video";
    const empty = dict["reviews_empty"] ?? "";
    return withImages.replace(REVIEWS_MARKER, () =>
      renderReviewCards(videos, alt, editMode, empty),
    );
  }

  return withImages;
}

/**
 * Patient reviews: a saved list of video links from any platform. Each entry is
 * stored as "<platform>:<id>" so the embed URL can be rebuilt at render time.
 */
export const REVIEWS_TEXT_KEY = "reviews:videos";
const REVIEWS_MARKER = "<!--REVIEWS-->";

export type ReviewVideo = {
  platform: "youtube" | "instagram" | "facebook";
  id: string;
  shape: "wide" | "portrait";
};

/** Accepts a YouTube, Instagram or Facebook video link (or a bare YouTube id). */
export function parseVideoLink(input: string): ReviewVideo | null {
  const raw = input.trim();
  if (!raw) return null;

  const yt =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/i.exec(
      raw,
    );
  if (yt?.[1]) {
    return {
      platform: "youtube",
      id: yt[1],
      shape: /youtube\.com\/shorts\//i.test(raw) ? "portrait" : "wide",
    };
  }

  const ig = /instagram\.com\/(?:[^/]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i.exec(raw);
  if (ig?.[1]) return { platform: "instagram", id: ig[1], shape: "portrait" };

  if (/(?:facebook\.com|fb\.watch)\//i.test(raw)) {
    const url = raw.split(/\s+/)[0] ?? raw;
    if (/^https?:\/\//i.test(url) && url.length <= 500) {
      const portrait = /facebook\.com\/(?:reel|share\/r)\//i.test(url);
      return { platform: "facebook", id: url, shape: portrait ? "portrait" : "wide" };
    }
    return null;
  }

  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) {
    return { platform: "youtube", id: raw, shape: "wide" };
  }
  return null;
}

export function reviewVideoValue(video: ReviewVideo): string {
  return `${video.platform}:${video.shape}:${video.id}`;
}

export function reviewVideoIdentity(video: ReviewVideo): string {
  return `${video.platform}:${video.id}`;
}

function parseStoredReview(value: string): ReviewVideo | null {
  const at = value.indexOf(":");
  if (at === -1) return null;
  const platform = value.slice(0, at);
  let id = value.slice(at + 1);
  let shape: ReviewVideo["shape"] = platform === "instagram" ? "portrait" : "wide";
  if (id.startsWith("portrait:") || id.startsWith("wide:")) {
    const shapeEnd = id.indexOf(":");
    shape = id.slice(0, shapeEnd) as ReviewVideo["shape"];
    id = id.slice(shapeEnd + 1);
  }
  if (!id) return null;
  if (platform === "youtube" || platform === "instagram") {
    return SHORTCODE.test(id) ? { platform, id, shape } : null;
  }
  if (platform === "facebook") {
    return /^https?:\/\//i.test(id) ? { platform, id, shape } : null;
  }
  return null;
}

/** Saved value -> clean list of review videos. */
export function parseReviewList(raw: string | undefined): ReviewVideo[] {
  if (!raw) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const list: ReviewVideo[] = [];
  for (const entry of parsed) {
    if (typeof entry !== "string") continue;
    const video = parseStoredReview(entry);
    if (!video) continue;
    const key = reviewVideoValue(video);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(video);
  }
  return list;
}

export function serializeReviewList(videos: ReviewVideo[]): string {
  return JSON.stringify(videos.map(reviewVideoValue));
}

export function reviewEmbedUrl(video: ReviewVideo): string {
  if (video.platform === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}`;
  }
  if (video.platform === "instagram") {
    return `https://www.instagram.com/reel/${video.id}/embed`;
  }
  return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(video.id)}&show_text=false`;
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function renderReviewCards(
  videos: ReviewVideo[],
  alt: string,
  editMode: boolean,
  emptyText: string,
): string {
  if (videos.length === 0) {
    return `<div class="col-12 text-center"><p class="mb-0">${emptyText}</p></div>`;
  }
  return videos
    .map((video, i) => {
      const value = reviewVideoValue(video);
      const delay = `0.${(i % 5) + 1}s`;
      const remove = editMode
        ? `<button type="button" class="cms-reel-remove" data-cms-review-remove="${escapeAttr(value)}">Remove video</button>`
        : "";
       const shape = `review-card--${video.shape}`;
      return `<div class="col-md-6 col-lg-4 wow fadeIn" data-wow-delay="${delay}" data-cms-review="${escapeAttr(value)}">
                    <div class="reel-card review-card ${shape}">
                        <iframe data-reel-src="${escapeAttr(reviewEmbedUrl(video))}" loading="lazy" title="${escapeAttr(alt)} ${i + 1}" frameborder="0" scrolling="no" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe>
                        ${remove}
                    </div>
                </div>`;
    })
    .join("\n");
}

/**
 * The video gallery is a saved list of Instagram post codes, so the admin can
 * post a new reel by pasting its link. It lives in the same text store under
 * one shared key (videos are not translated).
 */
export const REELS_TEXT_KEY = "gallery:reels";
const REELS_MARKER = "<!--REELS-->";

export const DEFAULT_REELS: string[] = [
  "DcSm1T1tKxf",
  "Dcp54LatVSo",
  "DcxhugLN0_Q",
  "DdB1tWFt2Dg",
  "DdJeFfjNfJ6",
  "DdQcdUMtfvD",
  "DZHNi9ANjEZ",
  "DZRmbrMNzal",
];

const SHORTCODE = /^[A-Za-z0-9_-]{4,40}$/;

/** Accepts a full Instagram link (reel, post or tv) or a bare post code. */
export function instagramShortcode(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const fromUrl = /instagram\.com\/(?:[^/]+\/)?(?:reels?|p|tv)\/([A-Za-z0-9_-]+)/i.exec(raw);
  const code = fromUrl?.[1] ?? raw.replace(/^@/, "");
  return SHORTCODE.test(code) ? code : null;
}

/** Saved value -> clean list of post codes (falls back to the shipped videos). */
export function parseReelList(raw: string | undefined): string[] {
  if (raw === undefined) return DEFAULT_REELS;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_REELS;
  }
  if (!Array.isArray(parsed)) return DEFAULT_REELS;
  const codes = parsed.filter((c): c is string => typeof c === "string" && SHORTCODE.test(c));
  return Array.from(new Set(codes));
}

export function serializeReelList(codes: string[]): string {
  return JSON.stringify(codes);
}

function renderReelCards(codes: string[], alt: string, editMode: boolean): string {
  return codes
    .map((code, i) => {
      const delay = `0.${(i % 5) + 1}s`;
      const remove = editMode
        ? `<button type="button" class="cms-reel-remove" data-cms-reel-remove="${code}">Remove video</button>`
        : "";
      return `<div class="col-md-6 col-lg-4 col-xl-3 wow fadeIn" data-wow-delay="${delay}" data-cms-reel="${code}">
                    <div class="reel-card">
                        <iframe data-reel-src="https://www.instagram.com/reel/${code}/embed" loading="lazy" title="${alt} ${i + 1}" frameborder="0" scrolling="no" allowtransparency="true" allowfullscreen></iframe>
                        ${remove}
                    </div>
                </div>`;
    })
    .join("\n");
}

/**
 * Every remaining piece of wording in the legacy markup (everything that is not
 * a {{placeholder}}) gets a stable auto key like `home:t42`, numbered by its
 * position in the template. Saved edits for those keys live in the same
 * site_text store as the placeholder keys, so the live site shows them too.
 */
const SKIP_TEXT_IN = new Set(["script", "style", "textarea", "title", "option", "select", "svg"]);
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export function autoTextKey(page: Page, index: number): string {
  return `${page}:t${index}`;
}

function applyAutoText(
  html: string,
  page: Page,
  lang: Lang,
  dict: Record<string, string>,
  editMode: boolean,
): string {
  const stack: string[] = [];
  let editableDepth = 0;
  let index = 0;

  return html.replace(
    /<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]*>|[^<]+/gi,
    (token) => {
      if (token.startsWith("<")) {
        const close = /^<\/\s*([a-z0-9-]+)/i.exec(token);
        if (close) {
          const name = (close[1] ?? "").toLowerCase();
          if (editableDepth > 0 && name === "span") editableDepth -= 1;
          const at = stack.lastIndexOf(name);
          if (at !== -1) stack.splice(at);
          return token;
        }
        const open = /^<\s*([a-z0-9-]+)/i.exec(token);
        if (open) {
          const name = (open[1] ?? "").toLowerCase();
          const selfClosing = /\/>$/.test(token) || VOID_TAGS.has(name);
          if (!selfClosing) {
            stack.push(name);
            if (editableDepth > 0 && name === "span") editableDepth += 1;
            if (name === "span" && token.includes("cms-editable")) editableDepth = 1;
          }
        }
        return token;
      }

      // Text node: numbered in document order so the key stays stable.
      const current = index++;
      if (editableDepth > 0) return token;
      if (stack.some((name) => SKIP_TEXT_IN.has(name))) return token;
      if (!token.trim() || !/[\p{L}\p{N}]/u.test(token)) return token;

      const key = autoTextKey(page, current);
      const saved = Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;
      const leading = /^\s*/.exec(token)?.[0] ?? "";
      const trailing = /\s*$/.exec(token)?.[0] ?? "";
      const value = saved ?? token.trim();

      if (!editMode) return saved === undefined ? token : `${leading}${value}${trailing}`;
      return `${leading}<span class="cms-editable cms-auto" data-cms-key="${key}" data-cms-lang="${lang}">${value}</span>${trailing}`;
    },
  );
}


const templates: Record<Page, string> = {
  home: bodyHtml,
  about: aboutBodyHtml,
  services: servicesBodyHtml,
  gallery: galleryBodyHtml,
  reviews: reviewsBodyHtml,
  contact: contactBodyHtml,
};

export function renderSitePage(lang: Lang, page: Page, options: RenderOptions = {}): string {
  return render(templates[page], lang, page, options);
}

export function renderPage(lang: Lang, options?: RenderOptions): string {
  return renderSitePage(lang, "home", options);
}

export function renderAboutPage(lang: Lang, options?: RenderOptions): string {
  return renderSitePage(lang, "about", options);
}

export function renderServicesPage(lang: Lang, options?: RenderOptions): string {
  return renderSitePage(lang, "services", options);
}

export function renderGalleryPage(lang: Lang, options?: RenderOptions): string {
  return renderSitePage(lang, "gallery", options);
}

export function renderReviewsPage(lang: Lang, options?: RenderOptions): string {
  return renderSitePage(lang, "reviews", options);
}

export function renderContactPage(lang: Lang, options?: RenderOptions): string {
  return renderSitePage(lang, "contact", options);
}

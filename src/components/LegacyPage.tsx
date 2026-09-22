import { useEffect, useMemo, type JSX } from "react";
import { useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import {
  editHref,
  langDir,
  matchSitePath,
  renderSitePage,
  type Lang,
  type Page,
} from "@/lib/i18n";
import { siteContentQueryOptions } from "@/lib/site-content";


// Re-executed after client-side page changes so newly rendered markup is wired
// up. The larger page-specific script is only fetched where its controls exist.
const pageScripts = (page: Page) =>
  page === "home" || page === "services" || page === "contact"
    ? ["/legacy/js/main.js", "/legacy/inline.js"]
    : ["/legacy/js/main.js"];

// Icon fonts are now requested in the document head (see LEGACY_LINKS) so the
// icons paint with the rest of the page instead of popping in seconds later.
const DEFERRED_STYLESHEETS: string[] = [];


// Page scripts must re-run after every client-side page change, but their file
// contents never change, so they are downloaded once and replayed from memory
// (a fresh module URL each time keeps top-level declarations from colliding).
const pageScriptSources = new Map<string, Promise<string | null>>();

function fetchPageScript(src: string): Promise<string | null> {
  let pending = pageScriptSources.get(src);
  if (!pending) {
    pending = fetch(src)
      .then((res) => (res.ok ? res.text() : null))
      .catch(() => null);
    pageScriptSources.set(src, pending);
  }
  return pending;
}

function runPageScript(src: string): Promise<void> {
  return fetchPageScript(src).then((code) => {
    if (code === null) return;
    const url = URL.createObjectURL(new Blob([code], { type: "text/javascript" }));
    return new Promise<void>((resolve) => {
      const el = document.createElement("script");
      el.type = "module";
      el.src = url;
      el.async = false;
      el.dataset["legacy"] = src;
      const done = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      el.onload = done;
      el.onerror = done;
      document.body.appendChild(el);
    });
  });
}

function whenIdle(run: () => void) {
  const w = window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(run, { timeout: 1200 });
    return;
  }
  window.setTimeout(run, 1);
}

/** Add lazy-loading/decoding hints to legacy markup images and embeds. */
function optimizeImages(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, (tag) => {
      if (/\sloading=/i.test(tag)) return tag;
      const isCritical = /heroSliderImg|nav-logo/i.test(tag);
      const extra = isCritical
        ? ' decoding="async" fetchpriority="high"'
        : ' loading="lazy" decoding="async"';
      const dimensions = /heroSliderImg/i.test(tag) ? ' width="1034" height="1024"' : "";
      return tag.replace(/\s*\/?>$/, `${extra}${dimensions}>`);
    })
    .replace(/<iframe\b[^>]*>/gi, (tag) =>
      /\sloading=/i.test(tag) ? tag : tag.replace(/\s*\/?>$/, ' loading="lazy">'),
    )
    // The legacy full-screen loading overlay would otherwise cover the page
    // every time the markup re-renders (e.g. right after saving an edit).
    .replace(/(<div\s+id="spinner"[^>]*class=")show\s*/i, "$1");
}


export function LegacyPage({
  lang,
  page = "home",
  editMode = false,
}: {
  lang: Lang;
  page?: Page;
  editMode?: boolean;
}) {
  const router = useRouter();
  const { data: content } = useSuspenseQuery(siteContentQueryOptions);
  const html = useMemo(
    () => optimizeImages(renderSitePage(lang, page, { content, editMode })),
    [lang, page, content, editMode],
  );


  // Icon stylesheets, loaded non-blocking after mount.
  useEffect(() => {
    whenIdle(() => {
      DEFERRED_STYLESHEETS.forEach((href) => {
        if (document.querySelector(`link[data-deferred-css="${href}"]`)) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.media = "print";
        link.dataset["deferredCss"] = href;
        link.onload = () => {
          link.media = "all";
        };
        document.head.appendChild(link);
      });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", langDir[lang]);
    document.getElementById("spinner")?.classList.remove("show");

    // Page scripts are tiny and dependency-free now, so they run right after
    // the first paint instead of landing as one long task while the user is
    // already scrolling.
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        void (async () => {
          for (const src of pageScripts(page)) {
            if (cancelled) return;
            await runPageScript(src);
          }
        })();
      });
    });


    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };

  }, [lang, page]);

  // Video gallery: each Instagram player only loads when its card scrolls near
  // the viewport, so the page opens instantly.
  useEffect(() => {
    if (page !== "gallery" && page !== "reviews") return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".reel-card"));
    if (cards.length === 0) return;

    const loadReel = (card: HTMLElement) => {
      const iframe = card.querySelector<HTMLIFrameElement>("iframe[data-reel-src]");
      if (!iframe) return;
      const src = iframe.dataset["reelSrc"];
      if (!src) return;
      iframe.src = src;
      iframe.removeAttribute("data-reel-src");
    };

    if (!("IntersectionObserver" in window)) {
      cards.forEach(loadReel);
      return;
    }

    let warmed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          if (!warmed) {
            warmed = true;
            const link = document.createElement("link");
            link.rel = "preconnect";
            link.href = "https://www.instagram.com";
            document.head.appendChild(link);
          }
          loadReel(entry.target as HTMLElement);
        });
      },
      { rootMargin: "400px 0px", threshold: 0.01 },
    );
    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, [page, html]);

  // Service-card photography is stored as data attributes so below-the-fold
  // images do not download until a visitor scrolls near them.
  useEffect(() => {
    if (page !== "services") return;
    const images = Array.from(document.querySelectorAll<HTMLElement>(".ser9[data-bg]"));
    const reveal = (element: HTMLElement) => {
      const src = element.dataset["bg"];
      if (!src) return;
      element.style.backgroundImage = `url("${src}")`;
      element.removeAttribute("data-bg");
    };
    if (!("IntersectionObserver" in window)) {
      images.forEach(reveal);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          reveal(entry.target as HTMLElement);
        });
      },
      { rootMargin: "500px 0px", threshold: 0.01 },
    );
    images.forEach((image) => observer.observe(image));
    return () => observer.disconnect();
  }, [page, html]);

  useEffect(() => {
    if (page !== "gallery" && page !== "reviews") return;

    let activeReel: HTMLIFrameElement | null = null;
    const reelSelector = ".reel-card iframe";
    const restoreTimers = new Map<HTMLIFrameElement, number>();

    const stopReel = (iframe: HTMLIFrameElement) => {
      const src = iframe.getAttribute("src");
      if (!src || src === "about:blank") return;

      const pendingTimer = restoreTimers.get(iframe);
      if (pendingTimer !== undefined) window.clearTimeout(pendingTimer);

      iframe.setAttribute("src", "about:blank");
      const timer = window.setTimeout(() => {
        iframe.setAttribute("src", src);
        restoreTimers.delete(iframe);
      }, 60);
      restoreTimers.set(iframe, timer);
    };

    const trackActiveReel = () => {
      const focusedElement = document.activeElement;
      if (!(focusedElement instanceof HTMLIFrameElement)) return;
      if (!focusedElement.matches(reelSelector) || focusedElement === activeReel) return;

      const previousReel = activeReel;
      activeReel = focusedElement;
      if (previousReel) stopReel(previousReel);
    };

    const handleWindowBlur = () => window.setTimeout(trackActiveReel, 0);
    const focusWatcher = window.setInterval(trackActiveReel, 150);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      window.clearInterval(focusWatcher);
      restoreTimers.forEach((timer) => window.clearTimeout(timer));
      restoreTimers.clear();
    };
  }, [page, html]);

  // Internal links navigate through the client router (no full page reload),
  // and hover/touch preloads the destination.
  useEffect(() => {
    const isInternal = (anchor: HTMLAnchorElement) => {
      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
      if (!href.startsWith("/") || href.startsWith("//")) return null;
      return href;
    };

    // While editing, a site link must not open the public page (that would drop
    // the editor tools); it opens the same page inside the editor instead.
    if (editMode) {
      const handleEditLinks = (event: MouseEvent) => {
        const element = event.target as HTMLElement | null;
        // Editor controls win over link navigation, even inside a link.
        if (
          element?.closest?.(
            ".cms-toolbar, .cms-image-button, [data-cms-img], [data-cms-key], [data-cms-reel-remove], [data-cms-review-remove]",
          )
        ) {
          return;
        }
        const anchor = element?.closest?.("a");
        if (!anchor) return;
        event.preventDefault();
        event.stopPropagation();
        const href = anchor.getAttribute("href");
        if (!href || !href.startsWith("/") || href.startsWith("//")) return;
        const target = matchSitePath(href);
        if (!target) return;
        const to = editHref(target.lang, target.page);
        if (to === window.location.pathname) return;
        if (
          document.querySelector(".cms-dirty") &&
          !window.confirm("You have unsaved changes. Leave this page anyway?")
        ) {
          return;
        }
        void router.navigate({ href: to });
      };
      document.addEventListener("click", handleEditLinks, true);
      return () => document.removeEventListener("click", handleEditLinks, true);
    }

    const onClick = (event: MouseEvent) => {

      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = isInternal(anchor);
      if (!href) return;
      event.preventDefault();
      event.stopPropagation();
      const [pathname = "/", hash] = href.split("#");
      if (pathname === window.location.pathname) {
        if (hash) {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
          return;
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      void router.navigate({ href });
    };

    const onPointerEnter = (event: Event) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;
      const href = isInternal(anchor);
      if (!href) return;
      const [pathname = "/"] = href.split("#");
      void router.preloadRoute({ to: pathname as never }).catch(() => {});
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerenter", onPointerEnter, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerenter", onPointerEnter, true);
    };
  }, [router, editMode]);

  return <div data-cms-root={editMode ? "1" : undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}

type LinkTag = JSX.IntrinsicElements["link"];

// Fonts and icons are served from this site (no third-party font/CDN round
// trips), and only the icon glyphs the pages actually use are shipped.
export const LEGACY_LINKS: LinkTag[] = [
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "/legacy/fonts/work-sans-400-latin.woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    href: "/legacy/fonts/playfair-display-500-latin.woff2",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: "/legacy/fonts.css" },
  { rel: "stylesheet", href: "/legacy/icons.css" },
  { rel: "stylesheet", href: "/legacy/css/bootstrap.min.css" },
  { rel: "stylesheet", href: "/legacy/css/style.css" },
  { rel: "stylesheet", href: "/legacy/css/html.css" },
  { rel: "stylesheet", href: "/legacy/home.css" },
  { rel: "stylesheet", href: "/legacy/perf.css" },
];


export const RTL_LINK: LinkTag = { rel: "stylesheet", href: "/legacy/rtl.css" };

export const ABOUT_LINK: LinkTag = { rel: "stylesheet", href: "/legacy/about.css" };

export const CONTACT_LINK: LinkTag = { rel: "stylesheet", href: "/legacy/contact.css" };

export const REVIEWS_LINK: LinkTag = { rel: "stylesheet", href: "/legacy/reviews.css" };

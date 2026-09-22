import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { db } from "@/lib/backend";
import { saveSiteContent, uploadSiteImage } from "@/lib/cms-store";
import { siteContentQueryOptions } from "@/lib/site-content";
import {
  REELS_TEXT_KEY,
  REVIEWS_TEXT_KEY,
  instagramShortcode,
  parseReelList,
  parseReviewList,
  parseVideoLink,
  reviewVideoIdentity,
  reviewVideoValue,
  serializeReelList,
  serializeReviewList,
} from "@/lib/i18n";
import type { Lang, Page, SiteContent } from "@/lib/i18n";

const PAGES: { page: Page; label: string }[] = [
  { page: "home", label: "Home" },
  { page: "about", label: "About" },
  { page: "services", label: "Services" },
  { page: "gallery", label: "Video Gallery" },
  { page: "reviews", label: "Patient Reviews" },
  { page: "contact", label: "Contact" },
];

const LANGS: { lang: Lang; label: string }[] = [
  { lang: "en", label: "English" },
  { lang: "ar", label: "العربية" },
  { lang: "fa", label: "فارسی" },
];

export function editPath(lang: Lang, page: Page): string {
  const langPart = lang === "en" ? "" : `/${lang}`;
  const pagePart = page === "home" ? "" : `/${page}`;
  const rest = `${langPart}${pagePart}`;
  return rest ? `/edit${rest}` : "/edit";
}

export function livePath(lang: Lang, page: Page): string {
  const langPart = lang === "en" ? "" : `/${lang}`;
  const pagePart = page === "home" ? "" : `/${page}`;
  return `${langPart}${pagePart}` || "/";
}

export function CmsEditor({ lang, page }: { lang: Lang; page: Page }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Re-reading the saved content here means the editor re-attaches itself to
  // the freshly rendered markup after every save, instead of going dead.
  const { data: content } = useSuspenseQuery(siteContentQueryOptions);
  const save = saveSiteContent;
  const upload = uploadSiteImage;

  const [dirtyTextCount, setDirtyTextCount] = useState(0);
  const [dirtyImageCount, setDirtyImageCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reelInput, setReelInput] = useState("");
  const [postingReel, setPostingReel] = useState(false);

  const dirtyText = useRef(new Map<string, { lang: Lang; key: string; value: string }>());
  const dirtyImages = useRef(new Map<string, string>());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingTarget = useRef<HTMLElement | null>(null);

  // Make every named piece of wording editable in place.
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-cms-key]"));
    const original = new Map<HTMLElement, string>();

    const onInput = (event: Event) => {
      const el = event.currentTarget as HTMLElement;
      const key = el.dataset["cmsKey"];
      const elLang = (el.dataset["cmsLang"] ?? lang) as Lang;
      if (!key) return;
      const value = el.innerHTML.trim();
      if (value === original.get(el)) {
        dirtyText.current.delete(`${elLang}:${key}`);
        el.classList.remove("cms-dirty");
      } else {
        dirtyText.current.set(`${elLang}:${key}`, { lang: elLang, key, value });
        el.classList.add("cms-dirty");
      }
      setDirtyTextCount(dirtyText.current.size);
    };

    const onPaste = (event: ClipboardEvent) => {
      event.preventDefault();
      const text = event.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };

    nodes.forEach((el) => {
      original.set(el, el.innerHTML.trim());
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
      el.addEventListener("input", onInput);
      el.addEventListener("paste", onPaste as EventListener);
    });

    return () => {
      nodes.forEach((el) => {
        el.removeAttribute("contenteditable");
        el.removeEventListener("input", onInput);
        el.removeEventListener("paste", onPaste as EventListener);
      });
    };
  }, [lang, page, content]);

  // "Replace image" affordance on every picture the page shows.
  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cms-img]"));
    const buttons: HTMLElement[] = [];
    const hosts: HTMLElement[] = [];

    const pick = (target: HTMLElement) => {
      pendingTarget.current = target;
      fileInputRef.current?.click();
    };

    const onTargetClick = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      pick(event.currentTarget as HTMLElement);
    };

    const buttonTargets = new Map<HTMLElement, HTMLElement>();

    targets.forEach((target) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cms-image-button";
      button.textContent = "Replace image";
      button.onclick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        pick(target);
      };
      target.classList.add("cms-image-target");
      // Clicking the picture itself works too, in case the badge is clipped.
      target.addEventListener("click", onTargetClick);

      const host = target.tagName === "IMG" ? (target.parentElement ?? document.body) : target;
      host.classList.add("cms-image-host");
      if (getComputedStyle(host).position === "static") host.classList.add("cms-image-host--rel");
      host.appendChild(button);
      hosts.push(host);
      buttons.push(button);
      buttonTargets.set(button, target);
    });

    // Overlays (gradients, links, decorative layers) can swallow clicks before they
    // reach the picture or its badge, so resolve the click by what sits under the pointer.
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      const stack = document.elementsFromPoint(event.clientX, event.clientY) as HTMLElement[];
      if (stack.some((el) => el.closest?.(".cms-toolbar"))) return;
      const badge = stack
        .map((el) => el.closest?.(".cms-image-button") as HTMLElement | null)
        .find((el): el is HTMLElement => Boolean(el));
      const hostTarget = stack
        .map((el) => el.closest?.("[data-cms-img]") as HTMLElement | null)
        .find((el): el is HTMLElement => Boolean(el));
      const overText = stack.some((el) => el.closest?.("[data-cms-key]"));
      const target = (badge ? buttonTargets.get(badge) : undefined) ?? hostTarget;
      if (!target) return;
      if (!badge && overText) return;
      event.preventDefault();
      event.stopPropagation();
      pick(target);
    };

    document.addEventListener("click", onDocumentClick, true);

    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      buttons.forEach((b) => b.remove());
      hosts.forEach((h) => h.classList.remove("cms-image-host", "cms-image-host--rel"));
      targets.forEach((t) => {
        t.classList.remove("cms-image-target");
        t.removeEventListener("click", onTargetClick);
      });
    };

  }, [lang, page, content]);


  const handleFile = useCallback(
    async (file: File) => {
      const target = pendingTarget.current;
      if (!target) return;
      const key = target.dataset["cmsImg"];
      if (!key) return;

      setUploading(true);
      try {
        const { url } = await upload(file);
        if (target.tagName === "IMG") {
          (target as HTMLImageElement).src = url;
        } else {
          target.style.backgroundImage = `url('${url}')`;
          target.setAttribute("data-cms-current-img", url);
        }
        target.classList.add("cms-dirty");
        dirtyImages.current.set(key, url);
        setDirtyImageCount(dirtyImages.current.size);
        toast.success("Image replaced. Remember to save.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload the image");
      } finally {
        setUploading(false);
        pendingTarget.current = null;
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [upload],
  );

  // Video gallery: the admin pastes an Instagram link and the video is posted.
  const reels = parseReelList(content.text.en?.[REELS_TEXT_KEY]);

  const saveReels = useCallback(
    async (next: string[]) => {
      const value = serializeReelList(next);
      await save({ texts: [{ lang: "en" as Lang, key: REELS_TEXT_KEY, value }], images: [] });
      // Show the new list straight away, then refresh from the server.
      queryClient.setQueryData(siteContentQueryOptions.queryKey, (prev?: SiteContent) =>
        prev
          ? { ...prev, text: { ...prev.text, en: { ...(prev.text.en ?? {}), [REELS_TEXT_KEY]: value } } }
          : prev,
      );
      await queryClient.invalidateQueries({ queryKey: siteContentQueryOptions.queryKey });
    },
    [save, queryClient],
  );

  const handlePostReel = useCallback(async () => {
    const code = instagramShortcode(reelInput);
    if (!code) {
      toast.error("That does not look like an Instagram video link.");
      return;
    }
    if (reels.includes(code)) {
      toast.info("This video is already in the gallery.");
      return;
    }
    setPostingReel(true);
    try {
      await saveReels([code, ...reels]);
      setReelInput("");
      toast.success("Video posted to the gallery.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post the video");
    } finally {
      setPostingReel(false);
    }
  }, [reelInput, reels, saveReels]);

  const handleRemoveReel = useCallback(
    async (code: string) => {
      if (!window.confirm("Remove this video from the gallery?")) return;
      setPostingReel(true);
      try {
        await saveReels(reels.filter((c) => c !== code));
        toast.success("Video removed.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove the video");
      } finally {
        setPostingReel(false);
      }
    },
    [reels, saveReels],
  );

  // "Remove video" badges are rendered inside the page markup, so they are
  // handled here by delegation and keep working after every re-render.
  useEffect(() => {
    if (page !== "gallery") return;
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cms-reel-remove]",
      );
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const code = button.dataset["cmsReelRemove"];
      if (code) void handleRemoveReel(code);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [page, handleRemoveReel]);

  // Patient reviews: the admin pastes a YouTube, Facebook or Instagram link.
  const reviews = parseReviewList(content.text.en?.[REVIEWS_TEXT_KEY]);

  const saveReviews = useCallback(
    async (next: typeof reviews) => {
      const value = serializeReviewList(next);
      await save({ texts: [{ lang: "en" as Lang, key: REVIEWS_TEXT_KEY, value }], images: [] });
      queryClient.setQueryData(siteContentQueryOptions.queryKey, (prev?: SiteContent) =>
        prev
          ? {
              ...prev,
              text: { ...prev.text, en: { ...(prev.text.en ?? {}), [REVIEWS_TEXT_KEY]: value } },
            }
          : prev,
      );
      await queryClient.invalidateQueries({ queryKey: siteContentQueryOptions.queryKey });
    },
    [save, queryClient],
  );

  const handlePostReview = useCallback(async () => {
    const video = parseVideoLink(reelInput);
    if (!video) {
      toast.error("Paste a YouTube, Facebook or Instagram video link.");
      return;
    }
    if (reviews.some((v) => reviewVideoIdentity(v) === reviewVideoIdentity(video))) {
      toast.info("This video is already posted.");
      return;
    }
    setPostingReel(true);
    try {
      await saveReviews([video, ...reviews]);
      setReelInput("");
      toast.success("Review video posted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post the video");
    } finally {
      setPostingReel(false);
    }
  }, [reelInput, reviews, saveReviews]);

  const handleRemoveReview = useCallback(
    async (value: string) => {
      if (!window.confirm("Remove this review video?")) return;
      setPostingReel(true);
      try {
        await saveReviews(reviews.filter((v) => reviewVideoValue(v) !== value));
        toast.success("Video removed.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove the video");
      } finally {
        setPostingReel(false);
      }
    },
    [reviews, saveReviews],
  );

  useEffect(() => {
    if (page !== "reviews") return;
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-cms-review-remove]",
      );
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const value = button.dataset["cmsReviewRemove"];
      if (value) void handleRemoveReview(value);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [page, handleRemoveReview]);

  const totalDirty = dirtyTextCount + dirtyImageCount;

  const handleSave = async () => {
    if (totalDirty === 0) {
      toast.info("Nothing to save yet.");
      return;
    }
    setSaving(true);
    try {
      await save({
        texts: Array.from(dirtyText.current.values()),
        images: Array.from(dirtyImages.current.entries()).map(([key, url]) => ({ key, url })),
      });
      dirtyText.current.clear();
      dirtyImages.current.clear();
      setDirtyTextCount(0);
      setDirtyImageCount(0);
      document.querySelectorAll(".cms-dirty").forEach((el) => el.classList.remove("cms-dirty"));
      await queryClient.invalidateQueries({ queryKey: siteContentQueryOptions.queryKey });
      toast.success("Saved. The live site now shows these changes.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the changes");
    } finally {
      setSaving(false);
    }
  };

  const goTo = (nextLang: Lang, nextPage: Page) => {
    if (totalDirty > 0 && !window.confirm("You have unsaved changes. Leave this page anyway?")) {
      return;
    }
    void navigate({ href: editPath(nextLang, nextPage) });
  };

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await db.auth.signOut();
    void navigate({ to: "/admin/login", replace: true });
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <div className="cms-toolbar" dir="ltr">
        <div className="cms-toolbar-row">
          <span className="cms-brand">Page editor</span>
          <select
            value={lang}
            onChange={(event) => goTo(event.target.value as Lang, page)}
            aria-label="Language"
          >
            {LANGS.map((l) => (
              <option key={l.lang} value={l.lang}>
                {l.label}
              </option>
            ))}
          </select>
          <select
            value={page}
            onChange={(event) => goTo(lang, event.target.value as Page)}
            aria-label="Page"
          >
            {PAGES.map((p) => (
              <option key={p.page} value={p.page}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {page === "reviews" ? (
          <div className="cms-toolbar-row">
            <input
              type="url"
              className="cms-reel-input"
              value={reelInput}
              placeholder="Paste a YouTube, Facebook or Instagram video link"
              aria-label="Review video link"
              maxLength={500}
              onChange={(event) => setReelInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handlePostReview();
                }
              }}
            />
            <button type="button" onClick={() => void handlePostReview()} disabled={postingReel}>
              {postingReel ? "Posting..." : "Post video"}
            </button>
          </div>
        ) : null}

        {page === "gallery" ? (
          <div className="cms-toolbar-row">
            <input
              type="url"
              className="cms-reel-input"
              value={reelInput}
              placeholder="Paste Instagram video link"
              aria-label="Instagram video link"
              maxLength={300}
              onChange={(event) => setReelInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handlePostReel();
                }
              }}
            />
            <button type="button" onClick={() => void handlePostReel()} disabled={postingReel}>
              {postingReel ? "Posting..." : "Post video"}
            </button>
          </div>
        ) : null}

        <div className="cms-toolbar-row">
          <button type="button" onClick={handleSave} disabled={saving || uploading}>
            {saving ? "Saving..." : totalDirty > 0 ? `Save (${totalDirty})` : "Save"}
          </button>
          <button type="button" onClick={() => window.location.reload()} disabled={saving}>
            Discard
          </button>
          <a href={livePath(lang, page)} target="_blank" rel="noreferrer">
            View live page
          </a>
          <button type="button" onClick={() => void handleSignOut()}>
            Sign out
          </button>
        </div>

        <p className="cms-hint">
          {uploading
            ? "Uploading image..."
            : page === "gallery"
              ? "Paste an Instagram video link and press Post video. Click any text to edit it."
              : page === "reviews"
                ? "Paste a YouTube, Facebook or Instagram video link and press Post video. Click any text to edit it."
                : "Click any text to edit it. Hover a picture to replace it."}
        </p>
      </div>
    </>
  );
}

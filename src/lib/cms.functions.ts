import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { EMPTY_SITE_CONTENT, type Lang, type SiteContent } from "@/lib/i18n";

export const SITE_IMAGE_PREFIX = "/api/public/site-image/";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

// Every page render needs the saved wording, so the result is cached in the
// server isolate for a short while instead of hitting the database per request.
const CONTENT_TTL_MS = 5 * 60_000;
let contentCache: { at: number; value: SiteContent } | null = null as
  | { at: number; value: SiteContent }
  | null;

/** Public: every page loads saved wording and image replacements through this. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    if (contentCache && Date.now() - contentCache.at < CONTENT_TTL_MS) {
      return contentCache.value;
    }
    if (!process.env["SUPABASE_URL"] || !process.env["SUPABASE_PUBLISHABLE_KEY"]) {
      return EMPTY_SITE_CONTENT;
    }
    const supabase = publicClient();
    const [textRows, imageRows] = await Promise.all([
      supabase.from("site_text").select("lang, key, value"),
      supabase.from("site_image").select("key, url"),
    ]);

    const text: SiteContent["text"] = {};
    for (const row of textRows.data ?? []) {
      const lang = row.lang as Lang;
      text[lang] = { ...(text[lang] ?? {}), [row.key]: row.value };
    }
    const images: Record<string, string> = {};
    for (const row of imageRows.data ?? []) images[row.key] = row.url;

    const value: SiteContent = { text, images };
    contentCache = { at: Date.now(), value };
    return value;
  },
);

async function assertAdmin(context: { supabase: unknown; userId: string }) {
  const supabase = context.supabase as ReturnType<typeof publicClient>;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Forbidden");
}

const savePayload = z.object({
  texts: z
    .array(
      z.object({
        lang: z.enum(["en", "ar", "fa"]),
        key: z.string().min(1).max(120),
        value: z.string().max(20000),
      }),
    )
    .max(2000),
  images: z
    .array(z.object({ key: z.string().min(1).max(300), url: z.string().min(1).max(600) }))
    .max(200),
});

/** Admin only: persists everything the editor changed in one go. */
export const saveSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => savePayload.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const supabase = context.supabase;

    if (data.texts.length > 0) {
      const { error } = await supabase.from("site_text").upsert(
        data.texts.map((t) => ({ ...t, updated_at: new Date().toISOString() })),
        { onConflict: "lang,key" },
      );
      if (error) throw new Error(error.message);
    }
    if (data.images.length > 0) {
      const { error } = await supabase.from("site_image").upsert(
        data.images.map((i) => ({ ...i, updated_at: new Date().toISOString() })),
        { onConflict: "key" },
      );
      if (error) throw new Error(error.message);
    }
    contentCache = null; // saved edits must show up right away
    return { ok: true, saved: data.texts.length + data.images.length };
  });

const uploadPayload = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(3).max(100),
  dataBase64: z.string().min(1),
});

/** Admin only: stores a replacement image and returns the URL the site should use. */
export const uploadSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadPayload.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (!data.contentType.startsWith("image/")) throw new Error("Only image files are allowed");

    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 15 * 1024 * 1024) throw new Error("Image must be smaller than 15 MB");

    const safeName = data.filename.replace(/[^A-Za-z0-9._-]/g, "-").slice(-80);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    // Uploads run as the signed-in admin (storage policies allow it), so the
    // editor keeps working without a service-role key.
    const { error } = await context.supabase.storage
      .from("site-images")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);

    // Visitors can only be served these files when the backend service key is
    // present; the editor warns when it is not.
    const servable = Boolean(process.env["SUPABASE_SERVICE_ROLE_KEY"]);
    return { url: `${SITE_IMAGE_PREFIX}${path}`, servable };
  });

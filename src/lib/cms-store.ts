import { db } from "@/lib/backend";
import { IMAGE_URL_TTL_SECONDS } from "@/lib/backend-config";
import type { Lang } from "@/lib/i18n";

export type TextEdit = { lang: Lang; key: string; value: string };
export type ImageEdit = { key: string; url: string };

/**
 * Saving runs as the signed-in editor directly against the content database,
 * so it works on every hosting provider without extra server configuration.
 */
export async function saveSiteContent(input: { texts: TextEdit[]; images: ImageEdit[] }) {
  const now = new Date().toISOString();

  if (input.texts.length > 0) {
    const { error } = await db
      .from("site_text")
      .upsert(
        input.texts.map((t) => ({ ...t, updated_at: now })),
        { onConflict: "lang,key" },
      );
    if (error) throw new Error(error.message);
  }

  if (input.images.length > 0) {
    const { error } = await db
      .from("site_image")
      .upsert(
        input.images.map((i) => ({ ...i, updated_at: now })),
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
  }

  return { ok: true, saved: input.texts.length + input.images.length };
}

/** Stores a replacement picture and returns the address the site should use. */
export async function uploadSiteImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
  if (file.size > 15 * 1024 * 1024) throw new Error("Image must be smaller than 15 MB");

  const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "-").slice(-80);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const { error } = await db.storage
    .from("site-images")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  const { data, error: urlError } = await db.storage
    .from("site-images")
    .createSignedUrl(path, IMAGE_URL_TTL_SECONDS);
  if (urlError || !data?.signedUrl) {
    throw new Error(urlError?.message ?? "Could not create the image address");
  }

  return { url: data.signedUrl };
}

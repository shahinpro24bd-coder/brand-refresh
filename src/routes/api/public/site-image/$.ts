import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/site-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        // Replacement images live in a private storage bucket, so serving them
        // to visitors needs the backend service key. Without it, fail with a
        // clear message instead of an unexplained crash.
        if (!process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
          return new Response(
            "Image storage is not connected yet: the backend service key is missing.",
            { status: 503, headers: { "cache-control": "no-store" } },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("site-images").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});

import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { setRequestOrigin } from "./lib/site-origin";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/**
 * Long-lived caching for the site's own photos, fonts, icons and stylesheets.
 * These files only change when a new version is deployed, so repeat visits and
 * page-to-page navigation reuse them from the browser cache.
 */
const CACHEABLE = /\.(?:webp|jpe?g|png|gif|svg|ico|woff2?|ttf|css|js|mjs|mp4|webm)$/i;

function withStaticCaching(request: Request, response: Response): Response {
  if (request.method !== "GET" || !response.ok) return response;
  const { pathname } = new URL(request.url);
  if (!CACHEABLE.test(pathname)) return response;
  const existing = response.headers.get("cache-control");
  // Dev serves these with "no-cache"; anything else deliberate is respected.
  if (existing && existing !== "no-cache") return response;
  const immutable = pathname.startsWith("/assets/") || pathname.includes("/fonts/");
  const headers = new Headers(response.headers);
  headers.set(
    "cache-control",
    immutable ? "public, max-age=31536000, immutable" : "public, max-age=604800, stale-while-revalidate=86400",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      // Remember the host so canonical/hreflang/og tags render as absolute URLs.
      setRequestOrigin(new URL(request.url).origin);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withStaticCaching(request, await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};

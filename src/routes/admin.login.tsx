import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/backend";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editor sign in | Dr. Arman Molazadeh" },
      { name: "description", content: "Sign in to edit the website content." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Editor sign in" },
      { property: "og:description", content: "Sign in to edit the website content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

/** The editor account signs in with a username; the stored account uses this address. */
function usernameToEmail(username: string) {
  const clean = username.trim().toLowerCase();
  return clean.includes("@") ? clean : `${clean}@drarman.local`;
}

function AdminLogin() {
  const navigate = useNavigate();
  const { data: setupState, isLoading } = useQuery({
    queryKey: ["editor-setup-state"],
    queryFn: async () => {
      const { data, error } = await db.rpc("has_any_admin");
      if (error) throw new Error(error.message);
      return { setupRequired: data !== true };
    },
    retry: 1,
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const email = usernameToEmail(username);

    if (setupState?.setupRequired) {
      if (password.length < 8) {
        setBusy(false);
        setError("Please use a password with at least 8 characters.");
        return;
      }
      const { error: signUpError } = await db.auth.signUp({ email, password });
      if (signUpError && !/already registered/i.test(signUpError.message)) {
        setBusy(false);
        setError(signUpError.message);
        return;
      }
    }

    const { error: signInError } = await db.auth.signInWithPassword({ email, password });
    if (signInError) {
      setBusy(false);
      setError("That username and password combination did not work.");
      return;
    }

    if (setupState?.setupRequired) {
      const { error: claimError } = await db.rpc("claim_first_admin");
      if (claimError) {
        setBusy(false);
        setError(claimError.message);
        return;
      }
    }

    setBusy(false);
    void navigate({ to: "/edit", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg"
      >
        <h1 className="text-xl font-semibold text-slate-900">
          {setupState?.setupRequired ? "Set up website editor" : "Website editor"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {setupState?.setupRequired
            ? "Create the first editor account for pages and images."
            : "Sign in to edit pages and images."}
        </p>

        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />

        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <Button
          type="submit"
          disabled={busy || isLoading}
          className="mt-6 w-full"
        >
          {busy
            ? setupState?.setupRequired
              ? "Creating account..."
              : "Signing in..."
            : setupState?.setupRequired
              ? "Create editor account"
              : "Sign in"}
        </Button>
      </form>
    </main>
  );
}

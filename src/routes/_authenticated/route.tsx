import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { db } from "@/lib/backend";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  component: () => <Outlet />,
});

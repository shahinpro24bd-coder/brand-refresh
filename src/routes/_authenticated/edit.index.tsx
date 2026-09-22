import { createFileRoute } from "@tanstack/react-router";

import { EditSurface, EDIT_HEAD } from "@/components/EditSurface";

export const Route = createFileRoute("/_authenticated/edit/")({
  head: () => EDIT_HEAD,
  component: () => <EditSurface lang="en" page="home" />,
});

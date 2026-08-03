import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/cabinet")({
  component: lazyRouteComponent(() => import("@/pages/Cabinet")),
});

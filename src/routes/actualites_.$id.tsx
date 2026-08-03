import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/actualites_/$id")({
  component: lazyRouteComponent(() => import("@/pages/NewsDetail")),
});

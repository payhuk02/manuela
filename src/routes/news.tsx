import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/news")({
  component: lazyRouteComponent(() => import("@/pages/Actualites")),
});

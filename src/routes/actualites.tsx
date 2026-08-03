import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/actualites")({
  component: lazyRouteComponent(() => import("@/pages/Actualites")),
});

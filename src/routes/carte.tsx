import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/carte")({
  component: lazyRouteComponent(() => import("@/pages/Carte")),
});

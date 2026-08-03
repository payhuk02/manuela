import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/carte-de-visite")({
  component: lazyRouteComponent(() => import("@/pages/Carte")),
});

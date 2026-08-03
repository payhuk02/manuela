import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/cabinet/carte")({
  component: lazyRouteComponent(() => import("@/pages/Carte")),
});
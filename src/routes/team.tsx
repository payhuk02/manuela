import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/team")({
  component: lazyRouteComponent(() => import("@/pages/Equipe")),
});

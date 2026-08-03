import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/equipe")({
  component: lazyRouteComponent(() => import("@/pages/Equipe")),
});

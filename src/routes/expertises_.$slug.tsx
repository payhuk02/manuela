import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/expertises_/$slug")({
  component: lazyRouteComponent(() => import("@/pages/ExpertiseDetail")),
});

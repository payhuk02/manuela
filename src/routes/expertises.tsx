import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/expertises")({
  component: lazyRouteComponent(() => import("@/pages/Expertises")),
});

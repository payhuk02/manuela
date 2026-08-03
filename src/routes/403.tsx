import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/403")({
  component: lazyRouteComponent(() => import("@/pages/Forbidden")),
});

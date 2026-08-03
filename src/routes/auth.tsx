import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/auth")({
  component: lazyRouteComponent(() => import("@/pages/Auth")),
});

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/$slug")({
  component: lazyRouteComponent(() => import("@/pages/LandingPage")),
});

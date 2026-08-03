import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/expertises_/$slug/faq")({
  component: lazyRouteComponent(() => import("@/pages/ExpertiseFAQ")),
});

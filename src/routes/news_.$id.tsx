import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
export const Route = createFileRoute("/news_/$id")({
  component: lazyRouteComponent(() => import("@/pages/NewsDetail")),
});

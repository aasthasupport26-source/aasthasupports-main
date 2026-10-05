import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { initSentryClient } from "./lib/sentry-client";

// Browser-side error tracking (no-ops unless VITE_SENTRY_DSN is set)
if (typeof window !== "undefined") {
  initSentryClient();
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 10000,
  });

  return router;
};

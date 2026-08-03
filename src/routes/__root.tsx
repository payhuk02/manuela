import { lazy, Suspense, type ReactNode } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { SiteDataProvider } from "@/hooks/SiteDataContext";
import { Chatbot } from "@/components/Chatbot";
import { SiteSeoInjector } from "@/components/SiteSeoInjector";
import NotFound from "@/pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransition } from "@/components/PageTransition";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteThemeInjector } from "@/components/SiteThemeInjector";

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen grid place-items-center text-muted-foreground">
    Chargement…
  </div>
);

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <SiteDataProvider>
                <Suspense fallback={<RouteFallback />}>{children}</Suspense>
                <Chatbot />
                <SiteSeoInjector />
                <CustomCursor />
                <SiteThemeInjector />
              </SiteDataProvider>
            </AuthProvider>
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function RootLayout() {
  return (
    <Providers>
      <PageTransition>
        <Outlet />
      </PageTransition>
    </Providers>
  );
}

function GlobalNotFound() {
  return (
    <Providers>
      <NotFound />
    </Providers>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: GlobalNotFound,
});

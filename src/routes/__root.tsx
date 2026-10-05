import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  // Render a real 404 instead of redirecting home — a redirect hides broken
  // links from customers and produces soft-404s for search engines.
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <p className="text-gold tracking-[0.3em] text-xs">|| ॐ ||</p>
        <h1 className="font-display text-5xl text-maroon-deep mt-4">404</h1>
        <p className="font-display text-2xl text-maroon-deep mt-2">Page Not Found</p>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex mt-6 bg-royal text-cream px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:opacity-90 transition shadow-royal"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Auto-recover only from stale-deploy chunk load failures; every other
      // error gets the error UI below instead of silently bouncing home.
      const msg = error?.message || String(error) || "";
      if (
        msg.includes("Failed to fetch dynamically imported module") ||
        msg.includes("Importing a module script failed") ||
        msg.includes("520")
      ) {
        const lastReload = sessionStorage.getItem("chunk_reload_time");
        if (!lastReload || Date.now() - parseInt(lastReload) > 5000) {
          sessionStorage.setItem("chunk_reload_time", Date.now().toString());
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("v", Date.now().toString());
          window.location.href = newUrl.toString();
        }
      }
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <p className="text-gold tracking-[0.3em] text-xs">|| ॐ ||</p>
        <h1 className="font-display text-3xl text-maroon-deep mt-4">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An unexpected error occurred while loading this page. Please try again.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex bg-royal text-cream px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:opacity-90 transition shadow-royal"
          >
            Try Again
          </button>
          <Link
            to="/"
            className="inline-flex border border-gold/40 text-maroon-deep px-6 py-3 rounded-md text-xs tracking-widest uppercase hover:bg-cream transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aastha Support — Rudraksha, Gemstones & Online Pooja" },
      {
        name: "description",
        content:
          "Certified rudraksha, gemstones, malas, bracelets, yantras and live Vedic poojas — energised by learned pandits. Pan India delivery.",
      },
      { name: "author", content: "Aastha Support" },
      { property: "og:site_name", content: "Aastha Support" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://checkout.razorpay.com" },
      { rel: "preconnect", href: "https://checkout.razorpay.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600;700&family=Tiro+Devanagari+Sanskrit&family=Libre+Baskerville:wght@400;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Aastha Support",
          url: "https://www.aasthasupports.com",
          logo: "https://www.aasthasupports.com/logo.png",
          description:
            "Authentic, certified, Vedic-energised rudraksha, gemstones, malas, bracelets, yantras and live online poojas.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Mampur bana",
            addressLocality: "Lucknow",
            addressRegion: "Uttar Pradesh",
            postalCode: "226201",
            addressCountry: "IN",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-82876-70827",
            contactType: "customer service",
            email: "hello@aasthasupports.com",
            areaServed: "IN",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Chunk-reload recovery for stale deploys. Errors are NOT rendered
              // into the page — raw messages/stacks must never be shown to
              // visitors; they go to the console (and Sentry when configured).
              window.onerror = function(msg, url, line, col, err) {
                var fullMsg = msg + (err ? err.message : '');
                if (fullMsg.includes('Failed to fetch dynamically imported module') || fullMsg.includes('Importing a module script failed')) {
                  var lastReload = sessionStorage.getItem('chunk_reload_time');
                  if (!lastReload || (Date.now() - parseInt(lastReload)) > 5000) {
                    sessionStorage.setItem('chunk_reload_time', Date.now().toString());
                    var newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('v', Date.now().toString());
                    window.location.href = newUrl.toString();
                    return true;
                  }
                }
                console.error('Client Error:', msg, url, line, col, err);
                return false;
              };
              window.onunhandledrejection = function(e) {
                var r = e.reason;
                var msg = r && r.message ? r.message : String(r);
                if (msg.includes('Failed to fetch dynamically imported module') || msg.includes('Importing a module script failed')) {
                  var lastReload = sessionStorage.getItem('chunk_reload_time');
                  if (!lastReload || (Date.now() - parseInt(lastReload)) > 5000) {
                    sessionStorage.setItem('chunk_reload_time', Date.now().toString());
                    var newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('v', Date.now().toString());
                    window.location.href = newUrl.toString();
                    return true;
                  }
                }
                console.error('Promise Rejection:', r);
              };
            `,
          }}
        />
      </head>
      <body className="bg-cream">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Outlet />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

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
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <p className="text-gold tracking-[0.3em] text-xs">|| ॐ ||</p>
        <h1 className="font-display text-7xl text-maroon-deep mt-4">404</h1>
        <h2 className="mt-3 font-display text-2xl text-maroon">Path not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you seek does not exist on this sacred journey.
        </p>
        <Link
          to="/"
          className="inline-flex mt-6 items-center justify-center rounded-md bg-royal text-cream px-6 py-3 text-sm tracking-widest uppercase font-medium hover:opacity-90 transition shadow-royal"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl text-maroon-deep">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try refreshing or return home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-royal text-cream px-5 py-2.5 text-sm tracking-widest uppercase hover:opacity-90 transition"
          >
            Try Again
          </button>
          <a
            href="/"
            className="rounded-md border border-maroon text-maroon px-5 py-2.5 text-sm tracking-widest uppercase hover:bg-maroon hover:text-cream transition"
          >
            Go Home
          </a>
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
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Tiro+Devanagari+Sanskrit&family=Libre+Baskerville:wght@400;700&display=optional",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Aastha Support",
          url: "https://aasthasupport.com",
          description:
            "Authentic, certified, Vedic-energised rudraksha, gemstones, malas, bracelets, yantras and live online poojas.",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Aastha Bhawan",
            addressLocality: "Haridwar",
            addressRegion: "Uttarakhand",
            postalCode: "249401",
            addressCountry: "IN",
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+91-99999-99999",
            contactType: "customer service",
            email: "care@aasthasupport.com",
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
              var __errs = [];
              var __errDiv = null;
              function __showErr(msg) {
                __errs.push(msg);
                if (!__errDiv) {
                  __errDiv = document.createElement('div');
                  __errDiv.id = '__agy_err';
                  __errDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#7f1d1d;color:#fff;font-family:monospace;font-size:13px;padding:16px;z-index:99999;white-space:pre-wrap;max-height:50vh;overflow:auto;';
                  document.body.appendChild(__errDiv);
                }
                __errDiv.textContent = '❌ JS ERROR (open DevTools → Console for full trace):\\n\\n' + __errs.join('\\n\\n---\\n\\n');
              }
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
                __showErr(msg + '\\n  at ' + url + ':' + line + ':' + col + (err ? '\\n  ' + err.stack : ''));
                console.error('Client Error:', msg, err);
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
                __showErr('Unhandled Promise: ' + (r && r.stack ? r.stack : String(r)));
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

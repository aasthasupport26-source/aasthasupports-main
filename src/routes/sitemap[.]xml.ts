import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { categories } from "@/data/catalog";

const BASE_URL = "https://www.aasthasupports.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/shop", changefreq: "daily", priority: "0.9" },
          { path: "/book-pooja", changefreq: "weekly", priority: "0.9" },
          { path: "/about", changefreq: "monthly", priority: "0.7" },
          { path: "/contact", changefreq: "monthly", priority: "0.7" },
          { path: "/faq", changefreq: "monthly", priority: "0.6" },
          { path: "/track-order", changefreq: "monthly", priority: "0.5" },
          { path: "/returns-policy", changefreq: "yearly", priority: "0.4" },
          { path: "/shipping-policy", changefreq: "yearly", priority: "0.4" },
          { path: "/privacy-policy", changefreq: "yearly", priority: "0.4" },
          { path: "/terms-of-service", changefreq: "yearly", priority: "0.4" },
          { path: "/refund-policy", changefreq: "yearly", priority: "0.4" },
        ];

        for (const cat of categories) {
          entries.push({ path: `/category/${cat.slug}`, changefreq: "weekly", priority: "0.8" });
          for (const sec of cat.sections) {
            for (const item of sec.items) {
              entries.push({
                path: `/product/${item.slug}`,
                changefreq: "weekly",
                priority: "0.6",
              });
            }
          }
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

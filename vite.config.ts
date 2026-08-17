// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    server: {
      port: 8082,
      strictPort: true,
    },
    plugins: [mcpPlugin()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('lucide-react')) return 'lucide';
            if (id.includes('@radix-ui')) return 'radix';
            if (id.includes('@supabase/supabase-js')) return 'supabase';
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
            if (id.includes('graphql-request') || id.includes('graphql')) return 'shopify';
            if (id.includes('razorpay')) return 'booking';
          },
        },
      },
    },
  },
});

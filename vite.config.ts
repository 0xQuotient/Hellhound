// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // The tool is 100% client-side: no server functions, no loaders, no secrets.
    // Prerender the single route so `npm run build` emits static HTML that any
    // plain HTTP server (or an air-gapped lab box) can serve.
    prerender: { enabled: true, crawlLinks: true },
    spa: { enabled: true },
  },
});

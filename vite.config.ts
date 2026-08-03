import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    // TanStack Router file-based routing (must run before react)
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }),
    react(),
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has("responsive")) {
          return new URLSearchParams({
            format: "avif;webp;jpg",
            w: "640;960;1280;1600;1920;2560",
            quality: "82",
            as: "picture",
          });
        }
        return new URLSearchParams();
      },
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Compatibility shim: every existing page/component imports from
      // "react-router-dom"; we redirect to a thin wrapper around TanStack Router
      // so we don't have to rewrite 20+ files.
      "react-router-dom": path.resolve(__dirname, "./src/shims/react-router-dom.tsx"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/recharts/") || id.includes("/d3-")) return "charts";
          if (id.includes("/@tiptap/") || id.includes("/prosemirror-")) return "editor";
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/@tanstack/react-router") ||
            id.includes("/@tanstack/router-")
          ) {
            return "react-vendor";
          }
          if (id.includes("/@supabase/")) return "supabase";
          if (id.includes("/@tanstack/react-query")) return "query";
          if (id.includes("/@radix-ui/")) return "radix";
          if (
            id.includes("/react-hook-form") ||
            id.includes("/@hookform/") ||
            id.includes("/zod/")
          ) {
            return "forms";
          }
          if (id.includes("/date-fns/")) return "date";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));

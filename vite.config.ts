// vite.config.ts
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  base: "/reaction-time/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "index.html", dest: ".", rename: "404.html" }],
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
});

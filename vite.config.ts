import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // se a 5520 estiver ocupada, o Vite usa a próxima livre (o endereço aparece no terminal)
  server: { host: "::", port: 5520 },
  preview: { port: 5521 },
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("/three/")) return "three";
          if (id.includes("/gsap/") || id.includes("/lenis/")) return "motion";
          if (id.includes("react") || id.includes("scheduler")) return "react";
        },
      },
    },
  },
});

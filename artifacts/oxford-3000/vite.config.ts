import { defineConfig } from "vite";
import path from "path";

// ปรับให้มีค่าเริ่มต้น (Fallback) หากรันบน Vercel แล้วไม่มีค่า PORT หรือ BASE_PATH ส่งมา
const rawPort = process.env.PORT || "3000";
const port = Number(rawPort);

const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [],
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// No dev proxy needed here: `vercel dev` (the recommended way to run this
// locally) serves the Vite frontend and the /api serverless functions
// together on one origin. If you ever run `vite` directly without Vercel's
// CLI, /api requests won't resolve — use `vercel dev` instead.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});

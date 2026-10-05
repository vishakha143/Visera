import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// FIREBASE_* is exposed too so Vercel keys named without the VITE_ prefix work.
// Safe: Firebase web config is public by design; never put secrets under these prefixes.
export default defineConfig({
  envPrefix: ["VITE_", "FIREBASE_"],
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Firebase's signInWithPopup needs to poll window.closed on the popup
    // it opens; a strict COOP header blocks that check and the sign-in
    // promise never resolves. Allow popups from this origin explicitly.
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
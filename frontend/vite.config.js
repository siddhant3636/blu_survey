//import { defineConfig } from "vite";
//import react from "@vitejs/plugin-react";
//import path from "path";

// https://vitejs.dev/config/
//export default defineConfig({
//  plugins: [react()],
//  resolve: {
//    alias: {
//      "@": path.resolve(__dirname, "./src"),
//    },
//  },
//  server: {
//    port: 8016,
//    host: true,
//  },
//});
//
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 8016,
    allowedHosts: [
      "ev.survey.pramaanu.co.in",
    ],
  },
});

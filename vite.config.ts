import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { getDashboard } from "./server/dashboardData";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "dashboard-api",
      configureServer(server) {
        server.middlewares.use("/api/dashboard", (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(getDashboard()));
        });
      },
    },
  ],

  resolve: {
    dedupe: ["styled-components", "react", "react-dom"],
  },

  server: {
    open: false,
  },
});

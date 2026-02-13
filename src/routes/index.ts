/**
 * Main API routes - Single-tenant Jenkins-like deployment
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import setupRoutes from "./setup.ts";
import authRoutes from "./auth.ts";
import adminRoutes from "./admin.ts";

const api = new Hono();

// Enable CORS
api.use("*", cors());

// Health check
api.get("/health", (c) => {
  return c.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
api.route("/setup", setupRoutes);
api.route("/auth", authRoutes);
api.route("/admin", adminRoutes);

// 404 handler
api.notFound((c) => {
  return c.json({
    success: false,
    error: "Route not found",
  }, 404);
});

export default api;

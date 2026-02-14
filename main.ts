import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { initializeDatabase } from "./src/database/connection.ts";
import apiRoutes from "./src/routes/index.ts";
import pagesRouter from "./src/routes/pages.ts";

const app = new Hono();

// Initialize database
await initializeDatabase();
console.log("✅ Database initialized");

// Serve static files
app.use("/css/*", serveStatic({ root: "./public" }));
app.use("/js/*", serveStatic({ root: "./public" }));

// Mount pages router for individual page routes
app.route("/", pagesRouter);

// Mount API routes
app.route("/api", apiRoutes);

// 404 fallback
app.all("*", (c) => {
  return c.text("Not Found", 404);
});

// Start server
const PORT = parseInt(Deno.env.get("PORT") || "3000");
console.log(`🚀 Server running on http://localhost:${PORT}`);

Deno.serve({ port: PORT }, app.fetch);
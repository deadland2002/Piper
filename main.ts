import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { initializeDatabase } from "./src/database/connection.ts";
import apiRoutes from "./src/routes/index.ts";
import { renderPage } from "./src/templates/page-template.ts";

const app = new Hono();

// Initialize database
await initializeDatabase();
console.log("✅ Database initialized");

// Serve static files
app.use("/css/*", serveStatic({ root: "./public" }));
app.use("/js/*", serveStatic({ root: "./public" }));

// Serve dynamically generated index.html for SPA routes
app.get("/", (c) => {
  return c.html(renderPage({ title: "Piper - Pipeline Orchestration" }));
});

app.get("/home", (c) => {
  return c.html(renderPage({ title: "Piper - Home" }));
});

app.get("/login", (c) => {
  return c.html(renderPage({ title: "Piper - Sign In" }));
});

app.get("/setup", (c) => {
  return c.html(renderPage({ title: "Piper - Setup" }));
});

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
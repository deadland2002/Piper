/**
 * Setup routes for instance initialization
 */

import { Hono } from "hono";
import {
  getSetupStatus,
  initializeInstance,
  createAdminUser,
} from "../handlers/setup/index.ts";
import { authMiddleware, requireSuperAdmin } from "../middleware/auth.ts";

const setupRoutes = new Hono();

// Public routes (no auth required)
setupRoutes.get("/status", getSetupStatus);
setupRoutes.post("/init", initializeInstance);

// Protected routes (require super-admin)
setupRoutes.use("/create-admin", authMiddleware());
setupRoutes.post("/create-admin", createAdminUser);

export default setupRoutes;

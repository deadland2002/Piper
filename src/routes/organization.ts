/**
 * Organization routes
 */

import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.ts";
import {
  createOrganization,
  getOrganization,
  listOrganizations,
  updateOrganization,
  deleteOrganization,
} from "../handlers/organization/index.ts";

const orgRoutes = new Hono();

// Apply auth middleware to all routes
orgRoutes.use("*", authMiddleware());

// Routes
orgRoutes.post("/", createOrganization);
orgRoutes.get("/", listOrganizations);
orgRoutes.get("/:id", getOrganization);
orgRoutes.put("/:id", updateOrganization);
orgRoutes.delete("/:id", deleteOrganization);

export default orgRoutes;

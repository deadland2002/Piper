/**
 * Team routes
 */

import { Hono } from "hono";
import {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
  updateMemberPermission,
} from "../handlers/team/index.ts";
import { authMiddleware } from "../middleware/auth.ts";

const router = new Hono();

// All routes require authentication
router.use("*", authMiddleware());

// List teams
router.get("/", listTeams);

// Get team by ID
router.get("/:id", getTeam);

// Create team
router.post("/", createTeam);

// Update team
router.put("/:id", updateTeam);

// Delete team
router.delete("/:id", deleteTeam);

// Add team member
router.post("/:id/members", addTeamMember);

// Remove team member
router.delete("/:id/members/:userId", removeTeamMember);

// Update member permission
router.put("/:id/members/:userId", updateMemberPermission);

export default router;
